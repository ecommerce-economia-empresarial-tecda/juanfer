import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "juanfer-shop-2026",
  appId: "1:62448351772:web:c3ffa2a0dddb49d953bdd9",
  storageBucket: "juanfer-shop-2026.firebasestorage.app",
  apiKey: "AIzaSyCpeGdnT5muOShvocvl1MGX038Et2kSORo",
  authDomain: "juanfer-shop-2026.firebaseapp.com",
  messagingSenderId: "62448351772",
  projectNumber: "62448351772"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
