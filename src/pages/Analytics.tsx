import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkoutData, useWeeklyWorkoutData, useWorkoutStatsByCategory } from '../hooks/useWorkoutData';
import { 
  TrendingUp, 
  TrendingDown,
  Award, 
  Clock, 
  Flame,
  Target,
  Brain,
  Camera,
  Dumbbell,
  Activity,
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const { stats, loading } = useWorkoutData();
  const { weeklyData } = useWeeklyWorkoutData();
  const { workoutBreakdown } = useWorkoutStatsByCategory();

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate period-specific data
  const currentData = {
    workouts: stats?.totalWorkouts || 0,
    totalReps: stats?.totalReps || 0,
    avgFormScore: stats?.avgFormScore || 0,
    aiAccuracy: stats?.avgAiAccuracy || 0,
    caloriesBurned: stats?.totalCalories || 0,
    activeMinutes: stats?.totalMinutes || 0,
    improvements: Math.floor((stats?.totalWorkouts || 0) * 1.5) // Estimated improvements
  };

  // Map weekly data for chart
  const weeklyProgress = weeklyData.map(day => ({
    day: day.day,
    workouts: day.workouts,
    formScore: day.avgFormScore,
    reps: day.totalReps
  }));

  const StatCard = ({ title, value, change, icon, bgColor, textColor, subtitle }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-2 rounded-lg ${bgColor}`}>
              {icon}
            </div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {change > 0 ? (
            <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs font-medium text-green-600">+{change}%</span>
            </div>
          ) : change < 0 ? (
            <div className="flex items-center bg-red-100 px-2 py-1 rounded-full">
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              <span className="text-xs font-medium text-red-600">{change}%</span>
            </div>
          ) : (
            <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
              <span className="text-xs font-medium text-gray-600">No change</span>
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last {selectedPeriod}</span>
        </div>
      )}
    </motion.div>
  );

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
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl mr-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time AI-powered insights</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            {['week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-8 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                This {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="AI Workouts"
              value={currentData.workouts}
              change={12}
              icon={<Camera className="h-5 w-5 text-white" />}
              bgColor="bg-purple-500"
              subtitle="Sessions tracked"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Reps"
              value={currentData.totalReps.toLocaleString()}
              change={8}
              icon={<Target className="h-5 w-5 text-white" />}
              bgColor="bg-blue-500"
              subtitle="Auto-counted"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              title="Form Score"
              value={`${currentData.avgFormScore}%`}
              change={5}
              icon={<Award className="h-5 w-5 text-white" />}
              bgColor="bg-green-500"
              subtitle="Average accuracy"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              title="AI Accuracy"
              value={`${currentData.aiAccuracy}%`}
              change={3}
              icon={<Brain className="h-5 w-5 text-white" />}
              bgColor="bg-yellow-500"
              subtitle="Detection precision"
            />
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Calories Burned"
              value={currentData.caloriesBurned.toLocaleString()}
              change={15}
              icon={<Flame className="h-5 w-5 text-white" />}
              bgColor="bg-red-500"
              subtitle="Total energy"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              title="Active Minutes"
              value={currentData.activeMinutes}
              change={10}
              icon={<Clock className="h-5 w-5 text-white" />}
              bgColor="bg-indigo-500"
              subtitle="Workout time"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <StatCard
              title="Improvements"
              value={currentData.improvements}
              change={25}
              icon={<TrendingUp className="h-5 w-5 text-white" />}
              bgColor="bg-teal-500"
              subtitle="Form corrections"
            />
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {/* Workout Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Breakdown</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-tracked exercise distribution</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Dumbbell className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            
            <div className="space-y-6">
              {workoutBreakdown.map((workout, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${workout.color}`}></div>
                      <span className="text-lg font-semibold text-gray-800">{workout.name}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{workout.sessions}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{workout.totalReps}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">reps</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full ${workout.color} transition-all duration-500`}
                      style={{ width: `${(workout.sessions / 15) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Award className={`h-4 w-4 ${workout.textColor}`} />
                      <span className={`text-sm font-medium ${workout.textColor}`}>
                        {workout.avgFormScore}% form score
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Activity</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Daily workout consistency</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <div className="h-64 flex items-end justify-between space-x-2">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col items-center space-y-1">
                    <div 
                      className="w-8 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg transition-all duration-500" 
                      style={{ 
                        height: `${Math.max(day.workouts * 40, 8)}px`,
                        opacity: day.workouts === 0 ? 0.3 : 1
                      }}
                    ></div>
                    {day.workouts > 0 && (
                      <div className="text-xs text-purple-600 font-semibold">
                        {day.formScore}%
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-3">{day.day}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-t from-purple-600 to-blue-500 rounded mr-2"></div>
                <span>Workout Sessions</span>
              </div>
              <div className="flex items-center">
                <Brain className="h-3 w-3 text-purple-600 mr-1" />
                <span>Form Score %</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white"
        >
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-white/20 rounded-2xl mb-4">
              <Brain className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI Insights</h2>
            <p className="text-purple-100">Personalized recommendations based on your workout data</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-white/10 rounded-xl p-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Form Improvement</h3>
              <p className="text-sm text-purple-100">Your squat form has improved by 15% this week</p>
            </div>
            
            <div className="text-center bg-white/10 rounded-xl p-6">
              <Target className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Rep Accuracy</h3>
              <p className="text-sm text-purple-100">AI is tracking your reps with 94% precision</p>
            </div>
            
            <div className="text-center bg-white/10 rounded-xl p-6">
              <Award className="h-8 w-8 mx-auto mb-3" />
              <h3 className="font-bold mb-2">Achievement</h3>
              <p className="text-sm text-purple-100">You've maintained consistent form for 5 days</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
