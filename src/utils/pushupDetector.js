// This file adapts the original pushup-counter-main code for use in React

// Global variables (similar to the original implementation)
let isLoaded = false;
let currentPosition = "UP";
let pushUps = 0;
let Detector = null;
let canvas = null;
let ctx = null;
let videoElement = null;
let onRepUpdate = null;
let onPositionChange = null;
let onFormFeedback = null;
let animationFrameId = null;
let isRunning = false;

// Utility functions from the original implementation
const utils = {
  createElement: (type, attributes) => {
    let element = document.createElement(type);
    for (var key in attributes) {
      if (key == "class") {
        element.classList.add.apply(element.classList, attributes[key]);
      } else {
        element[key] = attributes[key];
      }
    }
    return element;
  },
  getPointToLine: (shoulderX, shoulderY, elbow1X, elbow1Y, elbow2X, elbow2Y) => {
    var A = shoulderX - elbow1X;
    var B = shoulderY - elbow1Y;
    var C = elbow2X - elbow1X;
    var D = elbow2Y - elbow1Y;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;

    // in case of 0 length line
    if (len_sq != 0) {
      param = dot / len_sq;
    }

    var xx, yy;

    if (param < 0) {
      xx = elbow1X;
      yy = elbow1Y;
    } else if (param > 1) {
      xx = elbow2X;
      yy = elbow2Y;
    } else {
      xx = elbow1X + param * C;
      yy = elbow1Y + param * D;
    }

    var dx = shoulderX - xx;
    var dy = shoulderY - yy;
    return Math.sqrt(dx * dx + dy * dy);
  },
};

// The main pose detection function (adapted from the original)
const getPose = async () => {
  if (!isRunning || !Detector || !videoElement) return;
  
  try {
    const poses = await Detector.estimatePoses(videoElement);

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    if (!isLoaded) {
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
            if (onPositionChange && prevPosition !== currentPosition) {
              onPositionChange("DOWN");
            }
            
            // Draw indicator for DOWN position
            ctx.font = "24px Arial";
            ctx.fillStyle = "#ff0000";
            ctx.fillText("DOWN", 10, 60);
          } else {
            if (currentPosition === "DOWN") {
              pushUps++;
              if (onRepUpdate) {
                onRepUpdate(pushUps);
              }
              
              // Play sound (optional)
              try {
                const snd = new Audio("/a-tone.wav");
                snd.play().catch(e => console.log("Sound not available"));
              } catch (e) {
                console.log("Sound not available");
              }
            }
            
            currentPosition = "UP";
            if (onPositionChange && prevPosition !== currentPosition) {
              onPositionChange("UP");
            }
            
            // Draw indicator for UP position
            ctx.font = "24px Arial";
            ctx.fillStyle = "#00ff00";
            ctx.fillText("UP", 10, 60);
          }
          
          // Provide form feedback
          if (onFormFeedback) {
            if (Math.abs(leftShoulderDistance - rightShoulderDistance) > 30) {
              onFormFeedback("Keep your shoulders level!");
            } else if (leftShoulderDistance + rightShoulderDistance > 200) {
              onFormFeedback("Keep your elbows closer to your body!");
            } else {
              onFormFeedback("");
            }
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
  if (isRunning) {
    animationFrameId = requestAnimationFrame(getPose);
  }
};

// Initialize the pushup detector
export const initPushupDetector = async (video, repUpdateCallback, positionChangeCallback, formFeedbackCallback) => {
  // Reset state
  isLoaded = false;
  currentPosition = "UP";
  pushUps = 0;
  isRunning = false;
  
  // Store callbacks
  onRepUpdate = repUpdateCallback;
  onPositionChange = positionChangeCallback;
  onFormFeedback = formFeedbackCallback;
  
  // Store video element
  videoElement = video;
  
  // Create canvas
  canvas = utils.createElement("canvas", { id: "canvas" });
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '10';
  
  // Add canvas to video container
  video.parentNode.appendChild(canvas);
  
  // Get canvas context
  ctx = canvas.getContext("2d");
  
  try {
    // Import TensorFlow.js and pose-detection dynamically
    const poseDetection = await import('@tensorflow-models/pose-detection');
    
    // Create detector
    Detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet
    );
    
    console.log("Pose detector initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing pose detector:", error);
    return false;
  }
};

// Start the pushup detector
export const startPushupDetector = () => {
  if (Detector && videoElement && !isRunning) {
    isRunning = true;
    pushUps = 0;
    currentPosition = "UP";
    if (onRepUpdate) onRepUpdate(0);
    if (onPositionChange) onPositionChange("UP");
    if (onFormFeedback) onFormFeedback("");
    getPose();
  }
};

// Stop the pushup detector
export const stopPushupDetector = () => {
  isRunning = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

// Clean up resources
export const cleanupPushupDetector = () => {
  stopPushupDetector();
  if (canvas && canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
  canvas = null;
  ctx = null;
  videoElement = null;
  Detector = null;
  onRepUpdate = null;
  onPositionChange = null;
  onFormFeedback = null;
};