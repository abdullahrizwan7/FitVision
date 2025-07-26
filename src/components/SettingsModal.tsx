import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Bell, 
  Volume2, 
  VolumeX,
  Monitor,
  Moon,
  Sun,
  Globe,
  Camera,
  Mic,
  Shield,
  HelpCircle,
  Info,
  Download,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState({
    // Workout Settings
    autoRest: true,
    voiceCoaching: true,
    formAlerts: true,
    repCounting: true,
    
    // Notification Settings
    workoutReminders: userProfile?.preferences?.notifications || true,
    achievementAlerts: true,
    weeklyReports: true,
    
    // Privacy Settings
    cameraAccess: true,
    microphoneAccess: false,
    dataCollection: true,
    analyticsSharing: false,
    
    // Display Settings
    theme: theme,
    units: userProfile?.preferences?.units || 'metric',
    language: 'en',
    
    // AI Settings
    aiDifficulty: 'adaptive',
    poseAccuracy: 'high',
    feedbackFrequency: 'normal'
  });

  // Update settings when modal opens to reflect current values
  useEffect(() => {
    if (isOpen) {
      setSettings(prev => ({
        ...prev,
        theme: theme,
        units: userProfile?.preferences?.units || 'metric',
        workoutReminders: userProfile?.preferences?.notifications || true
      }));
    }
  }, [isOpen, userProfile, theme]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Apply theme change immediately
    if (key === 'theme') {
      setTheme(value);
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfile({
        preferences: {
          ...userProfile?.preferences,
          notifications: settings.workoutReminders,
          theme: settings.theme,
          units: settings.units
        }
      });
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      autoRest: true,
      voiceCoaching: true,
      formAlerts: true,
      repCounting: true,
      workoutReminders: true,
      achievementAlerts: true,
      weeklyReports: true,
      cameraAccess: true,
      microphoneAccess: false,
      dataCollection: true,
      analyticsSharing: false,
      theme: 'light',
      units: 'metric',
      language: 'en',
      aiDifficulty: 'adaptive',
      poseAccuracy: 'high',
      feedbackFrequency: 'normal'
    };
    
    setSettings(defaultSettings);
    // Apply default theme
    setTheme('light');
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }: any) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
        {description && <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-purple-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectOption = ({ value, onChange, options, label }: any) => (
    <div className="py-3">
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customize your FitVision experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Workout Settings */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-purple-600" />
                      Workout Settings
                    </h3>
                    <div className="space-y-1">
                      <ToggleSwitch
                        enabled={settings.autoRest}
                        onChange={(value: boolean) => handleSettingChange('autoRest', value)}
                        label="Auto Rest Timer"
                        description="Automatically start rest periods between sets"
                      />
                      <ToggleSwitch
                        enabled={settings.voiceCoaching}
                        onChange={(value: boolean) => handleSettingChange('voiceCoaching', value)}
                        label="Voice Coaching"
                        description="Audio cues and form corrections during workouts"
                      />
                      <ToggleSwitch
                        enabled={settings.formAlerts}
                        onChange={(value: boolean) => handleSettingChange('formAlerts', value)}
                        label="Form Alerts"
                        description="Real-time notifications for form improvements"
                      />
                      <ToggleSwitch
                        enabled={settings.repCounting}
                        onChange={(value: boolean) => handleSettingChange('repCounting', value)}
                        label="Auto Rep Counting"
                        description="AI-powered automatic repetition counting"
                      />
                    </div>

                    <SelectOption
                      value={settings.aiDifficulty}
                      onChange={(value: string) => handleSettingChange('aiDifficulty', value)}
                      label="AI Difficulty"
                      options={[
                        { value: 'easy', label: 'Easy - Relaxed form requirements' },
                        { value: 'adaptive', label: 'Adaptive - Adjusts to your level' },
                        { value: 'strict', label: 'Strict - Precise form required' }
                      ]}
                    />
                  </div>

                  {/* Notification Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Bell className="h-5 w-5 mr-2 text-blue-600" />
                      Notifications
                    </h3>
                    <div className="space-y-1">
                      <ToggleSwitch
                        enabled={settings.workoutReminders}
                        onChange={(value: boolean) => handleSettingChange('workoutReminders', value)}
                        label="Workout Reminders"
                        description="Daily reminders to stay active"
                      />
                      <ToggleSwitch
                        enabled={settings.achievementAlerts}
                        onChange={(value: boolean) => handleSettingChange('achievementAlerts', value)}
                        label="Achievement Alerts"
                        description="Notifications when you unlock achievements"
                      />
                      <ToggleSwitch
                        enabled={settings.weeklyReports}
                        onChange={(value: boolean) => handleSettingChange('weeklyReports', value)}
                        label="Weekly Reports"
                        description="Summary of your weekly progress"
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy & Display Settings */}
                <div className="space-y-6">
                  {/* Privacy Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-green-600" />
                      Privacy & Permissions
                    </h3>
                    <div className="space-y-1">
                      <ToggleSwitch
                        enabled={settings.cameraAccess}
                        onChange={(value: boolean) => handleSettingChange('cameraAccess', value)}
                        label="Camera Access"
                        description="Required for AI pose detection"
                      />
                      <ToggleSwitch
                        enabled={settings.microphoneAccess}
                        onChange={(value: boolean) => handleSettingChange('microphoneAccess', value)}
                        label="Microphone Access"
                        description="For voice commands and coaching"
                      />
                      <ToggleSwitch
                        enabled={settings.dataCollection}
                        onChange={(value: boolean) => handleSettingChange('dataCollection', value)}
                        label="Workout Data Collection"
                        description="Store workout data for progress tracking"
                      />
                      <ToggleSwitch
                        enabled={settings.analyticsSharing}
                        onChange={(value: boolean) => handleSettingChange('analyticsSharing', value)}
                        label="Anonymous Analytics"
                        description="Help improve FitVision with usage data"
                      />
                    </div>
                  </div>

                  {/* Display Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Monitor className="h-5 w-5 mr-2 text-indigo-600" />
                      Display & Language
                    </h3>
                    
                    <SelectOption
                      value={settings.theme}
                      onChange={(value: string) => handleSettingChange('theme', value)}
                      label="Theme"
                      options={[
                        { value: 'light', label: '☀️ Light Mode' },
                        { value: 'dark', label: '🌙 Dark Mode' },
                        { value: 'auto', label: '🔄 Auto (System)' }
                      ]}
                    />

                    <SelectOption
                      value={settings.units}
                      onChange={(value: string) => handleSettingChange('units', value)}
                      label="Units"
                      options={[
                        { value: 'metric', label: 'Metric (kg, cm, km)' },
                        { value: 'imperial', label: 'Imperial (lbs, ft, miles)' }
                      ]}
                    />

                    <SelectOption
                      value={settings.language}
                      onChange={(value: string) => handleSettingChange('language', value)}
                      label="Language"
                      options={[
                        { value: 'en', label: '🇺🇸 English' },
                        { value: 'es', label: '🇪🇸 Español' },
                        { value: 'fr', label: '🇫🇷 Français' },
                        { value: 'de', label: '🇩🇪 Deutsch' }
                      ]}
                    />
                  </div>

                  {/* AI Settings */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Info className="h-5 w-5 mr-2 text-yellow-600" />
                      AI Settings
                    </h3>
                    
                    <SelectOption
                      value={settings.poseAccuracy}
                      onChange={(value: string) => handleSettingChange('poseAccuracy', value)}
                      label="Pose Detection Accuracy"
                      options={[
                        { value: 'low', label: 'Low - Faster performance' },
                        { value: 'medium', label: 'Medium - Balanced' },
                        { value: 'high', label: 'High - Best accuracy' }
                      ]}
                    />

                    <SelectOption
                      value={settings.feedbackFrequency}
                      onChange={(value: string) => handleSettingChange('feedbackFrequency', value)}
                      label="Feedback Frequency"
                      options={[
                        { value: 'minimal', label: 'Minimal - Only major corrections' },
                        { value: 'normal', label: 'Normal - Balanced feedback' },
                        { value: 'detailed', label: 'Detailed - Comprehensive guidance' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Defaults</span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
