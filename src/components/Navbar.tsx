import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, User, LogOut, Settings, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoginModal from './auth/LoginModal';
import SettingsModal from './SettingsModal';

const Navbar = () => {
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
  ].filter(item => !item.protected || user); // Filter protected routes if user not logged in

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg fixed w-full z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/FitVision/images/logo.png" alt="FitVision" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Fit<span className="text-purple-600">Vision</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  item.current
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white'
                } px-3 py-2 text-sm font-medium transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Authentication */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {userProfile?.displayName || user.displayName || 'User'}
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {userProfile?.displayName || user.displayName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/achievements"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Trophy className="h-4 w-4 mr-3" />
                        Achievements
                      </Link>
                      <button
                        onClick={() => {
                          setShowSettingsModal(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-600"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  } block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      {/* Settings Modal */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </nav>
  );
};

export default Navbar;