# FIT-Vision 🏋️‍♂️

**AI-Powered Fitness Web App with Real-Time Pose Detection**

FIT-Vision is a cutting-edge fitness application that uses **MediaPipe Pose** and **TensorFlow.js** to provide real-time pose detection, form correction, and rep counting for various exercises. Built with **React**, **TypeScript**, and **Tailwind CSS** for a modern, responsive experience.

![FIT-Vision Demo](https://img.shields.io/badge/Status-Ready%20to%20Use-green?style=for-the-badge)

## ✨ Features

### 🔍 AI-Powered Pose Detection
- **Real-time pose tracking** using MediaPipe with 33+ body keypoints
- **Skeleton overlay visualization** for perfect form analysis
- **Smart joint angle calculations** for accurate movement detection

### 🏋️‍♂️ Supported Workouts
- **Push-ups** - Upper body strength with form correction
- **Squats** - Lower body tracking with depth analysis
- **Planks** - Core stability with posture monitoring
- **Jumping Jacks** - Cardio with arm/leg synchronization

### 📊 Smart Analytics
- **Automatic rep counting** using AI movement detection
- **Real-time form feedback** with posture alerts
- **Performance tracking** with accuracy scoring
- **Calorie estimation** based on workout intensity

### 🎨 Modern UI/UX
- **Responsive design** for all devices (mobile, tablet, desktop)
- **Dark/Light mode** toggle with system preference detection
- **Smooth animations** using Framer Motion
- **Professional gradient backgrounds** and glassmorphism effects

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with camera access

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fit-vision.git
   cd fit-vision
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

5. **Allow camera permissions** when prompted

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for styling and responsiveness  
- **Framer Motion** for smooth animations
- **React Router** for navigation
- **Lucide React** for modern icons

### AI/ML Stack
- **TensorFlow.js** for client-side ML processing
- **MediaPipe Pose** for accurate pose detection
- **MoveNet** model for real-time inference
- **WebGL backend** for optimized performance

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── Navbar.tsx       # Navigation with theme toggle
│   ├── WorkoutSelector.tsx # Exercise selection interface
│   ├── WorkoutCamera.tsx   # Main camera/detection view
│   ├── RepCounter.tsx      # Real-time rep counter
│   ├── PostureAlert.tsx    # Form feedback alerts
│   └── SummaryPage.tsx     # Workout completion summary
├── pages/               # Main application pages
│   ├── Home.tsx         # Landing page
│   ├── WorkoutSession.tsx # Main workout interface
│   └── Dashboard.tsx    # User analytics (optional)
├── utils/               # Core functionality
│   ├── workoutDetectors.ts # AI detection logic
│   ├── poseUtils.ts        # Pose analysis utilities
│   └── pushupCounter.js    # Legacy pushup detection
├── types/               # TypeScript definitions
│   └── pose.ts          # Workout and pose types
└── main.tsx            # Application entry point
```

## 🎯 How It Works

### 1. **Camera Setup**
- Access user's webcam using `navigator.mediaDevices.getUserMedia()`
- Create canvas overlay for pose visualization
- Initialize MediaPipe pose detection model

### 2. **AI Analysis**
- **Frame-by-frame processing** at ~15fps for optimal performance
- **Keypoint detection** for 33 body landmarks
- **Joint angle calculations** for form analysis
- **Movement pattern recognition** for rep counting

### 3. **Real-Time Feedback**
- **Position tracking** (UP/DOWN states for exercises)
- **Form alerts** for posture correction
- **Rep counting** with audio/visual feedback
- **Performance metrics** (accuracy, calories, time)

### 4. **Workout Types**

#### Push-ups Detection
```typescript
// Tracks shoulder distance to elbow line
const distance = getPointToLineDistance(shoulder, leftElbow, rightElbow);
if (distance < threshold) {
  position = "DOWN"; // Rep in progress
} else {
  position = "UP";   // Rep completed
}
```

#### Squats Detection
```typescript
// Analyzes knee angles for depth
const kneeAngle = calculateAngle(hip, knee, ankle);
if (kneeAngle < 120) {
  position = "DOWN"; // Proper squat depth
}
```

#### Plank Detection
```typescript
// Monitors body alignment
const bodyAngle = Math.abs(shoulder.y - hip.y);
if (bodyAngle < 40) {
  position = "HOLD"; // Good plank form
}
```

## 🎛️ Configuration

### Workout Customization
- **Rep targets**: 5-50 reps per exercise
- **Time targets**: 15-120 seconds for planks
- **Difficulty levels**: Beginner, Intermediate, Advanced
- **Form sensitivity**: Adjustable thresholds

### Performance Optimization
- **Frame rate limiting** to prevent overload
- **Model caching** for faster subsequent loads
- **Efficient rendering** with canvas operations
- **Memory management** for long sessions

## 📱 Device Compatibility

### Desktop
- **Chrome 90+** (recommended)
- **Firefox 88+**
- **Safari 14+**
- **Edge 90+**

### Mobile
- **iOS Safari 14+**
- **Chrome Mobile 90+**
- **Samsung Internet 14+**

### Camera Requirements
- **Resolution**: 720p minimum (1080p recommended)
- **Frame rate**: 15fps minimum
- **Positioning**: User should be 3-6 feet from camera
- **Lighting**: Good lighting for accurate detection

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style
- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Conventional commits** for git history
- **Component-based architecture**

### Testing
```bash
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Adding New Exercises

1. **Create detector class** in `src/utils/workoutDetectors.ts`:
```typescript
export class NewExerciseDetector extends BaseWorkoutDetector {
  protected detectMovement(keypoints: Keypoint[]): void {
    // Implement exercise-specific logic
  }
}
```

2. **Add workout configuration** in `WorkoutSelector.tsx`
3. **Update factory function** in `createWorkoutDetector()`
4. **Test thoroughly** with various body types and positions

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MediaPipe** team at Google for pose detection technology
- **TensorFlow.js** for making ML accessible in browsers
- **React** community for amazing tools and ecosystem
- **Tailwind CSS** for utility-first styling approach

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/fit-vision/issues)
- **Documentation**: [Wiki](https://github.com/your-username/fit-vision/wiki)
- **Email**: support@fit-vision.app

---

**Built with ❤️ and AI by the FIT-Vision Team**

*Transform your fitness journey with intelligent pose detection!* 💪🤖
