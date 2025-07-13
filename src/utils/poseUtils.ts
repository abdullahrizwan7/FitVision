import { Keypoint, JointAngle } from '../types/pose';

/**
 * Calculate the angle between three points (in degrees)
 * @param p1 First point (usually the joint)
 * @param p2 Middle point (the joint we're measuring)
 * @param p3 Third point
 */
export function calculateAngle(p1: Keypoint, p2: Keypoint, p3: Keypoint): number {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return angle;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(p1: Keypoint, p2: Keypoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Get the distance from a point to a line defined by two other points
 */
export function getPointToLineDistance(
  point: Keypoint,
  lineStart: Keypoint,
  lineEnd: Keypoint
): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx: number, yy: number;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if keypoints have sufficient confidence
 */
export function hasGoodConfidence(keypoints: Keypoint[], threshold = 0.3): boolean {
  return keypoints.every(kp => (kp.score || 0) >= threshold);
}

/**
 * Get keypoint by name from pose
 */
export function getKeypoint(keypoints: Keypoint[], name: string): Keypoint | null {
  return keypoints.find(kp => kp.name === name) || null;
}

/**
 * Get multiple keypoints by names
 */
export function getKeypoints(keypoints: Keypoint[], names: string[]): (Keypoint | null)[] {
  return names.map(name => getKeypoint(keypoints, name));
}

/**
 * Calculate joint angles for form analysis
 */
export function analyzeAngles(keypoints: Keypoint[]): JointAngle[] {
  const angles: JointAngle[] = [];
  
  // Left elbow angle (shoulder-elbow-wrist)
  const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
  const leftElbow = getKeypoint(keypoints, 'left_elbow');
  const leftWrist = getKeypoint(keypoints, 'left_wrist');
  
  if (leftShoulder && leftElbow && leftWrist) {
    const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    angles.push({
      name: 'left_elbow',
      angle,
      isCorrect: angle >= 70 && angle <= 110, // General range for good form
      threshold: { min: 70, max: 110 }
    });
  }
  
  // Right elbow angle
  const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
  const rightElbow = getKeypoint(keypoints, 'right_elbow');
  const rightWrist = getKeypoint(keypoints, 'right_wrist');
  
  if (rightShoulder && rightElbow && rightWrist) {
    const angle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    angles.push({
      name: 'right_elbow',
      angle,
      isCorrect: angle >= 70 && angle <= 110,
      threshold: { min: 70, max: 110 }
    });
  }
  
  // Left knee angle (hip-knee-ankle)
  const leftHip = getKeypoint(keypoints, 'left_hip');
  const leftKnee = getKeypoint(keypoints, 'left_knee');
  const leftAnkle = getKeypoint(keypoints, 'left_ankle');
  
  if (leftHip && leftKnee && leftAnkle) {
    const angle = calculateAngle(leftHip, leftKnee, leftAnkle);
    angles.push({
      name: 'left_knee',
      angle,
      isCorrect: angle >= 160 || angle <= 90, // Depends on exercise
      threshold: { min: 90, max: 180 }
    });
  }
  
  // Right knee angle
  const rightHip = getKeypoint(keypoints, 'right_hip');
  const rightKnee = getKeypoint(keypoints, 'right_knee');
  const rightAnkle = getKeypoint(keypoints, 'right_ankle');
  
  if (rightHip && rightKnee && rightAnkle) {
    const angle = calculateAngle(rightHip, rightKnee, rightAnkle);
    angles.push({
      name: 'right_knee',
      angle,
      isCorrect: angle >= 160 || angle <= 90,
      threshold: { min: 90, max: 180 }
    });
  }
  
  return angles;
}

/**
 * Check body alignment for squats
 */
export function analyzeSquatForm(keypoints: Keypoint[]): string[] {
  const feedback: string[] = [];
  
  const leftHip = getKeypoint(keypoints, 'left_hip');
  const rightHip = getKeypoint(keypoints, 'right_hip');
  const leftKnee = getKeypoint(keypoints, 'left_knee');
  const rightKnee = getKeypoint(keypoints, 'right_knee');
  const leftAnkle = getKeypoint(keypoints, 'left_ankle');
  const rightAnkle = getKeypoint(keypoints, 'right_ankle');
  
  if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
    return ['Cannot detect full body - position yourself fully in frame'];
  }
  
  // Check knee alignment
  const leftKneeAngle = leftHip && leftKnee && leftAnkle ? 
    calculateAngle(leftHip, leftKnee, leftAnkle) : 0;
  const rightKneeAngle = rightHip && rightKnee && rightAnkle ? 
    calculateAngle(rightHip, rightKnee, rightAnkle) : 0;
  
  if (leftKneeAngle < 90 || rightKneeAngle < 90) {
    feedback.push('Go deeper - bend your knees more');
  }
  
  // Check if knees are tracking over toes (width check)
  const kneeWidth = Math.abs(leftKnee.x - rightKnee.x);
  const ankleWidth = Math.abs(leftAnkle.x - rightAnkle.x);
  
  if (kneeWidth < ankleWidth * 0.8) {
    feedback.push('Keep knees aligned over your toes');
  }
  
  // Check hip level
  if (Math.abs(leftHip.y - rightHip.y) > 20) {
    feedback.push('Keep your hips level');
  }
  
  return feedback;
}

/**
 * Check form for pushups
 */
export function analyzePushupForm(keypoints: Keypoint[]): string[] {
  const feedback: string[] = [];
  
  const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
  const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
  const leftElbow = getKeypoint(keypoints, 'left_elbow');
  const rightElbow = getKeypoint(keypoints, 'right_elbow');
  const leftHip = getKeypoint(keypoints, 'left_hip');
  const rightHip = getKeypoint(keypoints, 'right_hip');
  
  if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow) {
    return ['Cannot detect upper body - position yourself in frame'];
  }
  
  // Check shoulder level
  if (Math.abs(leftShoulder.y - rightShoulder.y) > 30) {
    feedback.push('Keep your shoulders level');
  }
  
  // Check elbow position relative to shoulders
  if (leftElbow && rightElbow) {
    const elbowDistance = getPointToLineDistance(
      leftShoulder,
      leftElbow,
      rightElbow
    ) + getPointToLineDistance(rightShoulder, leftElbow, rightElbow);
    
    if (elbowDistance > 200) {
      feedback.push('Keep your elbows closer to your body');
    }
  }
  
  // Check body alignment (plank position)
  if (leftShoulder && leftHip && rightShoulder && rightHip) {
    const leftBodyAngle = Math.abs(leftShoulder.y - leftHip.y);
    const rightBodyAngle = Math.abs(rightShoulder.y - rightHip.y);
    
    if (leftBodyAngle > 50 || rightBodyAngle > 50) {
      feedback.push('Keep your body straight - maintain plank position');
    }
  }
  
  return feedback;
}

/**
 * Check form for planks
 */
export function analyzePlankForm(keypoints: Keypoint[]): string[] {
  const feedback: string[] = [];
  
  const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
  const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
  const leftHip = getKeypoint(keypoints, 'left_hip');
  const rightHip = getKeypoint(keypoints, 'right_hip');
  const leftElbow = getKeypoint(keypoints, 'left_elbow');
  const rightElbow = getKeypoint(keypoints, 'right_elbow');
  
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return ['Cannot detect full body alignment'];
  }
  
  // Check body straightness
  const shoulderMidpoint = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2
  };
  const hipMidpoint = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };
  
  const bodyAngle = Math.abs(shoulderMidpoint.y - hipMidpoint.y);
  
  if (bodyAngle > 40) {
    if (shoulderMidpoint.y > hipMidpoint.y) {
      feedback.push('Lower your hips - keep your body straight');
    } else {
      feedback.push('Raise your hips - avoid sagging');
    }
  }
  
  // Check shoulder alignment over elbows
  if (leftElbow && rightElbow) {
    const shoulderElbowAlignment = Math.abs(
      (leftShoulder.x + rightShoulder.x) / 2 - (leftElbow.x + rightElbow.x) / 2
    );
    
    if (shoulderElbowAlignment > 30) {
      feedback.push('Align your shoulders directly over your elbows');
    }
  }
  
  return feedback;
}

/**
 * Normalize keypoints to canvas dimensions
 */
export function normalizeKeypoints(
  keypoints: Keypoint[],
  videoWidth: number,
  videoHeight: number,
  canvasWidth: number,
  canvasHeight: number
): Keypoint[] {
  const scaleX = canvasWidth / videoWidth;
  const scaleY = canvasHeight / videoHeight;
  
  return keypoints.map(kp => ({
    ...kp,
    x: kp.x * scaleX,
    y: kp.y * scaleY
  }));
}

/**
 * Draw skeleton connections on canvas
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  connections: [string, string][],
  confidence = 0.3
): void {
  const validKeypoints = keypoints.filter(kp => (kp.score || 0) >= confidence);
  
  connections.forEach(([start, end]) => {
    const startPoint = getKeypoint(validKeypoints, start);
    const endPoint = getKeypoint(validKeypoints, end);
    
    if (startPoint && endPoint) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

/**
 * Common skeleton connections for drawing
 */
export const SKELETON_CONNECTIONS: [string, string][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle']
];
