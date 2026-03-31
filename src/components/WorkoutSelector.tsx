import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Brain,
  Dumbbell,
  Flame,
  Heart,
  Play,
  Target,
  Timer,
  TrendingUp,
  X
} from 'lucide-react';
import { WorkoutType } from '../types/pose';

interface WorkoutSelectorProps {
  onWorkoutSelect: (workout: WorkoutType, targetValue: number) => void;
  isLoading?: boolean;
}

const WorkoutSelector: React.FC<WorkoutSelectorProps> = ({ onWorkoutSelect, isLoading = false }) => {
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
      color: 'bg-cyan-500',
      lightColor: 'bg-cyan-50 border-cyan-200',
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
      color: 'bg-sky-500',
      lightColor: 'bg-sky-50 border-sky-200',
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
      color: 'bg-violet-500',
      lightColor: 'bg-violet-50 border-violet-200',
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
    : workoutOptions.filter((workout) => workout.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
      case 'intermediate':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
      case 'advanced':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-12 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-shell">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
            <Brain className="h-4 w-4" />
            Live training setup
          </div>
          <h1 className="mt-5 text-4xl font-black text-slate-900 dark:text-white sm:text-5xl">
            Choose a workout and let the AI handle the counting.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            The first workout screen should feel focused and simple. Pick an exercise type, set your target, and move
            straight into the camera experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                  selectedCategory === category.id
                    ? 'bg-slate-950 text-white dark:bg-cyan-500 dark:text-slate-950'
                    : 'border border-slate-200 bg-white/70 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(30,64,175,0.92),rgba(49,46,129,0.92))] p-8 text-white shadow-[0_30px_80px_-45px_rgba(30,64,175,0.9)]">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Realtime support</p>
              <p className="mt-2 text-3xl font-bold">33+</p>
              <p className="text-sm text-cyan-100/80">Pose keypoints</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Mode coverage</p>
              <p className="mt-2 text-3xl font-bold">{workoutOptions.length}</p>
              <p className="text-sm text-cyan-100/80">Core workout types</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Setup time</p>
              <p className="mt-2 text-3xl font-bold">&lt; 1 min</p>
              <p className="text-sm text-cyan-100/80">To first rep</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Feedback</p>
              <p className="mt-2 text-3xl font-bold">Live</p>
              <p className="text-sm text-cyan-100/80">Form correction</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {filteredWorkouts.map((workout) => (
          <motion.button
            key={workout.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleWorkoutSelect(workout)}
            className="section-shell group cursor-pointer p-6 text-left transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`rounded-[1.25rem] ${workout.color} p-4 text-white shadow-lg`}>
                {workout.icon}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getDifficultyColor(workout.difficulty)}`}>
                {workout.difficulty}
              </span>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">{workout.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{workout.description}</p>
            <div className="mt-5 flex items-center justify-between text-sm">
              <div className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Flame className="h-4 w-4 text-rose-500" />
                {workout.calories} cal
              </div>
              <div className="inline-flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                <TrendingUp className="h-4 w-4" />
                {workout.type === 'reps' ? 'Rep-based' : 'Time-based'}
              </div>
            </div>
          </motion.button>
        ))}
      </section>

      <AnimatePresence>
        {selectedWorkout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
            onClick={() => setSelectedWorkout(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-2xl rounded-[2rem] p-8"
            >
              <button
                onClick={() => setSelectedWorkout(null)}
                className="ml-auto flex rounded-full border border-slate-200 bg-white/80 p-2 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>

              <div className={`mt-2 inline-flex rounded-[1.25rem] ${selectedWorkout.color} p-4 text-white shadow-lg`}>
                {selectedWorkout.icon}
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-900 dark:text-white">{selectedWorkout.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedWorkout.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.4rem] bg-white/70 p-4 text-center dark:bg-slate-900/55">
                  <Flame className="mx-auto h-5 w-5 text-rose-500" />
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                    {Math.round(selectedWorkout.calories * (selectedValue / selectedWorkout.defaultValue))}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Calories</p>
                </div>
                <div className="rounded-[1.4rem] bg-white/70 p-4 text-center dark:bg-slate-900/55">
                  <Timer className="mx-auto h-5 w-5 text-sky-500" />
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                    {selectedWorkout.type === 'reps' ? `${Math.round(selectedValue * 3)}s` : `${selectedValue}s`}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Estimated time</p>
                </div>
                <div className="rounded-[1.4rem] bg-white/70 p-4 text-center dark:bg-slate-900/55">
                  <Target className="mx-auto h-5 w-5 text-emerald-500" />
                  <p className="mt-2 font-semibold capitalize text-slate-900 dark:text-white">{selectedWorkout.difficulty}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Difficulty</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Target {selectedWorkout.type === 'reps' ? 'reps' : 'duration'}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {selectedWorkout.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedValue(option)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        selectedValue === option
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
                      }`}
                    >
                      {option} {selectedWorkout.unit}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartWorkout}
                disabled={isLoading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-base font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                <Play className="h-5 w-5" />
                {isLoading ? 'Starting...' : 'Start AI Workout'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutSelector;
