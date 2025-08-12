import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkoutType, WorkoutSession as WorkoutSessionType } from '../types/pose';
import WorkoutSelector from '../components/WorkoutSelector';
import WorkoutCamera from '../components/WorkoutCamera';
import SummaryPage from '../components/SummaryPage';

type SessionPhase = 'selection' | 'workout' | 'summary';

const WorkoutSession = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<SessionPhase>('selection');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null);
  const [targetValue, setTargetValue] = useState(10);
  const [workoutSession, setWorkoutSession] = useState<WorkoutSessionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleWorkoutSelect = async (workout: WorkoutType, target: number) => {
    setIsLoading(true);
    setSelectedWorkout(workout);
    setTargetValue(target);
    
    // Simulate loading time for AI initialization
    setTimeout(() => {
      setPhase('workout');
      setIsLoading(false);
    }, 1000);
  };

  const handleWorkoutComplete = (results: any) => {
    const session: WorkoutSessionType = {
      id: Date.now().toString(),
      workoutType: selectedWorkout!,
      targetValue,
      startTime: new Date(Date.now() - results.timeElapsed * 1000),
      endTime: new Date(),
      repsCompleted: results.repsCompleted,
      accuracy: results.accuracy,
      calories: results.calories,
      formFeedback: [] // This would be populated with actual feedback during workout
    };
    
    setWorkoutSession(session);
    setPhase('summary');
  };

  const handleRestart = () => {
    if (selectedWorkout) {
      setPhase('workout');
    }
  };

  const handleNewWorkout = () => {
    setPhase('selection');
    setSelectedWorkout(null);
    setWorkoutSession(null);
  };

  const handleExit = () => {
    setPhase('selection');
    setSelectedWorkout(null);
    setWorkoutSession(null);
  };

  const handleHome = () => {
    navigate('/');
  };

  // Render based on current phase
  switch (phase) {
    case 'selection':
      return (
        <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <WorkoutSelector 
            onWorkoutSelect={handleWorkoutSelect}
            isLoading={isLoading}
          />
        </div>
      );

    case 'workout':
      return selectedWorkout ? (
        <WorkoutCamera
          selectedWorkout={selectedWorkout}
          targetValue={targetValue}
          onWorkoutComplete={handleWorkoutComplete}
          onExit={handleExit}
        />
      ) : null;

    case 'summary':
      return workoutSession ? (
        <SummaryPage
          session={workoutSession}
          onRestart={handleRestart}
          onNewWorkout={handleNewWorkout}
          onHome={handleHome}
        />
      ) : null;

    default:
      return null;
  }
};

export default WorkoutSession;
