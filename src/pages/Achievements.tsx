import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Brain,
  Calendar,
  Clock,
  Crown,
  Dumbbell,
  Flame,
  Medal,
  Shield,
  Star,
  Target,
  Trophy
} from 'lucide-react';
import { useWorkoutData } from '../hooks/useWorkoutData';

const Achievements = () => {
  const { stats } = useWorkoutData();
  const [filter, setFilter] = useState<'All' | 'Unlocked' | 'In Progress' | 'Locked'>('All');

  const achievements = useMemo(
    () => [
      {
        id: 'first_workout',
        title: 'First Steps',
        description: 'Complete your first workout',
        icon: Dumbbell,
        color: 'from-cyan-500 to-blue-600',
        unlocked: (stats?.totalWorkouts || 0) >= 1,
        progress: Math.min((stats?.totalWorkouts || 0), 1),
        requirement: '1 workout'
      },
      {
        id: 'workout_streak_3',
        title: 'Getting Consistent',
        description: 'Maintain a 3-day workout streak',
        icon: Calendar,
        color: 'from-sky-500 to-indigo-600',
        unlocked: (stats?.currentStreak || 0) >= 3,
        progress: Math.min((stats?.currentStreak || 0) / 3, 1),
        requirement: '3-day streak'
      },
      {
        id: 'workout_streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day workout streak',
        icon: Flame,
        color: 'from-orange-500 to-red-500',
        unlocked: (stats?.currentStreak || 0) >= 7,
        progress: Math.min((stats?.currentStreak || 0) / 7, 1),
        requirement: '7-day streak'
      },
      {
        id: 'reps_100',
        title: 'Century Club',
        description: 'Complete 100 total reps',
        icon: Target,
        color: 'from-emerald-500 to-teal-600',
        unlocked: (stats?.totalReps || 0) >= 100,
        progress: Math.min((stats?.totalReps || 0) / 100, 1),
        requirement: '100 reps'
      },
      {
        id: 'reps_500',
        title: 'Rep Master',
        description: 'Complete 500 total reps',
        icon: Medal,
        color: 'from-amber-500 to-yellow-500',
        unlocked: (stats?.totalReps || 0) >= 500,
        progress: Math.min((stats?.totalReps || 0) / 500, 1),
        requirement: '500 reps'
      },
      {
        id: 'calories_1000',
        title: 'Calorie Crusher',
        description: 'Burn 1000 total calories',
        icon: Flame,
        color: 'from-rose-500 to-red-600',
        unlocked: (stats?.totalCalories || 0) >= 1000,
        progress: Math.min((stats?.totalCalories || 0) / 1000, 1),
        requirement: '1000 calories'
      },
      {
        id: 'form_master',
        title: 'Perfect Form',
        description: 'Achieve 90%+ average form score',
        icon: Award,
        color: 'from-indigo-500 to-violet-600',
        unlocked: (stats?.avgFormScore || 0) >= 90,
        progress: Math.min((stats?.avgFormScore || 0) / 90, 1),
        requirement: '90% form score'
      },
      {
        id: 'time_warrior',
        title: 'Time Warrior',
        description: 'Complete 60 active minutes',
        icon: Clock,
        color: 'from-teal-500 to-cyan-600',
        unlocked: (stats?.totalMinutes || 0) >= 60,
        progress: Math.min((stats?.totalMinutes || 0) / 60, 1),
        requirement: '60 minutes'
      },
      {
        id: 'ai_champion',
        title: 'AI Champion',
        description: 'Achieve 95%+ AI accuracy',
        icon: Brain,
        color: 'from-fuchsia-500 to-purple-600',
        unlocked: (stats?.avgAiAccuracy || 0) >= 95,
        progress: Math.min((stats?.avgAiAccuracy || 0) / 95, 1),
        requirement: '95% AI accuracy'
      }
    ],
    [stats]
  );

  const filtered = achievements.filter((achievement) => {
    if (filter === 'All') return true;
    if (filter === 'Unlocked') return achievement.unlocked;
    if (filter === 'Locked') return !achievement.unlocked && achievement.progress === 0;
    return !achievement.unlocked && achievement.progress > 0;
  });

  const unlockedCount = achievements.filter((item) => item.unlocked).length;

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="section-shell">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <Trophy className="h-4 w-4" />
              Progress milestones
            </div>
            <h1 className="mt-5 text-4xl font-black text-slate-900 dark:text-white sm:text-5xl">
              Achievements should feel earned, visible, and motivating.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              This page now treats milestones like a progression system rather than a simple badge grid, so users can
              understand what is unlocked, what is close, and what is next.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {(['All', 'Unlocked', 'In Progress', 'Locked'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                    filter === option
                      ? 'bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950'
                      : 'border border-slate-200 bg-white/70 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-[linear-gradient(135deg,rgba(120,53,15,0.92),rgba(146,64,14,0.95),rgba(120,53,15,0.92))] p-8 text-white shadow-[0_30px_80px_-45px_rgba(146,64,14,0.9)]">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-300/15 blur-3xl" />
            <div className="relative grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                <Trophy className="h-7 w-7 text-amber-200" />
                <p className="mt-4 text-3xl font-bold">{unlockedCount}</p>
                <p className="text-sm text-amber-100/80">Unlocked</p>
              </div>
              <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                <Star className="h-7 w-7 text-amber-200" />
                <p className="mt-4 text-3xl font-bold">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
                <p className="text-sm text-amber-100/80">Completion rate</p>
              </div>
              <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                <Target className="h-7 w-7 text-amber-200" />
                <p className="mt-4 text-3xl font-bold">{stats?.totalReps || 0}</p>
                <p className="text-sm text-amber-100/80">Total reps</p>
              </div>
              <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                <Flame className="h-7 w-7 text-amber-200" />
                <p className="mt-4 text-3xl font-bold">{stats?.currentStreak || 0}</p>
                <p className="text-sm text-amber-100/80">Current streak</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-[1.8rem] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                  achievement.unlocked
                    ? 'border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/55'
                    : 'border-slate-200/70 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-900/35'
                }`}
              >
                {achievement.unlocked && (
                  <div className="absolute right-4 top-4 inline-flex rounded-full bg-amber-50 p-2 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <Crown className="h-4 w-4" />
                  </div>
                )}
                <div className={`inline-flex rounded-[1.25rem] bg-gradient-to-r ${achievement.color} p-4 text-white shadow-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className={`mt-5 text-2xl font-bold ${achievement.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-300'}`}>
                  {achievement.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{achievement.description}</p>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <span>Progress</span>
                    <span>{Math.round(achievement.progress * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${achievement.color}`} style={{ width: `${achievement.progress * 100}%` }} />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {achievement.requirement}
                  </span>
                  {achievement.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                      <Shield className="h-4 w-4" />
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Keep going</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-r from-slate-950 via-amber-950 to-orange-950 p-8 text-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.9)]">
          <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-amber-300/15 blur-3xl" />
          <div className="relative text-center">
            <Trophy className="mx-auto h-12 w-12 text-amber-200" />
            <h2 className="mt-4 text-3xl font-black">Next milestone</h2>
            <p className="mt-2 text-slate-300">
              {achievements.find((achievement) => !achievement.unlocked)?.title || 'All achievements unlocked!'}
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              A more premium milestone page makes the app feel worth returning to, especially for streak-based habits.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Achievements;
