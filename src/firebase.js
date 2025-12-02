// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALTf3nedTefDDrW8dY0RS40H0DfOmmv0s",
  authDomain: "matematikproje.firebaseapp.com",
  projectId: "matematikproje",
  storageBucket: "matematikproje.firebasestorage.app",
  messagingSenderId: "383558323844",
  appId: "1:383558323844:web:5b1ed7e4f640e82db37cd1",
  measurementId: "G-VY116TTEB1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const resultsCollection = collection(db, 'surveyResults');