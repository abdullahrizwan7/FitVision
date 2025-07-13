// Configuration
const TARGET_REPS = 10; // Default target, can be changed via URL params

// State variables
let isLoaded = false;
let currentPosition = "UP";
let pushUps = 0;
let targetReps = TARGET_REPS;
let formFeedback = "Get ready to start!";
let isWorkoutComplete = false;
let Detector = null;

// DOM elements
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const video = document.getElementById("videoElement");
const repCountElement = document.getElementById("rep-count");
const positionValueElement = document.getElementById("position-value");
const progressTextElement = document.getElementById("progress-text");
const progressBarElement = document.getElementById("progress-bar");
const feedbackMessageElement = document.getElementById("feedback-message");
const workoutCompleteElement = document.getElementById("workout-complete");
const restartButtonElement = document.getElementById("restart-button");

// Check for URL parameters
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('target')) {
  targetReps = parseInt(urlParams.get('target'), 10) || TARGET_REPS;
}

// Update progress text with target
progressTextElement.textContent = `0/${targetReps}`;

// Create an audio element for the sound
const snd = new Audio();
snd.src = "a-tone.wav";

// Update UI elements
function updateUI() {
  // Update rep count
  repCountElement.textContent = pushUps;
  
  // Update position indicator
  positionValueElement.textContent = currentPosition;
  positionValueElement.className = `position-value position-${currentPosition.toLowerCase()}`;
  
  // Update progress
  const progressPercentage = Math.min((pushUps / targetReps) * 100, 100);
  progressTextElement.textContent = `${pushUps}/${targetReps}`;
  progressBarElement.style.width = `${progressPercentage}%`;
  
  // Update feedback message
  if (formFeedback) {
    const isWarning = formFeedback !== "Good form!";
    feedbackMessageElement.className = `feedback-message ${isWarning ? 'feedback-warning' : 'feedback-good'}`;
    
    // Update the SVG icon based on feedback type
    const svgIcon = isWarning ? 
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>` : 
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>`;
    
    feedbackMessageElement.innerHTML = `${svgIcon}<span>${formFeedback}</span>`;
  }
  
  // Show workout complete message if target reached
  if (pushUps >= targetReps && !isWorkoutComplete) {
    workoutCompleteElement.style.display = 'block';
    isWorkoutComplete = true;
    
    // Send message to parent window if this is opened from another page
    try {
      window.opener.postMessage({ type: 'PUSHUP_COUNT', count: pushUps }, '*');
    } catch (e) {
      console.log("Could not send message to parent window");
    }
  }
}

// Reset workout
function resetWorkout() {
  pushUps = 0;
  currentPosition = "UP";
  formFeedback = "Get ready to start!";
  isWorkoutComplete = false;
  workoutCompleteElement.style.display = 'none';
  updateUI();
}

// Add event listener to restart button
if (restartButtonElement) {
  restartButtonElement.addEventListener('click', resetWorkout);
}

// The main pose detection function (adapted from the original)
const getPose = async () => {
  if (!Detector || !video) return;
  
  try {
    const poses = await Detector.estimatePoses(video);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the video frame on the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (!isLoaded) {
      const loadingText = document.querySelector(".loading-message");
      if (loadingText) {
        loadingText.remove();
      }
      isLoaded = true;
    }

    const drawPoint = (y, x, r, name) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = "#ff0000";
      ctx.fill();
      ctx.font = "12px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(name, x + 7, y + 2);
    };

    const drawSegment = (pair1, pair2, color, scale) => {
      ctx.beginPath();
      ctx.moveTo(pair1.x * scale, pair1.y * scale);
      ctx.lineTo(pair2.x * scale, pair2.y * scale);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.stroke();
    };

    if (poses.length) {
      const { keypoints } = poses[0];
      let i = 0;
      while (i != keypoints.length) {
        if (keypoints[i]['score'] < 0.3) {
          keypoints.splice(i, 1)
          i--;
        }
        i++;
      }
      
      // Draw keypoints
      keypoints.forEach(keypoint => {
        drawPoint(keypoint.y, keypoint.x, 5, keypoint.name);
      });
      
      try {
        let elbowPositions = keypoints.filter((k) => {
          return k.name === "left_elbow" || k.name === "right_elbow";
        });
        let leftShoulder = keypoints.filter((k) => {
          return k.name === "left_shoulder";
        });
        let rightShoulder = keypoints.filter((k) => {
          return k.name === "right_shoulder";
        });

        // Make sure we have all required keypoints
        if (elbowPositions.length === 2 && leftShoulder.length === 1 && rightShoulder.length === 1) {
          // Draw segment between left_elbow and right_elbow
          drawSegment(
            { x: elbowPositions[0].x, y: elbowPositions[0].y },
            { x: elbowPositions[1].x, y: elbowPositions[1].y },
            "red",
            1
          );

          let leftShoulderDistance = utils.getPointToLine(
            leftShoulder[0].x,
            leftShoulder[0].y,
            elbowPositions[0].x,
            elbowPositions[0].y,
            elbowPositions[1].x,
            elbowPositions[1].y
          );
          let rightShoulderDistance = utils.getPointToLine(
            rightShoulder[0].x,
            rightShoulder[0].y,
            elbowPositions[0].x,
            elbowPositions[0].y,
            elbowPositions[1].x,
            elbowPositions[1].y
          );

          // Display the distances for debugging
          ctx.font = "16px Arial";
          ctx.fillStyle = "white";
          ctx.fillText(`Distance: ${Math.round(leftShoulderDistance + rightShoulderDistance)}`, 10, 30);

          // Determine pushup position based on shoulder distances
          const prevPosition = currentPosition;
          
          if (leftShoulderDistance + rightShoulderDistance < 120) {
            currentPosition = "DOWN";
            
            // Draw indicator for DOWN position
            ctx.font = "24px Arial";
            ctx.fillStyle = "#f59e0b";
            ctx.fillText("DOWN", 10, 60);
          } else {
            if (currentPosition === "DOWN") {
              pushUps++;
              snd.currentTime = 0;
              snd.play().catch(e => console.log("Sound not available"));
            }
            
            currentPosition = "UP";
            
            // Draw indicator for UP position
            ctx.font = "24px Arial";
            ctx.fillStyle = "#10b981";
            ctx.fillText("UP", 10, 60);
          }
          
          // Provide form feedback
          if (Math.abs(leftShoulderDistance - rightShoulderDistance) > 30) {
            formFeedback = "Keep your shoulders level!";
          } else if (leftShoulderDistance + rightShoulderDistance > 200) {
            formFeedback = "Keep your elbows closer to your body!";
          } else {
            formFeedback = "Good form!";
          }
          
          // Update UI if position changed or rep count changed
          if (prevPosition !== currentPosition || pushUps >= targetReps) {
            updateUI();
          }
        }
      } catch (error) {
        console.log("Error analyzing pose:", error);
      }
    }
  } catch (error) {
    console.log("Error in pose detection:", error);
  }
  
  // Continue the loop
  requestAnimationFrame(getPose);
};

// Initialize camera and pose detection
navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then((stream) => {
    window.stream = stream;
    video.srcObject = stream;
    video.addEventListener("loadeddata", (event) => {
      // Initialize canvas size
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Load the pose detection model
      poseDetection
        .createDetector(poseDetection.SupportedModels.MoveNet)
        .then((detector) => {
          Detector = detector;
          requestAnimationFrame(getPose);
          
          // Initial UI update
          updateUI();
        })
        .catch(error => {
          console.error("Error creating detector:", error);
          const loadingText = document.querySelector(".loading-message");
          if (loadingText) {
            loadingText.textContent = "Error loading AI model. Please refresh the page.";
          }
        });
    });
  })
  .catch((error) => {
    console.error("Camera error:", error);
    const loadingText = document.querySelector(".loading-message");
    if (loadingText) {
      loadingText.textContent = "Camera access denied. Please allow camera access and refresh.";
    }
  });

// Add a tone sound file
fetch('a-tone.wav')
  .catch(error => {
    console.error("Could not load sound file:", error);
  });