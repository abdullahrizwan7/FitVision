type SpeechPriority = 'low' | 'normal' | 'high';

interface SpeakOptions {
  priority?: SpeechPriority;
  interrupt?: boolean;
  dedupeKey?: string;
  minGapMs?: number;
}

export class AudioFeedback {
  private audioContext: AudioContext | null = null;
  private enabled = true;
  private speechEnabled = true;
  private lastRepSoundTime = 0;
  private lastAchievementSoundTime = 0;
  private lastSpeechTime = 0;
  private lastSpeechKey = '';
  private queuedSpeech: { text: string; options: Required<SpeakOptions> } | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded = false;
  private soundCooldown = 500;
  private achievementCooldown = 2000;
  private speechCooldown = 1400;

  constructor() {
    this.initializeAudio();
    this.initializeVoices();
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio not supported:', error);
      this.enabled = false;
    }
  }

  private initializeVoices() {
    if (!('speechSynthesis' in window)) {
      this.speechEnabled = false;
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      this.voicesLoaded = true;
      this.selectedVoice =
        voices.find((voice) => /en-IN|en-GB|en-US/i.test(voice.lang)) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ||
        voices[0] ||
        null;
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  private createBeep(frequency: number, duration: number, volume = 0.1) {
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

  repCompleted() {
    const now = Date.now();
    if (now - this.lastRepSoundTime < this.soundCooldown) return;
    this.lastRepSoundTime = now;
    this.createBeep(800, 0.1, 0.15);
  }

  formAlert() {
    this.createBeep(400, 0.2, 0.2);
  }

  achievement() {
    const now = Date.now();
    if (now - this.lastAchievementSoundTime < this.achievementCooldown) return;
    this.lastAchievementSoundTime = now;

    setTimeout(() => this.createBeep(523, 0.1, 0.1), 0);
    setTimeout(() => this.createBeep(659, 0.1, 0.1), 100);
    setTimeout(() => this.createBeep(784, 0.1, 0.1), 200);
  }

  countdown() {
    this.createBeep(600, 0.08, 0.08);
  }

  error() {
    this.createBeep(300, 0.5, 0.3);
  }

  milestone() {
    this.createBeep(700, 0.15, 0.15);
  }

  speak(text: string, options: SpeakOptions = {}) {
    if (!this.enabled || !this.speechEnabled || !('speechSynthesis' in window) || !text.trim()) return;

    const resolvedOptions: Required<SpeakOptions> = {
      priority: options.priority ?? 'normal',
      interrupt: options.interrupt ?? false,
      dedupeKey: options.dedupeKey ?? text.trim().toLowerCase(),
      minGapMs: options.minGapMs ?? this.speechCooldown
    };

    const now = Date.now();
    const currentlySpeaking = window.speechSynthesis.speaking || window.speechSynthesis.pending;
    const sameAsLast = this.lastSpeechKey === resolvedOptions.dedupeKey;
    const tooSoon = now - this.lastSpeechTime < resolvedOptions.minGapMs;

    if (sameAsLast && tooSoon) {
      return;
    }

    if (currentlySpeaking && !resolvedOptions.interrupt) {
      if (resolvedOptions.priority === 'high') {
        this.queuedSpeech = { text, options: { ...resolvedOptions, interrupt: true } };
      }
      return;
    }

    if (tooSoon && resolvedOptions.priority !== 'high') {
      return;
    }

    if (resolvedOptions.interrupt && currentlySpeaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    if (this.voicesLoaded && this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => {
      this.lastSpeechTime = Date.now();
      this.lastSpeechKey = resolvedOptions.dedupeKey;
    };

    utterance.onend = () => {
      if (this.queuedSpeech) {
        const next = this.queuedSpeech;
        this.queuedSpeech = null;
        this.speak(next.text, next.options);
      }
    };

    utterance.onerror = () => {
      this.queuedSpeech = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.queuedSpeech = null;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopSpeech();
    }
  }

  setSpeechEnabled(enabled: boolean) {
    this.speechEnabled = enabled;
    if (!enabled) {
      this.stopSpeech();
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}

export const audioFeedback = new AudioFeedback();
