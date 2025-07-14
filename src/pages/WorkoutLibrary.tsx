import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Flame, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Define workout types
type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'all';
type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';

interface Workout {
  id: string;
  name: string;
  description: string;
  category: WorkoutCategory;
  difficulty: WorkoutDifficulty;
  duration: number; // in minutes
  calories: number;
  image: string;
  aiTracking: boolean;
}

const WorkoutLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample workout data
  const workouts: Workout[] = [
    {
      id: 'pushups',
      name: 'Push-ups',
      description: 'Build upper body strength with this classic exercise',
      category: 'strength',
      difficulty: 'beginner',
      duration: 10,
      calories: 100,
      image: '/FitVision/images/pushups.png',
      aiTracking: true,
    },
    {
      id: 'squats',
      name: 'Squats',
      description: 'Strengthen your lower body with proper form',
      category: 'strength',
      difficulty: 'beginner',
      duration: 15,
      calories: 150,
      image: '/FitVision/images/squad.png',
      aiTracking: true,
    },
    {
      id: 'plank',
      name: 'Plank Challenge',
      description: 'Build core strength and stability',
      category: 'strength',
      difficulty: 'intermediate',
      duration: 5,
      calories: 50,
      image: '/images/plank.png',
      aiTracking: true,
    },
    {
      id: 'jumpingjacks',
      name: 'Jumping Jacks',
      description: 'Get your heart rate up with this cardio classic',
      category: 'cardio',
      difficulty: 'beginner',
      duration: 10,
      calories: 120,
      image: '/images/jumpingjacks.png',
      aiTracking: true,
    },
    {
      id: 'yoga',
      name: 'Yoga Flow',
      description: 'Improve flexibility and mindfulness',
      category: 'flexibility',
      difficulty: 'intermediate',
      duration: 20,
      calories: 150,
      image: '/images/yoga.jpg',
      aiTracking: false,
    },
    {
      id: 'hiit',
      name: 'HIIT Workout',
      description: 'High intensity interval training for maximum calorie burn',
      category: 'cardio',
      difficulty: 'advanced',
      duration: 25,
      calories: 300,
      image: '/images/hiit.jpg',
      aiTracking: false,
    },
  ];

  // Filter workouts based on category and search query
  const filteredWorkouts = workouts.filter(workout => {
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory;
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get difficulty color
  const getDifficultyColor = (difficulty: WorkoutDifficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="pb-5 border-b border-gray-200 mb-8">
    <h1 className="text-3xl font-bold text-gray-900">Workout Library</h1>
    <p className="mt-2 text-sm text-gray-500">
    Discover workouts and start your fitness journey
    </p>
    </div>

    {/* Search and Filter */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div className="w-full md:w-64">
    <input
    type="text"
    placeholder="Search workouts..."
    className="w-full p-2 border border-gray-300 rounded-md"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    />
    </div>
    <div className="flex space-x-2">
    <button
    onClick={() => setSelectedCategory('all')}
    className={`px-4 py-2 rounded-md ${
      selectedCategory === 'all'
      ? 'bg-purple-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
    >
    All
    </button>
    <button
    onClick={() => setSelectedCategory('strength')}
    className={`px-4 py-2 rounded-md ${
      selectedCategory === 'strength'
      ? 'bg-purple-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
    >
    Strength
    </button>
    <button
    onClick={() => setSelectedCategory('cardio')}
    className={`px-4 py-2 rounded-md ${
      selectedCategory === 'cardio'
      ? 'bg-purple-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
    >
    Cardio
    </button>
    <button
    onClick={() => setSelectedCategory('flexibility')}
    className={`px-4 py-2 rounded-md ${
      selectedCategory === 'flexibility'
      ? 'bg-purple-600 text-white'
      : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
    >
    Flexibility
    </button>
    </div>
    </div>

    {/* Workout Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredWorkouts.map((workout) => (
      <motion.div
      key={workout.id}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
      >
      <div className="h-48 bg-gray-200 relative">
      <img
      src={workout.image}
      alt={workout.name}
      className="w-full h-full object-cover"
      onError={(e) => {
        // Fallback for missing images
        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Workout';
      }}
      />
      {workout.aiTracking && (
        <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
        AI Tracking
        </div>
      )}
      </div>
      <div className="p-4">
      <div className="flex justify-between items-start">
      <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(workout.difficulty)}`}>
      {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
      </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">{workout.description}</p>
      <div className="mt-4 flex items-center justify-between">
      <div className="flex space-x-4">
      <div className="flex items-center text-sm text-gray-500">
      <Clock className="h-4 w-4 mr-1" />
      <span>{workout.duration} min</span>
      </div>
      <div className="flex items-center text-sm text-gray-500">
      <Flame className="h-4 w-4 mr-1" />
      <span>{workout.calories} cal</span>
      </div>
      </div>
      <Link
      to={`/workout-session?type=${workout.id}&name=${workout.name}`}
      className="flex items-center text-purple-600 hover:text-purple-700"
      >
      <span className="text-sm font-medium">Start</span>
      <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
      </div>
      </div>
      </motion.div>
    ))}
    </div>

    {filteredWorkouts.length === 0 && (
      <div className="text-center py-12">
      <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No workouts found</h3>
      <p className="mt-1 text-sm text-gray-500">
      Try adjusting your search or filter to find what you're looking for.
      </p>
      </div>
    )}
    </div>
    </div>
  );
};

export default WorkoutLibrary;
