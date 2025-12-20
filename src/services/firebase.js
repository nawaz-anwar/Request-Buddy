import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - EXACT CONFIG AS REQUESTED
export const firebaseConfig = {
  apiKey: "AIzaSyBIh1_3IjaxvAhQaAFulnkfWPVT7uIgZKM",
  authDomain: "teamapi-96507.firebaseapp.com",
  projectId: "teamapi-96507",
  storageBucket: "teamapi-96507.firebasestorage.app",
  messagingSenderId: "1083620222554",
  appId: "1:1083620222554:web:cb21991938b07b55ceda63",
  measurementId: "G-DSNJS0KD6J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;