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
      console.log('useWorkoutData: No user found, clearing data');
      setWorkouts([]);
      setStats(null);
      setLoading(false);
      return;
    }

    if (!user.uid) {
      console.error('useWorkoutData: User exists but has no UID');
      setError('Authentication error: User has no ID');
      setLoading(false);
      return;
    }

    try {
      console.log('useWorkoutData: Loading workouts for user ID:', user.uid);
      setLoading(true);
      setError(null);

      // Try to load workouts first
      console.log('useWorkoutData: Attempting to load workouts...');
      const userWorkouts = await WorkoutService.getUserWorkouts(user.uid, 50);
      console.log('useWorkoutData: Workouts loaded successfully');
      
      // Then try to load stats (but don't fail if this doesn't work)
      let userStats = null;
      try {
        console.log('useWorkoutData: Attempting to load stats...');
        userStats = await WorkoutService.getUserStats(user.uid);
        console.log('useWorkoutData: Stats loaded successfully');
      } catch (statsError) {
        console.warn('useWorkoutData: Failed to load stats, but continuing with workouts:', statsError);
        userStats = {
          totalWorkouts: 0,
          totalReps: 0,
          totalCalories: 0,
          totalMinutes: 0,
          avgFormScore: 0,
          avgAiAccuracy: 0,
          currentStreak: 0,
          bestStreak: 0,
          workoutsByCategory: {},
          workoutsByDifficulty: {},
          recentWorkouts: []
        };
      }

      console.log('useWorkoutData: Loaded workouts:', userWorkouts.length, 'workouts');
      console.log('useWorkoutData: User stats:', userStats);
      setWorkouts(userWorkouts);
      setStats(userStats);
    } catch (err) {
      console.error('Error loading workout data:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      setWorkouts([]);
      setStats({
        totalWorkouts: 0,
        totalReps: 0,
        totalCalories: 0,
        totalMinutes: 0,
        avgFormScore: 0,
        avgAiAccuracy: 0,
        currentStreak: 0,
        bestStreak: 0,
        workoutsByCategory: {},
        workoutsByDifficulty: {},
        recentWorkouts: []
      });
      setError(`Failed to load workout data: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkout = async (session: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('useWorkoutData: Saving workout for user ID:', user.uid);
      console.log('useWorkoutData: Session data:', session);
      await WorkoutService.saveWorkoutSession(user.uid, session);
      console.log('useWorkoutData: Workout saved successfully, reloading data...');
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
