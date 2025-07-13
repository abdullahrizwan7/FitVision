import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Flame, TrendingUp } from 'lucide-react';

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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
      {/* Main Counter */}
      <div className="text-center mb-6">
        <motion.div
          key={currentReps}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
          className="text-6xl font-bold text-gray-900 mb-2"
        >
          {workoutType === 'reps' ? currentReps : formatTime(elapsedTime)}
        </motion.div>
        
        <div className="text-lg text-gray-600">
          {workoutType === 'reps' 
            ? `/ ${targetReps} reps` 
            : `/ ${formatTime(targetReps)} target`
          }
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
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
        
        <div className="text-sm text-gray-500 mt-2">
          {Math.round(progress)}% Complete
        </div>
      </div>
      
      {/* Position Indicator */}
      <div className="flex justify-center mb-6">
        <motion.div
          key={currentPosition}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-6 py-3 rounded-full font-bold text-lg ${
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
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-xs text-gray-500">Time</div>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(caloriesEstimate)}
          </div>
          <div className="text-xs text-gray-500">Calories</div>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.round(accuracy)}%
          </div>
          <div className="text-xs text-gray-500">Form</div>
        </div>
      </div>
      
      {/* Completion Animation */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center p-4 bg-green-100 rounded-lg border-2 border-green-300"
        >
          <div className="text-green-700 font-bold text-lg">
            🎉 Workout Complete!
          </div>
          <div className="text-green-600 text-sm mt-1">
            Great job! You've reached your target.
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RepCounter;
