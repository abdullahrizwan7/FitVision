import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Target, 
  Award, 
  Activity, 
  Brain, 
  Zap, 
  Clock, 
  Flame, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Camera,
  Users,
  Trophy,
  Filter,
  Download,
  Share2
} from 'lucide-react';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Enhanced mock data for analytics
  const [performanceData] = useState({
    week: {
      workouts: 5,
      totalReps: 125,
      avgFormScore: 88,
      aiAccuracy: 94,
      caloriesBurned: 450,
      activeMinutes: 75,
      postureAlerts: 8,
      improvements: 12
    },
    month: {
      workouts: 18,
      totalReps: 520,
      avgFormScore: 85,
      aiAccuracy: 92,
      caloriesBurned: 1680,
      activeMinutes: 290,
      postureAlerts: 35,
      improvements: 45
    },
    year: {
      workouts: 156,
      totalReps: 4200,
      avgFormScore: 82,
      aiAccuracy: 89,
      caloriesBurned: 12500,
      activeMinutes: 2100,
      postureAlerts: 280,
      improvements: 380
    }
  });

  const [workoutBreakdown] = useState([
    { name: 'Push-ups', count: 45, percentage: 35, avgAccuracy: 95, color: 'bg-purple-500', lightColor: 'bg-purple-100' },
    { name: 'Squats', count: 38, percentage: 30, avgAccuracy: 93, color: 'bg-blue-500', lightColor: 'bg-blue-100' },
    { name: 'Jumping Jacks', count: 25, percentage: 20, avgAccuracy: 91, color: 'bg-green-500', lightColor: 'bg-green-100' },
    { name: 'Planks', count: 18, percentage: 15, avgAccuracy: 89, color: 'bg-yellow-500', lightColor: 'bg-yellow-100' }
  ]);

  const [formProgressData] = useState([
    { week: 'W1', pushups: 75, squats: 70, jumpingJacks: 80, plank: 65 },
    { week: 'W2', pushups: 78, squats: 75, jumpingJacks: 82, plank: 70 },
    { week: 'W3', pushups: 82, squats: 80, jumpingJacks: 85, plank: 75 },
    { week: 'W4', pushups: 88, squats: 85, jumpingJacks: 88, plank: 82 }
  ]);

  const [aiInsights] = useState([
    {
      type: 'improvement',
      title: 'Form Consistency Improved',
      description: 'Your push-up form has become 15% more consistent over the past month.',
      impact: 'High',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    {
      type: 'alert',
      title: 'Posture Pattern Detected',
      description: 'AI detected you tend to lean forward during squats in the afternoon.',
      impact: 'Medium',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    },
    {
      type: 'achievement',
      title: 'AI Accuracy Milestone',
      description: 'Congratulations! Your workouts are now tracked with 95%+ accuracy.',
      impact: 'High',
      icon: <Trophy className="h-5 w-5" />,
      color: 'text-purple-600 bg-purple-50 border-purple-200'
    },
    {
      type: 'recommendation',
      title: 'Workout Optimization',
      description: 'Based on your performance, try increasing push-up reps by 20%.',
      impact: 'Medium',
      icon: <Brain className="h-5 w-5" />,
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    }
  ]);

  const currentData = performanceData[selectedPeriod as keyof typeof performanceData];

  const StatCard = ({ title, value, change, icon, color, subtitle }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${color} shadow-lg`}>
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          {change > 0 ? (
            <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs font-medium text-green-600">+{change}%</span>
            </div>
          ) : (
            <div className="flex items-center bg-red-100 px-2 py-1 rounded-full">
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              <span className="text-xs font-medium text-red-600">{change}%</span>
            </div>
          )}
          <span className="text-xs text-gray-500 ml-2">vs last {selectedPeriod}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Enhanced Header */}
        <div className="pb-8 border-b border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-3">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AI Analytics Dashboard</h1>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <p className="text-sm text-gray-500">Real-time AI insights powered by MediaPipe & OpenCV</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Controls */}
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
              {/* Period Selector */}
              <div className="flex bg-white rounded-xl p-1 shadow-lg border border-gray-200">
                {['week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      selectedPeriod === period
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-purple-600">
                  <Download className="h-5 w-5" />
                </button>
                <button className="p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-purple-600">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="AI-Tracked Workouts"
            value={currentData.workouts}
            change={12}
            icon={<Camera className="h-7 w-7 text-white" />}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            subtitle="Real-time pose detection"
          />
          <StatCard
            title="Auto-Counted Reps"
            value={currentData.totalReps.toLocaleString()}
            change={8}
            icon={<Target className="h-7 w-7 text-white" />}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            subtitle="OpenCV powered counting"
          />
          <StatCard
            title="AI Accuracy"
            value={`${currentData.aiAccuracy}%`}
            change={3}
            icon={<Brain className="h-7 w-7 text-white" />}
            color="bg-gradient-to-r from-green-500 to-green-600"
            subtitle="MediaPipe precision"
          />
          <StatCard
            title="Form Score"
            value={`${currentData.avgFormScore}%`}
            change={5}
            icon={<Award className="h-7 w-7 text-white" />}
            color="bg-gradient-to-r from-yellow-500 to-yellow-600"
            subtitle="Posture analysis"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Calories Burned"
            value={currentData.caloriesBurned.toLocaleString()}
            change={15}
            icon={<Flame className="h-7 w-7 text-white" />}
            color="bg-gradient-to-r from-red-500 to-red-600"
          />
          <StatCard
            title="Active Minutes"
            value={currentData.activeMinutes}
            change={10}
            icon={<Clock className="h-7 w-7 text-white" />}
            color="bg-gradient-to-r from-indigo-500 to-indigo-600"
          />
          <StatCard
            title="Posture Alerts"
            value={currentData.postureAlerts}
            change={-20}
            icon={<AlertTriangle className="h-7 w-7 text-white" />}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          <StatCard
            title="Improvements"
            value={currentData.improvements}
            change={25}
            icon={<TrendingUp className="h-7 w-7 text-white" />}
            color="bg-gradient-to-r from-teal-500 to-teal-600"
          />
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Workout Breakdown */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Workout Distribution</h2>
                <p className="text-sm text-gray-500 mt-1">AI-tracked exercise breakdown</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            
            <div className="space-y-6">
              {workoutBreakdown.map((workout, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <div className={`w-5 h-5 rounded-full ${workout.color} shadow-lg`}></div>
                      <span className="text-lg font-semibold text-gray-800">{workout.name}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className="text-sm text-gray-500">{workout.count} sessions</span>
                      <span className="text-lg font-bold text-gray-900">{workout.percentage}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div 
                      className={`h-3 rounded-full ${workout.color} transition-all duration-500 ease-out`}
                      style={{ width: `${workout.percentage}%` }}
                    ></div>
                  </div>
                  
                  {/* AI Accuracy Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-xs text-purple-600">{workout.avgAccuracy}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Progress Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Form Score Progress</h2>
              <LineChart className="h-5 w-5 text-purple-600" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {formProgressData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                  <div className="w-full flex flex-col items-center space-y-1">
                    <div 
                      className="w-4 bg-purple-500 rounded-t-sm" 
                      style={{ height: `${data.pushups * 2}px` }}
                    ></div>
                    <div 
                      className="w-4 bg-blue-500 rounded-t-sm" 
                      style={{ height: `${data.squats * 2}px` }}
                    ></div>
                    <div 
                      className="w-4 bg-green-500 rounded-t-sm" 
                      style={{ height: `${data.jumpingJacks * 2}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{data.week}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Push-ups</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Squats</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Jumping Jacks</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h2>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {insight.icon}
                    <span className={`text-sm font-medium ${insight.color}`}>{insight.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">{insight.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;