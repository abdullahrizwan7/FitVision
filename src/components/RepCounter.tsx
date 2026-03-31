import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, TrendingUp } from 'lucide-react';

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
    <div className="rounded-[1.6rem] border border-slate-200 bg-white/92 p-4 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 lg:rounded-2xl lg:p-6">
      {/* Main Counter */}
      <div className="mb-4 text-center lg:mb-6">
        <motion.div
          key={currentReps}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
          className="mb-1 text-[2.15rem] font-black leading-none text-slate-900 dark:text-white lg:mb-2 lg:text-6xl"
        >
          {workoutType === 'reps' ? currentReps : formatTime(elapsedTime)}
        </motion.div>
        
        <div className="text-sm font-medium text-slate-500 dark:text-slate-300 lg:text-lg">
          {workoutType === 'reps' 
            ? `/ ${targetReps} reps` 
            : `/ ${formatTime(targetReps)} target`
          }
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 lg:mt-4 lg:h-3">
          <motion.div
            className={`h-full rounded-full ${
              isComplete 
                ? 'bg-green-500' 
                : progress > 75 
                  ? 'bg-blue-500' 
                  : 'bg-purple-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 lg:text-sm">
          {Math.round(progress)}% Complete
        </div>
      </div>
      
      {/* Position Indicator */}
      <div className="mb-4 flex justify-center lg:mb-6">
        <motion.div
          key={currentPosition}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm lg:px-6 lg:py-3 lg:text-lg ${
            currentPosition === 'DOWN' || currentPosition === 'HOLD' || currentPosition === 'OUT'
              ? 'bg-red-100 text-red-700 border-2 border-red-300'
              : currentPosition === 'UP' || currentPosition === 'IN'
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
          }`}
        >
          {currentPosition}
        </motion.div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 lg:gap-4">
        <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center dark:bg-slate-800/70">
          <div className="mb-1 flex justify-center lg:mb-2">
            <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
          </div>
          <div className="text-base font-semibold text-slate-900 dark:text-white lg:text-lg">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Time</div>
        </div>
        
        <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center dark:bg-slate-800/70">
          <div className="mb-1 flex justify-center lg:mb-2">
            <Flame className="h-4 w-4 lg:h-5 lg:w-5 text-orange-500" />
          </div>
          <div className="text-base font-semibold text-slate-900 dark:text-white lg:text-lg">
            {Math.round(caloriesEstimate)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Calories</div>
        </div>
        
        <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center dark:bg-slate-800/70">
          <div className="mb-1 flex justify-center lg:mb-2">
            <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-green-500" />
          </div>
          <div className="text-base font-semibold text-slate-900 dark:text-white lg:text-lg">
            {Math.round(accuracy)}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Form</div>
        </div>
      </div>
      
      {/* Completion Animation */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 lg:mt-6 text-center p-3 lg:p-4 bg-green-100 rounded-lg border-2 border-green-300"
        >
          <div className="text-green-700 font-bold text-base lg:text-lg">
            🎉 Workout Complete!
          </div>
          <div className="text-green-600 text-xs lg:text-sm mt-1">
            Great job! You've reached your target.
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RepCounter;
