import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let mode = 'register';
const toggle = (m) => {
    mode = m;
    document.getElementById('signupOnly').style.display = m === 'login' ? 'none' : 'block';
    document.getElementById('actionBtn').innerText = m === 'login' ? 'Login Now' : 'Register Now';
    document.getElementById('tabRegister').className = m === 'register' ? 'flex-1 py-2 rounded-xl text-[10px] font-bold bg-yellow-600 text-slate-950' : 'flex-1 py-2 rounded-xl text-[10px] font-bold';
    document.getElementById('tabLogin').className = m === 'login' ? 'flex-1 py-2 rounded-xl text-[10px] font-bold bg-yellow-600 text-slate-950' : 'flex-1 py-2 rounded-xl text-[10px] font-bold';
};

document.getElementById('tabRegister').onclick = () => toggle('register');
document.getElementById('tabLogin').onclick = () => toggle('login');

document.getElementById('actionBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    if(mode === 'register') {
        const name = document.getElementById('name').value;
        const city = document.getElementById('city').value;
        const role = document.getElementById('role').value;
        const txn = document.getElementById('txn').value;
        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name, city, role, email, transaction_id: txn,
                is_paid: false, is_approved: role === 'admin', bp_coins: 0
            });
            alert("Registration Sent! Wait for Admin Approval.");
        } catch (e) { alert(e.message); }
    } else {
        try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert(e.message); }
    }
};

onAuthStateChanged(auth, async (u) => {
    if(u) {
        const d = await getDoc(doc(db, "users", u.uid));
        if(d.exists()) {
            const data = d.data();
            if(!data.is_approved) { alert("Pending Admin Approval!"); return; }
            window.location.href = data.role === 'admin' ? 'admin.html' : 'student.html';
        }
    }
});
