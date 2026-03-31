import { PoseDetectorCallbacks, DetectorInstance } from '../types/pose';

/**
 * Fallback detector for when AI pose detection fails
 * Uses simple timer-based or manual counting
 */
export class FallbackDetector implements DetectorInstance {
  private callbacks: PoseDetectorCallbacks;
  private currentCount = 0;
  private currentPosition = 'UP';
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(callbacks: PoseDetectorCallbacks) {
    this.callbacks = callbacks;
  }

  async initialize(): Promise<void> {
    // No AI initialization needed for fallback
    this.callbacks.onFormFeedback('AI tracking unavailable. Use manual counting mode.', 'warning');
    this.callbacks.onStatusChange?.({
      stage: 'idle',
      message: 'Manual counting mode',
      issues: ['AI tracking unavailable'],
      isBodyVisible: true,
      isReady: true,
      readinessProgress: 1,
      countdown: null,
      formScore: 0,
      repPhase: 'READY',
      fps: 0
    });
  }

  start(): void {
    this.isRunning = true;
    this.callbacks.onPositionChange('READY');
    this.callbacks.onStatusChange?.({
      stage: 'active',
      message: 'Manual counting mode active',
      issues: [],
      isBodyVisible: true,
      isReady: true,
      readinessProgress: 1,
      countdown: null,
      formScore: 0,
      repPhase: 'READY',
      fps: 0
    });
    
    // For plank exercises, start a timer
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Basic timer for time-based exercises
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.currentCount++;
        this.callbacks.onRepComplete(this.currentCount);
      }
    }, 1000);
  }

  stop(): void {
    this.isRunning = false;
    this.callbacks.onStatusChange?.({
      stage: 'paused',
      message: 'Manual counting paused',
      issues: [],
      isBodyVisible: true,
      isReady: true,
      readinessProgress: 1,
      countdown: null,
      formScore: 0,
      repPhase: this.currentPosition,
      fps: 0
    });
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(): void {
    this.currentCount = 0;
    this.currentPosition = 'UP';
    this.callbacks.onRepComplete(0);
    this.callbacks.onPositionChange('UP');
    this.callbacks.onStatusChange?.({
      stage: 'idle',
      message: 'Manual counting reset',
      issues: [],
      isBodyVisible: true,
      isReady: true,
      readinessProgress: 1,
      countdown: null,
      formScore: 0,
      repPhase: 'UP',
      fps: 0
    });
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  cleanup(): void {
    this.stop();
  }

  getCurrentCount(): number {
    return this.currentCount;
  }

  getCurrentPosition(): string {
    return this.currentPosition;
  }

  // Manual rep counting method
  addRep(): void {
    if (this.isRunning) {
      this.currentCount++;
      this.callbacks.onRepComplete(this.currentCount);
      this.callbacks.onPositionChange(this.currentPosition === 'UP' ? 'DOWN' : 'UP');
      this.currentPosition = this.currentPosition === 'UP' ? 'DOWN' : 'UP';
    }
  }
}
