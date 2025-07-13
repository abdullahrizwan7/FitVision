import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import WorkoutLibrary from './pages/WorkoutLibrary';
import WorkoutSession from './pages/WorkoutSession';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 transition-colors duration-200">
        <Navbar />
        <div className="pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/workout-library" element={<WorkoutLibrary />} />
            <Route path="/workout-session" element={<WorkoutSession />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;