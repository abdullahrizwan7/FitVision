import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Camera, 
  Edit3, 
  Save, 
  X,
  Bell, 
  Shield, 
  Settings,
  Target,
  Calendar,
  Award,
  Flame,
  Clock,
  TrendingUp,
  Mail,
  Globe,
  Moon,
  Sun,
  Brain
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkoutData } from '../hooks/useWorkoutData';

const Profile = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const { stats } = useWorkoutData();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    email: user?.email || '',
    bio: '',
    location: '',
    dateOfBirth: '',
    fitnessGoal: userProfile?.preferences?.fitnessGoal || 'general',
    units: userProfile?.preferences?.units || 'metric',
    notifications: userProfile?.preferences?.notifications || true,
    theme: userProfile?.preferences?.theme || 'light'
  });

  const handleSave = async () => {
    try {
      await updateUserProfile({
        displayName: formData.displayName,
        preferences: {
          ...userProfile?.preferences,
          units: formData.units,
          notifications: formData.notifications,
          theme: formData.theme,
          fitnessGoal: formData.fitnessGoal
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative inline-block mb-6">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-24 h-24 rounded-full mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center mx-auto">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {userProfile?.displayName || user?.displayName || 'User'}
                </h2>
                <p className="text-gray-500 mb-4">{user?.email}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats?.totalWorkouts || 0}</div>
                    <div className="text-xs text-gray-500">Workouts</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats?.currentStreak || 0}</div>
                    <div className="text-xs text-gray-500">Day Streak</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Overview */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Total Reps</span>
                  </div>
                  <span className="font-semibold">{stats?.totalReps || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Flame className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">Calories Burned</span>
                  </div>
                  <span className="font-semibold">{stats?.totalCalories || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Active Minutes</span>
                  </div>
                  <span className="font-semibold">{stats?.totalMinutes || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-gray-700">Avg. Form Score</span>
                  </div>
                  <span className="font-semibold">{stats?.avgFormScore || 0}%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Settings Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2"
          >
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Account Settings</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Personal Information
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goal</label>
                    <select
                      name="fitnessGoal"
                      value={formData.fitnessGoal}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="weight_loss">Weight Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="endurance">Build Endurance</option>
                      <option value="strength">Increase Strength</option>
                      <option value="general">General Fitness</option>
                    </select>
                  </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                    <select
                      name="units"
                      value={formData.units}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="metric">Metric (kg, cm)</option>
                      <option value="imperial">Imperial (lbs, ft)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'notifications', type: 'checkbox', checked: !formData.notifications } } as any)}
                      disabled={!isEditing}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.notifications ? 'bg-purple-600' : 'bg-gray-200'
                      } ${!isEditing ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Workout Preferences */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Workout Preferences
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-center">
                      <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Weekly Goal</div>
                      <div className="text-lg font-bold text-purple-600">5 days</div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-center">
                      <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Session Length</div>
                      <div className="text-lg font-bold text-blue-600">30 min</div>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Difficulty</div>
                      <div className="text-lg font-bold text-green-600">Beginner</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
