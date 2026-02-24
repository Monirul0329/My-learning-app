import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDYw3wJTOurtrgQffR2DsQ1mqj__w6-4_s",
    authDomain: "nest-mr-bio.firebaseapp.com",
    databaseURL: "https://nest-mr-bio-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nest-mr-bio",
    storageBucket: "nest-mr-bio.firebasestorage.app",
    messagingSenderId: "1051338751163",
    appId: "1:1051338751163:web:59e5f33e44b265b31fbd9e",
    measurementId: "G-DXZD3SVH46"
  };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
