// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDno3hB6oZRCkBGU3He-RSicqEhD1ltrWI",
  authDomain: "kalumbu-shop.firebaseapp.com",
  projectId: "kalumbu-shop",
  storageBucket: "kalumbu-shop.firebasestorage.app",
  messagingSenderId: "906662106330",
  appId: "1:906662106330:web:2ff969e063a89a1c3301e3",
  measurementId: "G-B6MYRMTN2Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
