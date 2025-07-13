import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Flame, TrendingUp, Zap, Eye, Award } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import HolographicText from './ui/HolographicText';

interface RepCounterProps {
  currentReps: number;
  targetReps: number;
  workoutType: 'reps' | 'time';
  currentPosition: string;
  elapsedTime?: number;
  caloriesEstimate?: number;
  accuracy?: number;
}

const RepCounter: React.FC<RepCounterProps> = ({
  currentReps,
  targetReps,
  workoutType,
  currentPosition,
  elapsedTime = 0,
  caloriesEstimate = 0,
  accuracy = 100
}) => {
  const progress = workoutType === 'reps' 
    ? (currentReps / targetReps) * 100 
    : (elapsedTime / targetReps) * 100;
  
  const isComplete = progress >= 100;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Main Counter Display */}
      <GlassCard className="p-6 text-center" glow variant="dark">
        <motion.div
          key={currentReps}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.4 }}
        >
          <HolographicText 
            size="4xl" 
            className="mb-2"
            gradient="from-cyan-400 via-purple-400 to-pink-400"
          >
            {workoutType === 'reps' ? currentReps : formatTime(elapsedTime)}
          </HolographicText>
        </motion.div>
        
        <p className="text-white/70 text-lg mb-4">
          {workoutType === 'reps' 
            ? `of ${targetReps} reps` 
            : `of ${formatTime(targetReps)}`
          }
        </p>
        
        {/* Futuristic Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 40}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 40 * (1 - Math.min(progress, 100) / 100) 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="progressGradient">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Percentage in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <HolographicText size="lg">
              {Math.round(progress)}%
            </HolographicText>
          </div>
        </div>
      </GlassCard>
      
      {/* Position Status */}
      <motion.div
        key={currentPosition}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex justify-center"
      >
        <GlassCard 
          className={`px-6 py-3 ${
            currentPosition === 'DOWN' || currentPosition === 'HOLD' || currentPosition === 'OUT'
              ? 'border-red-400 shadow-red-500/25' 
              : currentPosition === 'UP' || currentPosition === 'IN'
                ? 'border-green-400 shadow-green-500/25'
                : 'border-yellow-400 shadow-yellow-500/25'
          }`}
          glow
        >
          <div className="flex items-center space-x-2">
            <Eye className={`h-5 w-5 ${
              currentPosition === 'DOWN' || currentPosition === 'HOLD' || currentPosition === 'OUT'
                ? 'text-red-400' 
                : currentPosition === 'UP' || currentPosition === 'IN'
                  ? 'text-green-400'
                  : 'text-yellow-400'
            }`} />
            <HolographicText size="lg" className="font-bold">
              {currentPosition}
            </HolographicText>
          </div>
        </GlassCard>
      </motion.div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Time */}
        <GlassCard className="p-4 text-center" variant="colored">
          <motion.div
            className="flex justify-center mb-2"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Clock className="h-6 w-6 text-blue-400" />
          </motion.div>
          <HolographicText size="lg" className="mb-1">
            {formatTime(elapsedTime)}
          </HolographicText>
          <p className="text-white/60 text-xs">Duration</p>
        </GlassCard>
        
        {/* Calories */}
        <GlassCard className="p-4 text-center" variant="colored">
          <motion.div
            className="flex justify-center mb-2"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="h-6 w-6 text-orange-400" />
          </motion.div>
          <HolographicText size="lg" className="mb-1">
            {Math.round(caloriesEstimate)}
          </HolographicText>
          <p className="text-white/60 text-xs">Calories</p>
        </GlassCard>
        
        {/* Form Accuracy */}
        <GlassCard className="p-4 text-center" variant="colored">
          <motion.div
            className="flex justify-center mb-2"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="h-6 w-6 text-green-400" />
          </motion.div>
          <HolographicText size="lg" className="mb-1">
            {Math.round(accuracy)}%
          </HolographicText>
          <p className="text-white/60 text-xs">Form Score</p>
        </GlassCard>
      </div>
      
      {/* Completion Celebration */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <GlassCard className="p-6 text-center" glow variant="colored">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Award className="h-12 w-12 text-yellow-400" />
            </motion.div>
            
            <HolographicText size="2xl" className="mb-2">
              🎉 Mission Complete! 🎉
            </HolographicText>
            
            <p className="text-white/80 text-lg">
              Outstanding performance! You've achieved your target with precision.
            </p>
            
            <motion.div
              className="mt-4 flex justify-center space-x-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">+{Math.round(caloriesEstimate)} XP Earned</span>
              <Zap className="h-5 w-5 text-yellow-400" />
            </motion.div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
};

export default RepCounter;
