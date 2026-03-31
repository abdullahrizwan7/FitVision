import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  Camera,
  Clock,
  Edit3,
  Flame,
  Save,
  Settings,
  Target,
  TrendingUp,
  User,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkoutData } from '../hooks/useWorkoutData';

const avatarBasePath = `${import.meta.env.BASE_URL}images`;

const presetAvatars = [
  `${avatarBasePath}/a1.jpg`,
  `${avatarBasePath}/a2.jpg`,
  `${avatarBasePath}/a3.jpg`,
  `${avatarBasePath}/a4.jpg`,
  `${avatarBasePath}/a5.jpg`,
  `${avatarBasePath}/a6.jpg`
];

const Profile = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const { stats } = useWorkoutData();
  const profilePhoto = userProfile?.photoURL || user?.photoURL || '';
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    email: user?.email || '',
    photoURL: profilePhoto,
    fitnessGoal: userProfile?.preferences?.fitnessGoal || 'general',
    units: userProfile?.preferences?.units || 'metric',
    notifications: userProfile?.preferences?.notifications || true,
    theme: userProfile?.preferences?.theme || 'light'
  });

  useEffect(() => {
    setFormData({
      displayName: userProfile?.displayName || user?.displayName || '',
      email: user?.email || '',
      photoURL: userProfile?.photoURL || user?.photoURL || '',
      fitnessGoal: userProfile?.preferences?.fitnessGoal || 'general',
      units: userProfile?.preferences?.units || 'metric',
      notifications: userProfile?.preferences?.notifications || true,
      theme: userProfile?.preferences?.theme || 'light'
    });
  }, [user, userProfile]);

  const resetForm = () => {
    setFormData({
      displayName: userProfile?.displayName || user?.displayName || '',
      email: user?.email || '',
      photoURL: userProfile?.photoURL || user?.photoURL || '',
      fitnessGoal: userProfile?.preferences?.fitnessGoal || 'general',
      units: userProfile?.preferences?.units || 'metric',
      notifications: userProfile?.preferences?.notifications || true,
      theme: userProfile?.preferences?.theme || 'light'
    });
  };

  const handleSave = async () => {
    try {
      await updateUserProfile({
        displayName: formData.displayName,
        photoURL: formData.photoURL.trim() || undefined,
        preferences: {
          ...userProfile?.preferences,
          units: formData.units,
          notifications: formData.notifications,
          theme: formData.theme,
          fitnessGoal: formData.fitnessGoal
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const profileMetrics = [
    { label: 'Workouts', value: stats?.totalWorkouts || 0, icon: Target },
    { label: 'Current streak', value: stats?.currentStreak || 0, icon: TrendingUp },
    { label: 'Calories', value: stats?.totalCalories || 0, icon: Flame },
    { label: 'Form score', value: `${stats?.avgFormScore || 0}%`, icon: Award }
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-8 text-white shadow-[0_30px_80px_-45px_rgba(8,47,73,0.9)]">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="relative text-center">
              <div className="relative mx-auto inline-block">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="h-28 w-28 rounded-full object-cover ring-4 ring-white/20" />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white/10 ring-4 ring-white/10">
                    <User className="h-12 w-12 text-cyan-200" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-1 right-1 rounded-full bg-white p-2 text-slate-950 shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <h1 className="mt-6 text-3xl font-black">{userProfile?.displayName || user?.displayName || 'User'}</h1>
              <p className="mt-2 text-sm text-slate-300">{user?.email}</p>
              <div className="mt-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Personal fitness hub
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {profileMetrics.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-[1.4rem] bg-white/10 p-4 text-left backdrop-blur">
                    <div className="inline-flex rounded-2xl bg-white/10 p-3 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-2xl font-bold">{value}</p>
                    <p className="text-sm text-slate-300">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section-shell">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Account settings</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Preferences and profile details</h2>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsEditing(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-300 px-4 py-3 text-sm font-semibold text-slate-900 dark:bg-slate-700 dark:text-white"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/75 p-5 dark:border-slate-800 dark:bg-slate-900/55">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <User className="h-4 w-4" />
                  Identity
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Display name</span>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white disabled:opacity-60"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    />
                  </label>
                  <div className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Choose avatar</span>
                    <div className="grid grid-cols-3 gap-3">
                      {presetAvatars.map((avatar) => {
                        const isSelected = formData.photoURL === avatar;
                        return (
                          <button
                            key={avatar}
                            type="button"
                            disabled={!isEditing}
                            onClick={() => setFormData((prev) => ({ ...prev, photoURL: avatar }))}
                            className={`overflow-hidden rounded-2xl border-2 transition ${
                              isSelected
                                ? 'border-cyan-500 ring-2 ring-cyan-200 dark:ring-cyan-500/30'
                                : 'border-slate-200 dark:border-slate-700'
                            } ${!isEditing ? 'cursor-default opacity-60' : 'hover:-translate-y-0.5'}`}
                          >
                            <img src={avatar} alt="Avatar option" className="h-20 w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!isEditing || !user?.photoURL}
                        onClick={() => setFormData((prev) => ({ ...prev, photoURL: user?.photoURL || '' }))}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        Use Google photo
                      </button>
                      <button
                        type="button"
                        disabled={!isEditing}
                        onClick={() => setFormData((prev) => ({ ...prev, photoURL: '' }))}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        Remove photo
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Pick one of the built-in avatars for the showcase, or use your Google photo if available.
                    </p>
                  </div>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Fitness goal</span>
                    <select
                      name="fitnessGoal"
                      value={formData.fitnessGoal}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white disabled:opacity-60"
                    >
                      <option value="weight_loss">Weight loss</option>
                      <option value="muscle_gain">Muscle gain</option>
                      <option value="endurance">Endurance</option>
                      <option value="strength">Strength</option>
                      <option value="general">General fitness</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/75 p-5 dark:border-slate-800 dark:bg-slate-900/55">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <Settings className="h-4 w-4" />
                  Preferences
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Units</span>
                    <select
                      name="units"
                      value={formData.units}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white disabled:opacity-60"
                    >
                      <option value="metric">Metric</option>
                      <option value="imperial">Imperial</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Theme</span>
                    <select
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white disabled:opacity-60"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </label>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Push notifications</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Workout reminders and summary nudges</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'notifications', type: 'checkbox', checked: !formData.notifications } } as React.ChangeEvent<HTMLInputElement>)}
                      disabled={!isEditing}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${formData.notifications ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'} ${!isEditing ? 'opacity-60' : ''}`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white transition ${formData.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { icon: Calendar, title: 'Weekly goal', value: '5 days' },
                { icon: Clock, title: 'Session target', value: '30 min' },
                { icon: TrendingUp, title: 'Difficulty', value: 'Beginner' }
              ].map(({ icon: Icon, title, value }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[1.4rem] border border-slate-200/70 bg-white/80 p-5 text-center dark:border-slate-800 dark:bg-slate-900/55"
                >
                  <div className="mx-auto inline-flex rounded-2xl bg-slate-950 p-3 text-cyan-300 dark:bg-slate-800">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm uppercase tracking-[0.18em] text-slate-400">{title}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
