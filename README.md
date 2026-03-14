# Request Buddy - Complete Guide

> A modern, Postman-like API development and testing desktop application built with React, Electron, and Firebase.

**Version**: 1.0.0  
**Platform**: macOS (Intel & Apple Silicon), Windows, Linux  
**Tech Stack**: React 18, Electron 27, Firebase 10, Zustand, TailwindCSS

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Firebase Integration](#firebase-integration)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Data Flow](#data-flow)
7. [Setup & Installation](#setup--installation)
8. [Building](#building)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

Request Buddy is a desktop application for API development and testing, similar to Postman. It provides:

- **API Testing**: Send HTTP requests (GET, POST, PUT, PATCH, DELETE, etc.)
- **Collections**: Organize requests into collections and folders
- **Collaboration**: Multi-user workspaces with role-based access control
- **Environment Variables**: Manage variables across different environments
- **Import/Export**: Full Postman Collection v2.1 compatibility
- **Real-time Sync**: Changes sync across all team members instantly

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Desktop App                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │  Zustand     │  │   Axios      │      │
│  │  Components  │◄─┤   Stores     │  │  HTTP Client │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                                 │
│         └──────────────────┼─────────────────────┐          │
│                            │                     │          │
│                            ▼                     ▼          │
│                  ┌──────────────────┐  ┌──────────────┐    │
│                  │  Firebase Auth   │  │   Firebase   │    │
│                  │  (Google, Email) │  │  Firestore   │    │
│                  └──────────────────┘  └──────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  Firebase Cloud  │
                  │   (Backend)      │
                  └──────────────────┘
```

### Technology Stack

**Frontend**:
- **React 18**: UI framework
- **React Router**: Navigation
- **TailwindCSS**: Styling
- **Lucide React**: Icons
- **React Hot Toast**: Notifications

**State Management**:
- **Zustand**: Lightweight state management
- Stores: Auth, Workspace, Collection, Request, Environment, History, User

**Backend**:
- **Firebase Authentication**: User authentication
- **Cloud Firestore**: NoSQL database
- **Firebase Storage**: File storage (future use)

**Desktop**:
- **Electron 27**: Desktop app framework
- **Vite**: Build tool and dev server

**HTTP Client**:
- **Axios**: Making API requests

---

## Firebase Integration

### Firebase Configuration

**Location**: `src/services/firebase.js`

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyBIh1_3IjaxvAhQaAFulnkfWPVT7uIgZKM",
  authDomain: "teamapi-96507.firebaseapp.com",
  projectId: "teamapi-96507",
  storageBucket: "teamapi-96507.firebasestorage.app",
  messagingSenderId: "1083620222554",
  appId: "1:1083620222554:web:cb21991938b07b55ceda63",
  measurementId: "G-DSNJS0KD6J"
};
```

### Where Firebase Credentials Are Used

#### 1. Authentication (`src/stores/authStore.js`)

**Purpose**: User sign-in/sign-up

**Methods**:
- Email/Password authentication
- Google OAuth authentication
- User profile management

**Firebase Services Used**:
- `firebase/auth` - Authentication
- `firebase/firestore` - User profiles storage

**Data Flow**:
```
User Sign In → Firebase Auth → Create/Update User Profile → Store in Firestore
                                                           ↓
                                                    users/{uid}
```

**User Profile Structure**:
```javascript
users/{uid} {
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 2. Workspaces (`src/stores/workspaceStore.js`)

**Purpose**: Multi-user collaboration spaces

**Firebase Services Used**:
- `firebase/firestore` - Workspace data storage
- Real-time listeners for live updates

**Data Flow**:
```
Create Workspace → Firestore → Real-time Listener → Update UI
                      ↓
              workspaces/{workspaceId}
```

**Workspace Structure**:
```javascript
workspaces/{workspaceId} {
  name: string,
  ownerId: string,
  members: {
    [uid]: "admin" | "editor" | "viewer"
  },
  memberIds: [string],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. Collections (`src/stores/collectionStore.js`)

**Purpose**: Organize API requests

**Firebase Services Used**:
- `firebase/firestore` - Collections storage
- Real-time listeners

**Data Flow**:
```
Create Collection → Firestore → Real-time Listener → Update Sidebar
                       ↓
               collections/{collectionId}
```

**Collection Structure**:
```javascript
collections/{collectionId} {
  name: string,
  workspaceId: string,
  createdBy: string,
  createdAt: timestamp
}
```

#### 4. Folders (`src/stores/collectionStore.js`)

**Purpose**: Organize requests within collections

**Folder Structure**:
```javascript
folders/{folderId} {
  name: string,
  collectionId: string,
  parentFolderId: string | null,
  workspaceId: string,
  createdAt: timestamp
}
```

#### 5. Requests (`src/stores/requestStore.js`)

**Purpose**: Store API request configurations

**Request Structure**:
```javascript
requests/{requestId} {
  name: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | ...,
  url: string,
  headers: { [key]: value },
  params: { [key]: value },
  body: {
    type: "none" | "json" | "form-data" | "urlencoded",
    content: string | object
  },
  auth: {
    type: "none" | "bearer" | "basic",
    bearerToken: string,
    basic: { username, password }
  },
  collectionId: string,
  folderId: string | null,
  workspaceId: string,
  createdAt: timestamp
}
```

#### 6. Environments (`src/stores/environmentStore.js`)

**Purpose**: Manage environment variables

**Environment Structure**:
```javascript
environments/{environmentId} {
  name: string,
  variables: {
    [key]: value
  },
  userId: string,
  createdAt: timestamp
}
```

#### 7. History (`src/stores/historyStore.js`)

**Purpose**: Track request history

**History Structure**:
```javascript
history/{historyId} {
  requestId: string,
  workspaceId: string,
  method: string,
  url: string,
  status: number,
  time: number,
  timestamp: timestamp
}
```

#### 8. Workspace Invitations (`src/stores/workspaceInviteStore.js`)

**Purpose**: Invite users to workspaces

**Invitation Structure**:
```javascript
workspaceInvites/{inviteId} {
  workspaceId: string,
  workspaceName: string,
  email: string,
  role: "admin" | "editor" | "viewer",
  invitedBy: string,
  inviterEmail: string,
  status: "pending" | "accepted" | "declined" | "cancelled",
  createdAt: timestamp,
  expiresAt: timestamp
}
```

### Firebase Security Rules

**Location**: Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Workspaces
    match /workspaces/{workspaceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Collections, Folders, Requests
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Project Structure

```
Request-Buddy/
├── electron/                      # Electron main process
│   ├── main.js                   # Main process entry
│   ├── preload.js                # Preload script
│   └── services/                 # Electron services
│
├── src/                          # React application
│   ├── components/               # React components
│   │   ├── ai/                  # AI features (Coming Soon)
│   │   ├── collections/         # Collections sidebar
│   │   ├── environments/        # Environment management
│   │   ├── history/             # Request history
│   │   ├── request/             # Request editor
│   │   ├── response/            # Response viewer
│   │   ├── rightSidebar/        # cURL & Info tabs
│   │   ├── ui/                  # Reusable UI components
│   │   ├── user/                # User profile
│   │   └── workspace/           # Workspace management
│   │
│   ├── layouts/                 # Page layouts
│   │   └── SimpleDashboard.jsx # Main dashboard layout
│   │
│   ├── pages/                   # Route pages
│   │   ├── AuthPage.jsx        # Login/Signup
│   │   ├── DashboardPage.jsx   # Main dashboard
│   │   └── InviteAcceptPage.jsx # Accept invitations
│   │
│   ├── services/                # Firebase services
│   │   └── firebase.js         # Firebase configuration ⚠️
│   │
│   ├── stores/                  # Zustand state stores
│   │   ├── authStore.js        # Authentication state
│   │   ├── workspaceStore.js   # Workspace state
│   │   ├── collectionStore.js  # Collections state
│   │   ├── requestStore.js     # Requests state
│   │   ├── environmentStore.js # Environments state
│   │   ├── historyStore.js     # History state
│   │   ├── userStore.js        # User profiles cache
│   │   └── workspaceInviteStore.js # Invitations
│   │
│   ├── utils/                   # Utility functions
│   │   ├── requestRunner.js    # HTTP request execution
│   │   ├── resolveVariables.js # Environment variable resolution
│   │   ├── postmanImportExport.js # Postman compatibility
│   │   ├── migrateWorkspaceMembers.js # Data migration
│   │   └── test*.js            # Test utilities
│   │
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
│
├── release/                     # Build output
│   ├── Request Buddy-1.0.0-arm64.dmg  # Apple Silicon
│   └── Request Buddy-1.0.0-x64.dmg    # Intel Mac
│
├── package.json                 # Dependencies & scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # TailwindCSS configuration
└── electron-builder.yml        # Electron build config
```

---

## Core Features

### 1. Authentication Flow

```
┌─────────────┐
│  AuthPage   │
└──────┬──────┘
       │
       ├─► Email/Password Sign In
       │   └─► Firebase Auth → Create User Profile → Dashboard
       │
       └─► Google Sign In
           └─► Firebase Auth → Create User Profile → Dashboard
```

**Implementation**: `src/pages/AuthPage.jsx` + `src/stores/authStore.js`

### 2. Workspace System

```
User creates workspace
       │
       ▼
Firestore: workspaces/{id}
       │
       ├─► Owner: Full access
       ├─► Admin: Manage members, full CRUD
       ├─► Editor: Create/Edit/Delete requests
       └─► Viewer: Read-only access
```

**Implementation**: `src/stores/workspaceStore.js`

### 3. Collections & Requests

```
Collection
  ├─► Folder 1
  │   ├─► Request 1
  │   └─► Request 2
  ├─► Folder 2
  │   └─► Request 3
  └─► Request 4 (no folder)
```

**Implementation**: 
- `src/stores/collectionStore.js`
- `src/stores/requestStore.js`
- `src/components/collections/CollectionsSidebar.jsx`

### 4. Request Execution Flow

```
1. User enters request details
   ├─► Method: GET, POST, etc.
   ├─► URL: https://api.example.com/users
   ├─► Headers: { "Authorization": "Bearer {{token}}" }
   ├─► Body: { "name": "John" }
   └─► Auth: Bearer token

2. Resolve environment variables
   └─► {{token}} → actual_token_value

3. Validate URL
   └─► Check format, protocol

4. Send HTTP request (Axios)
   └─► Include headers, body, auth

5. Receive response
   ├─► Status: 200 OK
   ├─► Headers: { ... }
   ├─► Body: { "id": 1, "name": "John" }
   └─► Time: 245ms

6. Display in ResponseViewer
   ├─► Body tab: Formatted JSON
   ├─► Headers tab: Response headers
   ├─► Cookies tab: Set-Cookie headers
   └─► Meta tab: Status, time, size

7. Save to history
   └─► Firestore: history/{id}
```

**Implementation**:
- `src/utils/requestRunner.js` - HTTP execution
- `src/utils/resolveVariables.js` - Variable resolution
- `src/components/response/ResponseViewer.jsx` - Display

### 5. Environment Variables

```
Environment: Production
  ├─► base_url: https://api.production.com
  ├─► api_key: prod_key_123
  └─► timeout: 5000

Request URL: {{base_url}}/users?key={{api_key}}
            ↓
Resolved: https://api.production.com/users?key=prod_key_123
```

**Implementation**:
- `src/stores/environmentStore.js`
- `src/utils/resolveVariables.js`
- `src/components/environments/VariableHint.jsx`

### 6. Postman Import/Export

```
Import:
Postman JSON → Parse → Create Collections → Create Folders → Create Requests
                                                              ↓
                                                        Firestore

Export:
Firestore → Fetch Collections → Fetch Folders → Fetch Requests
                                                 ↓
                                          Postman JSON
```

**Implementation**: `src/utils/postmanImportExport.js`

### 7. Collaboration

```
User A invites User B
       │
       ▼
Create invitation in Firestore
       │
       ▼
User B receives email (manual)
       │
       ▼
User B accepts invitation
       │
       ▼
Add User B to workspace.members
       │
       ▼
Real-time sync → Both users see changes
```

**Implementation**:
- `src/stores/workspaceInviteStore.js`
- `src/components/workspace/MemberManagementModal.jsx`

---

## Data Flow

### Complete Request Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        User Action                            │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│              SimpleDashboard.jsx (Main Layout)                │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │ Collections    │  │ Request Editor │  │ Response       │ │
│  │ Sidebar        │  │                │  │ Viewer         │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Zustand Stores                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐              │
│  │ Request    │ │ Environment│ │ History    │              │
│  │ Store      │ │ Store      │ │ Store      │              │
│  └────────────┘ └────────────┘ └────────────┘              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                  Request Processing                           │
│  1. Get request data from store                               │
│  2. Get environment variables                                 │
│  3. Resolve {{variables}} in URL, headers, body              │
│  4. Validate URL format                                       │
│  5. Build Axios config                                        │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    HTTP Request (Axios)                       │
│  → Send to external API                                       │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Response Handling                          │
│  1. Receive response                                          │
│  2. Parse headers, body, cookies                              │
│  3. Calculate time, size                                      │
│  4. Update UI (ResponseViewer)                                │
│  5. Save to history (Firestore)                               │
└──────────────────────────────────────────────────────────────┘
```

### Firebase Real-time Sync

```
User A creates collection
       │
       ▼
Firestore: collections/{id}
       │
       ├─► Real-time listener (User A)
       │   └─► Update UI
       │
       └─► Real-time listener (User B)
           └─► Update UI

Both users see the new collection instantly!
```

---

## Setup & Installation

### Prerequisites

- Node.js 16+ and npm
- macOS, Windows, or Linux
- Firebase account (for backend)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Request-Buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (if using your own project)
   
   Edit `src/services/firebase.js`:
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.firebasestorage.app",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

4. **Set up Firestore Security Rules**
   
   Go to Firebase Console → Firestore Database → Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth.uid == userId;
       }
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

5. **Enable Authentication**
   
   Firebase Console → Authentication → Sign-in method:
   - Enable Email/Password
   - Enable Google

6. **Run development server**
   ```bash
   npm run dev
   ```
   
   Opens at: http://localhost:5173

7. **Run Electron app**
   ```bash
   npm run electron:dev
   ```

---

## Building

### Web Build

```bash
npm run build
```

Output: `dist/` directory

### Electron Build (macOS)

```bash
# Clean old builds
rm -rf dist release build out

# Build for macOS (both Intel and Apple Silicon)
npm run release
```

Output: `release/` directory
- `Request Buddy-1.0.0-arm64.dmg` (Apple Silicon)
- `Request Buddy-1.0.0-x64.dmg` (Intel)

### Electron Build (Windows)

```bash
npm run electron:build -- --win
```

### Electron Build (Linux)

```bash
npm run electron:build -- --linux
```

---

## Testing

### Manual Testing

1. **Authentication**
   - Sign up with email/password
   - Sign in with Google
   - Sign out

2. **Workspaces**
   - Create workspace
   - Invite members
   - Change member roles
   - Remove members

3. **Collections**
   - Create collection
   - Create folder
   - Create request
   - Drag & drop reorder

4. **Requests**
   - Send GET request
   - Send POST request with body
   - Add headers
   - Add query parameters
   - Use authentication

5. **Environment Variables**
   - Create environment
   - Add variables
   - Use in request URL
   - Switch environments

6. **Import/Export**
   - Import Postman collection
   - Export collection
   - Re-import exported file

### Browser Console Tests

Open DevTools (Cmd+Option+I) and run:

```javascript
// Test user profiles
await window.testUserProfiles()

// Test member management
await window.testMemberManagementModal()

// Test for duplicates
await window.testDuplicateMembers()

// Check workspace members
await window.migrateWorkspaceMembers(workspaceId)

// Test import/export
await window.testImportExportCycle(workspaceId)
```

---

## Troubleshooting

### Common Issues

#### 1. Blank Screen After Login

**Cause**: userStore initialization error (fixed in v1.0.0)

**Solution**: Clear browser cache and reload

#### 2. Duplicate Members in List

**Cause**: Email resolution bug (fixed in v1.0.0)

**Solution**: Update to latest version

#### 3. Environment Variables Not Resolving

**Cause**: Variables not resolved before sending request

**Solution**: Check variable names match exactly (case-sensitive)

#### 4. Import Shows Success But No Data

**Cause**: Workspace ID mismatch or batch write failure

**Solution**: 
- Check browser console for errors
- Verify workspace is selected
- Try importing again

#### 5. Can't Sign In

**Cause**: Firebase configuration or network issue

**Solution**:
- Check internet connection
- Verify Firebase config in `src/services/firebase.js`
- Check Firebase Console for authentication status

#### 6. Members Show user-xxx@example.com

**Cause**: User profile doesn't exist in Firestore

**Solution**: Have the user log out and log back in to create profile

### Debug Commands

```javascript
// Check current user
window.useAuthStore.getState().user

// Check current workspace
window.useWorkspaceStore.getState().currentWorkspace

// Check collections
window.useCollectionStore.getState().collections

// Check requests
window.useRequestStore.getState().requests

// Check environments
window.useEnvironmentStore.getState().environments
```

---

## Firebase Credentials Summary

### Where Credentials Are Stored

**File**: `src/services/firebase.js`

### What Each Credential Does

| Credential | Purpose |
|------------|---------|
| `apiKey` | Identifies your Firebase project to Google servers |
| `authDomain` | Domain for Firebase Authentication |
| `projectId` | Unique identifier for your Firebase project |
| `storageBucket` | Cloud Storage bucket URL |
| `messagingSenderId` | Cloud Messaging sender ID |
| `appId` | Unique identifier for your Firebase app |
| `measurementId` | Google Analytics measurement ID |

### Security Notes

⚠️ **Important**: These credentials are **client-side** and are meant to be public. Security is enforced by:

1. **Firestore Security Rules**: Control who can read/write data
2. **Authentication**: Users must be signed in
3. **Firebase App Check**: (Optional) Verify requests come from your app

### Changing Firebase Project

To use your own Firebase project:

1. Create project at https://console.firebase.google.com
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database
4. Copy configuration from Project Settings
5. Update `src/services/firebase.js`
6. Deploy security rules

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Check Firebase Console for backend issues
4. Run diagnostic commands

---

**Built with ❤️ using React, Electron, and Firebase**

**Version**: 1.0.0  
**Last Updated**: February 5, 2026
