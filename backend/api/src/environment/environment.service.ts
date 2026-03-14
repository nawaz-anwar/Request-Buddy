import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class EnvironmentService {
  constructor(private firebaseService: FirebaseService) {}

  async getEnvironments(workspaceId: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('environments')
      .where('workspaceId', '==', workspaceId)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getEnvironment(environmentId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('environments').doc(environmentId).get();

    if (!doc.exists) {
      throw new Error('Environment not found');
    }

    return { id: doc.id, ...doc.data() };
  }

  async createEnvironment(data: { name: string; workspaceId: string; variables: any }) {
    const db = this.firebaseService.getFirestore();
    const docRef = await db.collection('environments').add({
      name: data.name,
      workspaceId: data.workspaceId,
      variables: data.variables || {},
      createdAt: Timestamp.now(),
    });

    return { id: docRef.id };
  }

  async updateEnvironment(environmentId: string, updates: any) {
    const db = this.firebaseService.getFirestore();
    await db.collection('environments').doc(environmentId).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  }

  async deleteEnvironment(environmentId: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('environments').doc(environmentId).delete();

    return { success: true };
  }
}
