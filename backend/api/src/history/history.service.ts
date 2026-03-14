import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class HistoryService {
  constructor(private firebaseService: FirebaseService) {}

  async getHistory(workspaceId: string, limit: number = 50) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('history')
      .where('workspaceId', '==', workspaceId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addHistory(data: any) {
    const db = this.firebaseService.getFirestore();
    const docRef = await db.collection('history').add({
      ...data,
      timestamp: Timestamp.now(),
    });

    return { id: docRef.id };
  }

  async deleteHistory(historyId: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('history').doc(historyId).delete();

    return { success: true };
  }

  async clearHistory(workspaceId: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('history')
      .where('workspaceId', '==', workspaceId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { success: true, deleted: snapshot.size };
  }
}
