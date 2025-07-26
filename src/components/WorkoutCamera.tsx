import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  CameraOff, 
  Play, 
  Pause, 
  RotateCcw, 
  StopCircle,
  Settings,
  Maximize2,
  Minimize2,
  Target
} from 'lucide-react';
import { WorkoutType, FormFeedback } from '../types/pose';
import { createWorkoutDetector, createFallbackDetector } from '../utils/workoutDetectors';
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

const WorkoutCamera: React.FC<WorkoutCameraProps> = ({
  selectedWorkout,
  targetValue,
  onWorkoutComplete,
  onExit
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentReps, setCurrentReps] = useState(0);
  const [currentPosition, setCurrentPosition] = useState('UP');
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'correct' | 'warning' | 'error'>('correct');
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [personInFrame, setPersonInFrame] = useState(true);
  const [formIssues, setFormIssues] = useState<string[]>([]);
  const [lastRepTime, setLastRepTime] = useState(0);
  const [alertBorder, setAlertBorder] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const [lastPauseStart, setLastPauseStart] = useState<number | null>(null);
  
  // Format time helper function
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);
  
  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = async () => {
          try {
            console.log('Initializing workout detector for:', selectedWorkout.id);
            
            const callbacks = {
              onRepComplete: (reps: number) => {
                setCurrentReps(reps);
                setLastRepTime(Date.now());
                
                // Audio feedback for completed rep
                audioFeedback.repCompleted();
                
                // Check for motivational messages
                const motivationalMessage = workoutMotivation.getMotivationalMessage(
                  reps, 
                  targetValue, 
                  selectedWorkout.id
                );
                if (motivationalMessage) {
                  audioFeedback.speak(motivationalMessage);
                  setFeedback(motivationalMessage);
                  setFeedbackType('correct');
                  setShowFeedback(true);
                  setTimeout(() => setShowFeedback(false), 3000);
                }
              },
              onPositionChange: setCurrentPosition,
              onFormFeedback: (message: string, type: 'correct' | 'warning' | 'error' = 'correct') => {
                if (message !== feedback) {
                  setFeedback(message);
                  setFeedbackType(type);
                  setShowFeedback(true);
                  
                  // Audio and visual feedback for form issues
                  if (type === 'error' || type === 'warning') {
                    audioFeedback.formAlert();
                    setAlertBorder(true);
                    setTimeout(() => setAlertBorder(false), 1000);
                    
                    // Add form issue to tracking
                    setFormIssues(prev => [...prev, message]);
                  }
                  
                  // Auto-hide feedback after 4 seconds
                  setTimeout(() => setShowFeedback(false), 4000);
                }
              },
              onPersonDetected: (detected: boolean) => {
                setPersonInFrame(detected);
                if (!detected) {
                  const frameMessage = workoutMotivation.getComeIntoFrameMessage();
                  audioFeedback.speak(frameMessage);
                  setFeedback(frameMessage);
                  setFeedbackType('warning');
                  setShowFeedback(true);
                }
              }
            };
            
            if (useFallback) {
              // Use fallback detector
              detectorRef.current = createFallbackDetector(callbacks);
            } else {
              // Initialize AI workout detector
              detectorRef.current = createWorkoutDetector(
                selectedWorkout.id,
                videoRef.current!,
                callbacks
              );
            }
            
            console.log('Detector created, initializing...');
            await detectorRef.current.initialize();
            console.log('Detector initialized successfully');
            setIsLoading(false);
          } catch (detectorError: any) {
            console.error('Detector initialization error:', detectorError);
            console.error('Error stack:', detectorError?.stack);
            
            let errorMessage = 'Failed to initialize AI detection.';
            if (detectorError?.message) {
              errorMessage += ` Details: ${detectorError.message}`;
            }
            
            // Check for specific error types
            if (detectorError?.message?.includes('WebGL')) {
              errorMessage = 'WebGL not supported. Please use a modern browser with hardware acceleration enabled.';
            } else if (detectorError?.message?.includes('network') || detectorError?.message?.includes('fetch')) {
              errorMessage = 'Failed to download AI model. Please check your internet connection.';
            }
            
            setError(errorMessage);
            setIsLoading(false);
          }
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions and try again.');
      setIsLoading(false);
    }
  }, [selectedWorkout.id, feedback]);
  
  // Start workout
  const startWorkout = useCallback(() => {
    if (detectorRef.current && !isActive) {
      setIsActive(true);
      setStartTime(new Date());
      setCurrentReps(0);
      setCurrentPosition('UP');
      setFormIssues([]);
      setPausedTime(0);
      setLastPauseStart(null);
      
      // Resume audio context and provide start feedback
      audioFeedback.resume();
      audioFeedback.speak("Let's begin! Show me your best form!");
      
      detectorRef.current.start();
    }
  }, [isActive]);
  
  // Pause workout
  const pauseWorkout = useCallback(() => {
    if (detectorRef.current && isActive) {
      setIsActive(false);
      setLastPauseStart(Date.now());
      detectorRef.current.stop();
      
      audioFeedback.speak("Workout paused. Take a breath!");
    }
  }, [isActive]);
  
  // Reset workout
  const resetWorkout = useCallback(() => {
    if (detectorRef.current) {
      setIsActive(false);
      setCurrentReps(0);
      setCurrentPosition('UP');
      setElapsedTime(0);
      setStartTime(null);
      detectorRef.current.reset();
    }
  }, []);
  
  // Complete workout
  const completeWorkout = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.stop();
    }
    
    // Calculate accuracy based on form issues
    const totalPossibleFormChecks = currentReps * 3; // Assume 3 form checks per rep
    const formIssueCount = formIssues.length;
    const accuracy = Math.max(60, Math.round((1 - (formIssueCount / totalPossibleFormChecks)) * 100));
    
    // Calculate calories based on actual performance
    const baseCalories = selectedWorkout.calories * (currentReps / selectedWorkout.defaultValue);
    const timeMultiplier = elapsedTime > 0 ? Math.min(1.2, 600 / elapsedTime) : 1; // Bonus for faster completion
    const formMultiplier = accuracy / 100; // Penalty for poor form
    const calories = Math.round(baseCalories * timeMultiplier * formMultiplier);
    
    const results = {
      workoutType: selectedWorkout,
      targetValue,
      repsCompleted: currentReps,
      timeElapsed: elapsedTime,
      accuracy,
      calories,
      formIssues: formIssues.length,
      averageRepTime: currentReps > 0 ? elapsedTime / currentReps : 0
    };
    
    // Completion feedback
    if (currentReps >= targetValue) {
      audioFeedback.achievement();
      audioFeedback.speak(`Outstanding! You completed ${currentReps} reps with ${accuracy}% form accuracy!`);
    } else {
      audioFeedback.speak(`Good effort! You completed ${currentReps} out of ${targetValue} reps.`);
    }
    
    onWorkoutComplete(results);
  }, [selectedWorkout, targetValue, currentReps, elapsedTime, formIssues, onWorkoutComplete]);
  
  // Check if workout is complete
  useEffect(() => {
    if (selectedWorkout.type === 'reps' && currentReps >= targetValue) {
      setTimeout(completeWorkout, 2000); // Delay to show completion
    } else if (selectedWorkout.type === 'time' && elapsedTime >= targetValue) {
      setTimeout(completeWorkout, 1000);
    }
  }, [currentReps, elapsedTime, targetValue, selectedWorkout.type, completeWorkout]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectorRef.current) {
        detectorRef.current.cleanup();
      }
    };
  }, []);
  
  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
  }, [initializeCamera]);
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const progress = selectedWorkout.type === 'reps' 
    ? (currentReps / targetValue) * 100 
    : (elapsedTime / targetValue) * 100;
    
  const isComplete = progress >= 100;
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-lg w-full text-center">
          <div className="text-red-500 mb-4">
            <CameraOff className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">AI Detection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          {/* Debug info for development */}
          <details className="mb-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
              Show technical details
            </summary>
            <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 font-mono">
              <p>Workout Type: {selectedWorkout.id}</p>
              <p>Browser: {navigator.userAgent}</p>
              <p>WebGL Support: {(() => {
                try {
                  const canvas = document.createElement('canvas');
                  return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                } catch (e) {
                  return false;
                }
              })() ? 'Yes' : 'No'}</p>
              <p>Camera Access: {streamRef.current ? 'Granted' : 'Denied/Failed'}</p>
            </div>
          </details>
          
          <div className="space-y-3">
            <button
              onClick={initializeCamera}
              className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => {
                setUseFallback(true);
                setError(null);
                initializeCamera();
              }}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue with Manual Counting
            </button>
            
            <button
              onClick={onExit}
              className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          </div>
          
          {/* Troubleshooting tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Troubleshooting Tips:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Make sure your browser supports WebGL</li>
              <li>• Enable hardware acceleration in browser settings</li>
              <li>• Try refreshing the page</li>
              <li>• Check your internet connection</li>
              <li>• Use Chrome, Firefox, or Safari for best results</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gray-900 flex flex-col ${alertBorder ? 'ring-4 ring-red-500 ring-opacity-75' : ''}`}>
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-2 md:p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className={`p-1 md:p-2 rounded-lg ${selectedWorkout.color} text-white`}>
              {selectedWorkout.icon}
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">{selectedWorkout.name}</h1>
              <p className="text-white/70 text-xs md:text-sm">
                Target: {targetValue} {selectedWorkout.unit}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 md:p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all touch-manipulation"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4 md:h-5 md:w-5" /> : <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />}
            </button>
            
            <button
              onClick={onExit}
              className="p-1.5 md:p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all touch-manipulation"
            >
              <StopCircle className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Video Area - Portrait optimized for mobile */}
        <div className="flex-1 relative min-h-0 lg:flex lg:flex-row">
          {/* Camera Container */}
          <div className="flex-1 relative bg-black">
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg font-medium">Initializing AI Detection...</p>
                <p className="text-sm text-white/70 mt-2">This may take a few moments</p>
              </div>
            </div>
          )}
          
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          
            {/* Posture Alert Overlay */}
            <PostureAlert
              feedback={feedback}
              type={feedbackType}
              isVisible={showFeedback && !isLoading}
            />
            
            {/* Controls Overlay */}
            <div className="absolute bottom-2 lg:bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-2 lg:space-x-4 bg-black/50 backdrop-blur-sm rounded-full px-3 lg:px-6 py-2 lg:py-3">
              {!isActive ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={startWorkout}
                  disabled={isLoading}
                  className="p-2 lg:p-3 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                >
                  <Play className="h-4 w-4 lg:h-6 lg:w-6" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={pauseWorkout}
                  className="p-2 lg:p-3 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition-colors touch-manipulation"
                >
                  <Pause className="h-4 w-4 lg:h-6 lg:w-6" />
                </motion.button>
              )}
              
              {/* Manual rep button for fallback mode */}
              {useFallback && isActive && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (detectorRef.current && 'addRep' in detectorRef.current) {
                      (detectorRef.current as any).addRep();
                    }
                  }}
                  className="p-2 lg:p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors touch-manipulation"
                >
                  <Target className="h-4 w-4 lg:h-6 lg:w-6" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetWorkout}
                className="p-2 lg:p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors touch-manipulation"
              >
                <RotateCcw className="h-4 w-4 lg:h-6 lg:w-6" />
              </motion.button>
              
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={completeWorkout}
                  className="p-2 lg:p-3 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors touch-manipulation"
                >
                  <StopCircle className="h-4 w-4 lg:h-6 lg:w-6" />
                </motion.button>
              </div>
            </div>
            
            {/* Manual counting instructions for fallback mode */}
            {useFallback && isActive && (
              <div className="absolute top-2 lg:top-4 left-1/2 transform -translate-x-1/2 px-2">
                <div className="bg-blue-500/80 backdrop-blur-sm text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm text-center">
                  Manual Mode: Tap the target button to count each rep
                </div>
              </div>
            )}
          </div>
          
          {/* Stats Sidebar - Desktop only */}
          <div className="hidden lg:flex lg:w-80 bg-gray-800 p-6 flex-col h-full">
            <RepCounter
              currentReps={selectedWorkout.type === 'reps' ? currentReps : elapsedTime}
              targetReps={targetValue}
              workoutType={selectedWorkout.type}
              currentPosition={currentPosition}
              elapsedTime={elapsedTime}
              caloriesEstimate={Math.round(selectedWorkout.calories * (currentReps / selectedWorkout.defaultValue))}
              accuracy={95}
            />
            
            {/* Workout Tips */}
            <div className="mt-6 bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 text-base">Form Tips</h3>
              <div className="text-white/70 text-sm space-y-2">
                {selectedWorkout.id === 'pushups' && (
                  <>
                    <p>• Keep your body straight like a plank</p>
                    <p>• Lower until elbows are at 90 degrees</p>
                    <p>• Keep your core engaged</p>
                  </>
                )}
                {selectedWorkout.id === 'squats' && (
                  <>
                    <p>• Keep your chest up and core tight</p>
                    <p>• Lower until thighs are parallel</p>
                    <p>• Knees should track over your toes</p>
                  </>
                )}
                {selectedWorkout.id === 'plank' && (
                  <>
                    <p>• Keep your body straight</p>
                    <p>• Shoulders over elbows</p>
                    <p>• Engage your core muscles</p>
                  </>
                )}
                {selectedWorkout.id === 'jumpingjacks' && (
                  <>
                    <p>• Jump feet apart, arms overhead</p>
                    <p>• Land softly on balls of feet</p>
                    <p>• Keep a steady rhythm</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Portrait Stats Bar - Bottom */}
        <div className="lg:hidden bg-gray-800 p-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold">
                  {selectedWorkout.type === 'reps' ? currentReps : formatTime(elapsedTime)}
                </div>
                <div className="text-xs text-gray-300">
                  {selectedWorkout.type === 'reps' ? `/${targetValue}` : `/${formatTime(targetValue)}`}
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatTime(elapsedTime)}</div>
                <div className="text-xs text-gray-300">Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{Math.round(selectedWorkout.calories * (currentReps / selectedWorkout.defaultValue))}</div>
                <div className="text-xs text-gray-300">Cal</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!personInFrame && (
                <div className="px-2 py-1 bg-red-500 text-white rounded text-xs font-bold animate-pulse">
                  FRAME
                </div>
              )}
              <motion.div
                key={currentPosition}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  currentPosition === 'DOWN' || currentPosition === 'HOLD' || currentPosition === 'OUT'
                    ? 'bg-red-500 text-white'
                    : currentPosition === 'UP' || currentPosition === 'IN'
                      ? 'bg-green-500 text-white'
                      : 'bg-yellow-500 text-white'
                }`}
              >
                {currentPosition}
              </motion.div>
              <div className="text-xs text-gray-300">
                {Math.round((selectedWorkout.type === 'reps' ? (currentReps / targetValue) : (elapsedTime / targetValue)) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCamera;
