import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, User, LogOut, Settings, Trophy, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginModal from './auth/LoginModal';
import SettingsModal from './SettingsModal';

const Navbar = () => {
  const logoUrl = `${import.meta.env.BASE_URL}images/logo.png`;
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, userProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigation = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Dashboard', href: '/dashboard', current: location.pathname === '/dashboard', protected: true },
    { name: 'Analytics', href: '/analytics', current: location.pathname === '/analytics', protected: true },
    { name: 'Workout Library', href: '/workout-library', current: location.pathname === '/workout-library' },
    { name: 'Workout Session', href: '/workout-session', current: location.pathname === '/workout-session', protected: true },
  ].filter(item => !item.protected || user);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/70 shadow-[0_15px_40px_-28px_rgba(15,23,42,0.55)] backdrop-blur-xl transition-colors duration-200 dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                <img className="h-8 w-auto dark:invert" src={logoUrl} alt="FitVision" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  Fit<span className="text-cyan-600 dark:text-cyan-400">Vision</span>
                </span>
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  AI fitness coach
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center rounded-full border border-slate-200/80 bg-white/70 px-2 py-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-slate-950 text-white shadow-sm dark:bg-cyan-500 dark:text-slate-950'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-cyan-200/70 bg-cyan-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300 xl:flex">
              <Sparkles className="h-3.5 w-3.5" />
              Live pose AI
            </div>

            <button
              onClick={toggleTheme}
              className="rounded-full border border-slate-200/80 bg-white/70 p-2.5 text-slate-500 transition-colors duration-200 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/70 p-2 pr-4 shadow-sm transition-all duration-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-900"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="max-w-32 truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                    {userProfile?.displayName || user.displayName || 'User'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {userProfile?.displayName || user.displayName}
                      </p>
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/achievements"
                        className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Trophy className="mr-3 h-4 w-4" />
                        Achievements
                      </Link>
                      <button
                        onClick={() => {
                          setShowSettingsModal(true);
                          setShowUserMenu(false);
                        }}
                        className="flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center border-t border-slate-200 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                Sign In
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-full border border-slate-200/80 bg-white/70 p-2 text-slate-500 transition-colors duration-200 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full border border-slate-200/80 bg-white/70 p-2 text-slate-500 transition-colors hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="pb-4 md:hidden">
            <div className="glass-panel mt-2 rounded-[1.5rem] p-3">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block rounded-xl px-3 py-3 text-base font-medium transition-colors duration-200 ${
                      item.current
                        ? 'bg-slate-950 text-white dark:bg-cyan-500 dark:text-slate-950'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                          {userProfile?.displayName || user.displayName || 'User'}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-900 dark:bg-slate-800 dark:text-white"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/achievements"
                        onClick={() => setIsOpen(false)}
                        className="rounded-xl bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-900 dark:bg-slate-800 dark:text-white"
                      >
                        Achievements
                      </Link>
                    </div>

                    <button
                      onClick={() => {
                        setShowSettingsModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-xl bg-slate-950 px-3 py-2 text-sm font-medium text-white dark:bg-cyan-500 dark:text-slate-950"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white dark:bg-cyan-500 dark:text-slate-950"
                  >
                    Sign In to save workouts
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </nav>
  );
};

export default Navbar;
