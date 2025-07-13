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
  Target,
  Menu,
  X,
  Zap,
  Eye,
  Clock,
  Flame
} from 'lucide-react';
import { WorkoutType, FormFeedback } from '../types/pose';
import { createWorkoutDetector, createFallbackDetector } from '../utils/workoutDetectors';
import RepCounter from './RepCounter';
import PostureAlert from './PostureAlert';
import GlassCard from './ui/GlassCard';
import NeonButton from './ui/NeonButton';
import HolographicText from './ui/HolographicText';
import FloatingPanel from './ui/FloatingPanel';

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
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
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
              onRepComplete: setCurrentReps,
              onPositionChange: setCurrentPosition,
              onFormFeedback: (message: string, type: 'correct' | 'warning' | 'error' = 'correct') => {
                if (message !== feedback) {
                  setFeedback(message);
                  setFeedbackType(type);
                  setShowFeedback(true);
                  
                  // Auto-hide feedback after 4 seconds
                  setTimeout(() => setShowFeedback(false), 4000);
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
          } catch (detectorError) {
            console.error('Detector initialization error:', detectorError);
            console.error('Error stack:', detectorError.stack);
            
            let errorMessage = 'Failed to initialize AI detection.';
            if (detectorError.message) {
              errorMessage += ` Details: ${detectorError.message}`;
            }
            
            // Check for specific error types
            if (detectorError.message?.includes('WebGL')) {
              errorMessage = 'WebGL not supported. Please use a modern browser with hardware acceleration enabled.';
            } else if (detectorError.message?.includes('network') || detectorError.message?.includes('fetch')) {
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
      detectorRef.current.start();
    }
  }, [isActive]);
  
  // Pause workout
  const pauseWorkout = useCallback(() => {
    if (detectorRef.current && isActive) {
      setIsActive(false);
      detectorRef.current.stop();
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
    
    const results = {
      workoutType: selectedWorkout,
      targetValue,
      repsCompleted: currentReps,
      timeElapsed: elapsedTime,
      accuracy: 95, // This would be calculated based on form feedback
      calories: Math.round(selectedWorkout.calories * (currentReps / selectedWorkout.defaultValue))
    };
    
    onWorkoutComplete(results);
  }, [selectedWorkout, targetValue, currentReps, elapsedTime, onWorkoutComplete]);
  
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <GlassCard className="p-8 max-w-lg w-full text-center" glow>
          <motion.div
            className="text-red-400 mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CameraOff className="h-16 w-16 mx-auto" />
          </motion.div>
          
          <HolographicText size="2xl" className="mb-4">
            AI Detection Error
          </HolographicText>
          
          <p className="text-white/70 mb-8 leading-relaxed">{error}</p>
          
          {/* Debug info for development */}
          <GlassCard className="mb-6 p-4" variant="dark">
            <details className="text-left">
              <summary className="text-sm text-white/70 cursor-pointer hover:text-white transition-colors">
                🔧 Technical Details
              </summary>
              <div className="mt-3 p-3 bg-black/30 rounded-lg text-xs text-white/60 font-mono space-y-1">
                <p>🏋️ Workout: {selectedWorkout.id}</p>
                <p>🌐 Browser: {navigator.userAgent.split(' ')[0]}</p>
                <p>⚡ WebGL: {(() => {
                  try {
                    const canvas = document.createElement('canvas');
                    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
                  } catch (e) {
                    return false;
                  }
                })() ? '✅ Supported' : '❌ Not Supported'}</p>
                <p>📷 Camera: {streamRef.current ? '✅ Access Granted' : '❌ Access Denied'}</p>
              </div>
            </details>
          </GlassCard>
          
          <div className="space-y-4">
            <NeonButton
              onClick={initializeCamera}
              variant="primary"
              size="lg"
              className="w-full"
              icon={<RotateCcw className="h-5 w-5" />}
            >
              Try Again
            </NeonButton>
            
            <NeonButton
              onClick={() => {
                setUseFallback(true);
                setError(null);
                initializeCamera();
              }}
              variant="secondary"
              size="lg"
              className="w-full"
              icon={<Target className="h-5 w-5" />}
            >
              Manual Mode
            </NeonButton>
            
            <NeonButton
              onClick={onExit}
              variant="danger"
              size="lg"
              className="w-full"
              icon={<X className="h-5 w-5" />}
            >
              Exit Workout
            </NeonButton>
          </div>
          
          {/* Troubleshooting tips */}
          <GlassCard className="mt-6 p-4" variant="colored">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Troubleshooting Tips
            </h3>
            <ul className="text-xs text-white/70 space-y-2 text-left">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">•</span>
                Ensure WebGL is supported in your browser
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                Enable hardware acceleration in settings
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-2">•</span>
                Use Chrome, Firefox, or Safari for best results
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">•</span>
                Check your internet connection
              </li>
            </ul>
          </GlassCard>
        </GlassCard>
      </div>
    );
  }
  
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900`}>
      {/* Futuristic Header */}
      <motion.div 
        className="relative z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard className="m-4 p-4" variant="dark">
          <div className="flex items-center justify-between">
            {/* Workout Info */}
            <div className="flex items-center space-x-4">
              <motion.div 
                className={`p-3 rounded-xl ${selectedWorkout.color} text-white shadow-lg`}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {selectedWorkout.icon}
              </motion.div>
              <div>
                <HolographicText size="xl" className="mb-1">
                  {selectedWorkout.name}
                </HolographicText>
                <p className="text-white/70 text-sm flex items-center">
                  <Target className="h-3 w-3 mr-1" />
                  Goal: {targetValue} {selectedWorkout.unit}
                </p>
              </div>
            </div>
            
            {/* Header Controls */}
            <div className="flex items-center space-x-2">
              {/* Mobile Stats Toggle */}
              <button
                onClick={() => setShowMobileStats(!showMobileStats)}
                className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <Settings className="h-5 w-5" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="hidden md:block p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
              
              <NeonButton
                onClick={onExit}
                variant="danger"
                size="sm"
                icon={<X className="h-4 w-4" />}
              >
                Exit
              </NeonButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>
      
      {/* Main Content - Mobile First Layout */}
      <div className="flex flex-col lg:flex-row flex-1 p-4 pt-0 gap-4">
        {/* Video Area */}
        <motion.div 
          className="flex-1 relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <GlassCard className="relative overflow-hidden h-[60vh] lg:h-[calc(100vh-200px)]" glow>
            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-400 mx-auto mb-6"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <HolographicText size="lg" className="mb-2">
                      AI Initializing...
                    </HolographicText>
                    <p className="text-white/70 text-sm">Preparing your futuristic workout experience</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-2xl"
            />
            
            {/* AI Overlay Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner Indicators */}
              <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-400"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-400"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-400"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-400"></div>
              
              {/* AI Status Indicator */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <GlassCard className="px-3 py-1" variant="dark">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span className="text-white/70">
                      {isActive ? 'AI TRACKING' : 'AI READY'}
                    </span>
                  </div>
                </GlassCard>
              </div>
            </div>
            
            {/* Posture Alert */}
            <PostureAlert
              feedback={feedback}
              type={feedbackType}
              isVisible={showFeedback && !isLoading}
            />
            
            {/* Manual Mode Banner */}
            {useFallback && isActive && (
              <motion.div 
                className="absolute top-16 left-1/2 transform -translate-x-1/2"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <GlassCard className="px-4 py-2" variant="colored" glow>
                  <div className="flex items-center space-x-2 text-sm text-white">
                    <Target className="h-4 w-4" />
                    <span>Manual Mode Active - Tap target to count</span>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </GlassCard>
          
          {/* Mobile Controls */}
          <motion.div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GlassCard className="p-3" variant="dark" glow>
              <div className="flex items-center space-x-3">
                {/* Play/Pause */}
                {!isActive ? (
                  <NeonButton
                    onClick={startWorkout}
                    disabled={isLoading}
                    variant="success"
                    size="sm"
                    icon={<Play className="h-5 w-5" />}
                    className="px-4"
                  >
                    Start
                  </NeonButton>
                ) : (
                  <NeonButton
                    onClick={pauseWorkout}
                    variant="warning"
                    size="sm"
                    icon={<Pause className="h-5 w-5" />}
                    className="px-4"
                  >
                    Pause
                  </NeonButton>
                )}
                
                {/* Manual Rep Button */}
                {useFallback && isActive && (
                  <NeonButton
                    onClick={() => {
                      if (detectorRef.current && 'addRep' in detectorRef.current) {
                        (detectorRef.current as any).addRep();
                      }
                    }}
                    variant="primary"
                    size="sm"
                    icon={<Target className="h-5 w-5" />}
                  >
                    +1
                  </NeonButton>
                )}
                
                {/* Reset */}
                <button
                  onClick={resetWorkout}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                
                {/* Complete */}
                <button
                  onClick={completeWorkout}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <StopCircle className="h-5 w-5" />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
        
        {/* Desktop Stats Sidebar */}
        <motion.div 
          className="hidden lg:block w-80"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <GlassCard className="p-6 h-[calc(100vh-200px)] overflow-y-auto" variant="dark">
            <RepCounter
              currentReps={selectedWorkout.type === 'reps' ? currentReps : elapsedTime}
              targetReps={targetValue}
              workoutType={selectedWorkout.type}
              currentPosition={currentPosition}
              elapsedTime={elapsedTime}
              caloriesEstimate={Math.round(selectedWorkout.calories * (currentReps / selectedWorkout.defaultValue))}
              accuracy={95}
            />
            
            {/* Form Tips */}
            <div className="mt-6">
              <HolographicText size="lg" className="mb-4">
                Form Guide
              </HolographicText>
              <GlassCard className="p-4" variant="colored">
                <div className="text-white/80 text-sm space-y-3">
                  {selectedWorkout.id === 'pushups' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-400">•</span>
                        <span>Keep your body straight like a plank</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400">•</span>
                        <span>Lower until elbows are at 90 degrees</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-400">•</span>
                        <span>Keep your core engaged throughout</span>
                      </div>
                    </>
                  )}
                  {selectedWorkout.id === 'squats' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-400">•</span>
                        <span>Keep your chest up and core tight</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400">•</span>
                        <span>Lower until thighs are parallel</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-400">•</span>
                        <span>Knees should track over your toes</span>
                      </div>
                    </>
                  )}
                  {selectedWorkout.id === 'plank' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-400">•</span>
                        <span>Keep your body straight</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400">•</span>
                        <span>Shoulders directly over elbows</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-400">•</span>
                        <span>Engage your core muscles</span>
                      </div>
                    </>
                  )}
                  {selectedWorkout.id === 'jumpingjacks' && (
                    <>
                      <div className="flex items-start space-x-2">
                        <span className="text-green-400">•</span>
                        <span>Jump feet apart, arms overhead</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-400">•</span>
                        <span>Land softly on balls of feet</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-purple-400">•</span>
                        <span>Maintain a steady rhythm</span>
                      </div>
                    </>
                  )}
                </div>
              </GlassCard>
            </div>
          </GlassCard>
        </motion.div>
      </div>
      
      {/* Mobile Stats Panel */}
      <FloatingPanel
        isVisible={showMobileStats}
        position="bottom"
        onClose={() => setShowMobileStats(false)}
        title="Workout Stats"
        className="lg:hidden w-full max-w-lg"
      >
        <RepCounter
          currentReps={selectedWorkout.type === 'reps' ? currentReps : elapsedTime}
          targetReps={targetValue}
          workoutType={selectedWorkout.type}
          currentPosition={currentPosition}
          elapsedTime={elapsedTime}
          caloriesEstimate={Math.round(selectedWorkout.calories * (currentReps / selectedWorkout.defaultValue))}
          accuracy={95}
        />
      </FloatingPanel>
      
      {/* Settings Panel */}
      <FloatingPanel
        isVisible={showSettings}
        position="center"
        onClose={() => setShowSettings(false)}
        title="Workout Settings"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/80">Fullscreen Mode</span>
            <button
              onClick={toggleFullscreen}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                isFullscreen ? 'bg-purple-500 text-white' : 'bg-white/20 text-white/70'
              }`}
            >
              {isFullscreen ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-white/80">Manual Mode</span>
            <button
              onClick={() => {
                setUseFallback(!useFallback);
                if (!useFallback) {
                  setError(null);
                  initializeCamera();
                }
              }}
              className={`px-3 py-1 rounded-lg text-sm transition-all ${
                useFallback ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/70'
              }`}
            >
              {useFallback ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
};

export default WorkoutCamera;
