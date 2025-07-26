import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    units: 'metric' | 'imperial';
    notifications: boolean;
    theme: 'light' | 'dark';
  };
  stats: {
    totalWorkouts: number;
    totalReps: number;
    totalCalories: number;
    totalMinutes: number;
    currentStreak: number;
    bestStreak: number;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth initialization timeout - proceeding without auth');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Google sign-in
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createOrUpdateUserProfile(result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  // Email/password sign-in
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await updateLastLogin(result.user.uid);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  // Email/password sign-up
  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await createOrUpdateUserProfile(result.user);
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Create or update user profile in Firestore
  const createOrUpdateUserProfile = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    const now = new Date();

    if (!userSnap.exists()) {
      // Create new user profile
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        createdAt: now,
        lastLoginAt: now,
        preferences: {
          units: 'metric',
          notifications: true,
          theme: 'light'
        },
        stats: {
          totalWorkouts: 0,
          totalReps: 0,
          totalCalories: 0,
          totalMinutes: 0,
          currentStreak: 0,
          bestStreak: 0
        }
      };

      await setDoc(userRef, newProfile);
      setUserProfile(newProfile);
    } else {
      // Update existing user profile
      const existingProfile = userSnap.data() as UserProfile;
      const updatedProfile = {
        ...existingProfile,
        lastLoginAt: now,
        displayName: user.displayName || existingProfile.displayName,
        photoURL: user.photoURL || existingProfile.photoURL
      };

      await setDoc(userRef, updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
    }
  };

  // Update last login time
  const updateLastLogin = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !userProfile) return;

    const userRef = doc(db, 'users', user.uid);
    const updatedProfile = { ...userProfile, ...updates };
    
    await setDoc(userRef, updatedProfile, { merge: true });
    setUserProfile(updatedProfile);
  };

  // Load user profile from Firestore
  const loadUserProfile = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      setUserProfile(userSnap.data() as UserProfile);
    }
  };

  useEffect(() => {
    let unsubscribe: any;
    
    const initAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user);
          if (user) {
            try {
              await loadUserProfile(user);
            } catch (error) {
              console.error('Error loading user profile:', error);
            }
          } else {
            setUserProfile(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
