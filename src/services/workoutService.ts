import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { WorkoutSession } from '../types/pose';

export interface FirebaseWorkoutSession {
  id?: string;
  userId: string;
  workoutType: {
    id: string;
    name: string;
    category: string;
    difficulty: string;
    type: string;
  };
  targetValue: number;
  actualValue: number;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // in seconds
  repsCompleted: number;
  accuracy: number;
  formScore: number;
  calories: number;
  aiAccuracy: number;
  formFeedback: Array<{
    timestamp: number;
    type: 'correction' | 'encouragement' | 'warning';
    message: string;
  }>;
  createdAt: Timestamp;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalReps: number;
  totalCalories: number;
  totalMinutes: number;
  avgFormScore: number;
  avgAiAccuracy: number;
  currentStreak: number;
  bestStreak: number;
  workoutsByCategory: Record<string, number>;
  workoutsByDifficulty: Record<string, number>;
  recentWorkouts: FirebaseWorkoutSession[];
}

export class WorkoutService {
  private static COLLECTION_NAME = 'workouts';
  private static USER_STATS_COLLECTION = 'userStats';

  // Save a workout session
  static async saveWorkoutSession(userId: string, session: WorkoutSession): Promise<string> {
    try {
      const workoutData: Omit<FirebaseWorkoutSession, 'id'> = {
        userId,
        workoutType: {
          id: session.workoutType.id,
          name: session.workoutType.name,
          category: session.workoutType.category,
          difficulty: session.workoutType.difficulty,
          type: session.workoutType.type
        },
        targetValue: session.targetValue,
        actualValue: session.repsCompleted,
        startTime: Timestamp.fromDate(session.startTime),
        endTime: Timestamp.fromDate(session.endTime || new Date()),
        duration: Math.floor(((session.endTime || new Date()).getTime() - session.startTime.getTime()) / 1000),
        repsCompleted: session.repsCompleted,
        accuracy: session.accuracy,
        formScore: session.accuracy, // Using accuracy as form score for now
        calories: session.calories,
        aiAccuracy: session.accuracy,
        formFeedback: (session.formFeedback || []).map(feedback => ({
          timestamp: feedback.timestamp instanceof Date ? feedback.timestamp.getTime() : feedback.timestamp,
          type: feedback.type === 'error' ? 'warning' : feedback.type === 'correct' ? 'encouragement' : feedback.type as 'correction' | 'encouragement' | 'warning',
          message: feedback.message
        })),
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), workoutData);
      
      // Update user stats
      await this.updateUserStats(userId, workoutData);
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving workout session:', error);
      throw error;
    }
  }

  // Get user's workout sessions
  static async getUserWorkouts(
    userId: string, 
    limitCount: number = 50
  ): Promise<FirebaseWorkoutSession[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseWorkoutSession));
    } catch (error) {
      console.error('Error getting user workouts:', error);
      throw error;
    }
  }

  // Get workout by ID
  static async getWorkoutById(workoutId: string): Promise<FirebaseWorkoutSession | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, workoutId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as FirebaseWorkoutSession;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting workout by ID:', error);
      throw error;
    }
  }

  // Delete a workout session
  static async deleteWorkoutSession(workoutId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, workoutId));
    } catch (error) {
      console.error('Error deleting workout session:', error);
      throw error;
    }
  }

  // Get user workout statistics
  static async getUserStats(userId: string): Promise<WorkoutStats> {
    try {
      const workouts = await this.getUserWorkouts(userId, 1000); // Get more for stats calculation
      
      if (workouts.length === 0) {
        return {
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

      const totalWorkouts = workouts.length;
      const totalReps = workouts.reduce((sum, w) => sum + w.repsCompleted, 0);
      const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
      const totalMinutes = Math.floor(workouts.reduce((sum, w) => sum + w.duration, 0) / 60);
      const avgFormScore = Math.round(workouts.reduce((sum, w) => sum + w.formScore, 0) / totalWorkouts);
      const avgAiAccuracy = Math.round(workouts.reduce((sum, w) => sum + w.aiAccuracy, 0) / totalWorkouts);

      // Calculate workout distribution
      const workoutsByCategory: Record<string, number> = {};
      const workoutsByDifficulty: Record<string, number> = {};
      
      workouts.forEach(workout => {
        const category = workout.workoutType.category;
        const difficulty = workout.workoutType.difficulty;
        
        workoutsByCategory[category] = (workoutsByCategory[category] || 0) + 1;
        workoutsByDifficulty[difficulty] = (workoutsByDifficulty[difficulty] || 0) + 1;
      });

      // Calculate streak
      const { currentStreak, bestStreak } = this.calculateWorkoutStreaks(workouts);

      return {
        totalWorkouts,
        totalReps,
        totalCalories,
        totalMinutes,
        avgFormScore,
        avgAiAccuracy,
        currentStreak,
        bestStreak,
        workoutsByCategory,
        workoutsByDifficulty,
        recentWorkouts: workouts.slice(0, 10)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Calculate workout streaks
  private static calculateWorkoutStreaks(workouts: FirebaseWorkoutSession[]): { currentStreak: number; bestStreak: number } {
    if (workouts.length === 0) return { currentStreak: 0, bestStreak: 0 };

    // Group workouts by date
    const workoutDates = new Set(
      workouts.map(w => w.createdAt.toDate().toDateString())
    );

    const sortedDates = Array.from(workoutDates).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    for (let i = 0; i < sortedDates.length; i++) {
      const workoutDate = new Date(sortedDates[i]);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && (daysDiff === 0 || daysDiff === 1)) {
        currentStreak = 1;
      } else if (currentStreak > 0) {
        const prevDate = new Date(sortedDates[i - 1]);
        prevDate.setHours(0, 0, 0, 0);
        const prevDaysDiff = Math.floor((prevDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (prevDaysDiff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate best streak
    tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const prevDate = new Date(sortedDates[i - 1]);
      const daysDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    return { currentStreak, bestStreak };
  }

  // Update user statistics in a separate collection for quick access
  private static async updateUserStats(userId: string, workout: Omit<FirebaseWorkoutSession, 'id'>): Promise<void> {
    try {
      const userStatsRef = doc(db, this.USER_STATS_COLLECTION, userId);
      const userStatsSnap = await getDoc(userStatsRef);
      
      let currentStats = {
        totalWorkouts: 0,
        totalReps: 0,
        totalCalories: 0,
        totalMinutes: 0,
        lastWorkoutDate: null as Timestamp | null,
        updatedAt: Timestamp.now()
      };

      if (userStatsSnap.exists()) {
        currentStats = { ...currentStats, ...userStatsSnap.data() };
      }

      const updatedStats = {
        totalWorkouts: currentStats.totalWorkouts + 1,
        totalReps: currentStats.totalReps + workout.repsCompleted,
        totalCalories: currentStats.totalCalories + workout.calories,
        totalMinutes: currentStats.totalMinutes + Math.floor(workout.duration / 60),
        lastWorkoutDate: workout.createdAt,
        updatedAt: Timestamp.now()
      };

      await updateDoc(userStatsRef, updatedStats);
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Don't throw here as it's not critical for the main workflow
    }
  }

  // Get workouts for a specific date range
  static async getWorkoutsInDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FirebaseWorkoutSession[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseWorkoutSession));
    } catch (error) {
      console.error('Error getting workouts in date range:', error);
      throw error;
    }
  }
}
