import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: admin.firestore.Firestore;
  private auth: admin.auth.Auth;

  onModuleInit() {
    // Initialize Firebase Admin SDK
    // Using the same project configuration as the frontend
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: 'teamapi-96507',
      });
    }

    this.firestore = admin.firestore();
    this.auth = admin.auth();
    
    console.log('✅ Firebase Admin SDK initialized');
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  getAuth(): admin.auth.Auth {
    return this.auth;
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(token);
  }
}
