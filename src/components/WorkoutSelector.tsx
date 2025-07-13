import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Dumbbell, 
  Activity, 
  Timer, 
  Heart, 
  Target, 
  Flame, 
  TrendingUp,
  Zap,
  RotateCcw,
  Award,
  Play
} from 'lucide-react';
import { WorkoutType } from '../types/pose';

interface WorkoutSelectorProps {
  onWorkoutSelect: (workout: WorkoutType, targetValue: number) => void;
  isLoading?: boolean;
}

const WorkoutSelector: React.FC<WorkoutSelectorProps> = ({ 
  onWorkoutSelect,
  isLoading = false
}) => {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null);
  const [selectedValue, setSelectedValue] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const workoutOptions: WorkoutType[] = [
    {
      id: 'pushups',
      name: 'Push-ups',
      description: 'Upper body strength with AI form correction',
      category: 'strength',
      type: 'reps',
      difficulty: 'beginner',
      calories: 8,
      icon: <Dumbbell className="h-6 w-6" />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 border-purple-200',
      defaultValue: 10,
      options: [5, 10, 15, 20, 25, 30],
      unit: 'reps'
    },
    {
      id: 'squats',
      name: 'Squats',
      description: 'Lower body strength with depth tracking',
      category: 'strength',
      type: 'reps',
      difficulty: 'beginner',
      calories: 10,
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 border-blue-200',
      defaultValue: 15,
      options: [10, 15, 20, 25, 30, 40],
      unit: 'reps'
    },
    {
      id: 'plank',
      name: 'Plank',
      description: 'Core stability with posture monitoring',
      category: 'core',
      type: 'time',
      difficulty: 'beginner',
      calories: 5,
      icon: <Timer className="h-6 w-6" />,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 border-indigo-200',
      defaultValue: 30,
      options: [15, 30, 45, 60, 90, 120],
      unit: 'seconds'
    },
    {
      id: 'jumpingjacks',
      name: 'Jumping Jacks',
      description: 'Cardio with arm and leg synchronization',
      category: 'cardio',
      type: 'reps',
      difficulty: 'beginner',
      calories: 6,
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-50 border-pink-200',
      defaultValue: 20,
      options: [15, 20, 25, 30, 40, 50],
      unit: 'reps'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Exercises', icon: <Activity className="h-5 w-5" /> },
    { id: 'strength', name: 'Strength', icon: <Dumbbell className="h-5 w-5" /> },
    { id: 'cardio', name: 'Cardio', icon: <Heart className="h-5 w-5" /> },
    { id: 'core', name: 'Core', icon: <Target className="h-5 w-5" /> }
  ];

  const filteredWorkouts = selectedCategory === 'all' 
    ? workoutOptions 
    : workoutOptions.filter(workout => workout.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleWorkoutSelect = (workout: WorkoutType) => {
    setSelectedWorkout(workout);
    setSelectedValue(workout.defaultValue);
  };

  const handleStartWorkout = () => {
    if (selectedWorkout) {
      onWorkoutSelect(selectedWorkout, selectedValue);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI-Powered Workouts
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your exercise and let our AI provide real-time form feedback and rep counting
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600 shadow-md'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Workout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {filteredWorkouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleWorkoutSelect(workout)}
            className={`bg-white rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              selectedWorkout?.id === workout.id
                ? `${workout.lightColor} border-2`
                : 'border-gray-100 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${workout.color} text-white`}>
                {workout.icon}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                  {workout.difficulty}
                </span>
                <div className="flex items-center text-orange-500">
                  <Flame className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{workout.calories} cal</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{workout.name}</h3>
            <p className="text-gray-600 mb-4">{workout.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-500">
                {workout.type === 'reps' ? (
                  <Target className="h-4 w-4 mr-1" />
                ) : (
                  <Timer className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm">{workout.type === 'reps' ? 'Rep-based' : 'Time-based'}</span>
              </div>
              {selectedWorkout?.id === workout.id && (
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Workout Configuration */}
      {selectedWorkout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto mb-8"
        >
          <div className="text-center mb-6">
            <div className={`inline-flex p-4 rounded-2xl ${selectedWorkout.color} text-white mb-4`}>
              {selectedWorkout.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedWorkout.name}</h2>
            <p className="text-gray-600">{selectedWorkout.description}</p>
          </div>

          <div className="space-y-6">
            {/* Value Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target {selectedWorkout.type === 'reps' ? 'Reps' : 'Duration'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {selectedWorkout.options.map(option => (
                  <button
                    key={option}
                    onClick={() => setSelectedValue(option)}
                    className={`p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                      selectedValue === option
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-700 hover:border-purple-300'
                    }`}
                  >
                    {option} {selectedWorkout.unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Workout Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(selectedWorkout.calories * (selectedValue / selectedWorkout.defaultValue))}
                </div>
                <div className="text-sm text-gray-500">Calories</div>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Timer className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedWorkout.type === 'reps' 
                    ? `${Math.round(selectedValue * 3)}s`
                    : `${selectedValue}s`
                  }
                </div>
                <div className="text-sm text-gray-500">Est. Time</div>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {selectedWorkout.difficulty}
                </div>
                <div className="text-sm text-gray-500">Level</div>
              </div>
            </div>

            {/* Start Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartWorkout}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Play className="h-5 w-5" />
              <span>{isLoading ? 'Starting...' : 'Start AI Workout'}</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WorkoutSelector;
