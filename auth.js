import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Import your module functions
import { initTeacher } from './teacher.js';
import { initStudent } from './student.js';
import { initAdmin } from './admin.js';

const firebaseConfig = {
    apiKey: "AIzaSyDlmQWV3IN_asZolPyaBLBb7L_RG0uriZM",
    authDomain: "mneet-f9bc7.firebaseapp.com",
    projectId: "mneet-f9bc7",
    storageBucket: "mneet-f9bc7.appspot.com",
    messagingSenderId: "944379440196",
    appId: "1:944379440196:web:9d26b632b3e778d247e011"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentRole = 'student';

// --- UI HELPERS ---
window.setRole = (role) => {
    currentRole = role;
    const btns = ['btnStudent', 'btnTeacher', 'btnAdmin'];
    btns.forEach(id => {
        const el = document.getElementById(id);
        el.classList.remove('bg-yellow-600', 'text-black');
        el.classList.add('text-slate-500');
    });
    const activeBtn = role === 'student' ? 'btnStudent' : (role === 'teacher' ? 'btnTeacher' : 'btnAdmin');
    document.getElementById(activeBtn).classList.add('bg-yellow-600', 'text-black');

    // Show/Hide Teacher Subject field
    document.getElementById('teacherSub').classList.toggle('hidden', role !== 'teacher');
};

// --- AUTH ACTIONS ---
document.getElementById('authBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const isSignup = !document.getElementById('signupFields').classList.contains('hidden');

    if (!email || !pass) return alert("Fields cannot be empty!");

    try {
        if (isSignup) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            const userData = {
                uid: res.user.uid,
                name: document.getElementById('regName').value,
                email: email,
                role: currentRole,
                paid: false,
                blocked: false,
                bpcoins: 0,
                levelName: 'Novice',
                studyDays: 1,
                subject: currentRole === 'teacher' ? document.getElementById('teacherSub').value : 'All'
            };
            await setDoc(doc(db, "users", res.user.uid), userData);
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch (err) {
        alert(err.message);
    }
};

// --- SESSION MANAGER ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.blocked) {
                alert("Account Blocked!");
                signOut(auth);
                return;
            }
            
            // Layout Update
            document.getElementById('authPage').classList.add('hidden');
            document.getElementById('appHeader').classList.remove('hidden');
            document.getElementById('appBody').classList.remove('hidden');

            // Redirect to proper dashboard
            if (userData.role === 'admin') initAdmin(db);
            else if (userData.role === 'teacher') initTeacher(userData, db);
            else initStudent(userData, db);
            
            // Set Coin UI for students
            if (userData.role === 'student') {
                document.getElementById('coinDisplay').classList.remove('hidden');
                document.getElementById('bpValue').innerText = userData.bpcoins || 0;
            }
        }
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('appHeader').classList.add('hidden');
        document.getElementById('appBody').classList.add('hidden');
    }
});

document.getElementById('logoutBtn').onclick = () => signOut(auth);
document.getElementById('toggleAuth').onclick = () => {
    document.getElementById('signupFields').classList.toggle('hidden');
    document.getElementById('authBtn').innerText = 
        document.getElementById('signupFields').classList.contains('hidden') ? 'Sign In' : 'Register';
};

export { auth, db };
              
