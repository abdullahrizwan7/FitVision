# FIT-Vision Development Guide

## Quick Commands

### Development
```bash
npm run dev          # Start development server on http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Testing & Quality
```bash
npm run test         # Run unit tests (when available)
npm run typecheck    # TypeScript type checking
```

## Project Structure

### Key Directories
- `src/components/` - Reusable UI components
- `src/pages/` - Main application pages
- `src/utils/` - AI detection and utility functions
- `src/types/` - TypeScript type definitions

### Core Components
- `WorkoutSelector.tsx` - Exercise selection interface
- `WorkoutCamera.tsx` - Main camera/pose detection view
- `RepCounter.tsx` - Real-time rep counting display
- `PostureAlert.tsx` - Form feedback system
- `SummaryPage.tsx` - Workout completion summary

### AI/ML Files
- `workoutDetectors.ts` - Main pose detection logic
- `poseUtils.ts` - Pose analysis utilities
- `pose.ts` - TypeScript type definitions

## Technical Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation

### AI/ML
- TensorFlow.js with WebGL backend
- MediaPipe Pose detection
- MoveNet model for real-time inference

### Build Tools
- Vite for fast development and building
- ESLint for code quality
- PostCSS for CSS processing

## Development Workflow

### Adding New Workouts
1. Create detector class in `workoutDetectors.ts`
2. Add workout configuration in `WorkoutSelector.tsx`
3. Update factory function `createWorkoutDetector()`
4. Test with camera input

### Code Style
- Use TypeScript for all new files
- Follow existing component patterns
- Use Tailwind for styling
- Add proper type definitions

### Performance Notes
- Pose detection runs at ~15fps for optimal performance
- Frame rate is limited to prevent browser overload
- Models are cached for faster subsequent loads
- Canvas operations are optimized for smooth rendering

## Deployment

### Environment Requirements
- Node.js 18+
- Modern browser with camera access
- HTTPS required for camera permissions in production

### Build Process
1. `npm run build` creates optimized production bundle
2. Output in `dist/` directory
3. Static files can be served from any CDN/hosting

### Known Issues
- Camera permissions required on first use
- WebGL backend needed for TensorFlow.js
- Some mobile browsers may have performance limitations

## Camera Setup
- User should be 3-6 feet from camera
- Good lighting required for accurate detection
- 720p minimum resolution recommended
- Full body should be visible for best results
