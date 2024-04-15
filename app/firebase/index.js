// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAr18ztXFX8JJRwE2GEx-0SDryjawJcql8",
  authDomain: "sdp2024-e72ff.firebaseapp.com",
  projectId: "sdp2024-e72ff",
  storageBucket: "sdp2024-e72ff.appspot.com",
  messagingSenderId: "56311089684",
  appId: "1:56311089684:web:c808acba75668b46447501",
  measurementId: "G-K7FCR49FP6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getDatabase(app);

export { app, db };
