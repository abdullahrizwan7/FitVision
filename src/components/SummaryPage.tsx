import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Clock, 
  Flame, 
  TrendingUp, 
  Star,
  RotateCcw,
  Home,
  Share2,
  Download
} from 'lucide-react';
import { WorkoutSession } from '../types/pose';

interface SummaryPageProps {
  session: WorkoutSession;
  onRestart: () => void;
  onNewWorkout: () => void;
  onHome: () => void;
}

const SummaryPage: React.FC<SummaryPageProps> = ({
  session,
  onRestart,
  onNewWorkout,
  onHome
}) => {
  const duration = session.endTime 
    ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
    : 0;
    
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getPerformanceRating = (accuracy: number, completion: number): string => {
    const score = (accuracy + completion) / 2;
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Keep practicing';
  };
  
  const completion = session.workoutType.type === 'reps' 
    ? (session.repsCompleted / session.targetValue) * 100
    : 100; // Time-based workouts are complete when time is reached
  
  const performanceRating = getPerformanceRating(session.accuracy, completion);
  const overallScore = Math.round((session.accuracy + completion) / 2);
  
  const achievements = [];
  if (completion >= 100) achievements.push('Goal Completed');
  if (session.accuracy >= 90) achievements.push('Perfect Form');
  if (duration <= session.targetValue * 0.8 && session.workoutType.type === 'reps') {
    achievements.push('Speed Demon');
  }
  if (session.calories >= session.workoutType.calories) {
    achievements.push('Calorie Crusher');
  }
  
  const shareWorkout = () => {
    if (navigator.share) {
      navigator.share({
        title: 'FitVision Workout Complete!',
        text: `Just completed ${session.repsCompleted} ${session.workoutType.name} with ${session.accuracy}% form accuracy! 💪`,
        url: window.location.origin
      }).catch(console.log);
    } else {
      // Fallback for browsers without Web Share API
      const text = `Just completed ${session.repsCompleted} ${session.workoutType.name} with ${session.accuracy}% form accuracy using FitVision AI! 💪 ${window.location.origin}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Workout results copied to clipboard!');
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Workout Complete!
          </h1>
          <p className="text-xl text-gray-600">
            Great job on your {session.workoutType.name} session
          </p>
        </motion.div>
        
        {/* Main Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="flex justify-center mb-3">
              <div className={`p-3 rounded-full ${session.workoutType.color} text-white`}>
                {session.workoutType.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {session.repsCompleted}
            </div>
            <div className="text-sm text-gray-500">
              {session.workoutType.unit} completed
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="flex justify-center mb-3">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatTime(duration)}
            </div>
            <div className="text-sm text-gray-500">total time</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="flex justify-center mb-3">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {session.calories}
            </div>
            <div className="text-sm text-gray-500">calories burned</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="flex justify-center mb-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {session.accuracy}%
            </div>
            <div className="text-sm text-gray-500">form accuracy</div>
          </div>
        </motion.div>
        
        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Summary</h2>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.round(overallScore / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">{performanceRating}</div>
            <div className="text-lg text-gray-600">Overall Score: {overallScore}/100</div>
          </div>
          
          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Completion Rate</span>
                <span>{Math.round(completion)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-blue-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(completion, 100)}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Form Accuracy</span>
                <span>{session.accuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-green-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${session.accuracy}%` }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 mb-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
              Achievements Unlocked
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white rounded-lg p-3 border border-yellow-200 text-center"
                >
                  <div className="text-yellow-500 mb-1">🏆</div>
                  <div className="text-sm font-medium text-gray-900">{achievement}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <button
            onClick={onRestart}
            className="flex items-center justify-center space-x-2 py-4 px-6 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Do Again</span>
          </button>
          
          <button
            onClick={onNewWorkout}
            className="flex items-center justify-center space-x-2 py-4 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <Target className="h-5 w-5" />
            <span>New Workout</span>
          </button>
          
          <button
            onClick={shareWorkout}
            className="flex items-center justify-center space-x-2 py-4 px-6 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
          
          <button
            onClick={onHome}
            className="flex items-center justify-center space-x-2 py-4 px-6 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
        </motion.div>
        
        {/* Tips for Next Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tips for Next Time</h3>
          <div className="space-y-2 text-gray-600">
            {session.accuracy < 85 && (
              <p>• Focus on maintaining proper form throughout the entire movement</p>
            )}
            {completion < 100 && (
              <p>• Try to complete the full target next time - you're almost there!</p>
            )}
            {duration > session.targetValue * 2 && session.workoutType.type === 'reps' && (
              <p>• Work on increasing your pace while maintaining good form</p>
            )}
            <p>• Stay consistent with your workouts for best results</p>
            <p>• Remember to stay hydrated and listen to your body</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SummaryPage;
