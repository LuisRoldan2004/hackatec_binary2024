// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfBjYyNQNx562IPZ8e1ZQJr4LEnFURp28",
  authDomain: "hackatecnm-daafb.firebaseapp.com",
  projectId: "hackatecnm-daafb",
  storageBucket: "hackatecnm-daafb.appspot.com",
  messagingSenderId: "364452573593",
  appId: "1:364452573593:web:31a2b7111431117303a308",
  measurementId: "G-STXV6MV350"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the necessary instances and functions
export { auth, db, storage, collection, addDoc, ref, uploadBytes, getDownloadURL };
