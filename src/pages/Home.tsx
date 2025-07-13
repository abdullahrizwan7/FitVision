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
    CpuChipIcon,
    HeartIcon,
    SparklesIcon,
    ShieldCheckIcon,
    AcademicCapIcon
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <div className="text-center">
                        {/* Logo and Badge */}
                        <div className="relative inline-block mb-8">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                                <img
                                    src="/images/logo.png"
                                    alt="FitVision Logo"
                                    className="h-24 md:h-32 w-auto mx-auto drop-shadow-xl"
                                />
                            </div>
                            <div className="absolute -top-3 -right-3 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                <SparklesIcon className="h-3 w-3 inline mr-1" />
                                AI POWERED
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
                            Your <span className="text-yellow-300">Personal</span><br />
                            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                AI Fitness Coach
                            </span>
                        </h1>

                        <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-purple-100 leading-relaxed">
                            🏠 <strong>Train from home</strong> with your AI coach that sees, guides, and motivates you every step of the way.
                            Perfect for beginners who want to build confidence and strength.
                        </p>

                        {/* Trust Indicators */}
                        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-purple-200">
                            <div className="flex items-center">
                                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                Safe & Beginner-Friendly
                            </div>
                            <div className="flex items-center">
                                <HeartIcon className="h-4 w-4 mr-1" />
                                No Gym Required
                            </div>
                            <div className="flex items-center">
                                <AcademicCapIcon className="h-4 w-4 mr-1" />
                                Proper Form Coaching
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
                            <Link
                                to="/workout-session"
                                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl text-purple-700 bg-white hover:bg-yellow-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 border border-white/20"
                            >
                                <PlayIcon className="h-5 w-5 mr-2 group-hover:text-purple-600" />
                                Start My First Workout
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">FREE</span>
                            </Link>
                            <Link
                                to="/workout-library"
                                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-2xl text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 hover:border-white/50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                            >
                                <CameraIcon className="h-5 w-5 mr-2" />
                                Browse Workouts
                            </Link>
                        </div>

                        {/* Beginner Encouragement */}
                        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-2xl mx-auto border border-white/20">
                            <p className="text-purple-100 text-sm">
                                👋 <strong>New to fitness?</strong> Perfect! Our AI coach will start you slow, teach you proper form,
                                and celebrate every small win with you.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Join Our Growing Community
                        </h2>
                        <p className="text-gray-600">Real people, real results, real support</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                                <div className="flex justify-center text-purple-600 mb-3">
                                    {stat.icon}
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                                <div className="text-xs md:text-sm text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        Why Our AI Coach Works
                    </h2>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
                        Built with cutting-edge technology but designed for everyday people.
                        No confusing tech jargon—just results you can see and feel.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
                    {aiFeatures.map((feature, index) => (
                        <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                            <div className={`inline-flex p-4 rounded-xl text-white mb-6 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Supported Workouts Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-8 md:p-12 border border-purple-100">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                            Perfect Workouts for Every Level
                        </h2>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
                            Whether you're just starting out or looking to challenge yourself,
                            our AI adapts to your pace and keeps you motivated.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {workoutTypes.map((workout, index) => (
                            <div key={index} className="bg-white border border-white/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group hover:scale-105">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-gray-900 text-lg">{workout.name}</h3>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${workout.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                            workout.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {workout.difficulty}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4 font-medium">{workout.reps}</p>
                                <div className="flex items-center text-sm text-purple-600 font-medium">
                                    <CpuChipIcon className="h-4 w-4 mr-2" />
                                    AI Coach Included
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-purple-700 font-medium">
                            🎯 Start with beginner exercises and work your way up—your AI coach will guide you!
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                        Simple. Smart. Supportive.
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600">
                        Getting started is easier than you think—no complicated setup, no intimidating routines.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 md:gap-8 md:grid-cols-3">
                    <div className="text-center group">
                        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-3xl font-bold text-purple-600">1</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Just Show Up</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Open the app, turn on your camera, and position yourself comfortably.
                            No special equipment needed—just you and your device.
                        </p>
                    </div>

                    <div className="text-center group">
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-3xl font-bold text-blue-600">2</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">AI Takes Over</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Our smart AI watches your movements, counts your reps, and gently corrects your form—
                            like having a patient personal trainer.
                        </p>
                    </div>

                    <div className="text-center group">
                        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <span className="text-3xl font-bold text-green-600">3</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Feel Amazing</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Get instant encouragement, track your progress, and build confidence
                            with every workout. You've got this!
                        </p>
                    </div>
                </div>
            </div>

            {/* Final CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 md:p-16 text-center text-white">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
                            Your Fitness Journey Starts Now 💪
                        </h2>
                        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of people who chose to prioritize their health and discovered
                            that working out from home can be fun, effective, and empowering.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                            <Link
                                to="/workout-session"
                                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-purple-700 bg-white hover:bg-yellow-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                            >
                                <PlayIcon className="h-5 w-5 mr-2 group-hover:text-purple-600" />
                                Start My Journey - FREE
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">0$</span>
                            </Link>
                        </div>

                        <div className="mt-8 text-sm opacity-75">
                            <p>✨ No signup required • 🏠 Works on any device • 💜 Beginner-friendly</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;