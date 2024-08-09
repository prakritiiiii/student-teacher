// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, push, update, ref, set, get, child, onValue} from 'firebase/database'; // Import Realtime Database functions

const firebaseConfig = {
  apiKey: "AIzaSyBW9_j-V6yW3PBuJA_hAVmHlS0JCNrKmm4",
  authDomain: "student-teachr.firebaseapp.com",
  projectId: "student-teachr",
  storageBucket: "student-teachr.appspot.com",
  messagingSenderId: "93256369875",
  appId: "1:93256369875:web:00ddc12706e9d665037626",
  measurementId: "G-T8S4V1GCPB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app); // Initialize Realtime Database

export { auth, database, push, update, onValue, signInWithEmailAndPassword, createUserWithEmailAndPassword, ref, set, get, child };
