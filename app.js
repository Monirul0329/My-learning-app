import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Tomar Firebase Config eikhane boshau (Screenshot 1-e jeta chilo)
const firebaseConfig = {
    apiKey: "AizasyDYW3wJTOurtrgQffR2DsQimqj__w6-4_s",
    authDomain: "nest-mr-bio.firebaseapp.com",
    databaseURL: "https://nest-mr-bio-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nest-mr-bio",
    storageBucket: "nest-mr-bio.firebasestorage.app",
    messagingSenderId: "1051338751163",
    appId: "1:1051338751163:web:fd94176e0ccb9b251fbd9e",
    measurementId: "G-PEN8W68ESL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup Logic
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('userName').value;
    const city = document.getElementById('userCity').value;
    const phone = document.getElementById('userPhone').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;

    try {
        // 1. Auth-e student create kora
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Firestore-er 'users' collection-e data pathano
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            city: city,
            phone: phone,
            email: email,
            role: "student",       // Teacher ba Admin hobe na
            is_approved: false     // Default false thakbe
        });

        alert("Signup Successful! Wait for Admin Approval.");
        signupForm.reset();

    } catch (error) {
        alert("Error: " + error.message);
    }
});

