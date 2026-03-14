# Next Steps - Complete the Migration

This guide walks you through completing the monorepo migration step by step.

## Overview

The monorepo structure is complete. Now we need to:
1. Install dependencies
2. Configure the backend
3. Update frontend stores
4. Test everything
5. Clean up

Estimated time: 2-4 hours

---

## Step 1: Install Dependencies (5 minutes)

```bash
# From the root directory
npm install
```

This will install dependencies for:
- Root workspace
- apps/web
- apps/desktop
- backend/api
- packages/shared

**Verify**:
```bash
# Check that node_modules exists in each workspace
ls apps/web/node_modules
ls apps/desktop/node_modules
ls backend/api/node_modules
```

---

## Step 2: Configure Firebase Admin SDK (10 minutes)

### Option A: Service Account Key (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `teamapi-96507`
3. Go to: Project Settings → Service Accounts
4. Click: "Generate New Private Key"
5. Save the JSON file as: `backend/api/serviceAccountKey.json`

### Option B: Application Default Credentials

```bash
gcloud auth application-default login
```

### Create Backend .env File

```bash
cd backend/api
cp .env.example .env
```

Edit `backend/api/.env`:
```env
PORT=3000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
FIREBASE_PROJECT_ID=teamapi-96507
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Step 3: Configure Frontend (5 minutes)

```bash
cd apps/web
cp .env.example .env
```

Edit `apps/web/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## Step 4: Test Backend (10 minutes)

### Start Backend

```bash
# From root directory
npm run dev:api
```

**Expected Output**:
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] FirebaseModule dependencies initialized
✅ Firebase Admin SDK initialized
[Nest] INFO [NestApplication] Nest application successfully started
🚀 Request Buddy API Gateway running on: http://localhost:3000/api
```

### Test Health Check

Open another terminal:

```bash
# Test that API is running
curl http://localhost:3000/api/workspaces
```

**Expected**: `401 Unauthorized` (because no auth token)

This is correct! It means the API is running and auth guard is working.

---

## Step 5: Test Frontend (Without API Integration) (5 minutes)

```bash
# From root directory
npm run dev:web
```

Open browser: http://localhost:5173

**Test**:
1. Sign in with Google or email
2. Create a workspace
3. Create a collection
4. Create a request

**Expected**: Everything should work as before (using Firebase SDK directly)

---

## Step 6: Update Frontend Stores (60-90 minutes)

Now we'll update each store to use the API instead of Firebase SDK.

### 6.1: Update workspaceStore.js

**File**: `apps/web/src/stores/workspaceStore.js`

**Changes Needed**:

1. Import API client:
```javascript
import apiClient from '../services/apiClient';
```

2. Replace Firebase calls with API calls:

**Before**:
```javascript
const docRef = await addDoc(collection(db, 'workspaces'), {
  name,
  ownerId: userId,
  createdAt: new Date(),
  members: { [userId]: 'admin' },
  memberIds: [userId]
});
```

**After**:
```javascript
const response = await apiClient.post('/workspaces', {
  name
});
```

3. Update subscribeToWorkspaces:

**Before**: Uses `onSnapshot` from Firestore
**After**: Use polling or WebSocket (for now, fetch on mount)

```javascript
subscribeToWorkspaces: async (userId) => {
  try {
    const workspaces = await apiClient.get('/workspaces');
    set({ workspaces });
    
    if (!get().currentWorkspace && workspaces.length > 0) {
      set({ currentWorkspace: workspaces[0] });
    }
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
  }
}
```

**Note**: Real-time updates will need to be implemented separately (polling, WebSocket, or Server-Sent Events)

### 6.2: Update collectionStore.js

**File**: `apps/web/src/stores/collectionStore.js`

**Changes**:

```javascript
// Get collections
subscribeToCollections: async (workspaceId) => {
  try {
    const collections = await apiClient.get(`/collections?workspaceId=${workspaceId}`);
    set({ collections });
  } catch (error) {
    console.error('Failed to fetch collections:', error);
  }
}

// Create collection
createCollection: async (collectionData) => {
  try {
    const response = await apiClient.post('/collections', collectionData);
    toast.success('Collection created successfully!');
    return response.id;
  } catch (error) {
    toast.error('Failed to create collection');
    throw error;
  }
}

// Update collection
updateCollection: async (id, updates) => {
  try {
    await apiClient.put(`/collections/${id}`, updates);
    toast.success('Collection updated successfully!');
  } catch (error) {
    toast.error('Failed to update collection');
    throw error;
  }
}

// Delete collection
deleteCollection: async (id) => {
  try {
    await apiClient.delete(`/collections/${id}`);
    toast.success('Collection deleted successfully!');
  } catch (error) {
    toast.error('Failed to delete collection');
    throw error;
  }
}
```

### 6.3: Update requestStore.js

**File**: `apps/web/src/stores/requestStore.js`

Similar pattern - replace all Firestore calls with API calls.

### 6.4: Update environmentStore.js

**File**: `apps/web/src/stores/environmentStore.js`

Similar pattern.

### 6.5: Update historyStore.js

**File**: `apps/web/src/stores/historyStore.js`

Similar pattern.

### 6.6: Update workspaceInviteStore.js

**File**: `apps/web/src/stores/workspaceInviteStore.js`

Similar pattern.

---

## Step 7: Test Integration (30 minutes)

### Start Both Services

Terminal 1:
```bash
npm run dev:api
```

Terminal 2:
```bash
npm run dev:web
```

### Test Each Feature

1. **Authentication**
   - Sign in with email/password ✓
   - Sign in with Google ✓
   - Sign out ✓

2. **Workspaces**
   - Create workspace ✓
   - Update workspace ✓
   - Delete workspace ✓
   - Invite member ✓
   - Remove member ✓
   - Change member role ✓

3. **Collections**
   - Create collection ✓
   - Update collection ✓
   - Delete collection ✓
   - Create folder ✓
   - Update folder ✓
   - Delete folder ✓

4. **Requests**
   - Create request ✓
   - Update request ✓
   - Delete request ✓
   - Send request ✓

5. **Environments**
   - Create environment ✓
   - Update environment ✓
   - Delete environment ✓
   - Use variables in request ✓

6. **History**
   - View history ✓
   - Clear history ✓

7. **Invitations**
   - Send invitation ✓
   - Accept invitation ✓
   - Decline invitation ✓

### Check Browser Console

Look for:
- No errors
- API calls succeeding
- Proper authentication headers

### Check Backend Logs

Look for:
- Incoming requests
- Successful responses
- No errors

---

## Step 8: Test Desktop App (15 minutes)

```bash
npm run dev:desktop
```

**Test**:
1. App opens correctly ✓
2. All features work ✓
3. HTTP requests work ✓
4. No console errors ✓

---

## Step 9: Build Everything (10 minutes)

```bash
# Build all workspaces
npm run build
```

**Verify**:
- `apps/web/dist/` exists
- `backend/api/dist/` exists
- No build errors

---

## Step 10: Test Production Build (10 minutes)

### Start Backend in Production Mode

```bash
cd backend/api
npm run start:prod
```

### Test Desktop App with Production Build

```bash
cd apps/desktop
npm run preview
```

**Test**: All features work in production mode

---

## Step 11: Clean Up (5 minutes)

After verifying everything works:

```bash
# Remove old root-level files
rm -rf src/
rm -rf electron/
rm index.html
rm vite.config.js
rm tailwind.config.js
rm postcss.config.js
rm package.json.backup

# Keep only:
# - apps/
# - backend/
# - packages/
# - package.json
# - *.md files
# - .gitignore
# - .firebaserc
# - firebase.json
# - functions/
```

---

## Step 12: Update Git (5 minutes)

```bash
# Stage all changes
git add .

# Commit
git commit -m "refactor: migrate to monorepo architecture with NestJS backend

- Move frontend to apps/web
- Move Electron to apps/desktop
- Add NestJS API gateway in backend/api
- Add shared types package
- Update all stores to use API client
- Add comprehensive documentation"

# Push
git push origin main
```

---

## Troubleshooting

### Backend won't start

**Error**: "Firebase Admin SDK not initialized"

**Solution**:
- Check `GOOGLE_APPLICATION_CREDENTIALS` path
- Verify service account key is valid
- Ensure Firebase project ID is correct

### Frontend can't connect to backend

**Error**: "Network Error" or CORS error

**Solution**:
- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in `apps/web/.env`
- Check CORS configuration in `backend/api/src/main.ts`

### Authentication errors

**Error**: "Unauthorized" or "Invalid token"

**Solution**:
- Ensure user is logged in
- Check token is being sent in Authorization header
- Verify Firebase Admin SDK can verify tokens
- Check token format: `Bearer <token>`

### Real-time updates not working

**Expected**: This is normal! Real-time updates need to be implemented separately.

**Options**:
1. Polling: Fetch data every few seconds
2. WebSocket: Implement WebSocket server
3. Server-Sent Events: Use SSE for real-time updates
4. Firebase Realtime Database: Use for real-time features

---

## Success Checklist

- [ ] Dependencies installed
- [ ] Backend configured
- [ ] Frontend configured
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] All stores updated
- [ ] Authentication works
- [ ] Workspaces work
- [ ] Collections work
- [ ] Requests work
- [ ] Environments work
- [ ] History works
- [ ] Invitations work
- [ ] Desktop app works
- [ ] Production build works
- [ ] Old files cleaned up
- [ ] Changes committed to git

---

## Estimated Timeline

| Task | Time |
|------|------|
| Install dependencies | 5 min |
| Configure backend | 10 min |
| Configure frontend | 5 min |
| Test backend | 10 min |
| Test frontend | 5 min |
| Update stores | 90 min |
| Test integration | 30 min |
| Test desktop app | 15 min |
| Build everything | 10 min |
| Test production | 10 min |
| Clean up | 5 min |
| Git commit | 5 min |
| **Total** | **3-4 hours** |

---

## Need Help?

1. Check [MONOREPO_MIGRATION_GUIDE.md](MONOREPO_MIGRATION_GUIDE.md)
2. Check [backend/api/README.md](backend/api/README.md)
3. Check browser console for errors
4. Check backend logs for errors
5. Review API endpoint documentation

---

## After Migration

### Benefits You'll Have

1. ✅ Clean separation of concerns
2. ✅ Better security (server-side Firebase Admin SDK)
3. ✅ Scalable architecture
4. ✅ Type safety across frontend and backend
5. ✅ Independent deployment
6. ✅ Better testability

### Next Features to Add

1. **Real-time Updates**: Implement WebSocket or SSE
2. **Caching**: Add Redis for better performance
3. **Rate Limiting**: Protect API from abuse
4. **Logging**: Add structured logging
5. **Monitoring**: Add health checks and metrics
6. **Testing**: Add unit and integration tests
7. **CI/CD**: Automate builds and deployments

---

**Good luck with the migration! 🚀**

If you encounter any issues, refer to the troubleshooting section or the comprehensive documentation.
