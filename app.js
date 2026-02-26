import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, increment, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

let userRole = 'student';
let isSignup = false;

// --- GLOBAL FUNCTIONS ---
window.switchRole = (role) => {
    userRole = role;
    document.querySelectorAll('#roleSelection button').forEach(b => b.classList.replace('bg-yellow-600', 'text-slate-500'));
    document.getElementById(`role-${role}`).classList.add('bg-yellow-600', 'text-black');
    document.getElementById('subject').classList.toggle('hidden', role !== 'teacher');
};

window.toggleReg = () => {
    isSignup = !isSignup;
    document.getElementById('regFields').classList.toggle('hidden');
    document.getElementById('mainBtn').innerText = isSignup ? 'Register' : 'Sign In';
};

window.handleAuth = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try {
        if(isSignup) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name: document.getElementById('name').value,
                email, role: userRole, subject: document.getElementById('subject').value || 'All', bpcoins: 0, attempts: {}
            });
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch(e) { alert(e.message); }
};

// --- SESSION CONTROL ---
onAuthStateChanged(auth, async (user) => {
    const body = document.getElementById('appBody');
    if(user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();
        document.getElementById('authPage').classList.add('hidden');
        document.getElementById('mainNav').classList.remove('hidden');
        body.classList.remove('hidden');
        
        if(data.role === 'admin') loadAdminPanel();
        else if(data.role === 'teacher') loadTeacherPanel(data);
        else loadStudentPanel(data);
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainNav').classList.add('hidden');
        body.classList.add('hidden');
    }
});

// --- TEACHER PANEL (QUIZ & CHAPTERS) ---
async function loadTeacherPanel(user) {
    const body = document.getElementById('appBody');
    body.innerHTML = `
        <div class="p-6 bg-slate-900 rounded-[2rem] border border-yellow-500/20 mb-6">
            <h2 class="text-yellow-500 font-black italic">${user.subject} Teacher Panel</h2>
        </div>
        <div class="grid gap-4">
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-bold uppercase mb-4 text-slate-500">1. Create Structure</h3>
                <input type="text" id="chapName" placeholder="Chapter Name" class="w-full p-4 bg-black rounded-xl mb-2 text-sm border border-slate-800">
                <button onclick="createChapter('${user.subject}')" class="w-full bg-blue-600 py-3 rounded-xl font-bold uppercase text-[10px]">Create Chapter</button>
            </div>
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-bold uppercase mb-4 text-slate-500">2. Upload Quiz (Image)</h3>
                <input type="file" id="quizImg" accept="image/*" class="w-full mb-3 text-xs">
                <select id="quizAns" class="w-full p-4 bg-black rounded-xl mb-3 text-sm">
                    <option value="A">Option A</option><option value="B">Option B</option><option value="C">Option C</option><option value="D">Option D</option>
                </select>
                <select id="chapSelect" class="w-full p-4 bg-black rounded-xl mb-4 text-sm"></select>
                <button onclick="uploadQuiz('${user.subject}')" class="w-full bg-yellow-600 py-4 rounded-xl font-black text-black uppercase">Publish Question</button>
            </div>
        </div>
    `;
    loadChapters(user.subject);
}

// Logic for uploading, student loading, and admin...
// (Code-ti boro hobar karone ami main logic gulo app.js e guchiye dichhi)

