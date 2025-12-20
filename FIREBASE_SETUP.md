# Firebase Setup Guide for Request Buddy

This guide will help you set up Firebase for Request Buddy's authentication and data storage.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `request-buddy` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Enable the following providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", and configure:
     - Project support email: Your email
     - Click "Save"

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location closest to your users
5. Click **Done**

## Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon in left sidebar)
2. Scroll down to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register app with nickname: `request-buddy-web`
5. Copy the configuration object that looks like:

\`\`\`javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
\`\`\`

## Step 5: Update Application Configuration

1. Open `src/services/firebase.js` in your Request Buddy project
2. Replace the placeholder config with your actual Firebase config:

\`\`\`javascript
// Replace this configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
\`\`\`

## Step 6: Set Up Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write collections they own
    match /collections/{collectionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can read/write requests they own
    match /requests/{requestId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Users can read/write environments they own
    match /environments/{environmentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
\`\`\`

3. Click **Publish**

## Step 7: Configure Google Sign-In (Optional)

If you want to customize the Google Sign-In experience:

1. Go to **Authentication** → **Sign-in method**
2. Click on **Google** provider
3. Add authorized domains if needed (for production)
4. Customize the public-facing name and support email

## Step 8: Test the Setup

1. Start your Request Buddy application:
   \`\`\`bash
   npm start
   npm run electron-dev
   \`\`\`

2. Try creating an account with email/password
3. Try signing in with Google
4. Create a collection and request to test Firestore integration

## Firestore Data Structure

Your Firestore database will automatically create these collections:

### users
- Stores user profile information
- Document ID: Firebase Auth UID
- Fields: displayName, email, createdAt

### collections
- Stores API request collections
- Fields: name, description, userId, createdAt, updatedAt

### requests
- Stores individual API requests
- Fields: name, method, url, headers, params, body, auth, collectionId, userId, createdAt, updatedAt

### environments
- Stores environment variables (future feature)
- Fields: name, variables, userId, createdAt, updatedAt

## Production Considerations

### Security Rules Enhancement
For production, consider adding more granular security rules:

\`\`\`javascript
// Example: Add organization-based access
match /collections/{collectionId} {
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.userId || 
     request.auth.uid in resource.data.sharedWith);
}
\`\`\`

### Performance
- Add composite indexes for complex queries
- Monitor usage in Firebase Console
- Set up billing alerts

### Backup
- Enable automatic backups in Firestore settings
- Consider exporting data regularly

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Authentication settings

2. **"Missing or insufficient permissions"**
   - Check Firestore security rules
   - Ensure user is authenticated

3. **"Firebase: No Firebase App '[DEFAULT]' has been created"**
   - Verify firebase.js configuration is correct
   - Check if Firebase is initialized before use

### Debug Mode
Enable Firebase debug mode by adding to your environment:
\`\`\`bash
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
export FIRESTORE_EMULATOR_HOST="localhost:8080"
\`\`\`

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)