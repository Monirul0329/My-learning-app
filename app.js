import { auth, db, storage } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');
const authMsg = document.getElementById('authMsg');
let isLogin = true;

toggleAuth.onclick = () => {
    isLogin = !isLogin;
    document.getElementById('signupForm').classList.toggle('hidden');
    authBtn.innerText = isLogin ? 'Login' : 'Register Now';
    toggleAuth.innerText = isLogin ? 'Create Account' : 'Back to Login';
};

document.getElementById('forgotBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    if(!email) return alert("Email type koro!");
    try {
        await sendPasswordResetEmail(auth, email);
        authMsg.innerText = "Password reset link sent to Gmail!";
    } catch(e) { authMsg.innerText = e.message; }
};

authBtn.onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    
    try {
        if(!isLogin) {
            const name = document.getElementById('regName').value;
            const city = document.getElementById('regCity').value;
            const role = document.getElementById('regRole').value;
            const txn = document.getElementById('regTxn').value;
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name, city, role, txn, email, approved: false, bp_coins: 0, progress: 0
            });
            authMsg.innerText = "Registration successful! Wait for Admin Approval.";
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch(e) { authMsg.innerText = e.message; }
};

onAuthStateChanged(auth, (user) => {
    if(user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            const data = snap.data();
            if(data && data.approved) {
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                document.getElementById('coins').innerText = data.bp_coins;
                document.getElementById('progText').innerText = data.progress + "%";
                document.getElementById('progBar').style.width = data.progress + "%";
            } else {
                authMsg.innerText = "Account NOT approved by Admin yet.";
            }
        });
    }
});

document.getElementById('globalBackBtn').onclick = () => {
    window.history.back();
};
  
