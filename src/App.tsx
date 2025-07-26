import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import WorkoutLibrary from './pages/WorkoutLibrary';
import WorkoutSession from './pages/WorkoutSession';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router basename="/FitVision">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/achievements" element={
              <ProtectedRoute>
                <Achievements />
              </ProtectedRoute>
            } />
            <Route path="/workout-library" element={<WorkoutLibrary />} />
            <Route path="/workout-session" element={
              <ProtectedRoute>
                <WorkoutSession />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;