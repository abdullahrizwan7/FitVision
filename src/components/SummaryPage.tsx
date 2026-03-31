import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Flame,
  Home,
  RotateCcw,
  Share2,
  Star,
  Target,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { WorkoutSession } from '../types/pose';
import { useAuth } from '../contexts/AuthContext';
import { useWorkoutData } from '../hooks/useWorkoutData';

interface SummaryPageProps {
  session: WorkoutSession;
  onRestart: () => void;
  onNewWorkout: () => void;
  onHome: () => void;
}

const SummaryPage: React.FC<SummaryPageProps> = ({ session, onRestart, onNewWorkout, onHome }) => {
  const { user } = useAuth();
  const { saveWorkout } = useWorkoutData();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saveWorkoutSession = async () => {
      if (user && !isSaved && !isSaving) {
        try {
          setIsSaving(true);
          await saveWorkout(session);
          setIsSaved(true);
        } catch (error) {
          console.error('Failed to save workout:', error);
        } finally {
          setIsSaving(false);
        }
      }
    };

    saveWorkoutSession();
  }, [user, session, isSaved, isSaving, saveWorkout]);

  const duration = session.endTime
    ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
    : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const rawCompletion = session.workoutType.type === 'reps'
    ? (session.repsCompleted / Math.max(session.targetValue, 1)) * 100
    : (duration / Math.max(session.targetValue, 1)) * 100;
  const completion = Math.max(0, Math.min(100, rawCompletion));

  const overallScore = Math.round((session.accuracy + completion) / 2);

  const performanceRating = (() => {
    if (overallScore >= 90) return 'Excellent';
    if (overallScore >= 80) return 'Great';
    if (overallScore >= 70) return 'Good';
    if (overallScore >= 60) return 'Fair';
    return 'Keep practicing';
  })();

  const achievements = [];
  if (completion >= 100) achievements.push('Goal Completed');
  if (session.accuracy >= 90) achievements.push('Perfect Form');
  if (duration <= session.targetValue * 0.8 && session.workoutType.type === 'reps') achievements.push('Speed Demon');
  if (session.calories >= session.workoutType.calories) achievements.push('Calorie Crusher');

  const shareWorkout = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'FitVision Workout Complete!',
          text: `Completed ${session.repsCompleted} ${session.workoutType.name} with ${session.accuracy}% form accuracy.`,
          url: window.location.origin
        })
        .catch(console.log);
    } else {
      const text = `Completed ${session.repsCompleted} ${session.workoutType.name} with ${session.accuracy}% form accuracy using FitVision AI! ${window.location.origin}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Workout results copied to clipboard!');
      });
    }
  };

  const stats = [
    { label: `${session.workoutType.unit} completed`, value: session.repsCompleted, icon: session.workoutType.icon },
    { label: 'Total time', value: formatTime(duration), icon: <Target className="h-6 w-6" /> },
    { label: 'Calories burned', value: session.calories, icon: <Flame className="h-6 w-6" /> },
    { label: 'Form accuracy', value: `${session.accuracy}%`, icon: <TrendingUp className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {user && (
          <div className={`mx-auto w-full max-w-2xl rounded-2xl px-4 py-3 text-center text-sm font-medium ${
            isSaved
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              : isSaving
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            {isSaved ? 'Workout saved to your profile.' : isSaving ? 'Saving workout...' : 'Ready to save'}
          </div>
        )}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-[linear-gradient(135deg,rgba(6,78,59,0.92),rgba(8,47,73,0.92),rgba(15,23,42,0.94))] p-8 text-white shadow-[0_30px_80px_-45px_rgba(6,78,59,0.9)]">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-300/15 blur-3xl" />
          <div className="relative text-center">
            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
              <Trophy className="h-10 w-10 text-emerald-200" />
            </div>
            <h1 className="mt-6 text-4xl font-black">Workout complete.</h1>
            <p className="mt-3 text-lg text-slate-300">
              Strong finish on your {session.workoutType.name} session.
            </p>
            <div className="mt-6 inline-flex rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
              {performanceRating} performance
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="section-shell p-6 text-center">
              <div className="mx-auto inline-flex rounded-[1.25rem] bg-slate-950 p-4 text-cyan-300 dark:bg-slate-800">
                {stat.icon}
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="section-shell">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Performance summary</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">How this session went</h2>

            <div className="mt-6 flex items-center gap-2">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-6 w-6 ${index < Math.round(overallScore / 20) ? 'fill-current text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                />
              ))}
              <span className="ml-2 text-lg font-semibold text-slate-900 dark:text-white">{overallScore}/100</span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Completion rate</span>
                  <span>{Math.round(completion)}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                  <motion.div
                    className="h-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(completion, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Form accuracy</span>
                  <span>{session.accuracy}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                  <motion.div
                    className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${session.accuracy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="section-shell bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(16,185,129,0.12),rgba(255,255,255,0.55))] dark:bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(16,185,129,0.1),rgba(15,23,42,0.52))]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Session notes</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Highlights and next steps</h2>

            {achievements.length > 0 && (
              <div className="mt-6 grid gap-3">
                {achievements.map((achievement) => (
                  <div key={achievement} className="flex items-center gap-3 rounded-[1.3rem] border border-slate-200/70 bg-white/75 p-4 dark:border-slate-800 dark:bg-slate-900/55">
                    <div className="rounded-full bg-amber-50 p-2 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">{achievement}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-[1.4rem] border border-slate-200/70 bg-white/75 p-5 dark:border-slate-800 dark:bg-slate-900/55">
              <h3 className="font-semibold text-slate-900 dark:text-white">Tips for next time</h3>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {session.accuracy < 85 && <p>Focus on cleaner form through the full movement range.</p>}
                {completion < 100 && <p>You were close to the target. A slightly steadier pace should finish it.</p>}
                {duration > session.targetValue * 2 && session.workoutType.type === 'reps' && (
                  <p>Try increasing pace while keeping technique stable.</p>
                )}
                <p>Consistency compounds. One more session this week will strengthen your trend line.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <button
            onClick={onRestart}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
          >
            <RotateCcw className="h-4 w-4" />
            Do again
          </button>
          <button
            onClick={onNewWorkout}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-4 text-sm font-semibold text-white"
          >
            <Target className="h-4 w-4" />
            New workout
          </button>
          <button
            onClick={shareWorkout}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-white"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            onClick={onHome}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-300 px-5 py-4 text-sm font-semibold text-slate-900 dark:bg-slate-700 dark:text-white"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        </section>
      </div>
    </div>
  );
};

export default SummaryPage;
