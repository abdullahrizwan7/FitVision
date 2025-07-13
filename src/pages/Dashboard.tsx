import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Calendar, 
  Dumbbell, 
  TrendingUp, 
  Award, 
  Clock, 
  Flame,
  ChevronRight,
  Target,
  Zap,
  Brain,
  Camera,
  AlertTriangle,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  // Enhanced mock data for dashboard
  const [recentWorkouts] = useState([
    { 
      id: 1, 
      name: 'AI Push-ups', 
      date: '2023-11-15', 
      reps: 15, 
      duration: '10 min',
      formScore: 85,
      aiAccuracy: 94,
      postureAlerts: 2,
      calories: 45
    },
    { 
      id: 2, 
      name: 'Smart Squats', 
      date: '2023-11-13', 
      reps: 20, 
      duration: '12 min',
      formScore: 90,
      aiAccuracy: 96,
      postureAlerts: 1,
      calories: 60
    },
    { 
      id: 3, 
      name: 'AI Jumping Jacks', 
      date: '2023-11-10', 
      reps: 30, 
      duration: '15 min',
      formScore: 88,
      aiAccuracy: 92,
      postureAlerts: 3,
      calories: 75
    }
  ]);

  const [weeklyStats] = useState({
    workoutsCompleted: 3,
    totalReps: 65,
    totalDuration: 37,
    avgFormScore: 88,
    avgAiAccuracy: 94,
    totalCalories: 180,
    postureImprovements: 15,
    aiInsights: 8
  });

  const [aiInsights] = useState([
    {
      type: 'improvement',
      title: 'Form Improvement Detected',
      message: 'Your squat form has improved by 12% this week!',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-green-600 bg-green-100'
    },
    {
      type: 'alert',
      title: 'Posture Alert Pattern',
      message: 'You tend to lean forward during push-ups. Focus on core engagement.',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      type: 'achievement',
      title: 'AI Accuracy Milestone',
      message: 'Congratulations! Your workouts are being tracked with 95%+ accuracy.',
      icon: <Brain className="h-5 w-5" />,
      color: 'text-purple-600 bg-purple-100'
    }
  ]);

  // Enhanced weekly activity chart with AI metrics
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activityData = [20, 35, 0, 45, 0, 30, 0]; // Minutes per day
  const aiAccuracyData = [92, 95, 0, 96, 0, 94, 0]; // AI accuracy per day

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pb-5 border-b border-gray-200 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Fitness Dashboard</h1>
          <p className="mt-2 text-sm text-gray-500">
            Track your AI-powered fitness progress with real-time analytics and insights
          </p>
        </div>

        {/* AI Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/workout-session" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Camera className="h-6 w-6 mr-2" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">AI POWERED</span>
                  </div>
                  <h3 className="text-xl font-bold">Start AI Workout</h3>
                  <p className="text-sm text-purple-100">Real-time pose detection & rep counting</p>
                </div>
                <ChevronRight className="h-6 w-6" />
              </div>
            </Link>
            
            <Link 
              to="/workout-library" 
              className="bg-white text-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Brain className="h-6 w-6 mr-2 text-purple-600" />
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">SMART</span>
                  </div>
                  <h3 className="text-xl font-bold">AI Workouts</h3>
                  <p className="text-sm text-gray-500">Browse intelligent workout library</p>
                </div>
                <ChevronRight className="h-6 w-6 text-gray-400" />
              </div>
            </Link>

            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <Zap className="h-6 w-6 mr-2" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">LIVE</span>
                  </div>
                  <h3 className="text-xl font-bold">AI Accuracy</h3>
                  <p className="text-2xl font-bold">{weeklyStats.avgAiAccuracy}%</p>
                </div>
                <Activity className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Weekly Stats */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Weekly AI Stats</h2>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <BarChart className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Dumbbell className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-600">AI Workouts</span>
                </div>
                <span className="font-bold text-lg">{weeklyStats.workoutsCompleted}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-600">Auto-Counted Reps</span>
                </div>
                <span className="font-bold text-lg">{weeklyStats.totalReps}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-600">Active Minutes</span>
                </div>
                <span className="font-bold text-lg">{weeklyStats.totalDuration}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Flame className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-gray-600">Calories Burned</span>
                </div>
                <span className="font-bold text-lg">{weeklyStats.totalCalories}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="text-gray-600">Avg. Form Score</span>
                </div>
                <span className="font-bold text-lg">{weeklyStats.avgFormScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-600">AI Accuracy</span>
                </div>
                <span className="font-bold text-lg text-purple-600">{weeklyStats.avgAiAccuracy}%</span>
              </div>
            </div>
          </div>

          {/* Enhanced Weekly Activity Chart with AI Metrics */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AI Activity Tracking</h2>
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="h-48 flex items-end justify-between space-x-2">
              {weekDays.map((day, index) => (
                <div key={day} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col items-center space-y-1">
                    {/* Activity bar */}
                    <div 
                      className="w-6 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-sm" 
                      style={{ 
                        height: `${activityData[index] / 45 * 120}px`,
                        opacity: activityData[index] === 0 ? 0.3 : 1
                      }}
                    ></div>
                    {/* AI accuracy indicator */}
                    {activityData[index] > 0 && (
                      <div className="text-xs text-purple-600 font-semibold">
                        {aiAccuracyData[index]}%
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-t from-purple-600 to-blue-500 rounded mr-2"></div>
                <span>Workout Minutes</span>
              </div>
              <div className="flex items-center">
                <Brain className="h-3 w-3 text-purple-600 mr-1" />
                <span>AI Accuracy %</span>
              </div>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${insight.color}`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Recent Workouts */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent AI Workouts</h2>
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-purple-600" />
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          {recentWorkouts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentWorkouts.map(workout => (
                <div key={workout.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{workout.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{workout.duration}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(workout.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{workout.reps} reps</div>
                    <div className="text-xs text-gray-500">Form: {workout.formScore}%</div>
                    <div className="text-xs text-gray-500">AI Accuracy: {workout.aiAccuracy}%</div>
                    <div className="text-xs text-gray-500">Calories: {workout.calories}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent workouts found.</p>
              <Link to="/workout-session" className="mt-3 text-sm text-purple-600 hover:text-purple-500 inline-block">
                Start your first workout
              </Link>
            </div>
          )}
        </div>

        {/* Achievements Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-100 rounded-lg">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600 mb-3">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-gray-900">First Workout</h3>
              <p className="text-xs text-gray-500 mt-1">Completed your first AI workout</p>
            </div>
            <div className="text-center p-4 border border-gray-100 rounded-lg bg-gray-50">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-gray-400 mb-3">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-gray-400">3-Day Streak</h3>
              <p className="text-xs text-gray-400 mt-1">Work out for 3 days in a row</p>
            </div>
            <div className="text-center p-4 border border-gray-100 rounded-lg bg-gray-50">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-gray-400 mb-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-gray-400">100 Reps</h3>
              <p className="text-xs text-gray-400 mt-1">Complete 100 total reps</p>
            </div>
            <div className="text-center p-4 border border-gray-100 rounded-lg bg-gray-50">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-200 text-gray-400 mb-3">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="font-medium text-gray-400">Variety Pack</h3>
              <p className="text-xs text-gray-400 mt-1">Try 5 different workout types</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;