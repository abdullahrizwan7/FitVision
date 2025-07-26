import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WorkoutService, FirebaseWorkoutSession, WorkoutStats } from '../services/workoutService';

export const useWorkoutData = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<FirebaseWorkoutSession[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserWorkouts = async () => {
    if (!user) {
      setWorkouts([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [userWorkouts, userStats] = await Promise.all([
        WorkoutService.getUserWorkouts(user.uid, 50),
        WorkoutService.getUserStats(user.uid)
      ]);

      setWorkouts(userWorkouts);
      setStats(userStats);
    } catch (err) {
      console.error('Error loading workout data:', err);
      setError('Failed to load workout data');
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async (session: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await WorkoutService.saveWorkoutSession(user.uid, session);
      // Reload data after saving
      await loadUserWorkouts();
    } catch (err) {
      console.error('Error saving workout:', err);
      throw err;
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    try {
      await WorkoutService.deleteWorkoutSession(workoutId);
      // Reload data after deletion
      await loadUserWorkouts();
    } catch (err) {
      console.error('Error deleting workout:', err);
      throw err;
    }
  };

  const getWorkoutsInRange = async (startDate: Date, endDate: Date) => {
    if (!user) return [];

    try {
      return await WorkoutService.getWorkoutsInDateRange(user.uid, startDate, endDate);
    } catch (err) {
      console.error('Error getting workouts in range:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadUserWorkouts();
  }, [user]);

  return {
    workouts,
    stats,
    loading,
    error,
    saveWorkout,
    deleteWorkout,
    getWorkoutsInRange,
    refreshData: loadUserWorkouts
  };
};

// Hook for getting weekly workout data
export const useWeeklyWorkoutData = () => {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeeklyData = async () => {
      if (!user) {
        setWeeklyData([]);
        setLoading(false);
        return;
      }

      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const workouts = await WorkoutService.getWorkoutsInDateRange(user.uid, startDate, endDate);
        
        // Process data for weekly chart
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const processedData = weekDays.map((day, index) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - index));
          
          const dayWorkouts = workouts.filter(w => {
            const workoutDate = w.createdAt.toDate();
            return workoutDate.toDateString() === date.toDateString();
          });

          return {
            day,
            date,
            workouts: dayWorkouts.length,
            totalReps: dayWorkouts.reduce((sum, w) => sum + w.repsCompleted, 0),
            totalCalories: dayWorkouts.reduce((sum, w) => sum + w.calories, 0),
            avgFormScore: dayWorkouts.length > 0 
              ? Math.round(dayWorkouts.reduce((sum, w) => sum + w.formScore, 0) / dayWorkouts.length)
              : 0
          };
        });

        setWeeklyData(processedData);
      } catch (err) {
        console.error('Error loading weekly data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyData();
  }, [user]);

  return { weeklyData, loading };
};

// Hook for workout statistics by category
export const useWorkoutStatsByCategory = () => {
  const { stats } = useWorkoutData();
  
  const getWorkoutBreakdown = () => {
    if (!stats || !stats.workoutsByCategory) return [];

    const colors = {
      strength: { bg: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-600', color: 'bg-purple-500', textColor: 'text-purple-600' },
      cardio: { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-600', color: 'bg-blue-500', textColor: 'text-blue-600' },
      core: { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-600', color: 'bg-green-500', textColor: 'text-green-600' },
      flexibility: { bg: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-600', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    };

    return Object.entries(stats.workoutsByCategory).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      sessions: count,
      totalReps: Math.round(count * 20), // Estimated reps per session
      avgFormScore: stats.avgFormScore || 85,
      percentage: Math.round((count / stats.totalWorkouts) * 100),
      ...colors[category as keyof typeof colors] || colors.strength
    }));
  };

  return { workoutBreakdown: getWorkoutBreakdown() };
};
