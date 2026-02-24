import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AizasyDYW3wJTOurtrgQffR2DsQimqj__w6-4_s",
    authDomain: "nest-mr-bio.firebaseapp.com",
    projectId: "nest-mr-bio",
    storageBucket: "nest-mr-bio.firebasestorage.app",
    messagingSenderId: "1051338751163",
    appId: "1:1051338751163:web:fd94176e0ccb9b251fbd9e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- SIGNUP LOGIC ---
document.getElementById('btnSignup')?.addEventListener('click', async () => {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const city = document.getElementById('regCity').value;
    const phone = document.getElementById('regPhone').value;

    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
            uid: res.user.uid,
            name: name,
            email: email,
            city: city,
            phone: phone,
            role: "student",
            is_approved: false // Default false
        });
        alert("Signup Success! Wait for Admin Approval.");
    } catch (err) { alert(err.message); }
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
            if (data.is_approved === true) {
                window.location.href = "student.html"; // Approved hole dashboard e jabe
            } else {
                alert("Account ekhono approve kora hoyni!");
                auth.signOut();
            }
        }
    } catch (err) { alert(err.message); }
});
