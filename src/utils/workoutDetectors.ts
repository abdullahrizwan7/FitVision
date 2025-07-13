import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { 
  Keypoint, 
  PoseDetectorCallbacks, 
  DetectorInstance, 
  JointAngle 
} from '../types/pose';
import { 
  calculateAngle, 
  getKeypoint, 
  getPointToLineDistance, 
  analyzePushupForm, 
  analyzeSquatForm, 
  analyzePlankForm,
  drawSkeleton,
  SKELETON_CONNECTIONS,
  normalizeKeypoints
} from './poseUtils';
import { FallbackDetector } from './fallbackDetector';

// Global detector instance to reuse across workouts
let globalDetector: any = null;

/**
 * Initialize pose detector (reusable across all workouts)
 */
export async function initializePoseDetector(): Promise<any> {
  if (globalDetector) return globalDetector;
  
  try {
    console.log('Initializing TensorFlow.js...');
    
    // Ensure TensorFlow is ready
    await tf.ready();
    console.log('TensorFlow.js backend:', tf.getBackend());
    
    // Set backend to webgl if not already set
    if (tf.getBackend() !== 'webgl') {
      await tf.setBackend('webgl');
      await tf.ready();
    }
    
    console.log('Creating pose detector...');
    globalDetector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { 
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        enableSmoothing: true
      }
    );
    
    console.log('MoveNet model loaded successfully');
    return globalDetector;
  } catch (error) {
    console.error('Error loading pose detector:', error);
    console.error('Error details:', error.message);
    
    // Try fallback initialization
    try {
      console.log('Attempting fallback initialization...');
      globalDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet
      );
      console.log('Fallback detector created successfully');
      return globalDetector;
    } catch (fallbackError) {
      console.error('Fallback initialization also failed:', fallbackError);
      throw new Error(`Failed to initialize pose detector: ${error.message}`);
    }
  }
}

/**
 * Base class for workout detectors
 */
abstract class BaseWorkoutDetector implements DetectorInstance {
  protected videoElement: HTMLVideoElement;
  protected canvasElement: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected callbacks: PoseDetectorCallbacks;
  protected detector: any;
  
  protected isRunning = false;
  protected requestId: number | null = null;
  protected currentCount = 0;
  protected currentPosition = 'UP';
  protected lastFrameTime = 0;
  protected frameCount = 0;
  
  constructor(
    videoElement: HTMLVideoElement,
    callbacks: PoseDetectorCallbacks
  ) {
    this.videoElement = videoElement;
    this.callbacks = callbacks;
    
    // Create canvas overlay
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.style.position = 'absolute';
    this.canvasElement.style.top = '0';
    this.canvasElement.style.left = '0';
    this.canvasElement.style.width = '100%';
    this.canvasElement.style.height = '100%';
    this.canvasElement.style.zIndex = '10';
    this.canvasElement.style.pointerEvents = 'none';
    
    videoElement.parentNode?.appendChild(this.canvasElement);
    this.ctx = this.canvasElement.getContext('2d')!;
  }
  
  async initialize(): Promise<void> {
    this.detector = await initializePoseDetector();
  }
  
  start(): void {
    if (!this.isRunning && this.detector) {
      this.isRunning = true;
      this.lastFrameTime = performance.now();
      this.frameCount = 0;
      this.processFrame();
    }
  }
  
  stop(): void {
    this.isRunning = false;
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }
  
  reset(): void {
    this.currentCount = 0;
    this.currentPosition = 'UP';
    this.callbacks.onRepComplete(0);
    this.callbacks.onPositionChange('UP');
    this.callbacks.onFormFeedback('');
  }
  
  cleanup(): void {
    this.stop();
    if (this.canvasElement && this.canvasElement.parentNode) {
      this.canvasElement.parentNode.removeChild(this.canvasElement);
    }
  }
  
  getCurrentCount(): number {
    return this.currentCount;
  }
  
  getCurrentPosition(): string {
    return this.currentPosition;
  }
  
  protected async processFrame(): Promise<void> {
    if (!this.isRunning) return;
    
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    
    // Limit frame rate to ~15fps for better performance
    if (elapsed < 67) {
      this.requestId = requestAnimationFrame(() => this.processFrame());
      return;
    }
    
    this.lastFrameTime = now;
    this.frameCount++;
    
    // Update canvas dimensions
    if (this.canvasElement.width !== this.videoElement.videoWidth || 
        this.canvasElement.height !== this.videoElement.videoHeight) {
      this.canvasElement.width = this.videoElement.videoWidth || 640;
      this.canvasElement.height = this.videoElement.videoHeight || 480;
    }
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    
    try {
      // Only run pose detection every 2 frames for performance
      if (this.frameCount % 2 === 0) {
        const poses = await this.detector.estimatePoses(this.videoElement);
        
        if (poses.length > 0) {
          const pose = poses[0];
          const validKeypoints = pose.keypoints.filter((kp: Keypoint) => (kp.score || 0) > 0.3);
          
          if (validKeypoints.length > 0) {
            // Draw skeleton
            this.drawPose(validKeypoints);
            
            // Process workout-specific detection
            this.detectMovement(validKeypoints);
          }
        }
      }
      
      // Draw UI elements
      this.drawUI();
      
    } catch (error) {
      console.error('Error in pose detection:', error);
      this.ctx.fillStyle = 'red';
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Detection error - retrying...', 10, 30);
    }
    
    if (this.isRunning) {
      this.requestId = requestAnimationFrame(() => this.processFrame());
    }
  }
  
  protected drawPose(keypoints: Keypoint[]): void {
    // Draw keypoints
    keypoints.forEach(keypoint => {
      this.ctx.beginPath();
      this.ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fill();
    });
    
    // Draw skeleton
    drawSkeleton(this.ctx, keypoints, SKELETON_CONNECTIONS);
  }
  
  protected drawUI(): void {
    // Draw position indicator
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = this.currentPosition === 'DOWN' ? '#ff0000' : '#00ff00';
    this.ctx.fillText(this.currentPosition, 10, 60);
    
    // Draw rep count
    this.ctx.font = '32px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeText(`Reps: ${this.currentCount}`, 10, 100);
    this.ctx.fillText(`Reps: ${this.currentCount}`, 10, 100);
  }
  
  protected abstract detectMovement(keypoints: Keypoint[]): void;
}

/**
 * Pushup detector
 */
export class PushupDetector extends BaseWorkoutDetector {
  protected detectMovement(keypoints: Keypoint[]): void {
    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
    const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
    const leftElbow = getKeypoint(keypoints, 'left_elbow');
    const rightElbow = getKeypoint(keypoints, 'right_elbow');
    
    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow) {
      this.callbacks.onFormFeedback('Position yourself so your upper body is visible');
      return;
    }
    
    // Calculate shoulder distances to elbow line
    const leftDistance = getPointToLineDistance(leftShoulder, leftElbow, rightElbow);
    const rightDistance = getPointToLineDistance(rightShoulder, leftElbow, rightElbow);
    const totalDistance = leftDistance + rightDistance;
    
    // Display distance for debugging
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.strokeText(`Distance: ${Math.round(totalDistance)}`, 10, 30);
    this.ctx.fillText(`Distance: ${Math.round(totalDistance)}`, 10, 30);
    
    // Determine position
    const prevPosition = this.currentPosition;
    
    if (totalDistance < 120) {
      this.currentPosition = 'DOWN';
      if (prevPosition !== 'DOWN') {
        this.callbacks.onPositionChange('DOWN');
      }
    } else {
      if (this.currentPosition === 'DOWN') {
        this.currentCount++;
        this.callbacks.onRepComplete(this.currentCount);
        
        // Play sound feedback
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+Lr0Hj');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (e) {}
      }
      
      this.currentPosition = 'UP';
      if (prevPosition !== 'UP') {
        this.callbacks.onPositionChange('UP');
      }
    }
    
    // Form feedback
    const feedback = analyzePushupForm(keypoints);
    if (feedback.length > 0) {
      this.callbacks.onFormFeedback(feedback[0], 'warning');
    } else {
      this.callbacks.onFormFeedback('Good form!', 'correct');
    }
    
    // Draw elbow line
    this.ctx.beginPath();
    this.ctx.moveTo(leftElbow.x, leftElbow.y);
    this.ctx.lineTo(rightElbow.x, rightElbow.y);
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = 'red';
    this.ctx.stroke();
  }
}

/**
 * Squat detector
 */
export class SquatDetector extends BaseWorkoutDetector {
  protected detectMovement(keypoints: Keypoint[]): void {
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const rightHip = getKeypoint(keypoints, 'right_hip');
    const leftKnee = getKeypoint(keypoints, 'left_knee');
    const rightKnee = getKeypoint(keypoints, 'right_knee');
    const leftAnkle = getKeypoint(keypoints, 'left_ankle');
    const rightAnkle = getKeypoint(keypoints, 'right_ankle');
    
    if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
      this.callbacks.onFormFeedback('Position yourself so your full body is visible');
      return;
    }
    
    // Calculate knee angles
    const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    
    // Display angle for debugging
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.strokeText(`Knee Angle: ${Math.round(avgKneeAngle)}°`, 10, 30);
    this.ctx.fillText(`Knee Angle: ${Math.round(avgKneeAngle)}°`, 10, 30);
    
    const prevPosition = this.currentPosition;
    
    if (avgKneeAngle < 120) {
      this.currentPosition = 'DOWN';
      if (prevPosition !== 'DOWN') {
        this.callbacks.onPositionChange('DOWN');
      }
    } else {
      if (this.currentPosition === 'DOWN') {
        this.currentCount++;
        this.callbacks.onRepComplete(this.currentCount);
      }
      
      this.currentPosition = 'UP';
      if (prevPosition !== 'UP') {
        this.callbacks.onPositionChange('UP');
      }
    }
    
    // Form feedback
    const feedback = analyzeSquatForm(keypoints);
    if (feedback.length > 0) {
      this.callbacks.onFormFeedback(feedback[0], 'warning');
    } else {
      this.callbacks.onFormFeedback('Good form!', 'correct');
    }
  }
}

/**
 * Plank detector (time-based)
 */
export class PlankDetector extends BaseWorkoutDetector {
  private startTime: number | null = null;
  private elapsedTime = 0;
  
  start(): void {
    super.start();
    this.startTime = Date.now();
  }
  
  reset(): void {
    super.reset();
    this.startTime = Date.now();
    this.elapsedTime = 0;
  }
  
  protected detectMovement(keypoints: Keypoint[]): void {
    const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
    const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
    const leftHip = getKeypoint(keypoints, 'left_hip');
    const rightHip = getKeypoint(keypoints, 'right_hip');
    
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
      this.callbacks.onFormFeedback('Position yourself so your torso is visible');
      return;
    }
    
    // Calculate body alignment
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };
    
    const bodyAngle = Math.abs(shoulderMidpoint.y - hipMidpoint.y);
    
    // Check if in proper plank position
    const isInPosition = bodyAngle < 40;
    
    if (isInPosition) {
      this.currentPosition = 'HOLD';
      if (this.startTime) {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.callbacks.onRepComplete(this.elapsedTime);
      }
    } else {
      this.currentPosition = 'ADJUST';
    }
    
    this.callbacks.onPositionChange(this.currentPosition);
    
    // Form feedback
    const feedback = analyzePlankForm(keypoints);
    if (feedback.length > 0) {
      this.callbacks.onFormFeedback(feedback[0], 'warning');
    } else if (isInPosition) {
      this.callbacks.onFormFeedback('Perfect plank position!', 'correct');
    }
  }
  
  protected drawUI(): void {
    // Draw time instead of reps for plank
    this.ctx.font = '32px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeText(`Time: ${this.elapsedTime}s`, 10, 100);
    this.ctx.fillText(`Time: ${this.elapsedTime}s`, 10, 100);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = this.currentPosition === 'HOLD' ? '#00ff00' : '#ff0000';
    this.ctx.fillText(this.currentPosition, 10, 60);
  }
}

/**
 * Jumping Jacks detector
 */
export class JumpingJacksDetector extends BaseWorkoutDetector {
  protected detectMovement(keypoints: Keypoint[]): void {
    const leftWrist = getKeypoint(keypoints, 'left_wrist');
    const rightWrist = getKeypoint(keypoints, 'right_wrist');
    const leftAnkle = getKeypoint(keypoints, 'left_ankle');
    const rightAnkle = getKeypoint(keypoints, 'right_ankle');
    const nose = getKeypoint(keypoints, 'nose');
    
    if (!leftWrist || !rightWrist || !leftAnkle || !rightAnkle || !nose) {
      this.callbacks.onFormFeedback('Position yourself so your full body is visible');
      return;
    }
    
    // Check if arms are raised (wrists above nose level)
    const armsRaised = leftWrist.y < nose.y && rightWrist.y < nose.y;
    
    // Check if legs are spread (ankles are wide apart)
    const ankleDistance = Math.abs(leftAnkle.x - rightAnkle.x);
    const legsSpread = ankleDistance > 100; // Adjust threshold as needed
    
    const prevPosition = this.currentPosition;
    
    if (armsRaised && legsSpread) {
      this.currentPosition = 'OUT';
      if (prevPosition !== 'OUT') {
        this.callbacks.onPositionChange('OUT');
      }
    } else {
      if (this.currentPosition === 'OUT') {
        this.currentCount++;
        this.callbacks.onRepComplete(this.currentCount);
      }
      
      this.currentPosition = 'IN';
      if (prevPosition !== 'IN') {
        this.callbacks.onPositionChange('IN');
      }
    }
    
    // Form feedback
    if (!armsRaised && !legsSpread) {
      this.callbacks.onFormFeedback('Good form!', 'correct');
    } else if (!armsRaised) {
      this.callbacks.onFormFeedback('Raise your arms higher', 'warning');
    } else if (!legsSpread) {
      this.callbacks.onFormFeedback('Spread your legs wider', 'warning');
    }
    
    // Display debug info
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 1;
    this.ctx.strokeText(`Arms: ${armsRaised ? 'UP' : 'DOWN'} | Legs: ${legsSpread ? 'OUT' : 'IN'}`, 10, 30);
    this.ctx.fillText(`Arms: ${armsRaised ? 'UP' : 'DOWN'} | Legs: ${legsSpread ? 'OUT' : 'IN'}`, 10, 30);
  }
}

/**
 * Factory function to create workout detectors
 */
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
    case 'jumpingjacks':
      return new JumpingJacksDetector(videoElement, callbacks);
    default:
      throw new Error(`Unsupported workout type: ${workoutType}`);
  }
}

export function createFallbackDetector(
  callbacks: PoseDetectorCallbacks
): FallbackDetector {
  return new FallbackDetector(callbacks);
}
