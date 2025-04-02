import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkB26_xRWFfL_Zk-8YuE7UZed7ivTnBiI",
  authDomain: "ort-node-demo.firebaseapp.com",
  projectId: "ort-node-demo",
  storageBucket: "ort-node-demo.firebasestorage.app",
  messagingSenderId: "712905586746",
  appId: "1:712905586746:web:6ae0de98b008e7eb7c5d03",
  measurementId: "G-C8G99TNK2M"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
export const auth = getAuth(app);