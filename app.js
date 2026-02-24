import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const msg = document.getElementById('msg');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().is_approved === true) {
            authSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
        } else {
            msg.innerText = "Wait! Monirul ekhono tomake approve koreni.";
        }
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

document.getElementById('btnAction').onclick = async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;

    if(!name || !email || !pass) { msg.innerText = "Fill all fields!"; return; }

    try {
        msg.innerText = "Requesting Access...";
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), {
            name: name,
            email: email,
            is_approved: false
        });
        msg.innerText = "Success! Wait for Monirul's approval.";
    } catch (err) {
        msg.innerText = "Error: " + err.message;
    }
};

document.getElementById('btnLogout').onclick = () => signOut(auth);
