import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Dumbbell, 
  Clock, 
  Flame, 
  ChevronRight,
  Search,
  Filter,
  Target,
  Heart,
  Timer,
  Activity,
  Brain,
  Star,
  Play
} from 'lucide-react';

interface Workout {
  id: string;
  name: string;
  description: string;
  category: 'strength' | 'cardio' | 'core' | 'flexibility';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  calories: number;
  icon: React.ReactNode;
  color: string;
  lightColor: string;
  aiTracking: boolean;
  type: 'reps' | 'time';
  defaultValue: number;
  options: number[];
  unit: string;
}

const WorkoutLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const workouts: Workout[] = [
    {
      id: 'pushups',
      name: 'Push-ups',
      description: 'Upper body strength with AI form correction',
      category: 'strength',
      difficulty: 'beginner',
      duration: 10,
      calories: 100,
      icon: <Dumbbell className="h-6 w-6" />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 border-purple-200',
      aiTracking: true,
      type: 'reps',
      defaultValue: 10,
      options: [5, 10, 15, 20, 25, 30],
      unit: 'reps'
    },
    {
      id: 'squats',
      name: 'Squats',
      description: 'Lower body strength with depth tracking',
      category: 'strength',
      difficulty: 'beginner',
      duration: 15,
      calories: 150,
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 border-blue-200',
      aiTracking: true,
      type: 'reps',
      defaultValue: 15,
      options: [10, 15, 20, 25, 30, 40],
      unit: 'reps'
    },
    {
      id: 'plank',
      name: 'Plank',
      description: 'Core stability with posture monitoring',
      category: 'core',
      difficulty: 'intermediate',
      duration: 5,
      calories: 50,
      icon: <Timer className="h-6 w-6" />,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 border-indigo-200',
      aiTracking: true,
      type: 'time',
      defaultValue: 30,
      options: [15, 30, 45, 60, 90, 120],
      unit: 'seconds'
    },
    {
      id: 'jumpingjacks',
      name: 'Jumping Jacks',
      description: 'Cardio with arm and leg synchronization',
      category: 'cardio',
      difficulty: 'beginner',
      duration: 10,
      calories: 120,
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-50 border-pink-200',
      aiTracking: true,
      type: 'reps',
      defaultValue: 20,
      options: [15, 20, 25, 30, 40, 50],
      unit: 'reps'
    },
    {
      id: 'burpees',
      name: 'Burpees',
      description: 'Full body high-intensity exercise',
      category: 'cardio',
      difficulty: 'advanced',
      duration: 8,
      calories: 160,
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-red-500',
      lightColor: 'bg-red-50 border-red-200',
      aiTracking: false,
      type: 'reps',
      defaultValue: 10,
      options: [5, 10, 15, 20],
      unit: 'reps'
    },
    {
      id: 'lunges',
      name: 'Lunges',
      description: 'Lower body strength and balance',
      category: 'strength',
      difficulty: 'intermediate',
      duration: 12,
      calories: 130,
      icon: <Target className="h-6 w-6" />,
      color: 'bg-green-500',
      lightColor: 'bg-green-50 border-green-200',
      aiTracking: false,
      type: 'reps',
      defaultValue: 20,
      options: [10, 20, 30, 40],
      unit: 'reps'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Exercises', icon: <Activity className="h-5 w-5" /> },
    { id: 'strength', name: 'Strength', icon: <Dumbbell className="h-5 w-5" /> },
    { id: 'cardio', name: 'Cardio', icon: <Heart className="h-5 w-5" /> },
    { id: 'core', name: 'Core', icon: <Target className="h-5 w-5" /> }
  ];

  const filteredWorkouts = workouts.filter(workout => {
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory;
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const closeModal = () => {
    setSelectedWorkout(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Workout Library
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover AI-powered workouts designed for every fitness level
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6"
        >
          {/* Search Bar */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workouts..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 shadow-md border border-gray-200 dark:border-gray-700'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Workout Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {filteredWorkouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              variants={itemVariants}
              onClick={() => setSelectedWorkout(workout)}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${workout.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {workout.icon}
                </div>
                <div className="flex items-center space-x-2">
                  {workout.aiTracking && (
                    <div className="flex items-center bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-medium">
                      <Brain className="h-3 w-3 mr-1" />
                      AI
                    </div>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workout.difficulty)}`}>
                    {workout.difficulty}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{workout.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{workout.description}</p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{workout.duration}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">min</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Flame className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{workout.calories}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">cal</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    {workout.type === 'reps' ? (
                      <Target className="h-4 w-4 text-green-500" />
                    ) : (
                      <Timer className="h-4 w-4 text-purple-500" />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{workout.defaultValue}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{workout.unit}</div>
                </div>
              </div>

              {/* Start Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  {workout.type === 'reps' ? (
                    <Target className="h-4 w-4 mr-1" />
                  ) : (
                    <Timer className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm">{workout.type === 'reps' ? 'Rep-based' : 'Time-based'}</span>
                </div>
                <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                  <span className="text-sm">Configure</span>
                  <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredWorkouts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Dumbbell className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No workouts found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filter to find what you're looking for.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Modal for Workout Configuration */}
        <AnimatePresence>
          {selectedWorkout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-2xl ${selectedWorkout.color} text-white mb-4 shadow-lg`}>
                    {selectedWorkout.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedWorkout.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{selectedWorkout.description}</p>
                  
                  {selectedWorkout.aiTracking && (
                    <div className="inline-flex items-center bg-purple-100 text-purple-600 px-4 py-2 rounded-full text-sm font-medium mt-3">
                      <Brain className="h-4 w-4 mr-2" />
                      AI-Powered Tracking
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200 mb-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedWorkout.duration} min</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Flame className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">{selectedWorkout.calories}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{selectedWorkout.difficulty}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Level</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 px-6 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <Link
                    to={`/workout-session?workout=${selectedWorkout.id}`}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Workout</span>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkoutLibrary;
