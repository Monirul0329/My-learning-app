import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Tomar Notun Configuration
const firebaseConfig = {
    apiKey: "AizasyDYW3wJTOurtrgQffR2DsQimqj__w6-4_s",
    authDomain: "nest-mr-bio.firebaseapp.com",
    projectId: "nest-mr-bio",
    storageBucket: "nest-mr-bio.firebasestorage.app",
    messagingSenderId: "1051338751163",
    appId: "1:1051338751163:web:59e6f33e44b266b31fbd9e", // Updated ID
    measurementId: "G-DXZD3SVH46"                       // Updated ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- STUDENT SIGNUP LOGIC ---
document.getElementById('btnSignup')?.addEventListener('click', async () => {
    const name = document.getElementById('regName').value;
    const city = document.getElementById('regCity').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if(!email || !password) return alert("Email & Password dorkar!");

    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        // Firestore 'users' collection-e save kora
        await setDoc(doc(db, "users", res.user.uid), {
            uid: res.user.uid,
            name: name,
            city: city,
            phone: phone,
            email: email,
            role: "student",
            is_approved: false // Admin approve korle true hobe
        });
        alert("Signup Success! Approval er jonno wait koro.");
    } catch (err) { 
        alert("Error: " + err.message); 
    }
});

// --- LOGIN LOGIC ---
document.getElementById('btnLogin')?.addEventListener('click', async () => {
    const email = document.getElementById('logEmail').value;
    const password = document.getElementById('logPassword').value;

    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", res.user.uid));
        
        if (userDoc.exists()) {
            const data = userDoc.data();
            // Approval check kora
            if (data.is_approved === true || data.approved === true) {
                window.location.href = "student.html"; 
            } else {
                alert("Account ekhono approve kora hoyni!");
                auth.signOut();
            }
        }
    } catch (err) { 
        alert("Login Error: " + err.message); 
    }
});
