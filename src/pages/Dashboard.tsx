import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useWorkoutData } from '../hooks/useWorkoutData';
import {
  Activity,
  Award,
  Brain,
  Camera,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Play,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { workouts, stats, loading, error } = useWorkoutData();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="glass-panel rounded-[1.75rem] px-8 py-10 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500" />
          <p className="text-slate-600 dark:text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="glass-panel max-w-lg rounded-[1.75rem] px-8 py-10 text-center">
          <p className="text-lg font-semibold text-red-600">Couldn&apos;t load dashboard data</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{error}</p>
        </div>
      </div>
    );
  }

  const recentWorkouts = workouts.slice(0, 4).map((workout) => ({
    id: workout.id,
    name: workout.workoutType.name,
    date: workout.createdAt.toDate().toLocaleDateString(),
    reps: workout.repsCompleted,
    duration: `${Math.floor(workout.duration / 60)} min`,
    formScore: workout.formScore,
    calories: workout.calories
  }));

  const weeklyStats = [
    {
      label: 'Workouts',
      value: stats?.totalWorkouts || 0,
      icon: Dumbbell,
      accent: 'from-cyan-500 to-blue-600'
    },
    {
      label: 'Total reps',
      value: stats?.totalReps || 0,
      icon: Target,
      accent: 'from-emerald-500 to-teal-600'
    },
    {
      label: 'Minutes',
      value: stats?.totalMinutes || 0,
      icon: Clock,
      accent: 'from-indigo-500 to-blue-600'
    },
    {
      label: 'Form score',
      value: `${stats?.avgFormScore || 0}%`,
      icon: Award,
      accent: 'from-amber-500 to-orange-500'
    },
    {
      label: 'Calories',
      value: stats?.totalCalories || 0,
      icon: Flame,
      accent: 'from-rose-500 to-red-600'
    },
    {
      label: 'Current streak',
      value: stats?.currentStreak || 0,
      icon: Zap,
      accent: 'from-fuchsia-500 to-violet-600'
    }
  ];

  const actionCards = [
    {
      to: '/workout-session',
      title: 'Start live workout',
      description: 'Jump straight into camera tracking and realtime coaching.',
      icon: Play,
      badge: 'Primary',
      className: 'bg-slate-950 text-white dark:bg-cyan-500 dark:text-slate-950'
    },
    {
      to: '/workout-library',
      title: 'Explore workout library',
      description: 'Browse supported exercises and configure your next session.',
      icon: Camera,
      badge: 'Library',
      className: 'section-shell'
    },
    {
      to: '/analytics',
      title: 'Review progress',
      description: 'See trends, consistency, and where your form is improving.',
      icon: TrendingUp,
      badge: 'Insights',
      className: 'section-shell'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(15,23,42,0.96),rgba(30,41,59,0.92))] px-6 py-10 text-white shadow-[0_30px_80px_-45px_rgba(8,47,73,0.9)] sm:px-8 lg:px-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                <Brain className="h-4 w-4" />
                Training cockpit
              </div>
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                Welcome back{userProfile?.displayName ? `, ${userProfile.displayName}` : ''}.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Your dashboard should feel like a control room: next action first, progress second, and historical
                detail only where it helps.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/workout-session"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  <Play className="h-4 w-4" />
                  Start session
                </Link>
                <Link
                  to="/analytics"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Open analytics
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-5 text-slate-900 dark:text-slate-100">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Snapshot
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {weeklyStats.slice(0, 4).map(({ label, value, icon: Icon, accent }) => (
                  <div key={label} className="rounded-[1.3rem] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/55">
                    <div className={`inline-flex rounded-2xl bg-gradient-to-r ${accent} p-3 text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {actionCards.map(({ to, title, description, icon: Icon, badge, className }) => (
            <Link
              key={title}
              to={to}
              className={`${className} group rounded-[1.8rem] p-6 transition hover:-translate-y-1 hover:shadow-xl`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`rounded-2xl p-3 ${className.includes('bg-slate-950') ? 'bg-white/10' : 'bg-slate-950 text-cyan-300 dark:bg-slate-800'}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${className.includes('bg-slate-950') ? 'bg-white/10 text-white/80' : 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300'}`}>
                  {badge}
                </span>
              </div>
              <h2 className={`mt-6 text-2xl font-bold ${className.includes('bg-slate-950') ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {title}
              </h2>
              <p className={`mt-2 text-sm leading-6 ${className.includes('bg-slate-950') ? 'text-slate-300 dark:text-slate-950/80' : 'text-slate-600 dark:text-slate-300'}`}>
                {description}
              </p>
              <div className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${className.includes('bg-slate-950') ? 'text-white' : 'text-cyan-700 dark:text-cyan-300'}`}>
                Open
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </section>

        <section className="section-shell">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Performance metrics</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Your training totals at a glance</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {weeklyStats.map(({ label, value, icon: Icon, accent }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[1.5rem] border border-slate-200/70 bg-white/75 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/55"
              >
                <div className={`inline-flex rounded-2xl bg-gradient-to-r ${accent} p-3 text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="section-shell">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Recent sessions</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Latest AI-tracked workouts</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                <Camera className="h-4 w-4" />
                Live data
              </div>
            </div>

            {recentWorkouts.length > 0 ? (
              <div className="mt-6 space-y-4">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-5 transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/55"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-slate-950 p-3 text-cyan-300 dark:bg-slate-800">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{workout.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{workout.date}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Reps</p>
                          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{workout.reps}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Time</p>
                          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{workout.duration}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Form</p>
                          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{workout.formScore}%</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Calories</p>
                          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{workout.calories}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.6rem] border border-dashed border-slate-300/80 bg-white/70 p-10 text-center dark:border-slate-700 dark:bg-slate-900/45">
                <Camera className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No workouts yet</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start your first session and your recent activity will appear here.</p>
                <Link
                  to="/workout-session"
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
                >
                  <Play className="h-4 w-4" />
                  Start first workout
                </Link>
              </div>
            )}
          </div>

          <div className="section-shell bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(99,102,241,0.14),rgba(255,255,255,0.55))] dark:bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(59,130,246,0.12),rgba(15,23,42,0.52))]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Why this layout works</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">A calmer dashboard is easier to trust</h2>
            <div className="mt-6 space-y-4">
              {[
                {
                  icon: Brain,
                  title: 'AI confidence stays visible',
                  text: 'The dashboard now keeps the smart-coaching angle present without letting it overpower the content.'
                },
                {
                  icon: TrendingUp,
                  title: 'Metrics are easier to scan',
                  text: 'Cards are consistent in size, spacing, and contrast so users can compare numbers faster.'
                },
                {
                  icon: Target,
                  title: 'Next steps are obvious',
                  text: 'Users can start a workout, browse the library, or inspect analytics without hunting through the screen.'
                }
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-[1.4rem] border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-slate-950 p-3 text-cyan-300 dark:bg-slate-800">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
