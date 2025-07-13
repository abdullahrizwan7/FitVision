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
    console.log('Fallback detector initialized - manual counting mode');
    this.callbacks.onFormFeedback(
      'AI detection unavailable. Use manual controls to count reps.'
    );
  }

  start(): void {
    this.isRunning = true;
    this.callbacks.onPositionChange('READY');
    
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
