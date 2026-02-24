import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AizasyDYW3wJTOurtrgQffR2DsQimqj__w6-4_s", // Eita khub bhalo kore check koro
    authDomain: "nest-mr-bio.firebaseapp.com",
    databaseURL: "https://nest-mr-bio-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nest-mr-bio",
    storageBucket: "nest-mr-bio.firebasestorage.app",
    messagingSenderId: "1051338751163",
    appId: "1:1051338751163:web:fd94176e0ccb9b251fbd9e",
    measurementId: "G-PEN8W68ESL"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
