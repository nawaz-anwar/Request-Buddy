import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class CollectionService {
  constructor(private firebaseService: FirebaseService) {}

  async getCollections(workspaceId: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('collections')
      .where('workspaceId', '==', workspaceId)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getCollection(collectionId: string) {
    const db = this.firebaseService.getFirestore();
    const doc = await db.collection('collections').doc(collectionId).get();

    if (!doc.exists) {
      throw new Error('Collection not found');
    }

    return { id: doc.id, ...doc.data() };
  }

  async createCollection(data: { name: string; workspaceId: string; description?: string }) {
    const db = this.firebaseService.getFirestore();
    const docRef = await db.collection('collections').add({
      name: data.name,
      workspaceId: data.workspaceId,
      description: data.description || '',
      createdAt: Timestamp.now(),
    });

    return { id: docRef.id };
  }

  async updateCollection(collectionId: string, updates: any) {
    const db = this.firebaseService.getFirestore();
    await db.collection('collections').doc(collectionId).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  }

  async deleteCollection(collectionId: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('collections').doc(collectionId).delete();

    return { success: true };
  }

  async getFolders(workspaceId: string) {
    const db = this.firebaseService.getFirestore();
    const snapshot = await db.collection('folders')
      .where('workspaceId', '==', workspaceId)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async createFolder(data: { name: string; collectionId: string; workspaceId: string }) {
    const db = this.firebaseService.getFirestore();
    const docRef = await db.collection('folders').add({
      name: data.name,
      collectionId: data.collectionId,
      workspaceId: data.workspaceId,
      createdAt: Timestamp.now(),
    });

    return { id: docRef.id };
  }

  async updateFolder(folderId: string, updates: any) {
    const db = this.firebaseService.getFirestore();
    await db.collection('folders').doc(folderId).update({
      ...updates,
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  }

  async deleteFolder(folderId: string) {
    const db = this.firebaseService.getFirestore();
    await db.collection('folders').doc(folderId).delete();

    return { success: true };
  }
}
