import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CameraIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  FireIcon,
  UserGroupIcon,
  PlayIcon,
  EyeIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const aiFeatures = [
    {
      icon: <EyeIcon className="h-8 w-8" />,
      title: "Real-Time Pose Detection",
      description: "Advanced MediaPipe integration tracks 33+ body keypoints with skeleton overlay visualization for perfect form analysis.",
      color: "bg-blue-500"
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Smart Rep Counter",
      description: "AI-powered OpenCV algorithms automatically count push-ups, squats, and jumping jacks by tracking body movement patterns.",
      color: "bg-green-500"
    },
    {
      icon: <ExclamationTriangleIcon className="h-8 w-8" />,
      title: "Posture Correction Alerts",
      description: "Real-time joint angle analysis provides instant feedback to prevent injuries and optimize workout effectiveness.",
      color: "bg-yellow-500"
    },
    {
      icon: <CpuChipIcon className="h-8 w-8" />,
      title: "AI Analytics Dashboard",
      description: "Machine learning algorithms analyze your performance trends and provide personalized workout recommendations.",
      color: "bg-purple-500"
    }
  ];

  const workoutTypes = [
    { name: "Push-ups", reps: "Auto-counted", difficulty: "Beginner" },
    { name: "Squats", reps: "Auto-counted", difficulty: "Intermediate" },
    { name: "Jumping Jacks", reps: "Auto-counted", difficulty: "Beginner" },
    { name: "Planks", reps: "Time-based", difficulty: "Advanced" }
  ];

  const stats = [
    { label: "AI Accuracy", value: "95%", icon: <CpuChipIcon className="h-6 w-6" /> },
    { label: "Workouts Tracked", value: "10K+", icon: <ChartBarIcon className="h-6 w-6" /> },
    { label: "Users Active", value: "2.5K+", icon: <UserGroupIcon className="h-6 w-6" /> },
    { label: "Calories Burned", value: "500K+", icon: <FireIcon className="h-6 w-6" /> }
  ];

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-16">
          <div className="relative">
            <img 
              src="/FitVision/images/logo.png" 
              alt="FitVision Logo" 
              className="h-40 w-auto mx-auto mb-6 drop-shadow-lg" 
            />
            <div className="absolute -top-2 -right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
              AI POWERED
            </div>
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Fit<span className="text-purple-600">Vision</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-600">
            Your AI-Powered Personal Trainer with Real-Time Pose Detection, 
            Smart Rep Counting & Posture Correction
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/workout-session"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Start AI Workout
            </Link>
            <Link
              to="/workout-library"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-600 text-lg font-medium rounded-lg text-purple-600 bg-white hover:bg-purple-50 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              Browse AI Workouts
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-12 border-y border-gray-200 bg-white/50 backdrop-blur-sm rounded-2xl mb-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center text-purple-600 mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* AI Features Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Advanced AI Features
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
              Powered by MediaPipe, OpenCV, and TensorFlow for the most accurate fitness tracking
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className={`inline-flex p-3 rounded-lg text-white mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Workouts Section */}
        <div className="py-16 bg-white rounded-2xl shadow-sm">
          <div className="px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                AI-Supported Workouts
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Each workout includes real-time AI analysis and feedback
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {workoutTypes.map((workout, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-colors duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{workout.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      workout.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      workout.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {workout.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{workout.reps}</p>
                  <div className="flex items-center text-xs text-purple-600">
                    <CpuChipIcon className="h-4 w-4 mr-1" />
                    AI Tracking Enabled
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How FitVision AI Works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Setup</h3>
              <p className="text-gray-600">
                Position yourself in front of your device camera. Our AI will detect your body pose in real-time.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                MediaPipe tracks 33+ body keypoints while OpenCV counts reps and analyzes your form.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Feedback</h3>
              <p className="text-gray-600">
                Get instant posture corrections, rep counts, and performance analytics during your workout.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white">
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users already training smarter with AI
          </p>
          <Link
            to="/workout-session"
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-purple-600 bg-white hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Start Your First AI Workout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;