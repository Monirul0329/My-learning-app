import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlmQwV3IN_asZolPyaBLBb7",
  authDomain: "mneet-f9bc7.firebaseapp.com",
  projectId: "mneet-f9bc7",
  storageBucket: "mneet-f9bc7.firebasestorage.app",
  messagingSenderId: "944379440196",
  appId: "1:944379440196:web:9d26b632b3e778d247e011",
  measurementId: "G-78T6K30L0T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById('btnSignup').addEventListener('click', async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    if(!name || !email || !pass) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), {
            name: name,
            email: email,
            is_approved: false,
            joinedAt: new Date().toISOString()
        });
        alert("Success! Wait for Admin Approval.");
    } catch (err) {
        alert("Error: " + err.message);
    }
});
  
