// Import TensorFlow.js backend and pose-detection at the top level
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Global variable to store the model once loaded
let globalDetector = null;

// Function to preload the model
export async function preloadPoseDetector() {
  if (globalDetector) return globalDetector;
  
  try {
    // TensorFlow.js is automatically ready with the backend import
    console.log('TensorFlow.js is ready');
    
    // Create the detector with a simple configuration
    globalDetector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
    
    console.log('MoveNet model loaded successfully');
    return globalDetector;
  } catch (error) {
    console.error('Error loading pose detector:', error);
    throw error;
  }
}

// Main function to setup the pushup counter
export async function setupPushupCounter(videoElement, onRepComplete, onPositionChange, onFormFeedback) {
  // Create a canvas element for drawing
  const canvasElement = document.createElement('canvas');
  canvasElement.width = videoElement.videoWidth || 640;
  canvasElement.height = videoElement.videoHeight || 480;
  canvasElement.style.position = 'absolute';
  canvasElement.style.top = '0';
  canvasElement.style.left = '0';
  canvasElement.style.width = '100%';
  canvasElement.style.height = '100%';
  canvasElement.style.zIndex = '10';
  
  // Add the canvas as a sibling to the video element
  videoElement.parentNode.appendChild(canvasElement);
  
  const ctx = canvasElement.getContext('2d');
  
  // Try to use the global detector or create a new one
  let detector = globalDetector;
  if (!detector) {
    try {
      detector = await preloadPoseDetector();
    } catch (error) {
      console.error('Failed to load detector, using fallback mode');
    }
  }
  
  let isRunning = false;
  let requestId = null;
  let currentPosition = "UP";
  let pushUps = 0;
  let lastFrameTime = 0;
  let frameCount = 0;
  
  // Function to draw a point
  const drawPoint = (y, x, r, name) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff0000";
    ctx.fill();
    ctx.font = "12px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(name, x + 7, y + 2);
  };
  
  // Function to calculate distance between a point and a line
  const getPointToLine = (shoulderX, shoulderY, elbow1X, elbow1Y, elbow2X, elbow2Y) => {
    var A = shoulderX - elbow1X;
    var B = shoulderY - elbow1Y;
    var C = elbow2X - elbow1X;
    var D = elbow2Y - elbow1Y;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;

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
  };
  
  // Function to process each frame
  const processFrame = async () => {
    if (!isRunning) return;
    
    const now = performance.now();
    const elapsed = now - lastFrameTime;
    
    // Limit frame rate to avoid overloading the browser
    if (elapsed < 100) { // ~10fps is enough for pose detection
      requestId = requestAnimationFrame(processFrame);
      return;
    }
    
    lastFrameTime = now;
    frameCount++;
    
    // Update canvas dimensions if video size changed
    if (canvasElement.width !== videoElement.videoWidth || 
        canvasElement.height !== videoElement.videoHeight) {
      canvasElement.width = videoElement.videoWidth || 640;
      canvasElement.height = videoElement.videoHeight || 480;
    }
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Draw the video frame on the canvas
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    // If detector is available, try to detect poses
    if (detector) {
      try {
        // Only run pose detection every 3 frames to improve performance
        if (frameCount % 3 === 0) {
          // Detect poses
          const poses = await detector.estimatePoses(videoElement);
          
          if (poses.length > 0) {
            const pose = poses[0];
            let keypoints = pose.keypoints;
            
            // Filter keypoints with sufficient confidence (score > 0.3)
            const validKeypoints = keypoints.filter(kp => kp.score > 0.3);
            
            // Draw all keypoints
            validKeypoints.forEach(keypoint => {
              drawPoint(keypoint.y, keypoint.x, 5, keypoint.name);
            });
            
            // Find elbow positions
            const elbowPositions = validKeypoints.filter((k) => {
              return k.name === "left_elbow" || k.name === "right_elbow";
            });
            
            // Find shoulder positions
            const leftShoulder = validKeypoints.find(k => k.name === "left_shoulder");
            const rightShoulder = validKeypoints.find(k => k.name === "right_shoulder");
            
            // Make sure we have both elbows and shoulders
            if (elbowPositions.length === 2 && leftShoulder && rightShoulder) {
              // Draw line between elbows
              ctx.beginPath();
              ctx.moveTo(elbowPositions[0].x, elbowPositions[0].y);
              ctx.lineTo(elbowPositions[1].x, elbowPositions[1].y);
              ctx.lineWidth = 3;
              ctx.strokeStyle = "red";
              ctx.stroke();
              
              // Calculate shoulder distances to elbow line
              const leftShoulderDistance = getPointToLine(
                leftShoulder.x,
                leftShoulder.y,
                elbowPositions[0].x,
                elbowPositions[0].y,
                elbowPositions[1].x,
                elbowPositions[1].y
              );
              
              const rightShoulderDistance = getPointToLine(
                rightShoulder.x,
                rightShoulder.y,
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
              if (leftShoulderDistance + rightShoulderDistance < 120) {
                if (currentPosition !== "DOWN") {
                  currentPosition = "DOWN";
                  onPositionChange("DOWN");
                  
                  // Draw indicator for DOWN position
                  ctx.font = "24px Arial";
                  ctx.fillStyle = "#ff0000";
                  ctx.fillText("DOWN", 10, 60);
                }
              } else {
                if (currentPosition === "DOWN") {
                  // Count a pushup when transitioning from DOWN to UP
                  pushUps++;
                  onRepComplete(pushUps);
                }
                
                currentPosition = "UP";
                onPositionChange("UP");
                
                // Draw indicator for UP position
                ctx.font = "24px Arial";
                ctx.fillStyle = "#00ff00";
                ctx.fillText("UP", 10, 60);
              }
              
              // Provide form feedback
              if (Math.abs(leftShoulderDistance - rightShoulderDistance) > 30) {
                onFormFeedback("Keep your shoulders level!");
              } else {
                onFormFeedback("");
              }
            }
          }
        } else {
          // On frames where we don't run detection, just show the current state
          ctx.font = "24px Arial";
          ctx.fillStyle = currentPosition === "DOWN" ? "#ff0000" : "#00ff00";
          ctx.fillText(currentPosition, 10, 60);
        }
      } catch (error) {
        console.error("Error in pose detection:", error);
        // Show error message but continue running
        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.fillText("Detection error - retrying", 10, 30);
      }
    } else {
      // If detector is not available, show a message
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";
      ctx.fillText("AI model loading...", 10, 30);
      
      // Try to load the detector again if it's been more than 5 seconds
      if (frameCount % 50 === 0) {
        try {
          detector = await preloadPoseDetector();
        } catch (error) {
          // Ignore errors, we'll try again later
        }
      }
    }
    
    // Continue the detection loop
    if (isRunning) {
      requestId = requestAnimationFrame(processFrame);
    }
  };
  
  // Start the pushup counter
  const start = () => {
    if (!isRunning) {
      isRunning = true;
      lastFrameTime = performance.now();
      frameCount = 0;
      processFrame();
    }
  };
  
  // Stop the pushup counter
  const stop = () => {
    isRunning = false;
    if (requestId) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }
  };
  
  // Reset the pushup counter
  const reset = () => {
    pushUps = 0;
    currentPosition = "UP";
    onRepComplete(0);
    onPositionChange("UP");
  };
  
  // Clean up resources
  const cleanup = () => {
    stop();
    if (canvasElement && canvasElement.parentNode) {
      canvasElement.parentNode.removeChild(canvasElement);
    }
  };
  
  return {
    start,
    stop,
    reset,
    cleanup
  };
}