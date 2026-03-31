import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Activity,
  Brain,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  MoveRight,
  Play,
  Search,
  Sparkles,
  Star,
  Target,
  Timer,
  Waves,
  Zap
} from 'lucide-react';

interface Workout {
  id: string;
  name: string;
  description: string;
  category: 'strength' | 'cardio' | 'core' | 'flexibility';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  calories: number;
  icon: React.ReactNode;
  color: string;
  aiTracking: boolean;
  type: 'reps' | 'time';
  defaultValue: number;
  options: number[];
  unit: string;
}

const workouts: Workout[] = [
  {
    id: 'pushups',
    name: 'Push-ups',
    description: 'Upper body strength with AI form correction',
    category: 'strength',
    difficulty: 'beginner',
    duration: 10,
    calories: 100,
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'from-cyan-500 to-blue-600',
    aiTracking: true,
    type: 'reps',
    defaultValue: 10,
    options: [5, 10, 15, 20, 25, 30],
    unit: 'reps'
  },
  {
    id: 'squats',
    name: 'Squats',
    description: 'Lower body strength with depth tracking',
    category: 'strength',
    difficulty: 'beginner',
    duration: 15,
    calories: 150,
    icon: <Activity className="h-6 w-6" />,
    color: 'from-sky-500 to-indigo-600',
    aiTracking: true,
    type: 'reps',
    defaultValue: 15,
    options: [10, 15, 20, 25, 30, 40],
    unit: 'reps'
  },
  {
    id: 'plank',
    name: 'Plank',
    description: 'Core stability with posture monitoring',
    category: 'core',
    difficulty: 'intermediate',
    duration: 5,
    calories: 50,
    icon: <Timer className="h-6 w-6" />,
    color: 'from-violet-500 to-indigo-600',
    aiTracking: true,
    type: 'time',
    defaultValue: 30,
    options: [15, 30, 45, 60, 90, 120],
    unit: 'seconds'
  },
  {
    id: 'jumpingjacks',
    name: 'Jumping Jacks',
    description: 'Cardio with arm and leg synchronization',
    category: 'cardio',
    difficulty: 'beginner',
    duration: 10,
    calories: 120,
    icon: <Heart className="h-6 w-6" />,
    color: 'from-pink-500 to-rose-600',
    aiTracking: true,
    type: 'reps',
    defaultValue: 20,
    options: [15, 20, 25, 30, 40, 50],
    unit: 'reps'
  },
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'Full-body HIIT movement for explosive conditioning',
    category: 'cardio',
    difficulty: 'advanced',
    duration: 8,
    calories: 160,
    icon: <Zap className="h-6 w-6" />,
    color: 'from-red-500 to-orange-600',
    aiTracking: false,
    type: 'reps',
    defaultValue: 10,
    options: [5, 10, 15, 20],
    unit: 'reps'
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'Lower body strength and balance with alternating steps',
    category: 'strength',
    difficulty: 'intermediate',
    duration: 12,
    calories: 130,
    icon: <Target className="h-6 w-6" />,
    color: 'from-emerald-500 to-teal-600',
    aiTracking: false,
    type: 'reps',
    defaultValue: 20,
    options: [10, 20, 30, 40],
    unit: 'reps'
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    description: 'Fast-paced cardio and core work for elevated heart rate',
    category: 'cardio',
    difficulty: 'intermediate',
    duration: 12,
    calories: 145,
    icon: <Zap className="h-6 w-6" />,
    color: 'from-orange-500 to-amber-600',
    aiTracking: false,
    type: 'reps',
    defaultValue: 30,
    options: [20, 30, 40, 50, 60],
    unit: 'reps'
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    description: 'Quick cardio drill for coordination, stamina, and warm-up flow',
    category: 'cardio',
    difficulty: 'beginner',
    duration: 8,
    calories: 90,
    icon: <Heart className="h-6 w-6" />,
    color: 'from-rose-500 to-orange-500',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60, 90],
    unit: 'seconds'
  },
  {
    id: 'butt-kicks',
    name: 'Butt Kicks',
    description: 'Low-space cardio finisher that raises pace and body temperature',
    category: 'cardio',
    difficulty: 'beginner',
    duration: 8,
    calories: 85,
    icon: <Heart className="h-6 w-6" />,
    color: 'from-fuchsia-500 to-rose-500',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60],
    unit: 'seconds'
  },
  {
    id: 'jump-squats',
    name: 'Jump Squats',
    description: 'Explosive squat variation for leg power and cardio load',
    category: 'strength',
    difficulty: 'advanced',
    duration: 10,
    calories: 155,
    icon: <Activity className="h-6 w-6" />,
    color: 'from-indigo-500 to-blue-700',
    aiTracking: false,
    type: 'reps',
    defaultValue: 12,
    options: [8, 12, 16, 20, 24],
    unit: 'reps'
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    description: 'Isometric leg endurance builder for quads and glutes',
    category: 'strength',
    difficulty: 'intermediate',
    duration: 6,
    calories: 70,
    icon: <Timer className="h-6 w-6" />,
    color: 'from-slate-500 to-slate-700',
    aiTracking: false,
    type: 'time',
    defaultValue: 45,
    options: [30, 45, 60, 90, 120],
    unit: 'seconds'
  },
  {
    id: 'glute-bridges',
    name: 'Glute Bridges',
    description: 'Posterior chain activation with simple floor-based control',
    category: 'strength',
    difficulty: 'beginner',
    duration: 10,
    calories: 95,
    icon: <Target className="h-6 w-6" />,
    color: 'from-emerald-400 to-green-600',
    aiTracking: false,
    type: 'reps',
    defaultValue: 15,
    options: [10, 15, 20, 25, 30],
    unit: 'reps'
  },
  {
    id: 'single-leg-glute-bridges',
    name: 'Single-Leg Glute Bridges',
    description: 'Unilateral bridge work for hip stability and glute strength',
    category: 'strength',
    difficulty: 'intermediate',
    duration: 12,
    calories: 110,
    icon: <Target className="h-6 w-6" />,
    color: 'from-teal-500 to-emerald-700',
    aiTracking: false,
    type: 'reps',
    defaultValue: 12,
    options: [8, 12, 16, 20],
    unit: 'reps'
  },
  {
    id: 'calf-raises',
    name: 'Calf Raises',
    description: 'Lower-leg endurance work with low joint stress',
    category: 'strength',
    difficulty: 'beginner',
    duration: 8,
    calories: 65,
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'from-lime-500 to-green-600',
    aiTracking: false,
    type: 'reps',
    defaultValue: 20,
    options: [15, 20, 25, 30, 40],
    unit: 'reps'
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    description: 'Chair-assisted upper-body movement for pressing endurance',
    category: 'strength',
    difficulty: 'intermediate',
    duration: 10,
    calories: 105,
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'from-cyan-500 to-sky-700',
    aiTracking: false,
    type: 'reps',
    defaultValue: 12,
    options: [8, 12, 16, 20, 24],
    unit: 'reps'
  },
  {
    id: 'diamond-pushups',
    name: 'Diamond Push-ups',
    description: 'Push-up variation that targets triceps and chest control',
    category: 'strength',
    difficulty: 'advanced',
    duration: 9,
    calories: 125,
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'from-sky-500 to-cyan-700',
    aiTracking: false,
    type: 'reps',
    defaultValue: 8,
    options: [6, 8, 10, 12, 15],
    unit: 'reps'
  },
  {
    id: 'incline-pushups',
    name: 'Incline Push-ups',
    description: 'Beginner-friendly push-up option using elevated support',
    category: 'strength',
    difficulty: 'beginner',
    duration: 8,
    calories: 80,
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'from-blue-400 to-cyan-500',
    aiTracking: false,
    type: 'reps',
    defaultValue: 12,
    options: [8, 12, 16, 20, 24],
    unit: 'reps'
  },
  {
    id: 'pike-pushups',
    name: 'Pike Push-ups',
    description: 'Shoulder-focused pressing movement with bodyweight resistance',
    category: 'strength',
    difficulty: 'advanced',
    duration: 9,
    calories: 120,
    icon: <Dumbbell className="h-6 w-6" />,
    color: 'from-blue-600 to-indigo-700',
    aiTracking: false,
    type: 'reps',
    defaultValue: 8,
    options: [5, 8, 10, 12, 15],
    unit: 'reps'
  },
  {
    id: 'side-plank',
    name: 'Side Plank',
    description: 'Oblique-focused hold that builds lateral core stability',
    category: 'core',
    difficulty: 'intermediate',
    duration: 6,
    calories: 60,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-violet-500 to-purple-700',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60, 90],
    unit: 'seconds'
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    description: 'Controlled core exercise for trunk stability and coordination',
    category: 'core',
    difficulty: 'beginner',
    duration: 8,
    calories: 55,
    icon: <Target className="h-6 w-6" />,
    color: 'from-purple-500 to-indigo-500',
    aiTracking: false,
    type: 'reps',
    defaultValue: 12,
    options: [10, 12, 16, 20, 24],
    unit: 'reps'
  },
  {
    id: 'russian-twists',
    name: 'Russian Twists',
    description: 'Rotational core burner for obliques and endurance',
    category: 'core',
    difficulty: 'intermediate',
    duration: 9,
    calories: 85,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-fuchsia-500 to-violet-600',
    aiTracking: false,
    type: 'reps',
    defaultValue: 24,
    options: [16, 24, 32, 40, 50],
    unit: 'reps'
  },
  {
    id: 'bicycle-crunches',
    name: 'Bicycle Crunches',
    description: 'Dynamic ab movement with rotational engagement',
    category: 'core',
    difficulty: 'intermediate',
    duration: 10,
    calories: 95,
    icon: <Activity className="h-6 w-6" />,
    color: 'from-violet-500 to-pink-600',
    aiTracking: false,
    type: 'reps',
    defaultValue: 20,
    options: [16, 20, 24, 30, 40],
    unit: 'reps'
  },
  {
    id: 'leg-raises',
    name: 'Leg Raises',
    description: 'Lower-ab focused control work from the floor',
    category: 'core',
    difficulty: 'intermediate',
    duration: 8,
    calories: 75,
    icon: <Target className="h-6 w-6" />,
    color: 'from-indigo-500 to-violet-700',
    aiTracking: false,
    type: 'reps',
    defaultValue: 12,
    options: [8, 12, 16, 20, 24],
    unit: 'reps'
  },
  {
    id: 'hollow-hold',
    name: 'Hollow Hold',
    description: 'Gymnast-style core hold for full trunk tension',
    category: 'core',
    difficulty: 'advanced',
    duration: 6,
    calories: 65,
    icon: <Timer className="h-6 w-6" />,
    color: 'from-indigo-600 to-purple-700',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [15, 30, 45, 60, 75],
    unit: 'seconds'
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    description: 'Spinal stability and balance movement with low impact',
    category: 'core',
    difficulty: 'beginner',
    duration: 8,
    calories: 50,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-cyan-500 to-teal-600',
    aiTracking: false,
    type: 'reps',
    defaultValue: 12,
    options: [10, 12, 16, 20],
    unit: 'reps'
  },
  {
    id: 'flutter-kicks',
    name: 'Flutter Kicks',
    description: 'Core endurance movement for lower abs and hip flexors',
    category: 'core',
    difficulty: 'intermediate',
    duration: 7,
    calories: 70,
    icon: <Zap className="h-6 w-6" />,
    color: 'from-blue-500 to-violet-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60],
    unit: 'seconds'
  },
  {
    id: 'v-ups',
    name: 'V-Ups',
    description: 'Advanced core finisher that challenges timing and compression',
    category: 'core',
    difficulty: 'advanced',
    duration: 8,
    calories: 90,
    icon: <Target className="h-6 w-6" />,
    color: 'from-fuchsia-500 to-indigo-700',
    aiTracking: false,
    type: 'reps',
    defaultValue: 12,
    options: [8, 12, 16, 20],
    unit: 'reps'
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    description: 'Spine mobility drill for warm-ups and recovery sessions',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 5,
    calories: 25,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-teal-400 to-cyan-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 45,
    options: [30, 45, 60, 90],
    unit: 'seconds'
  },
  {
    id: 'child-pose',
    name: 'Child Pose',
    description: 'Restorative stretch for back, hips, and breathing reset',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 4,
    calories: 20,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-sky-400 to-cyan-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 60,
    options: [30, 60, 90, 120],
    unit: 'seconds'
  },
  {
    id: 'cobra-stretch',
    name: 'Cobra Stretch',
    description: 'Front-body opening stretch for the trunk and shoulders',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 4,
    calories: 22,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-cyan-500 to-blue-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60],
    unit: 'seconds'
  },
  {
    id: 'hamstring-stretch',
    name: 'Hamstring Stretch',
    description: 'Posterior chain flexibility work after lower-body sessions',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 5,
    calories: 24,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-emerald-400 to-teal-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 45,
    options: [30, 45, 60, 90],
    unit: 'seconds'
  },
  {
    id: 'quad-stretch',
    name: 'Quad Stretch',
    description: 'Standing stretch to release thighs after squats and jumps',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 4,
    calories: 20,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-lime-400 to-green-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60],
    unit: 'seconds'
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    description: 'Mobility support for long sitting days and leg training',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 5,
    calories: 24,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-emerald-500 to-cyan-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 45,
    options: [30, 45, 60, 90],
    unit: 'seconds'
  },
  {
    id: 'seated-twist',
    name: 'Seated Twist',
    description: 'Gentle rotation stretch for back mobility and recovery',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 5,
    calories: 22,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-indigo-400 to-sky-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 45,
    options: [30, 45, 60, 90],
    unit: 'seconds'
  },
  {
    id: 'side-lunge-stretch',
    name: 'Side Lunge Stretch',
    description: 'Adductor opener that pairs well with lower-body days',
    category: 'flexibility',
    difficulty: 'intermediate',
    duration: 6,
    calories: 28,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-teal-500 to-blue-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 45,
    options: [30, 45, 60, 90],
    unit: 'seconds'
  },
  {
    id: 'shoulder-rolls',
    name: 'Shoulder Rolls',
    description: 'Simple upper-body mobility reset for warm-up prep',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 4,
    calories: 18,
    icon: <Waves className="h-6 w-6" />,
    color: 'from-sky-500 to-indigo-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60],
    unit: 'seconds'
  },
  {
    id: 'arm-circles',
    name: 'Arm Circles',
    description: 'Dynamic shoulder warm-up to prep pressing and upper-body work',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 4,
    calories: 20,
    icon: <Activity className="h-6 w-6" />,
    color: 'from-blue-400 to-indigo-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60],
    unit: 'seconds'
  },
  {
    id: 'toe-touch-holds',
    name: 'Toe Touch Holds',
    description: 'Hamstring and lower-back mobility with controlled breathing',
    category: 'flexibility',
    difficulty: 'beginner',
    duration: 4,
    calories: 20,
    icon: <Timer className="h-6 w-6" />,
    color: 'from-cyan-400 to-teal-600',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60],
    unit: 'seconds'
  },
  {
    id: 'bear-crawl',
    name: 'Bear Crawl',
    description: 'Full-body crawl pattern for conditioning and coordination',
    category: 'cardio',
    difficulty: 'advanced',
    duration: 8,
    calories: 120,
    icon: <Zap className="h-6 w-6" />,
    color: 'from-amber-500 to-orange-700',
    aiTracking: false,
    type: 'time',
    defaultValue: 30,
    options: [20, 30, 45, 60],
    unit: 'seconds'
  }
];

const categories = [
  { id: 'all', name: 'All Exercises', icon: <Activity className="h-5 w-5" /> },
  { id: 'strength', name: 'Strength', icon: <Dumbbell className="h-5 w-5" /> },
  { id: 'cardio', name: 'Cardio', icon: <Heart className="h-5 w-5" /> },
  { id: 'core', name: 'Core', icon: <Target className="h-5 w-5" /> },
  { id: 'flexibility', name: 'Flexibility', icon: <Waves className="h-5 w-5" /> }
];

const WorkoutLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const filteredWorkouts = useMemo(
    () =>
      workouts.filter((workout) => {
        const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory;
        const search = searchQuery.toLowerCase();
        const matchesSearch =
          workout.name.toLowerCase().includes(search) ||
          workout.description.toLowerCase().includes(search) ||
          workout.category.toLowerCase().includes(search) ||
          workout.difficulty.toLowerCase().includes(search);
        return matchesCategory && matchesSearch;
      }),
    [searchQuery, selectedCategory]
  );

  const aiWorkoutCount = workouts.filter((workout) => workout.aiTracking).length;
  const timedWorkoutCount = workouts.filter((workout) => workout.type === 'time').length;
  const categoryCount = new Set(workouts.map((workout) => workout.category)).size;

  const featuredWorkouts = workouts.filter((workout) => workout.aiTracking).slice(0, 4);

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

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="section-shell relative overflow-hidden">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                <Brain className="h-4 w-4" />
                Workout discovery
              </div>
              <h1 className="mt-5 text-4xl font-black text-slate-900 dark:text-white sm:text-5xl">
                A workout library that feels curated, not cramped.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                The library now covers strength, cardio, core, and flexibility with 35+ exercises, better filtering,
                and clearer workout cards. AI-ready modes still stand out, while the larger catalog gives users more
                options to explore.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/workout-session"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950"
                >
                  <Play className="h-4 w-4" />
                  Start AI workout
                </Link>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  {workouts.length} exercises ready to browse
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-[linear-gradient(135deg,rgba(8,47,73,0.9),rgba(30,64,175,0.9),rgba(29,78,216,0.92))] p-8 text-white shadow-[0_30px_80px_-45px_rgba(30,64,175,0.9)]">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Available workouts</p>
                <p className="mt-2 text-3xl font-bold">{workouts.length}</p>
              </div>
              <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">AI-enabled</p>
                <p className="mt-2 text-3xl font-bold">{aiWorkoutCount}</p>
              </div>
              <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Categories</p>
                <p className="mt-2 text-3xl font-bold">{categoryCount}</p>
              </div>
              <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Timed sessions</p>
                <p className="mt-2 text-3xl font-bold">{timedWorkoutCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Featured modes
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                Start with the live AI-supported workouts
              </h2>
            </div>
            <Link
              to="/workout-session"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
            >
              Open workout setup
              <MoveRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="rounded-[1.5rem] border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
              >
                <div className={`inline-flex rounded-[1.1rem] bg-gradient-to-r ${workout.color} p-3 text-white shadow-lg`}>
                  {workout.icon}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{workout.name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                    <Brain className="h-3 w-3" />
                    AI
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{workout.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-shell">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search workouts, categories, or difficulty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-12 pr-4 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-3">
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
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredWorkouts.map((workout) => (
            <motion.button
              key={workout.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedWorkout(workout)}
              className="section-shell group cursor-pointer p-6 text-left transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`inline-flex rounded-[1.25rem] bg-gradient-to-r ${workout.color} p-4 text-white shadow-lg`}>
                  {workout.icon}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {workout.aiTracking && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                      <Brain className="h-3 w-3" />
                      AI
                    </span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getDifficultyColor(workout.difficulty)}`}>
                    {workout.difficulty}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span>{workout.category}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>{workout.type === 'reps' ? 'Rep target' : 'Timed hold'}</span>
              </div>

              <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{workout.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{workout.description}</p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-100/80 p-3 text-center dark:bg-slate-800/80">
                  <Clock className="mx-auto h-4 w-4 text-sky-500" />
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{workout.duration} min</p>
                </div>
                <div className="rounded-2xl bg-slate-100/80 p-3 text-center dark:bg-slate-800/80">
                  <Flame className="mx-auto h-4 w-4 text-rose-500" />
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{workout.calories} cal</p>
                </div>
                <div className="rounded-2xl bg-slate-100/80 p-3 text-center dark:bg-slate-800/80">
                  {workout.type === 'reps' ? (
                    <Target className="mx-auto h-4 w-4 text-emerald-500" />
                  ) : (
                    <Timer className="mx-auto h-4 w-4 text-violet-500" />
                  )}
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                    {workout.defaultValue} {workout.unit}
                  </p>
                </div>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                Configure workout
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </motion.button>
          ))}
        </section>

        {filteredWorkouts.length === 0 && (
          <section className="section-shell text-center">
            <Dumbbell className="mx-auto h-14 w-14 text-slate-400" />
            <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">No workouts found</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Try a broader search or switch categories.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
            >
              Clear filters
            </button>
          </section>
        )}

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
                <div className="flex items-start justify-between gap-4">
                  <div className={`inline-flex rounded-[1.25rem] bg-gradient-to-r ${selectedWorkout.color} p-4 text-white shadow-lg`}>
                    {selectedWorkout.icon}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {selectedWorkout.aiTracking && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                        <Brain className="h-3 w-3" />
                        AI-tracked
                      </span>
                    )}
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getDifficultyColor(selectedWorkout.difficulty)}`}>
                      {selectedWorkout.difficulty}
                    </span>
                  </div>
                </div>

                <h2 className="mt-5 text-3xl font-black text-slate-900 dark:text-white">{selectedWorkout.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{selectedWorkout.description}</p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-900/55 dark:text-slate-300">
                  {selectedWorkout.category}
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  {selectedWorkout.type === 'reps' ? 'Rep-based' : 'Timed'}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="rounded-[1.3rem] bg-white/70 p-4 text-center dark:bg-slate-900/55">
                    <Clock className="mx-auto h-5 w-5 text-sky-500" />
                    <p className="mt-2 font-semibold text-slate-900 dark:text-white">{selectedWorkout.duration} min</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Duration</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-white/70 p-4 text-center dark:bg-slate-900/55">
                    <Flame className="mx-auto h-5 w-5 text-rose-500" />
                    <p className="mt-2 font-semibold text-slate-900 dark:text-white">{selectedWorkout.calories}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Calories</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-white/70 p-4 text-center dark:bg-slate-900/55">
                    <Star className="mx-auto h-5 w-5 text-amber-500" />
                    <p className="mt-2 font-semibold capitalize text-slate-900 dark:text-white">{selectedWorkout.difficulty}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Level</p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.4rem] border border-slate-200/70 bg-white/75 p-5 dark:border-slate-800 dark:bg-slate-900/55">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Suggested target options</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedWorkout.options.map((option) => (
                      <span
                        key={option}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                      >
                        {option} {selectedWorkout.unit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setSelectedWorkout(null)}
                    className="flex-1 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Close
                  </button>
                  <Link
                    to={`/workout-session?workout=${selectedWorkout.id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
                  >
                    <Play className="h-4 w-4" />
                    Start workout
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WorkoutLibrary;
