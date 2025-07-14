// Motivational messages and feedback system
export class WorkoutMotivation {
  private lastMotivationTime: number = 0;
  private motivationCooldown: number = 5000; // 5 seconds between motivations

  // Motivational messages based on progress
  getMotivationalMessage(currentReps: number, targetReps: number, workoutType: string): string | null {
    const progress = currentReps / targetReps;
    const remaining = targetReps - currentReps;
    
    // Don't spam motivational messages
    const now = Date.now();
    if (now - this.lastMotivationTime < this.motivationCooldown) {
      return null;
    }

    let message = '';

    // Different messages based on progress
    if (remaining === 1) {
      message = "One more! You've got this!";
    } else if (remaining === 2) {
      message = "Two left! Keep going!";
    } else if (remaining === 3) {
      message = "Three more! You're almost there!";
    } else if (remaining === 5) {
      message = "Five more! Push through!";
    } else if (progress >= 0.9) {
      message = "Final stretch! Don't give up!";
    } else if (progress >= 0.75) {
      message = "Three quarters done! Keep it up!";
    } else if (progress >= 0.5) {
      message = "Halfway there! You're doing great!";
    } else if (progress >= 0.25) {
      message = "Quarter done! Find your rhythm!";
    } else if (currentReps === 5) {
      message = "Five reps down! You're warmed up!";
    } else if (currentReps === 10) {
      message = "Ten reps! You're on fire!";
    }

    // Special messages for different workout types
    if (workoutType === 'pushups' && currentReps > 0 && currentReps % 10 === 0) {
      message = `${currentReps} push-ups! Your upper body is getting stronger!`;
    } else if (workoutType === 'squats' && currentReps > 0 && currentReps % 15 === 0) {
      message = `${currentReps} squats! Your legs are on fire!`;
    } else if (workoutType === 'jumpingjacks' && currentReps > 0 && currentReps % 20 === 0) {
      message = `${currentReps} jumping jacks! Your heart is pumping!`;
    }

    if (message) {
      this.lastMotivationTime = now;
      return message;
    }

    return null;
  }

  // Form feedback messages
  getFormFeedbackMessage(issue: string, workoutType: string): string {
    const formMessages: { [key: string]: { [key: string]: string[] } } = {
      pushups: {
        'low_back': ["Keep your back straight!", "Engage your core!", "Don't let your hips sag!"],
        'elbow_angle': ["Lower down more!", "Get those elbows to 90 degrees!", "Go deeper!"],
        'head_position': ["Keep your head neutral!", "Look down at the floor!", "Don't crane your neck!"]
      },
      squats: {
        'knee_position': ["Keep your knees over your toes!", "Don't let your knees cave in!", "Track those knees!"],
        'depth': ["Go lower!", "Get your thighs parallel!", "Deeper squat!"],
        'back_angle': ["Keep your chest up!", "Don't lean forward!", "Proud chest!"]
      },
      jumpingjacks: {
        'arm_position': ["Get those arms all the way up!", "Touch your hands overhead!", "Full range of motion!"],
        'landing': ["Land softer!", "Bend your knees on landing!", "Light on your feet!"]
      }
    };

    const workoutMessages = formMessages[workoutType] || {};
    const issueMessages = workoutMessages[issue] || ["Keep focusing on your form!"];
    
    return issueMessages[Math.floor(Math.random() * issueMessages.length)];
  }

  // Person detection messages
  getComeIntoFrameMessage(): string {
    const messages = [
      "Please step into the camera frame!",
      "I can't see you! Move into the frame!",
      "Come into view so I can track your workout!",
      "Position yourself in front of the camera!",
      "Step into the frame to start tracking!"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Encouragement messages during workout
  getEncouragementMessage(): string {
    const messages = [
      "You're doing great!",
      "Keep up the good work!",
      "Strong and steady!",
      "Perfect form!",
      "You've got this!",
      "Stay focused!",
      "Breathe and push!",
      "Looking good!",
      "Nice rhythm!",
      "Keep it up!"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Warning messages for taking breaks
  getBreakWarningMessage(pausedTime: number): string {
    if (pausedTime > 30000) { // 30 seconds
      return "Ready to continue? Your body is cooling down!";
    } else if (pausedTime > 60000) { // 1 minute
      return "Let's get back to it! You've got momentum to maintain!";
    } else if (pausedTime > 120000) { // 2 minutes
      return "Time to resume! Your muscles are getting cold!";
    }
    
    return "Take your time, but don't rest too long!";
  }
}

export const workoutMotivation = new WorkoutMotivation();
