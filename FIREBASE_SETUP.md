# Firebase Setup Guide for FitVision

## ✅ Completed
- [x] Firebase configuration added to `.env`
- [x] Firebase SDK installed
- [x] Authentication context created
- [x] Firestore service created

## 🔧 Required Firebase Console Setup

### 1. Enable Authentication
1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **fitvision-318e5**
3. Navigate to **Authentication** in the left sidebar
4. Click **Get started** if it's your first time
5. Go to **Sign-in method** tab
6. Enable the following providers:

#### Enable Google Authentication:
- Click on **Google**
- Toggle **Enable**
- Add your project support email
- Click **Save**

#### Enable Email/Password Authentication:
- Click on **Email/Password**
- Toggle **Enable** for the first option
- Click **Save**

### 2. Create Firestore Database
1. Navigate to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select your preferred location (choose closest to your users)
5. Click **Done**

### 3. Set Firestore Security Rules (Important!)
Replace the default rules with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own workouts
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid);
    }
    
    // Users can read/write their own stats
    match /userStats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Optional: Configure Analytics
- Analytics is already initialized in your project
- No additional setup needed unless you want custom events

## 🚀 Test Your Setup

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test Authentication:**
   - Try signing up with email/password
   - Try signing in with Google
   - Check if user appears in Firebase Authentication tab

3. **Test Data Storage:**
   - Complete a workout session
   - Check if data appears in Firestore Database

## 🔒 Security Considerations

1. **Environment Variables:** 
   - ✅ Firebase config is in `.env` (not committed to git)
   - The API key is safe to expose in frontend (it's not a secret)

2. **Firestore Rules:**
   - ✅ Users can only access their own data
   - ✅ Authentication required for all operations

3. **Production Setup:**
   - Consider enabling App Check for additional security
   - Set up proper backup rules
   - Monitor usage in Firebase console

## 📊 Data Structure

Your Firestore will have these collections:
- `users/` - User profiles and preferences
- `workouts/` - Individual workout sessions
- `userStats/` - Aggregated user statistics

## 🐛 Troubleshooting

**Common Issues:**
1. **"Firebase not initialized"** - Check `.env` file exists and variables are correct
2. **"Auth domain not authorized"** - Add your domain to Firebase Auth settings
3. **"Permission denied"** - Check Firestore security rules

**Need Help?**
- Check browser console for errors
- Verify Firebase project settings match `.env` file
- Ensure Firestore rules are correctly applied
