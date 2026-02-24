import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AizasyDYW3wJTOurtrgQffR2DsQimqj__w6-4_s", // apiKey eiki ache
    authDomain: "nest-mr-bio.firebaseapp.com",
    projectId: "nest-mr-bio",
    storageBucket: "nest-mr-bio.firebasestorage.app",
    messagingSenderId: "1051338751163",
    appId: "1:1051338751163:web:59e6f33e44b266b31fbd9e", // NOTUN ID
    measurementId: "G-DXZD3SVH46"                       // NOTUN ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
