import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CameraOff,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  StopCircle,
  Target
} from 'lucide-react';
import { FormFeedback, WorkoutRuntimeStatus, WorkoutType } from '../types/pose';
import { createFallbackDetector, createWorkoutDetector, preloadPoseDetector } from '../utils/workoutDetectors';
import RepCounter from './RepCounter';
import PostureAlert from './PostureAlert';
import { audioFeedback } from '../utils/audioFeedback';
import { workoutMotivation } from '../utils/workoutMotivation';

interface WorkoutCameraProps {
  selectedWorkout: WorkoutType;
  targetValue: number;
  onWorkoutComplete: (results: any) => void;
  onExit: () => void;
}

type DetectorHandle = {
  initialize: () => Promise<void>;
  start: () => void;
  stop: () => void;
  reset: () => void;
  cleanup: () => void;
  addRep?: () => void;
};

const initialStatus: WorkoutRuntimeStatus = {
  stage: 'idle',
  message: 'Preparing camera',
  issues: [],
  isBodyVisible: false,
  isReady: false,
  readinessProgress: 0,
  countdown: null,
  formScore: 100,
  repPhase: 'READY',
  fps: 0
};

const WorkoutCamera: React.FC<WorkoutCameraProps> = ({
  selectedWorkout,
  targetValue,
  onWorkoutComplete,
  onExit
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<DetectorHandle | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);
  const previousCountdownRef = useRef<number | null>(null);
  const activeStartedAtRef = useRef<number | null>(null);
  const accumulatedActiveMsRef = useRef(0);
  const liveAccuracySamplesRef = useRef<number[]>([]);
  const isMountedRef = useRef(true);
  const setupRunRef = useRef(0);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Preparing camera...');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentReps, setCurrentReps] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [runtimeStatus, setRuntimeStatus] = useState<WorkoutRuntimeStatus>(initialStatus);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'warning' | 'error' | 'info'>('info');
  const [showFeedback, setShowFeedback] = useState(false);
  const [formEvents, setFormEvents] = useState<FormFeedback[]>([]);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const completionTriggeredRef = useRef(false);
  const [mobilePanel, setMobilePanel] = useState<'overview' | 'guidance'>('overview');

  const progress = selectedWorkout.type === 'reps'
    ? (currentReps / targetValue) * 100
    : (elapsedTime / targetValue) * 100;

  const caloriesEstimate = useMemo(() => {
    if (selectedWorkout.type === 'time') {
      return Math.round((elapsedTime / Math.max(targetValue, 1)) * selectedWorkout.calories);
    }

    return Math.round((currentReps / Math.max(targetValue, 1)) * selectedWorkout.calories);
  }, [currentReps, elapsedTime, selectedWorkout, targetValue]);

  useEffect(() => {
    let interval: number | undefined;

    if (runtimeStatus.stage === 'active') {
      if (activeStartedAtRef.current === null) {
        activeStartedAtRef.current = Date.now();
      }

      interval = window.setInterval(() => {
        const activeMs = Date.now() - (activeStartedAtRef.current ?? Date.now());
        setElapsedTime(Math.floor((accumulatedActiveMsRef.current + activeMs) / 1000));
      }, 250);
    } else if (activeStartedAtRef.current !== null) {
      accumulatedActiveMsRef.current += Date.now() - activeStartedAtRef.current;
      activeStartedAtRef.current = null;
      setElapsedTime(Math.floor(accumulatedActiveMsRef.current / 1000));
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [runtimeStatus.stage]);

  const clearFeedbackTimer = () => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  };

  const pushFeedback = useCallback(
    (message: string, type: 'correct' | 'warning' | 'error' | 'info') => {
      if (!message) return;

      setFeedback(message);
      setFeedbackType(type);
      setShowFeedback(true);
      clearFeedbackTimer();
      feedbackTimerRef.current = window.setTimeout(() => setShowFeedback(false), type === 'correct' ? 1800 : 3200);
    },
    []
  );

  const initializeCamera = useCallback(async () => {
    const runId = ++setupRunRef.current;

    const isStale = () => !isMountedRef.current || setupRunRef.current !== runId;

    try {
      setIsLoading(true);
      setError(null);
      setLoadingMessage('Requesting camera access...');

      detectorRef.current?.cleanup();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const isMobileViewport = window.matchMedia('(max-width: 639px)').matches;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: isMobileViewport ? 720 : 1280 },
          height: { ideal: isMobileViewport ? 1280 : 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error('Camera element unavailable.');
      }

      const video = videoRef.current;
      video.srcObject = stream;

      setLoadingMessage('Camera ready. Loading pose tracker...');
      const preloadPromise = useFallback ? Promise.resolve(null) : preloadPoseDetector();

      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= 1) {
          resolve();
          return;
        }

        const handleLoaded = () => {
          cleanup();
          resolve();
        };

        const handleError = () => {
          cleanup();
          reject(new Error('Camera metadata could not be loaded.'));
        };

        const cleanup = () => {
          video.removeEventListener('loadedmetadata', handleLoaded);
          video.removeEventListener('error', handleError);
        };

        video.addEventListener('loadedmetadata', handleLoaded);
        video.addEventListener('error', handleError);
      });

      if (isStale()) {
        return;
      }

      try {
        await video.play();
      } catch (playError: any) {
        const interrupted = `${playError?.message || ''}`.includes('media was removed from the document');
        if (!interrupted && playError?.name !== 'AbortError' && !isStale()) {
          throw playError;
        }
      }

      if (isStale()) {
        return;
      }

      await preloadPromise;

      if (isStale()) {
        return;
      }

      setLoadingMessage('Applying workout rules...');

      const callbacks = {
        onRepComplete: (reps: number) => {
          setCurrentReps(reps);
          audioFeedback.repCompleted();

          const motivation = workoutMotivation.getMotivationalMessage(reps, targetValue, selectedWorkout.id);
          if (motivation) {
            audioFeedback.speak(motivation, {
              priority: 'normal',
              dedupeKey: `motivation:${motivation}`,
              minGapMs: 4500
            });
            pushFeedback(motivation, 'correct');
          }
        },
        onPositionChange: () => {},
        onFormFeedback: (message: string, type: 'correct' | 'warning' | 'error' = 'correct') => {
          if (!message) return;

          pushFeedback(message, type);

          if (type !== 'correct') {
            audioFeedback.formAlert();
            setFormEvents((previous) => [
              ...previous,
              { message, type, timestamp: new Date() }
            ]);
            audioFeedback.speak(message, {
              priority: type === 'error' ? 'high' : 'normal',
              interrupt: type === 'error',
              dedupeKey: `form:${message}`,
              minGapMs: type === 'error' ? 1200 : 2200
            });
          } else if (message === 'START') {
            audioFeedback.speak('Start', {
              priority: 'high',
              interrupt: true,
              dedupeKey: 'session:start',
              minGapMs: 0
            });
          }
        },
        onStatusChange: (status: WorkoutRuntimeStatus) => {
          setRuntimeStatus(status);
          if (status.stage === 'active') {
            liveAccuracySamplesRef.current.push(status.formScore);
          }

          if (status.countdown !== null && status.countdown !== previousCountdownRef.current) {
            audioFeedback.countdown();
            previousCountdownRef.current = status.countdown;
          }

          if (status.countdown === null) {
            previousCountdownRef.current = null;
          }
        }
      };

      detectorRef.current = useFallback
        ? (createFallbackDetector(callbacks) as DetectorHandle)
        : (createWorkoutDetector(selectedWorkout.id, videoRef.current, callbacks) as DetectorHandle);

      await detectorRef.current.initialize();

      if (isStale()) {
        detectorRef.current?.cleanup();
        return;
      }

      setIsLoading(false);
      setLoadingMessage('Ready');
    } catch (cameraError: any) {
      if (isStale()) {
        return;
      }
      console.error(cameraError);
      setError(cameraError?.message || 'Unable to initialize the workout camera.');
      setIsLoading(false);
    }
  }, [pushFeedback, selectedWorkout.id, targetValue, useFallback]);

  useEffect(() => {
    isMountedRef.current = true;
    initializeCamera();

    return () => {
      isMountedRef.current = false;
      setupRunRef.current += 1;
      clearFeedbackTimer();
      detectorRef.current?.cleanup();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [initializeCamera]);

  const startWorkout = useCallback(() => {
    if (!detectorRef.current || isLoading) return;
    audioFeedback.resume();
    detectorRef.current.start();
  }, [isLoading]);

  const pauseWorkout = useCallback(() => {
    detectorRef.current?.stop();
  }, []);

  const resetWorkout = useCallback(() => {
    detectorRef.current?.reset();
    setCurrentReps(0);
    setElapsedTime(0);
    setRuntimeStatus(initialStatus);
    setWorkoutCompleted(false);
    completionTriggeredRef.current = false;
    setFormEvents([]);
    liveAccuracySamplesRef.current = [];
    accumulatedActiveMsRef.current = 0;
    activeStartedAtRef.current = null;
  }, []);

  const completeWorkout = useCallback(() => {
    if (workoutCompleted || completionTriggeredRef.current) return;

    completionTriggeredRef.current = true;
    setWorkoutCompleted(true);
    detectorRef.current?.stop();

    const averageFormScore = liveAccuracySamplesRef.current.length
      ? Math.round(
          liveAccuracySamplesRef.current.reduce((sum, value) => sum + value, 0) /
            liveAccuracySamplesRef.current.length
        )
      : runtimeStatus.formScore;

    const calories = Math.max(1, caloriesEstimate);
    const accuracy = Math.max(55, averageFormScore);

    const results = {
      workoutType: selectedWorkout,
      targetValue,
      repsCompleted: currentReps,
      timeElapsed: elapsedTime,
      accuracy,
      calories,
      formIssues: formEvents.length,
      averageRepTime: currentReps > 0 ? elapsedTime / currentReps : 0
    };

    if (selectedWorkout.type === 'reps' && currentReps >= targetValue) {
      audioFeedback.achievement();
      audioFeedback.speak(`Great set. ${currentReps} reps completed.`, {
        priority: 'high',
        interrupt: true,
        dedupeKey: 'session:complete',
        minGapMs: 0
      });
    }

    onWorkoutComplete(results);
  }, [
    caloriesEstimate,
    currentReps,
    elapsedTime,
    formEvents.length,
    onWorkoutComplete,
    runtimeStatus.formScore,
    selectedWorkout,
    targetValue,
    workoutCompleted
  ]);

  useEffect(() => {
    if (workoutCompleted || selectedWorkout.type !== 'reps' || currentReps < targetValue) {
      return;
    }

    completeWorkout();
  }, [completeWorkout, currentReps, selectedWorkout.type, targetValue, workoutCompleted]);

  useEffect(() => {
    if (workoutCompleted || selectedWorkout.type !== 'time' || elapsedTime < targetValue) {
      return;
    }

    completeWorkout();
  }, [completeWorkout, elapsedTime, selectedWorkout.type, targetValue, workoutCompleted]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
        <div className="glass-panel max-w-lg rounded-[2rem] p-8 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-rose-50 p-4 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            <CameraOff className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Camera setup failed</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{error}</p>
          <div className="mt-6 space-y-3">
            <button
              onClick={initializeCamera}
              className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
            >
              Try again
            </button>
            <button
              onClick={() => {
                setUseFallback(true);
                setError(null);
              }}
              className="w-full rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Use manual fallback
            </button>
            <button
              onClick={onExit}
              className="w-full rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 dark:bg-slate-700 dark:text-white"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-[100dvh]'} overflow-hidden bg-slate-950`}>
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <div className="mb-3 shrink-0 rounded-[1.45rem] border border-white/10 bg-white/5 px-3 py-3 text-white backdrop-blur sm:mb-4 sm:rounded-[1.6rem] sm:px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`rounded-2xl ${selectedWorkout.color} p-2.5 text-white sm:p-3`}>
              {selectedWorkout.icon}
            </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold sm:text-lg">{selectedWorkout.name}</h1>
                <p className="text-xs text-slate-300 sm:text-sm">
                  Target: {targetValue} {selectedWorkout.unit}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen((value) => !value)}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
              <button
                onClick={onExit}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
              >
                <StopCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            <div className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${
              runtimeStatus.isReady
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-200'
            }`}>
              {runtimeStatus.stage}
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
              {runtimeStatus.fps} FPS
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-200">
              {runtimeStatus.detectedView ?? 'unknown'} view
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:gap-4">
          <div className="grid min-h-0 grid-cols-2 items-stretch gap-3 lg:contents">
            <div className="relative aspect-[9/16] min-h-0 overflow-hidden rounded-[1.7rem] border border-white/10 bg-black shadow-[0_30px_80px_-45px_rgba(15,23,42,0.9)] sm:aspect-auto sm:min-h-0 sm:rounded-[2rem] lg:col-auto">
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 backdrop-blur">
                <div className="text-center text-white">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400" />
                <p className="text-lg font-semibold">Initializing pose tracking</p>
                <p className="mt-2 text-sm text-slate-300">{loadingMessage}</p>
              </div>
            </div>
          )}

            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full bg-slate-950 object-cover" />

            <div className="hidden sm:block">
              <PostureAlert
                feedback={feedback}
                type={feedbackType}
                isVisible={showFeedback && !isLoading}
              />
            </div>

            <div className="absolute left-3 top-3 hidden gap-2 sm:flex">
              <div className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                runtimeStatus.isReady
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-amber-500/20 text-amber-200'
              }`}>
                {runtimeStatus.stage}
              </div>
              <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                {runtimeStatus.fps} FPS
              </div>
              <div className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                {runtimeStatus.detectedView ?? 'unknown'} view
              </div>
            </div>

            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-2 backdrop-blur sm:bottom-4 sm:gap-3 sm:px-4 sm:py-3">
              {runtimeStatus.stage === 'active' ? (
                <button
                  onClick={pauseWorkout}
                  className="rounded-full bg-amber-500 p-2.5 text-white transition hover:bg-amber-400 sm:p-3"
                >
                  <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              ) : (
                <button
                  onClick={startWorkout}
                  disabled={isLoading}
                  className="rounded-full bg-emerald-500 p-2.5 text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 sm:p-3"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}

              {useFallback && runtimeStatus.stage === 'active' && (
                <button
                  onClick={() => detectorRef.current?.addRep?.()}
                  className="rounded-full bg-sky-500 p-2.5 text-white transition hover:bg-sky-400 sm:p-3"
                >
                  <Target className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}

              <button
                onClick={resetWorkout}
                className="rounded-full bg-rose-500 p-2.5 text-white transition hover:bg-rose-400 sm:p-3"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={completeWorkout}
                className="rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:p-3"
              >
                <StopCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
            </div>

            <div className="flex min-h-0 flex-col gap-3 lg:hidden">
              <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/5 p-3 text-white backdrop-blur">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Live workout</p>
                    <h2 className="truncate text-base font-bold">{selectedWorkout.name}</h2>
                  </div>
                  <div className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                    {runtimeStatus.repPhase}
                  </div>
                </div>

                <div className="mt-3 rounded-[1.2rem] border border-white/10 bg-slate-950/45 p-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Progress</p>
                      <p className="mt-1 text-2xl font-black text-white">
                        {currentReps}
                        <span className="ml-1 text-sm font-semibold text-slate-300">/ {targetValue}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Form</p>
                      <p className="mt-1 text-lg font-bold text-white">{Math.round(runtimeStatus.formScore)}%</p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-emerald-400"
                      animate={{ width: `${Math.max(8, Math.min(progress, 100))}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Time</p>
                    <p className="mt-1 text-sm font-semibold text-white">{Math.floor(elapsedTime / 60)}:{`${elapsedTime % 60}`.padStart(2, '0')}</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ready</p>
                    <p className="mt-1 text-sm font-semibold text-white">{Math.round(runtimeStatus.readinessProgress * 100)}%</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Calories</p>
                    <p className="mt-1 text-sm font-semibold text-white">{Math.round(caloriesEstimate)}</p>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 bg-white/5 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">View</p>
                    <p className="mt-1 truncate text-sm font-semibold capitalize text-white">{runtimeStatus.detectedView ?? 'unknown'}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-[1.1rem] bg-slate-900/70 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Coach cue</p>
                  <p className="mt-1 text-sm font-medium leading-5 text-white">{runtimeStatus.message}</p>
                </div>

                {showFeedback && feedback && (
                  <div
                    className={`mt-3 rounded-[1.1rem] border px-3 py-2.5 ${
                      feedbackType === 'correct'
                        ? 'border-green-400/35 bg-green-500/10'
                        : feedbackType === 'warning'
                          ? 'border-yellow-400/35 bg-yellow-500/10'
                          : feedbackType === 'error'
                            ? 'border-rose-400/35 bg-rose-500/10'
                            : 'border-sky-400/35 bg-sky-500/10'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                      {feedbackType === 'correct' && 'Perfect form'}
                      {feedbackType === 'warning' && 'Form alert'}
                      {feedbackType === 'error' && 'Form error'}
                      {feedbackType === 'info' && 'Tip'}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-white">{feedback}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden min-h-0 lg:flex lg:flex-col lg:gap-4 lg:overflow-y-auto">
            <RepCounter
              currentReps={currentReps}
              targetReps={targetValue}
              workoutType={selectedWorkout.type}
              currentPosition={runtimeStatus.repPhase}
              elapsedTime={elapsedTime}
              caloriesEstimate={caloriesEstimate}
              accuracy={runtimeStatus.formScore}
            />

            <div className="section-shell p-5 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Smart start
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Frame validation</h2>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Readiness</p>
                  <p className="text-lg font-bold">{Math.round(runtimeStatus.readinessProgress * 100)}%</p>
                </div>
              </div>

              <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  animate={{ width: `${Math.max(8, runtimeStatus.readinessProgress * 100)}%` }}
                />
              </div>

              <div className="mt-4 rounded-[1.2rem] bg-slate-100/80 p-4 dark:bg-slate-900/55">
                <p className="font-semibold text-slate-900 dark:text-white">{runtimeStatus.message}</p>
                {runtimeStatus.hint && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{runtimeStatus.hint}</p>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {(runtimeStatus.issues.length ? runtimeStatus.issues : ['Skeleton overlay is tracking your pose in real time.']).map((issue) => (
                  <div
                    key={issue}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-300"
                  >
                    <ShieldAlert className="h-4 w-4 text-cyan-500" />
                    {issue}
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-300">
                Detected camera angle: <span className="font-semibold capitalize text-slate-900 dark:text-white">{runtimeStatus.detectedView ?? 'unknown'}</span>
              </div>
            </div>

            <div className="section-shell p-5 text-slate-900 dark:text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Live guidance
              </p>
              <h2 className="mt-1 text-xl font-bold">What the system is checking</h2>
              <div className="mt-4 grid gap-3">
                {[
                  `Rep validation: only full ${selectedWorkout.name.toLowerCase()} reps count.`,
                  'Body alignment: posture issues are highlighted before they become bad reps.',
                  'Auto start: countdown begins only after full-body readiness is stable.'
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 shrink-0 lg:hidden">
          <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur">
            <button
              onClick={() => setMobilePanel('overview')}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                mobilePanel === 'overview'
                  ? 'bg-white text-slate-950'
                  : 'text-slate-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setMobilePanel('guidance')}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                mobilePanel === 'guidance'
                  ? 'bg-white text-slate-950'
                  : 'text-slate-300'
              }`}
            >
              Guidance
            </button>
          </div>

          {mobilePanel === 'overview' ? (
            <div className="grid gap-3">
              <div className="section-shell rounded-[1.6rem] p-4 text-slate-900 dark:text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      Smart start
                    </p>
                    <h2 className="mt-1 text-xl font-bold">Frame validation</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Ready</p>
                    <p className="text-xl font-black">{Math.round(runtimeStatus.readinessProgress * 100)}%</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    animate={{ width: `${Math.max(8, runtimeStatus.readinessProgress * 100)}%` }}
                  />
                </div>
                <div className="mt-3 rounded-[1.2rem] bg-slate-100/80 p-4 dark:bg-slate-900/55">
                  <p className="font-semibold text-slate-900 dark:text-white">{runtimeStatus.message}</p>
                  {runtimeStatus.hint && (
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{runtimeStatus.hint}</p>
                  )}
                  <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    View: <span className="ml-1 capitalize">{runtimeStatus.detectedView ?? 'unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="section-shell rounded-[1.6rem] p-4 text-slate-900 dark:text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Live guidance
              </p>
              <h2 className="mt-1 text-xl font-bold">What the system is checking</h2>
              <div className="mt-3 space-y-3">
                {(runtimeStatus.issues.length ? runtimeStatus.issues : [
                  `Only full ${selectedWorkout.name.toLowerCase()} reps count.`,
                  'Body alignment is checked continuously.',
                  'Countdown begins only after stable full-body framing.'
                ]).map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.2rem] border border-slate-200/70 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/55 dark:text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutCamera;
