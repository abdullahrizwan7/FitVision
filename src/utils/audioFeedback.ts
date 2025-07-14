// Audio feedback system for workout
export class AudioFeedback {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio not supported:', error);
      this.enabled = false;
    }
  }

  // Create different types of beeps for feedback
  private createBeep(frequency: number, duration: number, volume: number = 0.1) {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Success sound for completed rep
  repCompleted() {
    this.createBeep(800, 0.1, 0.15);
  }

  // Warning sound for form issues
  formAlert() {
    this.createBeep(400, 0.2, 0.2);
  }

  // Achievement sound for reaching targets
  achievement() {
    // Play ascending notes
    setTimeout(() => this.createBeep(523, 0.1, 0.1), 0);   // C
    setTimeout(() => this.createBeep(659, 0.1, 0.1), 100); // E
    setTimeout(() => this.createBeep(784, 0.1, 0.1), 200); // G
  }

  // Countdown beeps
  countdown() {
    this.createBeep(600, 0.1, 0.1);
  }

  // Error/alert sound
  error() {
    this.createBeep(300, 0.5, 0.3);
  }

  // Motivational milestone sound
  milestone() {
    this.createBeep(700, 0.15, 0.15);
  }

  // Text-to-speech for voice feedback
  speak(text: string) {
    if (!this.enabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.7;
    
    // Use a clear voice if available
    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.includes('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    speechSynthesis.speak(utterance);
  }

  // Enable/disable audio
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Resume audio context if suspended (required for user interaction)
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const audioFeedback = new AudioFeedback();
