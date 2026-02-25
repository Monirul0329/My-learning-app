import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, addDoc, orderBy, limit, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDlmQWV3IN_asZolPyaBLBb7L_RG0uriZM",
    authDomain: "mneet-f9bc7.firebaseapp.com",
    projectId: "mneet-f9bc7",
    storageBucket: "mneet-f9bc7.firebasestorage.app",
    messagingSenderId: "944379440196",
    appId: "1:944379440196:web:9d26b632b3e778d247e011"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentSubject = "";
let currentChapter = "";
let isLoginMode = true;

const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');

if(toggleAuth) {
    toggleAuth.onclick = () => {
        isLoginMode = !isLoginMode;
        document.getElementById('signupFields').classList.toggle('hidden');
        authBtn.innerText = isLoginMode ? 'Continue' : 'Create Account';
        toggleAuth.innerText = isLoginMode ? 'Create Account' : 'Back to Login';
    };
}

authBtn.onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    if(!email || !pass) return;
    try {
        if(!isLoginMode) {
            const data = {
                name: document.getElementById('regName').value,
                city: document.getElementById('regCity').value,
                role: document.getElementById('regRole').value,
                txn: document.getElementById('regTxn').value,
                email, approved: false, bpcoins: 0, progress: 0, streak: 1
            };
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), data);
            alert("Registration successful! Wait for admin approval.");
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch(e) { document.getElementById('authMsg').innerText = e.message; }
};

onAuthStateChanged(auth, (user) => {
    if(user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            const u = snap.data();
            if(u && u.approved) {
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                
          
                const r = u.role;
                document.getElementById('adminPanel').classList.toggle('hidden', r !== 'admin');
                document.getElementById('teacherPanel').classList.toggle('hidden', r !== 'teacher');
                document.getElementById('dashboardHome').classList.toggle('hidden', r === 'admin' || r === 'teacher');
                document.getElementById('studentStats').classList.toggle('hidden', r === 'admin' || r === 'teacher');
                document.getElementById('leaderboard').classList.toggle('hidden', r === 'admin' || r === 'teacher');

                if(r === 'admin') loadAdminData();
                if(r === 'student') { 
                    renderDashboard(); 
                    loadLeaderboard();
                    updateStreak();
                    calculateRank(u.bpcoins);
                }

                document.getElementById('coins').innerText = u.bpcoins || 0;
                document.getElementById('progText').innerText = (u.progress || 0) + "%";
                document.getElementById('progBar').style.width = (u.progress || 0) + "%";
            } else if(u) { alert("Account pending approval."); signOut(auth); }
        });
        syncNotice();
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

document.getElementById('globalBackBtn').onclick
      
