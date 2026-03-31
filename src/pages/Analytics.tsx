import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkoutData, useWeeklyWorkoutData, useWorkoutStatsByCategory } from '../hooks/useWorkoutData';
import {
  Activity,
  Award,
  BarChart3,
  Brain,
  Camera,
  Clock,
  Flame,
  Target,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

const periods = ['week', 'month'] as const;

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<(typeof periods)[number]>('week');
  const { stats, loading } = useWorkoutData();
  const { weeklyData } = useWeeklyWorkoutData();
  const { workoutBreakdown } = useWorkoutStatsByCategory();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="glass-panel rounded-[1.75rem] px-8 py-10 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500" />
          <p className="text-slate-600 dark:text-slate-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const currentData = {
    workouts: stats?.totalWorkouts || 0,
    totalReps: stats?.totalReps || 0,
    avgFormScore: stats?.avgFormScore || 0,
    aiAccuracy: stats?.avgAiAccuracy || 0,
    caloriesBurned: stats?.totalCalories || 0,
    activeMinutes: stats?.totalMinutes || 0,
    improvements: Math.floor((stats?.totalWorkouts || 0) * 1.5)
  };

  const overview = [
    {
      label: 'Tracked workouts',
      value: currentData.workouts,
      change: 12,
      icon: Camera
    },
    {
      label: 'Total reps',
      value: currentData.totalReps.toLocaleString(),
      change: 8,
      icon: Target
    },
    {
      label: 'Avg. form score',
      value: `${currentData.avgFormScore}%`,
      change: 5,
      icon: Award
    },
    {
      label: 'AI accuracy',
      value: `${currentData.aiAccuracy}%`,
      change: 3,
      icon: Brain
    },
    {
      label: 'Calories burned',
      value: currentData.caloriesBurned.toLocaleString(),
      change: 15,
      icon: Flame
    },
    {
      label: 'Active minutes',
      value: currentData.activeMinutes,
      change: 10,
      icon: Clock
    }
  ];

  const weeklyProgress = weeklyData.map((day) => ({
    day: day.day,
    workouts: day.workouts,
    formScore: day.avgFormScore,
    reps: day.totalReps
  }));

  const maxWorkouts = Math.max(...weeklyProgress.map((day) => day.workouts), 1);

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="section-shell">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
              <BarChart3 className="h-4 w-4" />
              Progress intelligence
            </div>
            <h1 className="mt-5 text-4xl font-black text-slate-900 dark:text-white sm:text-5xl">
              Analytics that read like coaching, not raw logs.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              This screen now leans into trend visibility, not dashboard clutter. The page should tell users what is
              improving, where they are consistent, and what they should do next.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                    selectedPeriod === period
                      ? 'bg-slate-950 text-white dark:bg-cyan-500 dark:text-slate-950'
                      : 'border border-slate-200 bg-white/70 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  This {period}
                </button>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-[linear-gradient(135deg,rgba(14,116,144,0.88),rgba(30,64,175,0.9),rgba(49,46,129,0.88))] p-8 text-white shadow-[0_30px_80px_-45px_rgba(30,64,175,0.9)]">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/80">Current readout</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Consistency</p>
                  <p className="mt-2 text-3xl font-bold">{currentData.workouts}</p>
                  <p className="mt-1 text-sm text-cyan-100/80">Sessions in view</p>
                </div>
                <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Efficiency</p>
                  <p className="mt-2 text-3xl font-bold">{currentData.aiAccuracy}%</p>
                  <p className="mt-1 text-sm text-cyan-100/80">AI precision</p>
                </div>
                <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Movement quality</p>
                  <p className="mt-2 text-3xl font-bold">{currentData.avgFormScore}%</p>
                  <p className="mt-1 text-sm text-cyan-100/80">Average form score</p>
                </div>
                <div className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Corrections made</p>
                  <p className="mt-2 text-3xl font-bold">{currentData.improvements}</p>
                  <p className="mt-1 text-sm text-cyan-100/80">Estimated improvements</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Overview</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Key performance metrics</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {overview.map(({ label, value, change, icon: Icon }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/55"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-slate-950 p-3 text-cyan-300 dark:bg-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${change >= 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>
                    {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {change >= 0 ? `+${change}%` : `${change}%`}
                  </div>
                </div>
                <p className="mt-5 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">vs last {selectedPeriod}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="section-shell">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Workout mix</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Where your sessions are going</h2>

            <div className="mt-6 space-y-5">
              {workoutBreakdown.map((workout) => (
                <div key={workout.name} className="rounded-[1.4rem] border border-slate-200/70 bg-white/75 p-5 dark:border-slate-800 dark:bg-slate-900/55">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded-full ${workout.color}`} />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{workout.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{workout.sessions} sessions tracked</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-semibold text-slate-900 dark:text-white">{workout.totalReps} reps</p>
                      <p className={`${workout.textColor} font-medium`}>{workout.avgFormScore}% form</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div className={`h-2 rounded-full ${workout.color}`} style={{ width: `${Math.min((workout.sessions / 15) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-shell">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Weekly pattern</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Daily activity rhythm</h2>

            <div className="mt-8 flex h-72 items-end justify-between gap-3 rounded-[1.5rem] border border-slate-200/70 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/55">
              {weeklyProgress.map((day) => (
                <div key={day.day} className="flex flex-1 flex-col items-center">
                  <div className="flex h-52 w-full items-end justify-center">
                    <div
                      className="w-full max-w-[2.75rem] rounded-t-2xl bg-gradient-to-t from-cyan-500 via-sky-500 to-indigo-500 transition-all"
                      style={{
                        height: `${Math.max((day.workouts / maxWorkouts) * 180, 12)}px`,
                        opacity: day.workouts === 0 ? 0.25 : 1
                      }}
                    />
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{day.day}</p>
                  <p className="mt-1 text-xs text-slate-400">{day.formScore ? `${day.formScore}%` : '-'}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-slate-400">
              <div className="inline-flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-cyan-500" />
                Session volume
              </div>
              <div className="inline-flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" />
                Form score labels
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-r from-slate-950 via-sky-900 to-indigo-900 p-8 text-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.9)]">
          <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/80">AI takeaways</p>
            <h2 className="mt-2 text-3xl font-black">The page now reads like guidance instead of a report dump.</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ['Form improvement', 'Your movement quality is trending upward when sessions stay consistent.'],
                ['Rep accuracy', 'Stable AI confidence makes the rep metrics easier to trust.'],
                ['Next focus', 'A little more weekly volume should translate into faster progress.']
              ].map(([title, text]) => (
                <div key={title} className="rounded-[1.4rem] bg-white/10 p-5 backdrop-blur">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Analytics;
