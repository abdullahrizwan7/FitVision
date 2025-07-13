import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Activity, 
  Timer, 
  Heart, 
  Target, 
  Flame, 
  TrendingUp,
  Zap,
  RotateCcw,
  Award,
  Play,
  Sparkles,
  Brain,
  Eye,
  Rocket
} from 'lucide-react';
import { WorkoutType } from '../types/pose';
import GlassCard from './ui/GlassCard';
import NeonButton from './ui/NeonButton';
import HolographicText from './ui/HolographicText';

interface WorkoutSelectorProps {
  onWorkoutSelect: (workout: WorkoutType, targetValue: number) => void;
  isLoading?: boolean;
}

const WorkoutSelector: React.FC<WorkoutSelectorProps> = ({ 
  onWorkoutSelect,
  isLoading = false
}) => {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null);
  const [selectedValue, setSelectedValue] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const workoutOptions: WorkoutType[] = [
    {
      id: 'pushups',
      name: 'Push-ups',
      description: 'Upper body strength with AI form correction',
      category: 'strength',
      type: 'reps',
      difficulty: 'beginner',
      calories: 8,
      icon: <Dumbbell className="h-6 w-6" />,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50 border-purple-200',
      defaultValue: 10,
      options: [5, 10, 15, 20, 25, 30],
      unit: 'reps'
    },
    {
      id: 'squats',
      name: 'Squats',
      description: 'Lower body strength with depth tracking',
      category: 'strength',
      type: 'reps',
      difficulty: 'beginner',
      calories: 10,
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50 border-blue-200',
      defaultValue: 15,
      options: [10, 15, 20, 25, 30, 40],
      unit: 'reps'
    },
    {
      id: 'plank',
      name: 'Plank',
      description: 'Core stability with posture monitoring',
      category: 'core',
      type: 'time',
      difficulty: 'beginner',
      calories: 5,
      icon: <Timer className="h-6 w-6" />,
      color: 'bg-indigo-500',
      lightColor: 'bg-indigo-50 border-indigo-200',
      defaultValue: 30,
      options: [15, 30, 45, 60, 90, 120],
      unit: 'seconds'
    },
    {
      id: 'jumpingjacks',
      name: 'Jumping Jacks',
      description: 'Cardio with arm and leg synchronization',
      category: 'cardio',
      type: 'reps',
      difficulty: 'beginner',
      calories: 6,
      icon: <Heart className="h-6 w-6" />,
      color: 'bg-pink-500',
      lightColor: 'bg-pink-50 border-pink-200',
      defaultValue: 20,
      options: [15, 20, 25, 30, 40, 50],
      unit: 'reps'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Exercises', icon: <Activity className="h-5 w-5" /> },
    { id: 'strength', name: 'Strength', icon: <Dumbbell className="h-5 w-5" /> },
    { id: 'cardio', name: 'Cardio', icon: <Heart className="h-5 w-5" /> },
    { id: 'core', name: 'Core', icon: <Target className="h-5 w-5" /> }
  ];

  const filteredWorkouts = selectedCategory === 'all' 
    ? workoutOptions 
    : workoutOptions.filter(workout => workout.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleWorkoutSelect = (workout: WorkoutType) => {
    setSelectedWorkout(workout);
    setSelectedValue(workout.defaultValue);
  };

  const handleStartWorkout = () => {
    if (selectedWorkout) {
      onWorkoutSelect(selectedWorkout, selectedValue);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Futuristic Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-12"
        >
          <motion.div
            className="mb-8"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-16 w-16 mx-auto text-purple-400 mb-6" />
          </motion.div>
          
          <HolographicText 
            size="4xl" 
            className="mb-6"
            gradient="from-cyan-400 via-purple-400 to-pink-400"
          >
            AI Fitness Matrix
          </HolographicText>
          
          <motion.p 
            className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Enter the future of fitness. Our quantum AI analyzes your every move, 
            perfects your form, and evolves with your progress.
          </motion.p>

          {/* AI Features Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <GlassCard className="px-4 py-2" variant="dark">
              <div className="flex items-center space-x-2 text-sm text-cyan-400">
                <Eye className="h-4 w-4" />
                <span>Real-time Pose Detection</span>
              </div>
            </GlassCard>
            <GlassCard className="px-4 py-2" variant="dark">
              <div className="flex items-center space-x-2 text-sm text-purple-400">
                <Brain className="h-4 w-4" />
                <span>AI Form Correction</span>
              </div>
            </GlassCard>
            <GlassCard className="px-4 py-2" variant="dark">
              <div className="flex items-center space-x-2 text-sm text-pink-400">
                <Sparkles className="h-4 w-4" />
                <span>Smart Rep Counting</span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <NeonButton
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "primary" : "secondary"}
                  size="md"
                  className="flex items-center space-x-2"
                  icon={category.icon}
                >
                  {category.name}
                </NeonButton>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Workout Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {filteredWorkouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.2 + index * 0.1, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ y: -10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleWorkoutSelect(workout)}
            >
              <GlassCard 
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  selectedWorkout?.id === workout.id
                    ? 'border-purple-400 shadow-purple-500/25'
                    : ''
                }`}
                hover
                glow={selectedWorkout?.id === workout.id}
                variant="dark"
              >
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    className={`p-3 rounded-xl ${workout.color} text-white shadow-lg`}
                    animate={selectedWorkout?.id === workout.id ? { rotate: [0, 360] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    {workout.icon}
                  </motion.div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      workout.difficulty === 'beginner' 
                        ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                        : workout.difficulty === 'intermediate'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                          : 'bg-red-500/20 text-red-400 border border-red-400/30'
                    }`}>
                      {workout.difficulty}
                    </span>
                    <div className="flex items-center text-orange-400">
                      <Flame className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{workout.calories} cal</span>
                    </div>
                  </div>
                </div>
                
                <HolographicText size="xl" className="mb-3">
                  {workout.name}
                </HolographicText>
                <p className="text-white/70 mb-4 text-sm leading-relaxed">{workout.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white/60">
                    {workout.type === 'reps' ? (
                      <Target className="h-4 w-4 mr-2" />
                    ) : (
                      <Timer className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm">{workout.type === 'reps' ? 'Rep-based' : 'Time-based'}</span>
                  </div>
                  <AnimatePresence>
                    {selectedWorkout?.id === workout.id && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="flex items-center space-x-1"
                      >
                        <motion.div
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span className="text-purple-400 text-xs font-medium">SELECTED</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Workout Configuration */}
        <AnimatePresence>
          {selectedWorkout && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-2xl mx-auto"
            >
              <GlassCard className="p-8" glow variant="colored">
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className={`inline-flex p-4 rounded-2xl ${selectedWorkout.color} text-white mb-4 shadow-lg`}
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    {selectedWorkout.icon}
                  </motion.div>
                  
                  <HolographicText size="3xl" className="mb-3">
                    {selectedWorkout.name}
                  </HolographicText>
                  <p className="text-white/80 text-lg">{selectedWorkout.description}</p>
                </motion.div>

                <motion.div 
                  className="space-y-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {/* Target Selection */}
                  <div>
                    <HolographicText size="lg" className="mb-4">
                      Select Target {selectedWorkout.type === 'reps' ? 'Reps' : 'Duration'}
                    </HolographicText>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedWorkout.options.map((option, index) => (
                        <motion.div
                          key={option}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                        >
                          <NeonButton
                            onClick={() => setSelectedValue(option)}
                            variant={selectedValue === option ? "primary" : "secondary"}
                            size="md"
                            className="w-full"
                          >
                            {option} {selectedWorkout.unit}
                          </NeonButton>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Workout Prediction Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <HolographicText size="lg" className="mb-4">
                      Workout Prediction
                    </HolographicText>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <GlassCard className="p-4 text-center" variant="dark">
                        <motion.div
                          className="flex justify-center mb-3"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Flame className="h-6 w-6 text-orange-400" />
                        </motion.div>
                        <HolographicText size="xl" className="mb-1">
                          {Math.round(selectedWorkout.calories * (selectedValue / selectedWorkout.defaultValue))}
                        </HolographicText>
                        <p className="text-white/60 text-sm">Calories</p>
                      </GlassCard>
                      
                      <GlassCard className="p-4 text-center" variant="dark">
                        <motion.div
                          className="flex justify-center mb-3"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <Timer className="h-6 w-6 text-blue-400" />
                        </motion.div>
                        <HolographicText size="xl" className="mb-1">
                          {selectedWorkout.type === 'reps' 
                            ? `${Math.round(selectedValue * 3)}s`
                            : `${selectedValue}s`
                          }
                        </HolographicText>
                        <p className="text-white/60 text-sm">Duration</p>
                      </GlassCard>
                      
                      <GlassCard className="p-4 text-center" variant="dark">
                        <motion.div
                          className="flex justify-center mb-3"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <TrendingUp className="h-6 w-6 text-green-400" />
                        </motion.div>
                        <HolographicText size="xl" className="mb-1">
                          {selectedWorkout.difficulty}
                        </HolographicText>
                        <p className="text-white/60 text-sm">Level</p>
                      </GlassCard>
                    </div>
                  </motion.div>

                  {/* Launch Button */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.0 }}
                    className="pt-4"
                  >
                    <NeonButton
                      onClick={handleStartWorkout}
                      disabled={isLoading}
                      variant="primary"
                      size="xl"
                      className="w-full"
                      loading={isLoading}
                      icon={<Rocket className="h-6 w-6" />}
                    >
                      {isLoading ? 'Initializing AI...' : 'Launch Workout'}
                    </NeonButton>
                    
                    <motion.p
                      className="text-center text-white/60 text-sm mt-4"
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🚀 Prepare for an AI-enhanced fitness experience
                    </motion.p>
                  </motion.div>
                </motion.div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkoutSelector;
