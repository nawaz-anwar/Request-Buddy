# 🏗️ Request Buddy - Architecture

## 📐 System Overview

Request Buddy is a modern API development tool built with React, Firebase, and Electron.

```
┌─────────────────────────────────────────────────────────┐
│                    Desktop App (Electron)                │
│  ┌───────────────────────────────────────────────────┐  │
│  │           React Frontend (Vite)                   │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  UI Components (React + Tailwind CSS)       │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  State Management (Zustand)                 │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Firebase Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Authentication│  │  Firestore   │  │  Functions   │  │
│  │   (Auth)     │  │  (Database)  │  │  (Backend)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              External Services                           │
│  ┌──────────────┐  ┌──────────────┐                     │
│  │   SendGrid   │  │ Google OAuth │                     │
│  │   (Email)    │  │    (Auth)    │                     │
│  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Architecture

### Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Routing:** React Router v6
- **UI Components:** Custom components + Lucide icons
- **Notifications:** React Hot Toast

### Project Structure
```
src/
├── components/          # React components
│   ├── ai/             # AI features
│   ├── collections/    # Collection management
│   ├── environments/   # Environment management
│   ├── history/        # Request history
│   ├── layout/         # Layout components
│   ├── request/        # Request editor
│   ├── response/       # Response viewer
│   ├── rightSidebar/   # Tools sidebar
│   ├── ui/             # Reusable UI components
│   ├── user/           # User profile
│   └── workspace/      # Workspace management
├── contexts/           # React contexts
├── layouts/            # Page layouts
├── pages/              # Page components
├── services/           # External services
│   ├── firebase.js     # Firebase config
│   └── storageService.js
├── stores/             # Zustand stores
│   ├── authStore.js
│   ├── collectionStore.js
│   ├── environmentStore.js
│   ├── historyStore.js
│   ├── requestStore.js
│   ├── themeStore.js
│   ├── userStore.js
│   ├── workspaceStore.js
│   └── workspaceInviteStore.js
├── templates/          # Email templates
├── utils/              # Utility functions
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

---

## 🗄️ Backend Architecture

### Firebase Services

#### 1. Authentication
- **Provider:** Firebase Auth
- **Methods:** Email/Password, Google OAuth
- **Features:** Session management, user profiles

#### 2. Firestore Database
```
Collections:
├── users/
│   └── {userId}
│       ├── email
│       ├── displayName
│       ├── photoURL
│       └── workspaces[]
├── workspaces/
│   └── {workspaceId}
│       ├── name
│       ├── ownerId
│       ├── members{}
│       ├── memberIds[]
│       └── createdAt
├── collections/
│   └── {collectionId}
│       ├── name
│       ├── workspaceId
│       ├── requests[]
│       └── folders[]
├── environments/
│   └── {environmentId}
│       ├── name
│       ├── workspaceId
│       └── variables{}
├── history/
│   └── {historyId}
│       ├── userId
│       ├── workspaceId
│       ├── request{}
│       └── timestamp
└── workspaceInvites/
    └── {inviteId}
        ├── workspaceId
        ├── email
        ├── role
        ├── status
        └── createdAt
```

#### 3. Cloud Functions
```javascript
functions/
└── index.js
    └── sendWorkspaceInvitation()
        ├── Validates parameters
        ├── Sends email via SendGrid
        └── Returns success/failure
```

---

## 🔄 Data Flow

### Request Execution Flow
```
1. User creates request in UI
   ↓
2. Request stored in Zustand store
   ↓
3. User clicks "Send"
   ↓
4. Request executed via Axios
   ↓
5. Response received
   ↓
6. Response displayed in UI
   ↓
7. Request saved to history (Firestore)
```

### Workspace Invitation Flow
```
1. Admin invites user
   ↓
2. Invitation saved to Firestore
   ↓
3. Cloud Function triggered
   ↓
4. SendGrid sends email
   ↓
5. User receives email
   ↓
6. User clicks "Accept"
   ↓
7. User added to workspace
   ↓
8. Real-time sync updates UI
```

### Real-time Sync Flow
```
1. User makes change (create/update/delete)
   ↓
2. Change saved to Firestore
   ↓
3. Firestore triggers onSnapshot listener
   ↓
4. All connected clients receive update
   ↓
5. UI updates automatically
```

---

## 🔐 Security Architecture

### Authentication Flow
```
1. User enters credentials
   ↓
2. Firebase Auth validates
   ↓
3. JWT token generated
   ↓
4. Token stored in session
   ↓
5. Token sent with each request
   ↓
6. Firestore validates token
   ↓
7. Access granted/denied
```

### Firestore Security Rules
```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}

// Workspace members can read/write workspace data
match /workspaces/{workspaceId} {
  allow read: if request.auth.uid in resource.data.memberIds;
  allow write: if request.auth.uid == resource.data.ownerId;
}

// Only workspace members can access collections
match /collections/{collectionId} {
  allow read, write: if request.auth.uid in 
    get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.memberIds;
}
```

---

## 🖥️ Desktop App Architecture

### Electron Structure
```
electron/
├── main.js              # Main process
├── preload.js           # Preload script
└── services/
    └── geminiService.js # AI service
```

### Process Communication
```
Main Process (Node.js)
    ↕ IPC
Renderer Process (React)
```

---

## 📦 State Management

### Zustand Stores

#### authStore
- User authentication state
- Login/logout functions
- Session management

#### workspaceStore
- Current workspace
- Workspace list
- Workspace operations

#### collectionStore
- Collections and folders
- Request management
- CRUD operations

#### environmentStore
- Environment variables
- Active environment
- Variable resolution

#### requestStore
- Current request state
- Request configuration
- Response data

#### historyStore
- Request history
- Search and filter
- History operations

#### workspaceInviteStore
- Pending invitations
- Sent invitations
- Accept/decline operations

---

## 🔌 API Integration

### HTTP Client
- **Library:** Axios
- **Features:** Interceptors, timeout, error handling
- **Configuration:** Dynamic headers, auth, params

### Request Pipeline
```
1. User configures request
   ↓
2. Environment variables resolved
   ↓
3. Headers and auth applied
   ↓
4. Request sent via Axios
   ↓
5. Response intercepted
   ↓
6. Response formatted
   ↓
7. Response displayed
```

---

## 🎨 UI Architecture

### Component Hierarchy
```
App
├── ErrorBoundary
├── Router
│   ├── AuthPage
│   │   ├── Login
│   │   └── Register
│   └── DashboardPage
│       └── SimpleDashboard
│           ├── Header
│           ├── Sidebar
│           │   ├── CollectionsSidebar
│           │   └── HistorySidebar
│           ├── RequestEditor
│           │   ├── RequestTabs
│           │   ├── ParamsTab
│           │   ├── HeadersTab
│           │   ├── BodyTab
│           │   └── AuthTab
│           ├── ResponseViewer
│           └── RightSidebar
│               ├── RequestInfo
│               ├── CodeSnippetGenerator
│               └── CopyTools
└── ThemeProvider
```

---

## 🚀 Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Memoization with React.memo()
- Virtual scrolling for large lists
- Debounced search and filters
- Optimized re-renders with Zustand

### Backend
- Firestore indexes for fast queries
- Pagination for large datasets
- Real-time listeners with cleanup
- Cached data where appropriate

### Build
- Vite for fast builds
- Tree shaking
- Minification
- Asset optimization

---

## 🔄 Deployment Architecture

### Development
```
Local Machine
├── npm run dev (Vite dev server)
└── firebase emulators:start (Local Firebase)
```

### Production
```
Firebase Hosting
├── Static assets (HTML, CSS, JS)
└── SPA routing

Firebase Cloud Functions
└── sendWorkspaceInvitation

Firestore Database
└── Production data

Firebase Authentication
└── User management
```

---

## 📊 Monitoring & Logging

### Frontend
- Console logging (development)
- Error boundaries
- Toast notifications

### Backend
- Firebase Functions logs
- Firestore audit logs
- SendGrid activity feed

---

## 🔮 Future Architecture

### Planned Improvements
- GraphQL API layer
- Redis caching
- WebSocket for real-time updates
- Microservices architecture
- Kubernetes deployment
- CDN for static assets
- Advanced monitoring (Sentry, LogRocket)
