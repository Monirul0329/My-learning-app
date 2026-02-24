import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDlmQWV3IN_asZolPyaBLBb7L_RG0uriZM",
    authDomain: "mneet-f9bc7.firebaseapp.com",
    projectId: "mneet-f9bc7",
    storageBucket: "mneet-f9bc7.firebasestorage.app",
    appId: "1:944379440196:web:9d26b632b3e778d247e011"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isLoginMode = false;

const toggleMode = (login) => {
    isLoginMode = login;
    document.getElementById('signupGroup').style.display = login ? 'none' : 'block';
    document.getElementById('mainBtn').innerText = login ? 'Login to Campus' : 'Register Now';
    document.getElementById('tabLogin').className = login ? "flex-1 py-2 rounded-xl text-[10px] font-bold bg-yellow-600 text-slate-950" : "flex-1 py-2 rounded-xl text-[10px] font-bold";
    document.getElementById('tabSignup').className = !login ? "flex-1 py-2 rounded-xl text-[10px] font-bold bg-yellow-600 text-slate-950" : "flex-1 py-2 rounded-xl text-[10px] font-bold";
};

document.getElementById('tabLogin').onclick = () => toggleMode(true);
document.getElementById('tabSignup').onclick = () => toggleMode(false);

document.getElementById('mainBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    const msg = document.getElementById('authMsg');

    if (isLoginMode) {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (e) { msg.innerText = "Error: " + e.message; }
    } else {
        const name = document.getElementById('regName').value;
        const city = document.getElementById('regCity').value;
        const role = document.getElementById('regRole').value;
        const txn = document.getElementById('regTxn').value;

        if(!name || !city) { alert("Name and City are required"); return; }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name, city, role, email,
                transaction_id: txn || "none",
                is_paid: false,
                is_approved: true,
                bp_coins: 0
            });
            msg.innerText = "Registration Successful!";
        } catch (e) { msg.innerText = "Error: " + e.message; }
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const d = await getDoc(doc(db, "users", user.uid));
        if (d.exists()) {
            window.location.href = 'student.html';
        }
    }
});
    
