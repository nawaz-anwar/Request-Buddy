import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class InvitationService {
  constructor(private firebaseService: FirebaseService) {}

  async getInvitations(email: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('workspaceInvitations')
      .where('inviteeEmail', '==', email)
      .where('status', '==', 'pending')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createInvitation(data: any, inviterId: string) {
    const db = this.firebaseService.getFirestore();
    const docRef = await db.collection('workspaceInvitations').add({
      ...data,
      inviterId,
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    return { id: docRef.id };
  }

  async acceptInvitation(invitationId: string, userId: string) {
    const db = this.firebaseService.getFirestore();
    const inviteDoc = await db.collection('workspaceInvitations').doc(invitationId).get();

    if (!inviteDoc.exists) {
      throw new Error('Invitation not found');
    }

    const invite: any = inviteDoc.data();

    // Add user to workspace
    const workspaceRef = db.collection('workspaces').doc(invite.workspaceId);
    const workspaceDoc = await workspaceRef.get();

    if (!workspaceDoc.exists) {
      throw new Error('Workspace not found');
    }

    const workspace: any = workspaceDoc.data();
    const newMembers = { ...workspace.members, [userId]: invite.role };
    const newMemberIds = [...(workspace.memberIds || []), userId];

    await workspaceRef.update({
      members: newMembers,
      memberIds: newMemberIds,
      updatedAt: Timestamp.now(),
    });

    // Update invitation status
    await db.collection('workspaceInvitations').doc(invitationId).update({
      status: 'accepted',
      acceptedAt: Timestamp.now(),
    });

    return { success: true };
  }

  async declineInvitation(invitationId: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('workspaceInvitations').doc(invitationId).update({
      status: 'declined',
      declinedAt: Timestamp.now(),
    });

    return { success: true };
  }

  async deleteInvitation(invitationId: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('workspaceInvitations').doc(invitationId).delete();

    return { success: true };
  }
}
