import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlmQWV3IN_asZolPyaBLBb7L_RG0uriZM",
  authDomain: "mneet-f9bc7.firebaseapp.com",
  projectId: "mneet-f9bc7",
  storageBucket: "mneet-f9bc7.firebasestorage.app",
  messagingSenderId: "944379440196",
  appId: "1:944379440196:web:9d26b632b3e778d247e011",
  measurementId: "G-70T6K3DLGT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup Logic
document.getElementById('btnSignup').addEventListener('click', async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    const msg = document.getElementById('msg');

    try {
        msg.innerText = "Registering...";
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        // Step: Save to Firestore with 'approved: false'
        await setDoc(doc(db, "users", res.user.uid), {
            name: name,
            email: email,
            is_approved: false, // You must change this to TRUE manually in Firestore
            joinedAt: new Date().toISOString()
        });
        msg.innerText = "Success! Account created. Wait for Monirul's approval.";
    } catch (err) {
        msg.innerText = "Error: " + err.message;
    }
});
