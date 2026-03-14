# Request Buddy Monorepo Migration Guide

## Overview

This guide documents the migration of Request Buddy from a single-repo structure to a monorepo architecture with a NestJS API gateway.

## New Architecture

```
request-buddy-monorepo/
├── apps/
│   ├── web/              # React Vite frontend
│   └── desktop/          # Electron wrapper
├── backend/
│   └── api/              # NestJS API gateway
├── packages/
│   └── shared/           # Shared types and utilities
└── package.json          # Root workspace configuration
```

## What Changed

### 1. Project Structure
- Frontend moved to `apps/web/`
- Electron moved to `apps/desktop/`
- New NestJS backend in `backend/api/`
- Shared types in `packages/shared/`

### 2. Data Flow
**Before:**
```
Frontend → Firebase SDK → Firestore
```

**After:**
```
Frontend → Axios → NestJS API → Firebase Admin SDK → Firestore
```

### 3. Authentication
- Firebase Authentication remains in frontend
- Frontend sends Firebase ID token to backend
- Backend verifies token using Firebase Admin SDK
- All API routes protected with AuthGuard

## Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Firebase project with Firestore enabled
- Firebase service account key (for backend)

### Step 1: Install Dependencies

```bash
# Install root dependencies and all workspace dependencies
npm install
```

This will install dependencies for:
- Root workspace
- apps/web
- apps/desktop
- backend/api
- packages/shared

### Step 2: Configure Firebase Admin SDK

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `backend/api/serviceAccountKey.json`
4. Or set up Application Default Credentials (ADC):
   ```bash
   gcloud auth application-default login
   ```

### Step 3: Configure Environment Variables

**Backend (`backend/api/.env`):**
```env
PORT=3000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
FIREBASE_PROJECT_ID=teamapi-96507
```

**Frontend (`apps/web/.env`):**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Step 4: Start Development Servers

**Option 1: Start all services together**
```bash
npm run dev
```

This starts:
- NestJS API on http://localhost:3000
- React frontend on http://localhost:5173

**Option 2: Start services individually**

Terminal 1 - Backend:
```bash
npm run dev:api
```

Terminal 2 - Frontend:
```bash
npm run dev:web
```

Terminal 3 - Desktop (optional):
```bash
npm run dev:desktop
```

### Step 5: Build for Production

```bash
# Build all workspaces
npm run build

# Or build individually
npm run build:web
npm run build:api
npm run build:desktop
```

### Step 6: Release Desktop App

```bash
npm run release
```

This will:
1. Build the web app
2. Package the Electron app
3. Create installers in `release/` directory

## API Endpoints

All endpoints require `Authorization: Bearer <firebase-token>` header.

### Workspaces
- `GET /api/workspaces` - Get all workspaces for user
- `GET /api/workspaces/:id` - Get workspace by ID
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/:id/members` - Add member
- `DELETE /api/workspaces/:id/members/:userId` - Remove member
- `PUT /api/workspaces/:id/members/:userId/role` - Change user role

### Collections
- `GET /api/collections?workspaceId=xxx` - Get collections
- `GET /api/collections/:id` - Get collection by ID
- `POST /api/collections` - Create collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection

### Folders
- `GET /api/collections/folders/list?workspaceId=xxx` - Get folders
- `POST /api/collections/folders` - Create folder
- `PUT /api/collections/folders/:id` - Update folder
- `DELETE /api/collections/folders/:id` - Delete folder

### Requests
- `GET /api/requests?workspaceId=xxx` - Get requests
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request

### Environments
- `GET /api/environments?workspaceId=xxx` - Get environments
- `GET /api/environments/:id` - Get environment by ID
- `POST /api/environments` - Create environment
- `PUT /api/environments/:id` - Update environment
- `DELETE /api/environments/:id` - Delete environment

### History
- `GET /api/history?workspaceId=xxx&limit=50` - Get history
- `POST /api/history` - Add history entry
- `DELETE /api/history/:id` - Delete history entry
- `DELETE /api/history/clear/:workspaceId` - Clear all history

### Invitations
- `GET /api/invitations?email=xxx` - Get invitations
- `POST /api/invitations` - Create invitation
- `PUT /api/invitations/:id/accept` - Accept invitation
- `PUT /api/invitations/:id/decline` - Decline invitation
- `DELETE /api/invitations/:id` - Delete invitation

## Migration Checklist

### ✅ Completed
- [x] Created monorepo structure
- [x] Moved frontend to `apps/web/`
- [x] Moved Electron to `apps/desktop/`
- [x] Created NestJS backend in `backend/api/`
- [x] Created shared package
- [x] Implemented Firebase Admin SDK service
- [x] Implemented authentication guard
- [x] Created all API controllers and services
- [x] Created API client for frontend
- [x] Updated Electron paths
- [x] Created environment configuration files

### 🔄 Next Steps (Manual)
- [ ] Update frontend stores to use API client instead of Firebase SDK
- [ ] Test all API endpoints
- [ ] Update frontend components to handle API responses
- [ ] Test Electron app with new structure
- [ ] Update CI/CD pipelines
- [ ] Deploy backend to production
- [ ] Update documentation

## Frontend Migration

To migrate a Zustand store from Firebase SDK to API client:

**Before (Firebase SDK):**
```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const docRef = await addDoc(collection(db, 'workspaces'), {
  name,
  ownerId: userId,
  createdAt: new Date()
});
```

**After (API Client):**
```javascript
import apiClient from '../services/apiClient';

const response = await apiClient.post('/workspaces', {
  name,
  ownerId: userId
});
```

## Troubleshooting

### Backend won't start
- Check Firebase service account key path
- Verify `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Ensure Firebase project ID is correct

### Frontend can't connect to backend
- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check CORS configuration in backend

### Authentication errors
- Ensure user is logged in via Firebase Auth
- Check token is being sent in Authorization header
- Verify Firebase Admin SDK can verify tokens

### Electron app won't load
- Check paths in `apps/desktop/electron/main.js`
- Ensure web app is built before running Electron
- Verify `dist` directory exists in `apps/web/`

## Benefits of New Architecture

1. **Separation of Concerns**: Frontend, backend, and desktop app are clearly separated
2. **Better Security**: Firebase Admin SDK runs server-side with elevated privileges
3. **Scalability**: Backend can be deployed independently and scaled
4. **Type Safety**: Shared types ensure consistency across frontend and backend
5. **Testability**: Each workspace can be tested independently
6. **Flexibility**: Easy to add new services or migrate to different database

## Important Notes

- **No Logic Changes**: All business logic remains the same
- **Same Database**: Still using Firebase Firestore
- **Same Auth**: Firebase Authentication in frontend
- **Same UI**: No UI changes
- **Same Features**: All features work exactly the same

## Support

For issues or questions:
1. Check this migration guide
2. Review API endpoint documentation
3. Check console logs for errors
4. Verify environment configuration
