# Multi-User Collaboration Firestore Rules

Updated Firestore rules for workspace-based collaboration:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Workspaces - users can read if they are members, only admins can write
    match /workspaces/{workspaceId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.memberIds;
      allow write: if request.auth != null && 
                      resource.data.members[request.auth.uid] == 'admin';
      allow create: if request.auth != null && 
                       request.auth.uid == resource.data.ownerId;
    }
    
    // Collections - members can read, editors/admins can write
    match /collections/{collectionId} {
      allow read: if request.auth != null && 
                     request.auth.uid in get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.memberIds;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.members[request.auth.uid] in ['admin', 'editor'];
    }
    
    // Folders - same as collections
    match /folders/{folderId} {
      allow read: if request.auth != null && 
                     request.auth.uid in get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.memberIds;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.members[request.auth.uid] in ['admin', 'editor'];
    }
    
    // Requests - same as collections
    match /requests/{requestId} {
      allow read: if request.auth != null && 
                     request.auth.uid in get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.memberIds;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.members[request.auth.uid] in ['admin', 'editor'];
    }
    
    // Environments - same as collections
    match /environments/{environmentId} {
      allow read: if request.auth != null && 
                     request.auth.uid in get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.memberIds;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.members[request.auth.uid] in ['admin', 'editor'];
    }
    
    // History - same as collections
    match /history/{historyId} {
      allow read: if request.auth != null && 
                     request.auth.uid in get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.memberIds;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/workspaces/$(resource.data.workspaceId)).data.members[request.auth.uid] in ['admin', 'editor'];
    }
    
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Permission Levels:

- **Admin**: Can manage members, create/edit/delete all content, delete workspace
- **Editor**: Can create/edit/delete collections and requests, cannot manage members  
- **Viewer**: Read-only access to all workspace content

## Steps to update rules:

1. Go to Firebase Console
2. Navigate to Firestore Database  
3. Click on "Rules" tab
4. Replace the rules with the version above
5. Click "Publish"

## Testing:

**CURRENT RECOMMENDED RULES** (Use these for now):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // SIMPLIFIED RULES FOR TESTING - Allow authenticated users full access
    // TODO: Implement proper role-based rules in production
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Workspace invites - users can read invites sent to their email
    match /workspaceInvites/{inviteId} {
      allow read: if request.auth != null && 
                     request.auth.token.email == resource.data.email;
      allow write: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

**IMPORTANT**: Update your Firestore rules to use the simplified version above. The complex rules require proper workspace structure which may not exist yet.

Once collaboration features are working and workspaces are properly created, switch to the full rules above.