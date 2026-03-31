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
  Timestamp,
  setDoc
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

  // Test Firebase connection
  static async testConnection(): Promise<boolean> {
    try {
      console.log('WorkoutService: Testing Firebase connection...');
      
      // Try to access the collection (this should work even with no data)
      const testQuery = query(
        collection(db, this.COLLECTION_NAME),
        limit(1)
      );
      
      const snapshot = await getDocs(testQuery);
      console.log('WorkoutService: Firebase connection successful, found', snapshot.size, 'documents');
      return true;
    } catch (error) {
      console.error('WorkoutService: Firebase connection failed:', error);
      return false;
    }
  }

  // Validate workout session data
  static validateWorkoutSession(session: WorkoutSession): boolean {
    console.log('WorkoutService: Validating session:', session);
    
    if (!session.workoutType?.name || !session.workoutType?.id) {
      console.error('WorkoutService: Invalid workout type', session.workoutType);
      return false;
    }
    if (session.repsCompleted < 0 || !Number.isFinite(session.repsCompleted)) {
      console.error('WorkoutService: Invalid reps completed', session.repsCompleted);
      return false;
    }
    if (!session.startTime || session.startTime > new Date()) {
      console.error('WorkoutService: Invalid start time', session.startTime);
      return false;
    }
    
    console.log('WorkoutService: Session validation passed');
    return true;
  }

  // Save a workout session
  static async saveWorkoutSession(userId: string, session: WorkoutSession): Promise<string> {
    try {
      console.log('WorkoutService: Saving workout session for userId:', userId);
      console.log('WorkoutService: Session data received:', session);
      
      // Validate session data before saving
      if (!this.validateWorkoutSession(session)) {
        throw new Error('Invalid workout session data');
      }

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

      console.log('WorkoutService: Final workout data to save:', workoutData);
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), workoutData);
      console.log('WorkoutService: Saved to Firestore with ID:', docRef.id);
      
      // Update user stats
      await this.updateUserStats(userId, workoutData);
      console.log('WorkoutService: User stats updated successfully');
      
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
      console.log('WorkoutService: Fetching workouts for userId:', userId);
      console.log('WorkoutService: Using collection:', this.COLLECTION_NAME);
      console.log('WorkoutService: Firebase db instance:', !!db);
      
      let q;
      let querySnapshot;
      
      try {
        // Try with orderBy first (requires index)
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );

        console.log('WorkoutService: Query with orderBy created, executing...');
        querySnapshot = await getDocs(q);
        console.log('WorkoutService: Query with orderBy executed successfully');
      } catch (indexError) {
        console.warn('WorkoutService: OrderBy query failed, trying without orderBy:', indexError);
        
        // Fallback: try without orderBy (doesn't require index)
        q = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', '==', userId),
          limit(limitCount)
        );

        console.log('WorkoutService: Fallback query created, executing...');
        querySnapshot = await getDocs(q);
        console.log('WorkoutService: Fallback query executed successfully');
      }
      
      const workouts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FirebaseWorkoutSession));
      
      console.log('WorkoutService: Found', workouts.length, 'workouts for user');
      return workouts;
    } catch (error) {
      console.error('WorkoutService: Error getting user workouts:', error);
      console.error('WorkoutService: Error type:', typeof error);
      console.error('WorkoutService: Error code:', error?.code);
      console.error('WorkoutService: Error message:', error?.message);
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

      await setDoc(userStatsRef, updatedStats, { merge: true });

      const fullStats = await this.getUserStats(userId);
      await setDoc(
        doc(db, 'users', userId),
        {
          stats: {
            totalWorkouts: fullStats.totalWorkouts,
            totalReps: fullStats.totalReps,
            totalCalories: fullStats.totalCalories,
            totalMinutes: fullStats.totalMinutes,
            currentStreak: fullStats.currentStreak,
            bestStreak: fullStats.bestStreak
          },
          updatedAt: Timestamp.now()
        },
        { merge: true }
      );
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
