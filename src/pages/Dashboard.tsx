import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { 
  Play,
  TrendingUp, 
  Award, 
  Clock, 
  Flame,
  Target,
  Brain,
  Camera,
  Dumbbell,
  Activity,
  Calendar,
  ChevronRight,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { workouts, stats, loading } = useWorkoutData();

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Use real data or defaults
  const recentWorkouts = workouts.slice(0, 3).map(workout => ({
    id: workout.id,
    name: workout.workoutType.name,
    date: workout.createdAt.toDate().toISOString().split('T')[0],
    reps: workout.repsCompleted,
    duration: `${Math.floor(workout.duration / 60)} min`,
    formScore: workout.formScore,
    calories: workout.calories
  }));

  const weeklyStats = {
    workoutsCompleted: stats?.totalWorkouts || 0,
    totalReps: stats?.totalReps || 0,
    totalMinutes: stats?.totalMinutes || 0,
    avgFormScore: stats?.avgFormScore || 0,
    totalCalories: stats?.totalCalories || 0,
    streak: stats?.currentStreak || 0
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
            Welcome Back{userProfile?.displayName ? `, ${userProfile.displayName}` : ''}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI-powered fitness tracking with real-time form correction and progress analytics
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={itemVariants}>
            <Link 
              to="/workout-session" 
              className="group bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Play className="h-8 w-8" />
                </div>
                <div className="flex items-center text-white/80">
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">AI POWERED</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Start Workout</h3>
              <p className="text-purple-100 mb-4">Real-time pose detection & form feedback</p>
              <div className="flex items-center text-white/80">
                <span className="text-sm">Begin your fitness journey</span>
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link 
              to="/workout-library" 
              className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 block border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Dumbbell className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex items-center">
                  <span className="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full">LIBRARY</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Browse Workouts</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Discover AI-tracked exercises</p>
              <div className="flex items-center text-purple-600">
                <span className="text-sm font-medium">Explore collection</span>
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link 
              to="/analytics" 
              className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 block border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex items-center">
                  <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">INSIGHTS</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">View Analytics</h3>
              <p className="text-gray-600 mb-4">Track your fitness progress</p>
              <div className="flex items-center text-green-600">
                <span className="text-sm font-medium">See detailed metrics</span>
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Weekly Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="inline-flex p-3 bg-purple-100 rounded-xl mb-3">
              <Dumbbell className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyStats.workoutsCompleted}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Workouts</div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="inline-flex p-3 bg-blue-100 rounded-xl mb-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyStats.totalReps}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Reps</div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="inline-flex p-3 bg-green-100 rounded-xl mb-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyStats.totalMinutes}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Minutes</div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="inline-flex p-3 bg-yellow-100 rounded-xl mb-3">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyStats.avgFormScore}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Form Score</div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="inline-flex p-3 bg-red-100 rounded-xl mb-3">
              <Flame className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyStats.totalCalories}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Calories</div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-center"
          >
            <div className="inline-flex p-3 bg-orange-100 rounded-xl mb-3">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyStats.streak}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Day Streak</div>
          </motion.div>
        </motion.div>

        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Workouts</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your latest AI-tracked sessions</p>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-purple-600" />
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
          </div>

          {recentWorkouts.length > 0 ? (
            <div className="space-y-4">
              {recentWorkouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{workout.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(workout.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{workout.reps}</div>
                      <div className="text-gray-500">reps</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{workout.duration}</div>
                      <div className="text-gray-500">time</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{workout.formScore}%</div>
                      <div className="text-gray-500">form</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{workout.calories}</div>
                      <div className="text-gray-500">cal</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts yet</h3>
              <p className="text-gray-500 mb-4">Start your first AI-powered workout to see your progress</p>
              <Link 
                to="/workout-session" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              >
                <Play className="h-4 w-4 mr-2" />
                Start First Workout
              </Link>
            </div>
          )}
        </motion.div>

        {/* AI Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4">
                <Camera className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Detection</h3>
              <p className="text-purple-100">AI tracks your movements with precision using advanced pose detection</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Feedback</h3>
              <p className="text-purple-100">Get instant form corrections and personalized workout insights</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Auto Rep Counting</h3>
              <p className="text-purple-100">Never lose count again with our intelligent repetition tracking</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
