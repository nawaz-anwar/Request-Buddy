import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class WorkspaceService {
  constructor(private firebaseService: FirebaseService) {}

  async getWorkspaces(userId: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('workspaces')
      .orderBy('createdAt', 'desc')
      .get();

    const workspaces = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((workspace: any) => 
        workspace.ownerId === userId || 
        workspace.memberIds?.includes(userId) ||
        workspace.members?.[userId]
      );

    return workspaces;
  }

  async getWorkspace(workspaceId: string, userId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('workspaces').doc(workspaceId).get();

    if (!doc.exists) {
      throw new Error('Workspace not found');
    }

    const workspace: any = { id: doc.id, ...doc.data() };

    // Check if user has access
    if (workspace.ownerId !== userId && 
        !workspace.memberIds?.includes(userId) && 
        !workspace.members?.[userId]) {
      throw new Error('Access denied');
    }

    return workspace;
  }

  async createWorkspace(name: string, userId: string) {
    const db = this.firebaseService.getFirestore();
    const docRef = await db.collection('workspaces').add({
      name,
      ownerId: userId,
      createdAt: Timestamp.now(),
      members: { [userId]: 'admin' },
      memberIds: [userId],
    });

    return { id: docRef.id };
  }

  async updateWorkspace(workspaceId: string, userId: string, updates: any) {
    const db = this.firebaseService.getFirestore();
    
    // Verify access
    await this.getWorkspace(workspaceId, userId);

    await db.collection('workspaces').doc(workspaceId).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const db = this.firebaseService.getFirestore();
    
    // Verify access and ownership
    const workspace = await this.getWorkspace(workspaceId, userId);
    if ((workspace as any).ownerId !== userId) {
      throw new Error('Only the owner can delete the workspace');
    }

    await db.collection('workspaces').doc(workspaceId).delete();

    return { success: true };
  }

  async addMember(workspaceId: string, currentUserId: string, userIdToAdd: string, role: string) {
    const db = this.firebaseService.getFirestore();
    const workspace = await this.getWorkspace(workspaceId, currentUserId);

    // Check if current user has permission
    if ((workspace as any).members?.[currentUserId] !== 'admin') {
      throw new Error('Only admins can add members');
    }

    const newMembers = { ...(workspace as any).members, [userIdToAdd]: role };
    const newMemberIds = [...((workspace as any).memberIds || []), userIdToAdd];

    await db.collection('workspaces').doc(workspaceId).update({
      members: newMembers,
      memberIds: newMemberIds,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  }

  async removeMember(workspaceId: string, currentUserId: string, userIdToRemove: string) {
    const db = this.firebaseService.getFirestore();
    const workspace = await this.getWorkspace(workspaceId, currentUserId);

    // Check permissions
    if ((workspace as any).members?.[currentUserId] !== 'admin') {
      throw new Error('Only admins can remove members');
    }

    if ((workspace as any).ownerId === userIdToRemove) {
      throw new Error('Cannot remove the workspace owner');
    }

    const newMembers = { ...(workspace as any).members };
    delete newMembers[userIdToRemove];
    const newMemberIds = ((workspace as any).memberIds || []).filter((id: string) => id !== userIdToRemove);

    await db.collection('workspaces').doc(workspaceId).update({
      members: newMembers,
      memberIds: newMemberIds,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  }

  async changeUserRole(workspaceId: string, currentUserId: string, userIdToChange: string, newRole: string) {
    const db = this.firebaseService.getFirestore();
    const workspace = await this.getWorkspace(workspaceId, currentUserId);

    // Check permissions
    if ((workspace as any).members?.[currentUserId] !== 'admin') {
      throw new Error('Only admins can change user roles');
    }

    if ((workspace as any).ownerId === userIdToChange && newRole !== 'admin') {
      throw new Error('Cannot change the owner role from admin');
    }

    const newMembers = { ...(workspace as any).members, [userIdToChange]: newRole };

    await db.collection('workspaces').doc(workspaceId).update({
      members: newMembers,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  }
}
