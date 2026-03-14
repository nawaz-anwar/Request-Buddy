import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class RequestService {
  constructor(private firebaseService: FirebaseService) {}

  async getRequests(workspaceId: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('requests')
      .where('workspaceId', '==', workspaceId)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getRequest(requestId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('requests').doc(requestId).get();

    if (!doc.exists) {
      throw new Error('Request not found');
    }

    return { id: doc.id, ...doc.data() };
  }

  async createRequest(data: any) {
    const db = this.firebaseService.getFirestore();
    const docRef = await db.collection('requests').add({
      ...data,
      createdAt: Timestamp.now(),
    });

    return { id: docRef.id };
  }

  async updateRequest(requestId: string, updates: any) {
    const db = this.firebaseService.getFirestore();
    await db.collection('requests').doc(requestId).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  }

  async deleteRequest(requestId: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('requests').doc(requestId).delete();

    return { success: true };
  }
}
