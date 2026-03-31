import { Keypoint } from '../types/pose';

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

export function getKeypoint(keypoints: Keypoint[], name: string): Keypoint | null {
  return keypoints.find((keypoint) => keypoint.name === name) || null;
}

export function getAverageKeypoint(
  keypoints: Keypoint[],
  first: string,
  second: string
): Keypoint | null {
  const start = getKeypoint(keypoints, first);
  const end = getKeypoint(keypoints, second);

  if (!start || !end) return null;

  return {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
    score: Math.min(start.score ?? 0, end.score ?? 0)
  };
}

export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export function calculateDistance(a: Keypoint, b: Keypoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function pointToLineDistance(point: Keypoint, lineStart: Keypoint, lineEnd: Keypoint): number {
  const numerator = Math.abs(
    (lineEnd.y - lineStart.y) * point.x -
      (lineEnd.x - lineStart.x) * point.y +
      lineEnd.x * lineStart.y -
      lineEnd.y * lineStart.x
  );
  const denominator = calculateDistance(lineStart, lineEnd);
  return denominator === 0 ? 0 : numerator / denominator;
}

export function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getPoseBounds(keypoints: Keypoint[], threshold = 0.35) {
  const valid = keypoints.filter((keypoint) => (keypoint.score ?? 0) >= threshold);

  if (!valid.length) {
    return null;
  }

  const xs = valid.map((keypoint) => keypoint.x);
  const ys = valid.map((keypoint) => keypoint.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}

export function hasRequiredKeypoints(
  keypoints: Keypoint[],
  required: string[],
  threshold = 0.35
): boolean {
  return required.every((name) => {
    const keypoint = getKeypoint(keypoints, name);
    return !!keypoint && (keypoint.score ?? 0) >= threshold;
  });
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  connections: [string, string][],
  options?: {
    pointColor?: string;
    lineColor?: string;
    warningColor?: string;
    confidence?: number;
    highlight?: string[];
  }
): void {
  const pointColor = options?.pointColor ?? '#38bdf8';
  const lineColor = options?.lineColor ?? 'rgba(56, 189, 248, 0.85)';
  const warningColor = options?.warningColor ?? '#fb7185';
  const confidence = options?.confidence ?? 0.35;
  const highlight = new Set(options?.highlight ?? []);
  const validKeypoints = keypoints.filter((keypoint) => (keypoint.score ?? 0) >= confidence);

  connections.forEach(([from, to]) => {
    const start = getKeypoint(validKeypoints, from);
    const end = getKeypoint(validKeypoints, to);

    if (!start || !end) return;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = highlight.has(from) || highlight.has(to) ? warningColor : lineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
  });

  validKeypoints.forEach((keypoint) => {
    ctx.beginPath();
    ctx.arc(keypoint.x, keypoint.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = highlight.has(keypoint.name || '') ? warningColor : pointColor;
    ctx.fill();
  });
}
