import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Award, 
  Target, 
  Flame, 
  Calendar,
  TrendingUp,
  Zap,
  Star,
  Crown,
  Medal,
  Clock,
  Dumbbell,
  Heart,
  Shield
} from 'lucide-react';
import { useWorkoutData } from '../hooks/useWorkoutData';

const Achievements = () => {
  const { stats } = useWorkoutData();

  const achievements = [
    {
      id: 'first_workout',
      title: 'First Steps',
      description: 'Complete your first workout',
      icon: <Dumbbell className="h-8 w-8" />,
      color: 'bg-purple-600',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      unlocked: (stats?.totalWorkouts || 0) >= 1,
      progress: Math.min((stats?.totalWorkouts || 0), 1),
      requirement: '1 workout'
    },
    {
      id: 'workout_streak_3',
      title: 'Getting Consistent',
      description: 'Maintain a 3-day workout streak',
      icon: <Calendar className="h-8 w-8" />,
      color: 'bg-blue-600',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      unlocked: (stats?.currentStreak || 0) >= 3,
      progress: Math.min((stats?.currentStreak || 0) / 3, 1),
      requirement: '3-day streak'
    },
    {
      id: 'workout_streak_7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day workout streak',
      icon: <Flame className="h-8 w-8" />,
      color: 'bg-orange-600',
      lightColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      unlocked: (stats?.currentStreak || 0) >= 7,
      progress: Math.min((stats?.currentStreak || 0) / 7, 1),
      requirement: '7-day streak'
    },
    {
      id: 'reps_100',
      title: 'Century Club',
      description: 'Complete 100 total reps',
      icon: <Target className="h-8 w-8" />,
      color: 'bg-green-600',
      lightColor: 'bg-green-100',
      textColor: 'text-green-600',
      unlocked: (stats?.totalReps || 0) >= 100,
      progress: Math.min((stats?.totalReps || 0) / 100, 1),
      requirement: '100 reps'
    },
    {
      id: 'reps_500',
      title: 'Rep Master',
      description: 'Complete 500 total reps',
      icon: <Medal className="h-8 w-8" />,
      color: 'bg-yellow-600',
      lightColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      unlocked: (stats?.totalReps || 0) >= 500,
      progress: Math.min((stats?.totalReps || 0) / 500, 1),
      requirement: '500 reps'
    },
    {
      id: 'calories_1000',
      title: 'Calorie Crusher',
      description: 'Burn 1000 total calories',
      icon: <Flame className="h-8 w-8" />,
      color: 'bg-red-600',
      lightColor: 'bg-red-100',
      textColor: 'text-red-600',
      unlocked: (stats?.totalCalories || 0) >= 1000,
      progress: Math.min((stats?.totalCalories || 0) / 1000, 1),
      requirement: '1000 calories'
    },
    {
      id: 'form_master',
      title: 'Perfect Form',
      description: 'Achieve 90%+ average form score',
      icon: <Award className="h-8 w-8" />,
      color: 'bg-indigo-600',
      lightColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      unlocked: (stats?.avgFormScore || 0) >= 90,
      progress: Math.min((stats?.avgFormScore || 0) / 90, 1),
      requirement: '90% form score'
    },
    {
      id: 'time_warrior',
      title: 'Time Warrior',
      description: 'Complete 60 active minutes',
      icon: <Clock className="h-8 w-8" />,
      color: 'bg-teal-600',
      lightColor: 'bg-teal-100',
      textColor: 'text-teal-600',
      unlocked: (stats?.totalMinutes || 0) >= 60,
      progress: Math.min((stats?.totalMinutes || 0) / 60, 1),
      requirement: '60 minutes'
    },
    {
      id: 'ai_champion',
      title: 'AI Champion',
      description: 'Achieve 95%+ AI accuracy',
      icon: <Brain className="h-8 w-8" />,
      color: 'bg-purple-600',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      unlocked: (stats?.avgAiAccuracy || 0) >= 95,
      progress: Math.min((stats?.avgAiAccuracy || 0) / 95, 1),
      requirement: '95% AI accuracy'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Achievements</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track your fitness milestones and celebrate your progress
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex p-4 bg-purple-100 rounded-2xl mb-3">
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{unlockedCount}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Achievements Unlocked</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-3">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round((unlockedCount / totalAchievements) * 100)}%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 bg-green-100 rounded-2xl mb-3">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.totalReps || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Reps</div>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 bg-yellow-100 rounded-2xl mb-3">
                <Flame className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.currentStreak || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
            </div>
          </div>
        </motion.div>

        {/* Achievement Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {['All', 'Unlocked', 'In Progress', 'Locked'].map((category) => (
              <button
                key={category}
                className="px-6 py-3 rounded-xl font-medium transition-all duration-200 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 shadow-md border border-gray-200 dark:border-gray-700"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              variants={itemVariants}
              className={`relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                achievement.unlocked 
                  ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Achievement Badge */}
              {achievement.unlocked && (
                <div className="absolute top-4 right-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Crown className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl mb-4 ${
                  achievement.unlocked ? achievement.lightColor : 'bg-gray-200'
                }`}>
                  <div className={achievement.unlocked ? achievement.textColor : 'text-gray-400'}>
                    {achievement.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className={`text-xl font-bold mb-2 ${
                  achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                }`}>
                  {achievement.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(achievement.progress * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${achievement.color}`}
                      style={{ width: `${achievement.progress * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Requirement */}
                <div className={`text-xs px-3 py-1 rounded-full inline-block ${
                  achievement.unlocked 
                    ? `${achievement.lightColor} ${achievement.textColor}` 
                    : 'bg-gray-200 text-gray-500 dark:text-gray-400'
                }`}>
                  {achievement.requirement}
                </div>

                {/* Unlock Status */}
                {achievement.unlocked && (
                  <div className="mt-4 flex items-center space-x-2 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Unlocked!</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Motivational Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <Trophy className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Keep Going!</h2>
          <p className="text-purple-100 mb-4">
            You're doing great! Every workout brings you closer to your next achievement.
          </p>
          <div className="text-sm text-purple-200">
            Next milestone: {achievements.find(a => !a.unlocked)?.title || 'All achievements unlocked!'}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Achievements;
