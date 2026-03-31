import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { FallbackDetector } from './fallbackDetector';
import {
  average,
  calculateAngle,
  calculateDistance,
  clamp,
  drawSkeleton,
  getAverageKeypoint,
  getKeypoint,
  getPoseBounds,
  hasRequiredKeypoints,
  pointToLineDistance,
  SKELETON_CONNECTIONS
} from './poseUtils';
import {
  DetectedCameraView,
  DetectorInstance,
  Keypoint,
  PoseDetectorCallbacks,
  WorkoutRuntimeStatus
} from '../types/pose';

const MIN_CONFIDENCE = 0.35;
const PROCESS_INTERVAL_MS = 85;
const READY_STABLE_FRAMES = 10;
const GUIDE_MARGIN = 32;

let globalDetector: poseDetection.PoseDetector | null = null;
let detectorInitPromise: Promise<poseDetection.PoseDetector> | null = null;

type FrameAssessment = {
  isBodyVisible: boolean;
  isReady: boolean;
  issues: string[];
  message: string;
  hint?: string;
  highlight: string[];
};

type ExerciseAnalysis = {
  phase: string;
  completedRep: boolean;
  feedback: string;
  feedbackType: 'correct' | 'warning' | 'error';
  formScore: number;
  highlight: string[];
};

async function initializePoseDetector(): Promise<poseDetection.PoseDetector> {
  if (globalDetector) return globalDetector;
  if (detectorInitPromise) return detectorInitPromise;

  detectorInitPromise = (async () => {
    await tf.ready();

    if (tf.getBackend() !== 'webgl') {
      await tf.setBackend('webgl');
      await tf.ready();
    }

    globalDetector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true
      }
    );

    return globalDetector;
  })();

  try {
    return await detectorInitPromise;
  } finally {
    detectorInitPromise = null;
  }
}

export function preloadPoseDetector(): Promise<poseDetection.PoseDetector> {
  return initializePoseDetector();
}

function createRuntimeStatus(overrides: Partial<WorkoutRuntimeStatus>): WorkoutRuntimeStatus {
  return {
    stage: 'idle',
    message: 'Get ready to start',
    issues: [],
    isBodyVisible: false,
    isReady: false,
    readinessProgress: 0,
    countdown: null,
    formScore: 100,
    repPhase: 'READY',
    fps: 0,
    detectedView: 'unknown',
    ...overrides
  };
}

abstract class BaseWorkoutDetector implements DetectorInstance {
  protected videoElement: HTMLVideoElement;
  protected callbacks: PoseDetectorCallbacks;
  protected detector: poseDetection.PoseDetector | null = null;

  protected canvasElement: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;

  protected isRunning = false;
  protected isActive = false;
  protected requestId: number | null = null;
  protected currentCount = 0;
  protected currentPosition = 'READY';
  protected lastProcessedAt = 0;
  protected lastRepAt = 0;
  protected readyFrames = 0;
  protected countdownValue: number | null = null;
  protected countdownTimer: number | null = null;
  protected runtimeStatus = createRuntimeStatus({});
  protected lastFeedbackMessage = '';
  protected lastFeedbackType: 'correct' | 'warning' | 'error' = 'correct';
  protected fps = 0;
  protected detectedView: DetectedCameraView = 'unknown';

  constructor(videoElement: HTMLVideoElement, callbacks: PoseDetectorCallbacks) {
    this.videoElement = videoElement;
    this.callbacks = callbacks;

    this.canvasElement = document.createElement('canvas');
    this.canvasElement.style.position = 'absolute';
    this.canvasElement.style.inset = '0';
    this.canvasElement.style.width = '100%';
    this.canvasElement.style.height = '100%';
    this.canvasElement.style.pointerEvents = 'none';
    this.canvasElement.style.zIndex = '5';
    videoElement.parentNode?.appendChild(this.canvasElement);

    this.ctx = this.canvasElement.getContext('2d') as CanvasRenderingContext2D;
  }

  async initialize(): Promise<void> {
    this.detector = await initializePoseDetector();
    this.emitStatus(
      createRuntimeStatus({
        stage: 'idle',
        message: 'Allow camera and press Start when ready',
        detectedView: this.detectedView
      })
    );
  }

  start(): void {
    if (!this.detector || this.isRunning) return;

    this.isRunning = true;
    this.isActive = false;
    this.readyFrames = 0;
    this.countdownValue = null;
    this.clearCountdown();
    this.emitStatus(
      createRuntimeStatus({
        stage: 'framing',
        message: 'Step into frame to begin',
        repPhase: 'READY',
        detectedView: this.detectedView
      })
    );
    this.processFrame();
  }

  stop(): void {
    this.isRunning = false;
    this.isActive = false;
    this.clearCountdown();

    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }

    this.emitStatus({
      ...this.runtimeStatus,
      stage: 'paused',
      message: 'Workout paused',
      countdown: null
    });
  }

  reset(): void {
    this.stop();
    this.currentCount = 0;
    this.currentPosition = 'READY';
    this.readyFrames = 0;
    this.lastRepAt = 0;
    this.lastFeedbackMessage = '';
    this.callbacks.onRepComplete(0);
    this.callbacks.onPositionChange('READY');
    this.callbacks.onFormFeedback('', 'correct');
    this.emitStatus(
      createRuntimeStatus({
        stage: 'idle',
        message: 'Press Start when you are ready',
        repPhase: 'READY',
        detectedView: this.detectedView
      })
    );
  }

  cleanup(): void {
    this.stop();
    if (this.canvasElement.parentNode) {
      this.canvasElement.parentNode.removeChild(this.canvasElement);
    }
  }

  getCurrentCount(): number {
    return this.currentCount;
  }

  getCurrentPosition(): string {
    return this.currentPosition;
  }

  protected abstract getRequiredKeypoints(): string[];
  protected abstract analyzeExercise(keypoints: Keypoint[]): ExerciseAnalysis;

  protected evaluateFrame(keypoints: Keypoint[]): FrameAssessment {
    const bounds = getPoseBounds(keypoints, MIN_CONFIDENCE);
    const requiredKeypoints = this.getRequiredKeypoints();
    const visibleRequiredCount = requiredKeypoints.filter((name) => {
      const keypoint = getKeypoint(keypoints, name);
      return !!keypoint && (keypoint.score ?? 0) >= MIN_CONFIDENCE;
    }).length;
    const requiredCoverage = visibleRequiredCount / Math.max(requiredKeypoints.length, 1);
    const torsoAnchorsVisible = hasRequiredKeypoints(
      keypoints,
      ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'],
      MIN_CONFIDENCE
    );

    if (!bounds || !torsoAnchorsVisible || requiredCoverage < 0.72) {
      return {
        isBodyVisible: false,
        isReady: false,
        issues: ['Align your full body inside the frame'],
        message: 'Align your full body',
        hint: 'Keep shoulders, hips, and most of your exercise joints clearly visible.',
        highlight: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle']
      };
    }

    const width = this.videoElement.videoWidth || 1280;
    const height = this.videoElement.videoHeight || 720;
    const issues: string[] = [];
    const highlight: string[] = [];
    const bodyHeightRatio = bounds.height / height;
    const bodyWidthRatio = bounds.width / width;
    const bodyDiagonalRatio = Math.hypot(bounds.width, bounds.height) / Math.hypot(width, height);
    const primaryCoverage = Math.max(bodyHeightRatio, bodyWidthRatio, bodyDiagonalRatio);
    const clippedTop = bounds.minY < GUIDE_MARGIN * 0.6;
    const clippedBottom = bounds.maxY > height - GUIDE_MARGIN * 0.6;
    const clippedSides =
      bounds.minX < GUIDE_MARGIN * 0.5 ||
      bounds.maxX > width - GUIDE_MARGIN * 0.5;

    let distanceIssue: string | null = null;

    if (
      primaryCoverage > 0.92 ||
      ((bodyHeightRatio > 0.84 || bodyWidthRatio > 0.84) && (clippedTop || clippedBottom || clippedSides))
    ) {
      distanceIssue = 'Move back';
      highlight.push('nose', 'left_ankle', 'right_ankle');
    } else if (primaryCoverage < 0.44 && !clippedTop && !clippedBottom && !clippedSides) {
      distanceIssue = 'Move closer';
    }

    if (distanceIssue) {
      issues.push(distanceIssue);
    }

    const bodyCenter = (bounds.minX + bounds.maxX) / 2;
    if (!distanceIssue && Math.abs(bodyCenter - width / 2) > width * 0.22) {
      issues.push('Center your body');
    }

    if (!distanceIssue && clippedSides && primaryCoverage > 0.72) {
      issues.push('Move back');
      highlight.push('left_shoulder', 'right_shoulder', 'left_ankle', 'right_ankle');
    }

    const orientationIssue = this.getOrientationIssue(keypoints);
    if (orientationIssue && !issues.includes(orientationIssue.message)) {
      issues.push(orientationIssue.message);
      highlight.push(...orientationIssue.highlight);
    }

    const isReady = issues.length === 0;

    return {
      isBodyVisible: true,
      isReady,
      issues,
      message: isReady ? 'Hold steady for auto start' : issues[0],
      hint: isReady ? 'Stay still for the countdown.' : 'Keep your full body inside the guide area.',
      highlight
    };
  }

  protected getOrientationIssue(_keypoints: Keypoint[]): { message: string; highlight: string[] } | null {
    return null;
  }

  protected async processFrame(): Promise<void> {
    if (!this.isRunning || !this.detector) return;

    this.requestId = requestAnimationFrame(() => this.processFrame());

    const now = performance.now();
    if (now - this.lastProcessedAt < PROCESS_INTERVAL_MS) {
      return;
    }

    this.fps = Math.round(1000 / Math.max(now - this.lastProcessedAt, PROCESS_INTERVAL_MS));
    this.lastProcessedAt = now;

    if (this.videoElement.readyState < 2) return;

    if (
      this.canvasElement.width !== this.videoElement.videoWidth ||
      this.canvasElement.height !== this.videoElement.videoHeight
    ) {
      this.canvasElement.width = this.videoElement.videoWidth || 1280;
      this.canvasElement.height = this.videoElement.videoHeight || 720;
    }

    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    try {
      const poses = await this.detector.estimatePoses(this.videoElement, {
        maxPoses: 1,
        flipHorizontal: false
      });

      const keypoints = poses[0]?.keypoints as Keypoint[] | undefined;
      const frame = keypoints ? this.evaluateFrame(keypoints) : {
        isBodyVisible: false,
        isReady: false,
        issues: ['Step fully into frame'],
        message: 'Step fully into frame',
        hint: 'We need your whole body visible before starting.',
        highlight: []
      };

      if (keypoints) {
        const highlight = this.isActive ? this.runtimeStatus.issues : frame.highlight;
        drawSkeleton(this.ctx, keypoints, SKELETON_CONNECTIONS, {
          highlight
        });
      }

      this.drawGuide(frame);

      if (!this.isActive) {
        this.handleReadiness(frame);
      } else if (keypoints) {
        const analysis = this.analyzeExercise(keypoints);
        this.handleExerciseAnalysis(analysis);
      } else {
        this.isActive = false;
        this.emitStatus({
          ...this.runtimeStatus,
          stage: 'framing',
          message: 'Step back into frame',
          issues: ['Step back into frame'],
          isBodyVisible: false,
          isReady: false,
          countdown: null
        });
      }
    } catch (error) {
      console.error('Pose processing failed:', error);
      this.emitStatus({
        ...this.runtimeStatus,
        stage: 'error',
        message: 'Pose detection error',
        issues: ['Please retry camera tracking']
      });
    }
  }

  protected handleReadiness(frame: FrameAssessment): void {
    if (!frame.isBodyVisible) {
      this.readyFrames = 0;
      this.clearCountdown();
    } else if (frame.isReady) {
      this.readyFrames = Math.min(this.readyFrames + 1, READY_STABLE_FRAMES);
      if (this.readyFrames >= READY_STABLE_FRAMES && this.countdownValue === null) {
        this.startCountdown();
      }
    } else {
      this.readyFrames = Math.max(this.readyFrames - 2, 0);
      this.clearCountdown();
    }

    this.emitFeedback(frame.message, frame.isReady ? 'correct' : 'warning');
    this.emitStatus({
      stage: this.countdownValue !== null ? 'countdown' : 'framing',
      message: this.countdownValue !== null ? `Starting in ${this.countdownValue}` : frame.message,
      hint: frame.hint,
      issues: frame.issues,
      isBodyVisible: frame.isBodyVisible,
      isReady: frame.isReady,
      readinessProgress: clamp(this.readyFrames / READY_STABLE_FRAMES, 0, 1),
      countdown: this.countdownValue,
      formScore: this.runtimeStatus.formScore,
      repPhase: 'READY',
      fps: this.fps,
      detectedView: this.detectedView
    });
  }

  protected handleExerciseAnalysis(analysis: ExerciseAnalysis): void {
    this.currentPosition = analysis.phase;
    this.callbacks.onPositionChange(analysis.phase);

    if (analysis.completedRep && performance.now() - this.lastRepAt > 450) {
      this.lastRepAt = performance.now();
      this.currentCount += 1;
      this.callbacks.onRepComplete(this.currentCount);
    }

    this.emitFeedback(analysis.feedback, analysis.feedbackType);
    this.emitStatus({
      stage: 'active',
      message: analysis.feedback,
      issues: analysis.feedbackType === 'correct' ? [] : [analysis.feedback],
      isBodyVisible: true,
      isReady: true,
      readinessProgress: 1,
      countdown: null,
      formScore: analysis.formScore,
      repPhase: analysis.phase,
      fps: this.fps,
      detectedView: this.detectedView
    });
  }

  protected drawGuide(frame: FrameAssessment): void {
    const width = this.canvasElement.width;
    const height = this.canvasElement.height;
    const strokeColor = this.isActive
      ? 'rgba(56, 189, 248, 0.8)'
      : frame.isReady
      ? 'rgba(16, 185, 129, 0.9)'
      : 'rgba(251, 191, 36, 0.85)';

    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([12, 10]);
    this.ctx.strokeRect(GUIDE_MARGIN, GUIDE_MARGIN, width - GUIDE_MARGIN * 2, height - GUIDE_MARGIN * 2);
    this.ctx.setLineDash([]);

    if (this.countdownValue !== null) {
      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      this.ctx.beginPath();
      this.ctx.arc(width / 2, height / 2, 68, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = '700 58px Inter, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(String(this.countdownValue), width / 2, height / 2 + 18);
    }
  }

  protected startCountdown(): void {
    this.countdownValue = 3;
    this.emitStatus({
      ...this.runtimeStatus,
      stage: 'countdown',
      message: 'Starting in 3',
      countdown: 3
    });

    this.countdownTimer = window.setInterval(() => {
      if (this.countdownValue === null) return;

      if (this.countdownValue <= 1) {
        this.clearCountdown();
        this.isActive = true;
        this.emitStatus({
          ...this.runtimeStatus,
          stage: 'active',
          message: 'START',
          countdown: null,
          repPhase: this.currentPosition || 'READY'
        });
        this.emitFeedback('START', 'correct');
        return;
      }

      this.countdownValue -= 1;
      this.emitStatus({
        ...this.runtimeStatus,
        stage: 'countdown',
        message: `Starting in ${this.countdownValue}`,
        countdown: this.countdownValue
      });
    }, 1000);
  }

  protected clearCountdown(): void {
    this.countdownValue = null;
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  protected emitFeedback(message: string, type: 'correct' | 'warning' | 'error'): void {
    if (!message || (message === this.lastFeedbackMessage && type === this.lastFeedbackType)) {
      return;
    }

    this.lastFeedbackMessage = message;
    this.lastFeedbackType = type;
    this.callbacks.onFormFeedback(message, type);
  }

  protected emitStatus(status: WorkoutRuntimeStatus): void {
    const nextStatus = {
      ...status,
      detectedView: status.detectedView ?? this.detectedView
    };
    this.runtimeStatus = nextStatus;
    this.callbacks.onStatusChange?.(nextStatus);
  }
}

function classifyPushupView(keypoints: Keypoint[]): DetectedCameraView {
  const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
  const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
  const shoulderMid = getAverageKeypoint(keypoints, 'left_shoulder', 'right_shoulder');
  const hipMid = getAverageKeypoint(keypoints, 'left_hip', 'right_hip');
  const nose = getKeypoint(keypoints, 'nose');
  const leftEye = getKeypoint(keypoints, 'left_eye');
  const rightEye = getKeypoint(keypoints, 'right_eye');
  const leftEar = getKeypoint(keypoints, 'left_ear');
  const rightEar = getKeypoint(keypoints, 'right_ear');

  if (!leftShoulder || !rightShoulder || !shoulderMid || !hipMid) {
    return 'unknown';
  }

  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);
  const torsoLength = Math.max(calculateDistance(shoulderMid, hipMid), 1);
  const widthToHeight = shoulderWidth / torsoLength;
  const faceConfidence = average([
    nose?.score ?? 0,
    leftEye?.score ?? 0,
    rightEye?.score ?? 0,
    leftEar?.score ?? 0,
    rightEar?.score ?? 0
  ]);

  if (widthToHeight < 0.72) {
    return 'side';
  }

  if (widthToHeight > 0.9 && faceConfidence >= 0.45) {
    return 'front';
  }

  if (widthToHeight > 0.9 && faceConfidence < 0.3) {
    return 'back';
  }

  return 'unknown';
}

function getSideConfidence(
  keypoints: Keypoint[],
  side: 'left' | 'right',
  joints: string[]
): number {
  return average(
    joints.map((joint) => getKeypoint(keypoints, `${side}_${joint}`)?.score ?? 0)
  );
}

class PushupDetector extends BaseWorkoutDetector {
  private hasReachedBottom = false;
  private bottomFrames = 0;
  private topFrames = 0;

  private getSideVisibility(keypoints: Keypoint[], side: 'left' | 'right'): number {
    return getSideConfidence(keypoints, side, ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']);
  }

  private hasFrontalUpperBody(keypoints: Keypoint[]): boolean {
    return hasRequiredKeypoints(
      keypoints,
      ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'],
      MIN_CONFIDENCE
    );
  }

  override reset(): void {
    this.hasReachedBottom = false;
    this.bottomFrames = 0;
    this.topFrames = 0;
    super.reset();
  }

  protected getRequiredKeypoints(): string[] {
    return [
      'left_shoulder',
      'right_shoulder',
      'left_elbow',
      'right_elbow',
      'left_wrist',
      'right_wrist',
      'left_hip',
      'right_hip',
      'left_knee',
      'right_knee',
      'left_ankle',
      'right_ankle'
    ];
  }

  protected getOrientationIssue(keypoints: Keypoint[]) {
    const view = classifyPushupView(keypoints);
    this.detectedView = view;
    const leftSideVisibility = this.getSideVisibility(keypoints, 'left');
    const rightSideVisibility = this.getSideVisibility(keypoints, 'right');
    const bestSideVisibility = Math.max(leftSideVisibility, rightSideVisibility);

    if (view === 'unknown' && bestSideVisibility < 0.52 && !this.hasFrontalUpperBody(keypoints)) {
      return {
        message: 'Keep your upper body clearly visible',
        highlight: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist']
      };
    }

    return null;
  }

  protected analyzeExercise(keypoints: Keypoint[]): ExerciseAnalysis {
    const classifiedView = classifyPushupView(keypoints);
    const leftSideVisibility = this.getSideVisibility(keypoints, 'left');
    const rightSideVisibility = this.getSideVisibility(keypoints, 'right');
    const bestSideVisibility = Math.max(leftSideVisibility, rightSideVisibility);
    const sideStrongEnough = bestSideVisibility >= 0.52;
    const frontalStrongEnough = this.hasFrontalUpperBody(keypoints);

    if (classifiedView === 'side' || sideStrongEnough) {
      this.detectedView = 'side';
      return this.analyzeSideViewPushup(keypoints);
    }

    if (classifiedView === 'front' || classifiedView === 'back' || frontalStrongEnough) {
      const fallbackView = classifiedView === 'back' ? 'back' : 'front';
      this.detectedView = fallbackView;
      return this.analyzeFrontalPushup(keypoints, fallbackView);
    }

    this.detectedView = classifiedView;
    return {
      phase: 'ADJUST',
      completedRep: false,
      feedback: 'Keep shoulders, elbows, and wrists visible',
      feedbackType: 'warning',
      formScore: 60,
      highlight: ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow']
    };
  }

  private analyzeSideViewPushup(keypoints: Keypoint[]): ExerciseAnalysis {
    const side = getSideConfidence(keypoints, 'left', ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']) >=
      getSideConfidence(keypoints, 'right', ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle'])
      ? 'left'
      : 'right';

    const shoulder = getKeypoint(keypoints, `${side}_shoulder`) as Keypoint;
    const elbow = getKeypoint(keypoints, `${side}_elbow`) as Keypoint;
    const wrist = getKeypoint(keypoints, `${side}_wrist`) as Keypoint;
    const hip = getKeypoint(keypoints, `${side}_hip`) as Keypoint;
    const knee = getKeypoint(keypoints, `${side}_knee`) as Keypoint;
    const ankle = getKeypoint(keypoints, `${side}_ankle`) as Keypoint;

    const elbowAngle = calculateAngle(shoulder, elbow, wrist);
    const hipLineOffset = pointToLineDistance(hip, shoulder, ankle);
    const kneeLineOffset = pointToLineDistance(knee, shoulder, ankle);
    const bodyLength = Math.max(calculateDistance(shoulder, ankle), 1);
    const alignmentRatio = Math.max(hipLineOffset, kneeLineOffset) / bodyLength;
    const alignmentGood = alignmentRatio < 0.16;
    const bottomCandidate = elbowAngle <= 125;
    const topCandidate = elbowAngle >= 150;

    let feedback = 'Drive up with control';
    let feedbackType: 'correct' | 'warning' | 'error' = 'correct';
    let highlight: string[] = [];
    let completedRep = false;

    if (!alignmentGood) {
      feedback = 'Keep your back straight';
      feedbackType = 'warning';
      highlight = [`${side}_shoulder`, `${side}_hip`, `${side}_knee`, `${side}_ankle`];
    } else if (elbowAngle < 140 && !bottomCandidate) {
      feedback = 'Go lower';
      feedbackType = 'warning';
      highlight = [`${side}_shoulder`, `${side}_elbow`, `${side}_wrist`];
    } else if (bottomCandidate) {
      feedback = 'Strong depth, press up';
    } else if (topCandidate) {
      feedback = 'Full extension';
    }

    this.bottomFrames = bottomCandidate ? Math.min(this.bottomFrames + 1, 5) : 0;
    this.topFrames = topCandidate ? Math.min(this.topFrames + 1, 5) : 0;

    const isBottom = this.bottomFrames >= 2;
    const isTop = this.topFrames >= 2;

    if (isBottom) {
      this.hasReachedBottom = true;
    }

    if (this.hasReachedBottom && isTop) {
      completedRep = true;
      this.hasReachedBottom = false;
      this.topFrames = 0;
      this.bottomFrames = 0;
    }

    return {
      phase: isBottom ? 'DOWN' : isTop ? 'UP' : elbowAngle < 140 ? 'LOWERING' : 'RISING',
      completedRep,
      feedback,
      feedbackType,
      formScore: Math.round(clamp(100 - alignmentRatio * 200 - Math.max(0, elbowAngle - 112) * 0.06, 55, 100)),
      highlight
    };
  }

  private analyzeFrontalPushup(
    keypoints: Keypoint[],
    view: 'front' | 'back'
  ): ExerciseAnalysis {
    const leftShoulder = getKeypoint(keypoints, 'left_shoulder') as Keypoint;
    const rightShoulder = getKeypoint(keypoints, 'right_shoulder') as Keypoint;
    const leftElbow = getKeypoint(keypoints, 'left_elbow') as Keypoint;
    const rightElbow = getKeypoint(keypoints, 'right_elbow') as Keypoint;
    const leftWrist = getKeypoint(keypoints, 'left_wrist') as Keypoint;
    const rightWrist = getKeypoint(keypoints, 'right_wrist') as Keypoint;
    const leftHip = getKeypoint(keypoints, 'left_hip') as Keypoint;
    const rightHip = getKeypoint(keypoints, 'right_hip') as Keypoint;
    const leftKnee = getKeypoint(keypoints, 'left_knee') as Keypoint;
    const rightKnee = getKeypoint(keypoints, 'right_knee') as Keypoint;

    const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const avgElbowAngle = average([leftElbowAngle, rightElbowAngle]);
    const elbowSymmetry = Math.abs(leftElbowAngle - rightElbowAngle);

    const shoulderMid = getAverageKeypoint(keypoints, 'left_shoulder', 'right_shoulder') as Keypoint;
    const wristMid = getAverageKeypoint(keypoints, 'left_wrist', 'right_wrist') as Keypoint;
    const hipMid = getAverageKeypoint(keypoints, 'left_hip', 'right_hip') as Keypoint;
    const kneeMid = getAverageKeypoint(keypoints, 'left_knee', 'right_knee') as Keypoint;
    const torsoLength = Math.max(calculateDistance(shoulderMid, hipMid), 1);
    const shoulderDropRatio = (wristMid.y - shoulderMid.y) / torsoLength;
    const hipTilt = Math.abs(leftHip.y - rightHip.y) / torsoLength;
    const kneeTilt = Math.abs(leftKnee.y - rightKnee.y) / torsoLength;
    const bodySymmetryGood = hipTilt < 0.18 && kneeTilt < 0.2;

    const bottomCandidate = avgElbowAngle <= 128 || shoulderDropRatio <= 0.72;
    const topCandidate = avgElbowAngle >= 150 || shoulderDropRatio >= 0.95;

    let feedback = view === 'front' ? 'Keep both arms moving evenly' : 'Keep your shoulders level';
    let feedbackType: 'correct' | 'warning' | 'error' = 'correct';
    let highlight: string[] = [];
    let completedRep = false;

    if (!bodySymmetryGood) {
      feedback = 'Keep your body level';
      feedbackType = 'warning';
      highlight = ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_knee', 'right_knee'];
    } else if (elbowSymmetry >= 28) {
      feedback = 'Keep both arms bending evenly';
      feedbackType = 'warning';
      highlight = ['left_elbow', 'right_elbow', 'left_wrist', 'right_wrist'];
    } else if (avgElbowAngle < 142 && !bottomCandidate) {
      feedback = 'Go lower';
      feedbackType = 'warning';
      highlight = ['left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'];
    } else if (bottomCandidate) {
      feedback = 'Good depth, press up';
    } else if (topCandidate) {
      feedback = 'Full extension';
    }

    this.bottomFrames = bottomCandidate ? Math.min(this.bottomFrames + 1, 5) : 0;
    this.topFrames = topCandidate ? Math.min(this.topFrames + 1, 5) : 0;

    const isBottom = this.bottomFrames >= 2;
    const isTop = this.topFrames >= 2;

    if (isBottom) {
      this.hasReachedBottom = true;
    }

    if (this.hasReachedBottom && isTop) {
      completedRep = true;
      this.hasReachedBottom = false;
      this.topFrames = 0;
      this.bottomFrames = 0;
    }

    return {
      phase: isBottom ? 'DOWN' : isTop ? 'UP' : avgElbowAngle < 142 ? 'LOWERING' : 'RISING',
      completedRep,
      feedback,
      feedbackType,
      formScore: Math.round(
        clamp(
          100 - elbowSymmetry * 0.8 - hipTilt * 110 - kneeTilt * 85 - Math.max(0, 118 - avgElbowAngle) * 0.08,
          55,
          100
        )
      ),
      highlight
    };
  }
}

class SquatDetector extends BaseWorkoutDetector {
  private hasReachedBottom = false;

  protected getRequiredKeypoints(): string[] {
    return [
      'left_shoulder',
      'right_shoulder',
      'left_hip',
      'right_hip',
      'left_knee',
      'right_knee',
      'left_ankle',
      'right_ankle'
    ];
  }

  protected analyzeExercise(keypoints: Keypoint[]): ExerciseAnalysis {
    const leftHip = getKeypoint(keypoints, 'left_hip') as Keypoint;
    const rightHip = getKeypoint(keypoints, 'right_hip') as Keypoint;
    const leftKnee = getKeypoint(keypoints, 'left_knee') as Keypoint;
    const rightKnee = getKeypoint(keypoints, 'right_knee') as Keypoint;
    const leftAnkle = getKeypoint(keypoints, 'left_ankle') as Keypoint;
    const rightAnkle = getKeypoint(keypoints, 'right_ankle') as Keypoint;
    const leftShoulder = getKeypoint(keypoints, 'left_shoulder') as Keypoint;
    const rightShoulder = getKeypoint(keypoints, 'right_shoulder') as Keypoint;

    const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const kneeAngle = average([leftAngle, rightAngle]);
    const hipMid = getAverageKeypoint(keypoints, 'left_hip', 'right_hip') as Keypoint;
    const kneeMid = getAverageKeypoint(keypoints, 'left_knee', 'right_knee') as Keypoint;
    const ankleMid = getAverageKeypoint(keypoints, 'left_ankle', 'right_ankle') as Keypoint;
    const shoulderMid = getAverageKeypoint(keypoints, 'left_shoulder', 'right_shoulder') as Keypoint;

    const kneeWidth = calculateDistance(leftKnee, rightKnee);
    const ankleWidth = calculateDistance(leftAnkle, rightAnkle);
    const torsoLean = Math.abs(shoulderMid.x - ankleMid.x) / Math.max(calculateDistance(shoulderMid, hipMid), 1);
    const depthGood = kneeAngle <= 95 && hipMid.y >= kneeMid.y - 12;
    const topPosition = kneeAngle >= 160;

    let feedback = 'Drive through your heels';
    let feedbackType: 'correct' | 'warning' | 'error' = 'correct';
    let highlight: string[] = [];
    let completedRep = false;

    if (kneeWidth < ankleWidth * 0.72) {
      feedback = 'Keep knees over toes';
      feedbackType = 'warning';
      highlight = ['left_knee', 'right_knee', 'left_ankle', 'right_ankle'];
    } else if (torsoLean > 0.35) {
      feedback = 'Lift your chest';
      feedbackType = 'warning';
      highlight = ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'];
    } else if (kneeAngle < 130 && !depthGood) {
      feedback = 'Go lower';
      feedbackType = 'warning';
      highlight = ['left_hip', 'right_hip', 'left_knee', 'right_knee'];
    } else if (depthGood) {
      feedback = 'Nice depth';
    }

    if (depthGood) this.hasReachedBottom = true;
    if (this.hasReachedBottom && topPosition) {
      completedRep = true;
      this.hasReachedBottom = false;
    }

    return {
      phase: depthGood ? 'DOWN' : topPosition ? 'UP' : kneeAngle < 130 ? 'LOWERING' : 'RISING',
      completedRep,
      feedback,
      feedbackType,
      formScore: Math.round(clamp(100 - torsoLean * 60 - Math.max(0, 0.72 - kneeWidth / Math.max(ankleWidth, 1)) * 110, 55, 100)),
      highlight
    };
  }
}

class PlankDetector extends BaseWorkoutDetector {
  private holdStartAt = 0;
  private lastSecond = 0;

  protected getRequiredKeypoints(): string[] {
    return [
      'left_shoulder',
      'right_shoulder',
      'left_hip',
      'right_hip',
      'left_ankle',
      'right_ankle'
    ];
  }

  protected getOrientationIssue(keypoints: Keypoint[]) {
    const shoulderWidth = calculateDistance(
      getKeypoint(keypoints, 'left_shoulder') as Keypoint,
      getKeypoint(keypoints, 'right_shoulder') as Keypoint
    );
    const torso = calculateDistance(
      getAverageKeypoint(keypoints, 'left_shoulder', 'right_shoulder') as Keypoint,
      getAverageKeypoint(keypoints, 'left_hip', 'right_hip') as Keypoint
    );

    if (torso > 0 && shoulderWidth / torso > 1.1) {
      return {
        message: 'Turn sideways to camera',
        highlight: ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip']
      };
    }

    return null;
  }

  protected analyzeExercise(keypoints: Keypoint[]): ExerciseAnalysis {
    const shoulderMid = getAverageKeypoint(keypoints, 'left_shoulder', 'right_shoulder') as Keypoint;
    const hipMid = getAverageKeypoint(keypoints, 'left_hip', 'right_hip') as Keypoint;
    const ankleMid = getAverageKeypoint(keypoints, 'left_ankle', 'right_ankle') as Keypoint;

    const hipOffset = pointToLineDistance(hipMid, shoulderMid, ankleMid) / Math.max(calculateDistance(shoulderMid, ankleMid), 1);
    const aligned = hipOffset < 0.1;

    let feedback = aligned ? 'Hold steady' : 'Keep your back straight';
    let feedbackType: 'correct' | 'warning' | 'error' = aligned ? 'correct' : 'warning';
    let highlight = aligned ? [] : ['left_shoulder', 'right_shoulder', 'left_hip', 'right_hip', 'left_ankle', 'right_ankle'];
    let completedRep = false;

    if (aligned) {
      if (!this.holdStartAt) {
        this.holdStartAt = performance.now();
        this.lastSecond = 0;
      }
      const heldSeconds = Math.floor((performance.now() - this.holdStartAt) / 1000);
      if (heldSeconds > this.lastSecond) {
        this.lastSecond = heldSeconds;
        completedRep = true;
      }
    } else {
      this.holdStartAt = 0;
      this.lastSecond = this.currentCount;
    }

    return {
      phase: aligned ? 'HOLD' : 'ADJUST',
      completedRep,
      feedback,
      feedbackType,
      formScore: Math.round(clamp(100 - hipOffset * 300, 55, 100)),
      highlight
    };
  }
}

class LungeDetector extends BaseWorkoutDetector {
  private hasReachedBottom = false;

  protected getRequiredKeypoints(): string[] {
    return [
      'left_hip',
      'right_hip',
      'left_knee',
      'right_knee',
      'left_ankle',
      'right_ankle'
    ];
  }

  protected analyzeExercise(keypoints: Keypoint[]): ExerciseAnalysis {
    const leftHip = getKeypoint(keypoints, 'left_hip') as Keypoint;
    const rightHip = getKeypoint(keypoints, 'right_hip') as Keypoint;
    const leftKnee = getKeypoint(keypoints, 'left_knee') as Keypoint;
    const rightKnee = getKeypoint(keypoints, 'right_knee') as Keypoint;
    const leftAnkle = getKeypoint(keypoints, 'left_ankle') as Keypoint;
    const rightAnkle = getKeypoint(keypoints, 'right_ankle') as Keypoint;

    const frontIsLeft = leftAnkle.x < rightAnkle.x ? leftKnee.x < rightKnee.x : leftKnee.x > rightKnee.x;
    const frontKnee = frontIsLeft ? leftKnee : rightKnee;
    const frontHip = frontIsLeft ? leftHip : rightHip;
    const frontAnkle = frontIsLeft ? leftAnkle : rightAnkle;
    const backKnee = frontIsLeft ? rightKnee : leftKnee;
    const backHip = frontIsLeft ? rightHip : leftHip;
    const backAnkle = frontIsLeft ? rightAnkle : leftAnkle;

    const frontAngle = calculateAngle(frontHip, frontKnee, frontAnkle);
    const backAngle = calculateAngle(backHip, backKnee, backAnkle);
    const bottomGood = frontAngle < 105 && backAngle < 130;
    const topGood = frontAngle > 155 && backAngle > 155;

    let feedback = 'Step into a stable split stance';
    let feedbackType: 'correct' | 'warning' | 'error' = 'correct';
    let highlight: string[] = [];
    let completedRep = false;

    if (frontKnee.x * (frontIsLeft ? 1 : -1) > frontAnkle.x * (frontIsLeft ? 1 : -1)) {
      feedback = 'Keep front knee stacked over ankle';
      feedbackType = 'warning';
      highlight = [frontIsLeft ? 'left_knee' : 'right_knee', frontIsLeft ? 'left_ankle' : 'right_ankle'];
    } else if (!bottomGood && frontAngle < 130) {
      feedback = 'Lower into the lunge';
      feedbackType = 'warning';
      highlight = [frontIsLeft ? 'left_hip' : 'right_hip', frontIsLeft ? 'left_knee' : 'right_knee'];
    } else if (bottomGood) {
      feedback = 'Strong lunge depth';
    }

    if (bottomGood) this.hasReachedBottom = true;
    if (this.hasReachedBottom && topGood) {
      completedRep = true;
      this.hasReachedBottom = false;
    }

    return {
      phase: bottomGood ? 'DOWN' : topGood ? 'UP' : 'TRANSITION',
      completedRep,
      feedback,
      feedbackType,
      formScore: Math.round(clamp(100 - Math.max(0, 105 - frontAngle) * 0.35, 55, 100)),
      highlight
    };
  }
}

class JumpingJacksDetector extends BaseWorkoutDetector {
  private openPositionReached = false;

  protected getRequiredKeypoints(): string[] {
    return ['left_wrist', 'right_wrist', 'left_ankle', 'right_ankle', 'nose'];
  }

  protected analyzeExercise(keypoints: Keypoint[]): ExerciseAnalysis {
    const leftWrist = getKeypoint(keypoints, 'left_wrist') as Keypoint;
    const rightWrist = getKeypoint(keypoints, 'right_wrist') as Keypoint;
    const leftAnkle = getKeypoint(keypoints, 'left_ankle') as Keypoint;
    const rightAnkle = getKeypoint(keypoints, 'right_ankle') as Keypoint;
    const nose = getKeypoint(keypoints, 'nose') as Keypoint;
    const leftHip = getKeypoint(keypoints, 'left_hip') as Keypoint;
    const rightHip = getKeypoint(keypoints, 'right_hip') as Keypoint;

    const hipWidth = calculateDistance(leftHip, rightHip);
    const ankleWidth = calculateDistance(leftAnkle, rightAnkle);
    const armsOpen = leftWrist.y < nose.y && rightWrist.y < nose.y;
    const legsOpen = ankleWidth > hipWidth * 1.8;
    const isOpen = armsOpen && legsOpen;
    const isClosed = ankleWidth < hipWidth * 1.2 && leftWrist.y > nose.y && rightWrist.y > nose.y;

    let feedback = 'Keep a steady rhythm';
    let feedbackType: 'correct' | 'warning' | 'error' = 'correct';
    let highlight: string[] = [];
    let completedRep = false;

    if (!armsOpen && ankleWidth > hipWidth * 1.4) {
      feedback = 'Raise your arms higher';
      feedbackType = 'warning';
      highlight = ['left_wrist', 'right_wrist', 'left_shoulder', 'right_shoulder'];
    } else if (armsOpen && !legsOpen) {
      feedback = 'Jump your feet wider';
      feedbackType = 'warning';
      highlight = ['left_ankle', 'right_ankle', 'left_hip', 'right_hip'];
    }

    if (isOpen) this.openPositionReached = true;
    if (this.openPositionReached && isClosed) {
      completedRep = true;
      this.openPositionReached = false;
    }

    return {
      phase: isOpen ? 'OUT' : 'IN',
      completedRep,
      feedback,
      feedbackType,
      formScore: isOpen || isClosed ? 94 : 82,
      highlight
    };
  }
}

export function createWorkoutDetector(
  workoutType: string,
  videoElement: HTMLVideoElement,
  callbacks: PoseDetectorCallbacks
): BaseWorkoutDetector {
  switch (workoutType.toLowerCase()) {
    case 'pushups':
      return new PushupDetector(videoElement, callbacks);
    case 'squats':
      return new SquatDetector(videoElement, callbacks);
    case 'plank':
      return new PlankDetector(videoElement, callbacks);
    case 'lunges':
      return new LungeDetector(videoElement, callbacks);
    case 'jumpingjacks':
      return new JumpingJacksDetector(videoElement, callbacks);
    default:
      throw new Error(`Unsupported workout type: ${workoutType}`);
  }
}

export function createFallbackDetector(callbacks: PoseDetectorCallbacks): DetectorInstance {
  return new FallbackDetector(callbacks);
}
