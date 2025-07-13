export interface Keypoint {
  x: number;
  y: number;
  z?: number;
  score?: number;
  name?: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score?: number;
}

export interface WorkoutType {
  id: string;
  name: string;
  description: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'core';
  type: 'reps' | 'time';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  calories: number;
  icon: JSX.Element;
  color: string;
  lightColor: string;
  defaultValue: number;
  options: number[];
  unit: string;
}

export interface WorkoutSession {
  id: string;
  workoutType: WorkoutType;
  targetValue: number;
  startTime: Date;
  endTime?: Date;
  repsCompleted: number;
  accuracy: number;
  calories: number;
  formFeedback: FormFeedback[];
}

export interface FormFeedback {
  message: string;
  type: 'correct' | 'warning' | 'error';
  timestamp: Date;
}

export interface JointAngle {
  name: string;
  angle: number;
  isCorrect: boolean;
  threshold: {
    min: number;
    max: number;
  };
}

export interface RepDetectorConfig {
  name: string;
  keypoints: string[];
  thresholds: {
    [key: string]: number;
  };
  minConfidence: number;
}

export interface PoseDetectorCallbacks {
  onRepComplete: (count: number) => void;
  onPositionChange: (position: string) => void;
  onFormFeedback: (feedback: string, type?: 'correct' | 'warning' | 'error') => void;
  onAngleUpdate?: (angles: JointAngle[]) => void;
}

export interface DetectorInstance {
  start: () => void;
  stop: () => void;
  reset: () => void;
  cleanup: () => void;
  getCurrentCount: () => number;
  getCurrentPosition: () => string;
}

// Theme types for dark/light mode
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalReps: number;
  totalTime: number;
  totalCalories: number;
  averageAccuracy: number;
  favoriteWorkout: string;
  weeklyProgress: {
    date: string;
    reps: number;
    time: number;
    calories: number;
  }[];
}
