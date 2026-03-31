import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  Dumbbell,
  Eye,
  HeartPulse,
  MoveRight,
  Play,
  ShieldCheck,
  Sparkles,
  Trophy,
  Waves,
  Zap
} from 'lucide-react';

const featureCards = [
  {
    icon: Eye,
    title: 'Realtime pose guidance',
    description: 'Live body tracking helps users adjust form mid-set instead of after the workout is already done.'
  },
  {
    icon: Activity,
    title: 'Reliable rep counting',
    description: 'Exercise-aware detection keeps sessions focused, hands-free, and easier to trust.'
  },
  {
    icon: ShieldCheck,
    title: 'Form-first coaching',
    description: 'Posture checks and movement feedback help reduce drift and keep every rep cleaner.'
  },
  {
    icon: BarChart3,
    title: 'Progress that feels earned',
    description: 'Sessions feed analytics, streaks, and milestones so users can see momentum build over time.'
  }
];

const trainingHighlights = [
  {
    title: 'Strength tracking',
    body: 'Push-ups, squats, lunges, and bodyweight circuits feel guided instead of manually counted.',
    icon: Dumbbell
  },
  {
    title: 'Cardio pacing',
    body: 'Jumping jacks and HIIT-friendly exercises stay easy to follow with visible targets and tempo cues.',
    icon: HeartPulse
  },
  {
    title: 'Core endurance',
    body: 'Time-based holds like planks get a calmer, more confidence-building experience with posture support.',
    icon: Waves
  }
];

const quickStats = [
  { label: 'Exercises in library', value: '35+' },
  { label: 'AI-tracked core modes', value: '4' },
  { label: 'Realtime feedback', value: 'Live' },
  { label: 'Focus', value: 'Home workouts' }
];

const workflow = [
  {
    step: '01',
    title: 'Choose a workout fast',
    description: 'Jump straight into the camera flow or browse the expanded workout library by category, goal, and intensity.'
  },
  {
    step: '02',
    title: 'Train with live feedback',
    description: 'FitVision watches posture, tracks movement, and gives users a clearer sense of whether they are on track.'
  },
  {
    step: '03',
    title: 'Review progress clearly',
    description: 'Stats, streaks, and summaries turn each session into something measurable and motivating.'
  }
];

const trustSignals = [
  'Built around camera-based workout feedback',
  'Designed for quick at-home session starts',
  'Supports both rep-based and timed workouts',
  'Pairs live motion analysis with progress views'
];

const Home = () => {
  const logoUrl = `${import.meta.env.BASE_URL}images/logo.png`;

  return (
    <div className="min-h-screen pt-20 text-slate-900 dark:text-slate-100">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/75 px-6 py-10 shadow-[0_35px_100px_-48px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/60 sm:px-8 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_24%),radial-gradient(circle_at_78%_18%,_rgba(14,165,233,0.16),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_26%),linear-gradient(135deg,_rgba(248,250,252,0.98),_rgba(240,249,255,0.88))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_24%),radial-gradient(circle_at_78%_18%,_rgba(59,130,246,0.18),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(30,64,175,0.16),_transparent_26%),linear-gradient(135deg,_rgba(2,6,23,0.92),_rgba(15,23,42,0.78))]" />
          <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-cyan-400/12 blur-3xl" />
          <div className="absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-sky-400/12 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.12fr_0.88fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl"
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-cyan-400/20 dark:bg-white/10 dark:text-slate-100">
                <Sparkles className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
                AI-guided home workouts with live movement feedback
              </div>

              <div className="mb-5 flex items-center gap-4">
                <img src={logoUrl} alt="FitVision logo" className="h-14 w-auto drop-shadow-2xl dark:invert" />
                <span className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300">FitVision</span>
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Train with a workout app that
                <span className="block bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 bg-clip-text text-transparent dark:from-cyan-300 dark:via-sky-300 dark:to-blue-300">
                  actually watches your form.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                FitVision turns the home workout experience into something more guided, more motivating, and much
                easier to trust. Start a live session, explore a bigger exercise library, and keep progress visible.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/workout-session"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-base font-semibold text-white transition hover:-translate-y-[-1px] hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  <Play className="h-5 w-5" />
                  Start workout session
                </Link>
                <Link
                  to="/workout-library"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300/80 bg-white/70 px-6 py-4 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-white/35 dark:hover:bg-white/14"
                >
                  Browse workout library
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200/70 bg-white/75 px-4 py-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="glass-panel relative ml-auto w-full max-w-md rounded-[1.9rem] p-5 text-slate-900 dark:text-slate-100"
            >
              <div className="rounded-[1.55rem] border border-slate-200/70 bg-white/90 p-5 shadow-inner shadow-cyan-400/5 dark:border-white/10 dark:bg-slate-950/85">
                <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-700 dark:text-cyan-200">
                    <Camera className="h-4 w-4" />
                    Live preview
                  </span>
                  <span>Form coaching active</span>
                </div>

                <div className="relative overflow-hidden rounded-[1.35rem] border border-slate-200/80 bg-[linear-gradient(135deg,#ecfeff,#f8fafc_58%,#dbeafe)] p-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,#083344,#0f172a_58%,#172554)]">
                  <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300/60 dark:bg-white/10" />
                  <div className="absolute inset-x-0 top-1/2 h-px bg-slate-300/60 dark:bg-white/10" />
                  <div className="relative mx-auto flex aspect-[4/5] max-w-[220px] items-center justify-center">
                    <div className="absolute h-52 w-36 rounded-full border border-cyan-500/70 dark:border-cyan-300/80" />
                    <div className="absolute top-7 h-10 w-10 rounded-full border border-cyan-500/70 dark:border-cyan-300/80" />
                    <div className="absolute top-16 h-16 w-px bg-cyan-500/80 dark:bg-cyan-200/90" />
                    <div className="absolute top-[5.2rem] h-px w-24 bg-cyan-500/80 dark:bg-cyan-200/90" />
                    <div className="absolute left-[5.5rem] top-[6.5rem] h-16 w-px rotate-[25deg] bg-cyan-500/70 dark:bg-cyan-200/80" />
                    <div className="absolute right-[5.5rem] top-[6.5rem] h-16 w-px rotate-[-25deg] bg-cyan-500/70 dark:bg-cyan-200/80" />
                    <div className="absolute bottom-10 left-[6.15rem] h-20 w-px rotate-[18deg] bg-cyan-500/70 dark:bg-cyan-200/80" />
                    <div className="absolute bottom-10 right-[6.15rem] h-20 w-px rotate-[-18deg] bg-cyan-500/70 dark:bg-cyan-200/80" />
                    <div className="absolute left-3 top-4 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-950">
                      Stable posture
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-full bg-slate-950/10 px-3 py-1 text-xs font-medium text-slate-900 backdrop-blur dark:bg-white/10 dark:text-white">
                      Form score 92
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Exercise</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">Push-ups</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Target</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">18 / 24 reps</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100/80 p-4 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Feedback</p>
                    <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-300">Tempo looks strong</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="section-shell">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/10 p-3 text-cyan-600 dark:text-cyan-300">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  Why it feels better
                </p>
                <h2 className="text-2xl font-bold">A clearer first screen for users who want to move fast</h2>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {featureCards.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-slate-200/70 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-slate-950 p-3 text-cyan-300 dark:bg-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-shell relative overflow-hidden">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="relative">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Training focus
              </p>
              <h2 className="mt-2 text-2xl font-bold">Built for bodyweight workouts users actually do at home</h2>
              <div className="mt-6 space-y-4">
                {trainingHighlights.map(({ title, body, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-[1.4rem] border border-slate-200/70 bg-white/80 p-5 dark:border-slate-800 dark:bg-slate-900/55"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                      <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Experience flow
              </p>
              <h2 className="mt-2 text-2xl font-bold">From first click to finished session, the path feels simpler</h2>
            </div>
            <Link
              to="/workout-library"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
            >
              Explore 35+ workouts
              <MoveRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="rounded-[1.5rem] border border-slate-200/70 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-cyan-300 dark:bg-slate-800">
                  {item.step}
                </span>
                <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="section-shell">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              Trust signals
            </p>
            <h2 className="mt-2 text-2xl font-bold">Small proof points that make the product feel more credible</h2>
            <div className="mt-6 space-y-4">
              {trustSignals.map((signal) => (
                <div
                  key={signal}
                  className="flex items-start gap-3 rounded-[1.3rem] border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/55"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{signal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-8 text-white shadow-[0_30px_80px_-45px_rgba(8,47,73,0.9)]">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-slate-950/20 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-100/80">What&apos;s new</p>
                <h2 className="mt-2 max-w-xl text-3xl font-black leading-tight">
                  The homepage now sells the workout experience instead of just listing features.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-cyan-50/90">
                  It leads with live coaching, bigger library access, and a more polished visual rhythm so users know
                  where to go next immediately.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  to="/dashboard"
                  className="rounded-[1.4rem] border border-white/20 bg-white/10 px-5 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Open dashboard
                </Link>
                <Link
                  to="/workout-session"
                  className="inline-flex items-center justify-center gap-2 rounded-[1.4rem] bg-white px-5 py-4 text-sm font-semibold text-sky-900 transition hover:bg-slate-100"
                >
                  <Trophy className="h-4 w-4" />
                  Launch live workout
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
