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

let currentRole = 'student';
let isSignupMode = false;
let userGlobal = null;

// --- AUTH UI HELPERS ---
window.setRole = (role) => {
    currentRole = role;
    document.querySelectorAll('#roleSelection button').forEach(b => {
        b.classList.remove('bg-yellow-600', 'text-black');
        b.classList.add('text-slate-500');
    });
    document.getElementById(`role-${role}`).classList.add('bg-yellow-600', 'text-black');
    document.getElementById('regSubject').classList.toggle('hidden', role !== 'teacher');
};

window.toggleAuthMode = () => {
    isSignupMode = !isSignupMode;
    document.getElementById('signupFields').classList.toggle('hidden');
    document.getElementById('authBtn').innerText = isSignupMode ? 'Register' : 'Sign In';
};

window.handleAuth = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    if(!email || !pass) return alert("Fields are empty!");

    try {
        if(isSignupMode) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            const userData = {
                uid: res.user.uid,
                name: document.getElementById('regName').value,
                email, role: currentRole, 
                subject: currentRole === 'teacher' ? document.getElementById('regSubject').value : 'All',
                bpcoins: 0, attempts: {}, paid: false
            };
            await setDoc(doc(db, "users", res.user.uid), userData);
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch(e) { alert(e.message); }
};

window.logout = () => signOut(auth);

// --- SESSION MONITOR ---
onAuthStateChanged(auth, async (user) => {
    const body = document.getElementById('appBody');
    if(user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        userGlobal = snap.data();
        document.getElementById('authPage').classList.add('hidden');
        document.getElementById('navbar').classList.remove('hidden');
        body.classList.remove('hidden');
        
        if(userGlobal.role === 'admin') renderAdmin();
        else if(userGlobal.role === 'teacher') renderTeacher();
        else renderStudent();
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('navbar').classList.add('hidden');
        body.classList.add('hidden');
    }
});

// --- TEACHER PANEL ---
async function renderTeacher() {
    const body = document.getElementById('appBody');
    body.innerHTML = `
        <div class="space-y-6">
            <div class="glass-card p-6 rounded-[2rem] border-yellow-500/20">
                <h2 class="text-yellow-500 font-black italic uppercase text-lg">${userGlobal.subject} Management</h2>
                <p class="text-[9px] text-slate-500 font-bold mt-1">INSTRUCTOR: ${userGlobal.name.toUpperCase()}</p>
            </div>
            <div class="glass-card p-6 rounded-3xl border-slate-800">
                <h3 class="text-[10px] font-black uppercase mb-4 text-slate-400">1. Chapter Creator</h3>
                <input type="text" id="chapInp" placeholder="Chapter Title" class="input-dark mb-3">
                <button id="addChapBtn" class="bg-blue-600 text-white font-black py-3 rounded-xl w-full text-[10px] uppercase">Create Chapter</button>
            </div>
            <div class="glass-card p-6 rounded-3xl border-slate-800">
                <h3 class="text-[10px] font-black uppercase mb-4 text-slate-400">2. Quiz Builder (Image)</h3>
                <input type="file" id="quizImg" accept="image/*" class="w-full mb-4 text-xs text-slate-500">
                <select id="quizAns" class="input-dark mb-3">
                    <option value="A">Answer: A</option><option value="B">Answer: B</option>
                    <option value="C">Answer: C</option><option value="D">Answer: D</option>
                </select>
                <select id="chapSelect" class="input-dark mb-4"></select>
                <button id="pubQuizBtn" class="btn-primary">Publish Question</button>
            </div>
        </div>
    `;

    // Load Chapters for Dropdown
    const q = query(collection(db, "chapters"), where("subject", "==", userGlobal.subject));
    const snap = await getDocs(q);
    const select = document.getElementById('chapSelect');
    snap.forEach(d => select.innerHTML += `<option value="${d.data().name}">${d.data().name}</option>`);

    document.getElementById('addChapBtn').onclick = async () => {
        const name = document.getElementById('chapInp').value;
        if(!name) return;
        await addDoc(collection(db, "chapters"), { name, subject: userGlobal.subject });
        alert("Chapter Created!"); location.reload();
    };

    document.getElementById('pubQuizBtn').onclick = async () => {
        const file = document.getElementById('quizImg').files[0];
        if(!file) return alert("Select Image");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            await addDoc(collection(db, "quizzes"), {
                image: reader.result, answer: document.getElementById('quizAns').value,
                chapter: select.value, subject: userGlobal.subject, type: 'topic-wise',
                createdAt: serverTimestamp()
            });
            alert("Quiz Image Published!");
        };
    };
}

// --- STUDENT PANEL ---
function renderStudent() {
    document.getElementById('coinBox').classList.remove('hidden');
    document.getElementById('bpDisplay').innerText = userGlobal.bpcoins;
    const body = document.getElementById('appBody');
    body.innerHTML = `
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="glass-card p-6 rounded-[2rem] text-center border-slate-800">
                <div class="text-[9px] font-black text-slate-500 uppercase mb-1">Rank</div>
                <div class="text-xl font-black italic text-yellow-500 uppercase">Warrior</div>
            </div>
            <div class="glass-card p-6 rounded-[2rem] text-center border-slate-800">
                <div class="text-[9px] font-black text-slate-500 uppercase mb-1">Status</div>
                <div class="text-xl font-black italic text-green-500 uppercase">Active</div>
            </div>
        </div>
        <button onclick="window.startQuiz()" class="w-full p-8 bg-yellow-600 rounded-[2.5rem] flex justify-between items-center text-black shadow-xl shadow-yellow-600/10 active:scale-95 transition">
            <div class="text-left">
                <div class="text-[10px] font-black uppercase opacity-60">Practice Mode</div>
                <div class="text-xl font-black italic uppercase">Start Quiz</div>
            </div>
            <i class="fas fa-brain text-2xl"></i>
        </button>
    `;
}

window.startQuiz = async () => {
    const snap = await getDocs(collection(db, "quizzes"));
    let quizArr = []; snap.forEach(d => quizArr.push(d.data()));
    if(quizArr.length === 0) return alert("No questions available yet.");

    document.getElementById('modal').classList.remove('hidden');
    const content = document.getElementById('modalContent');
    let idx = 0;
    
    const showQ = () => {
        content.innerHTML = `
            <div class="max-w-xl mx-auto animate-fade-in">
                <p class="text-[10px] text-slate-500 font-black mb-4 uppercase">Question ${idx+1} of ${quizArr.length}</p>
                <div class="bg-black p-2 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl mb-8 overflow-hidden">
                    <img src="${quizArr[idx].image}" class="w-full rounded-[2rem] object-contain max-h-[400px]">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    ${['A','B','C','D'].map(o => `
                        <button onclick="window.checkAnswer('${o}', '${quizArr[idx].answer}')" class="py-5 bg-slate-900 rounded-2xl font-black text-xl border border-slate-800 hover:bg-yellow-600 hover:text-black transition">
                            ${o}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    };

    window.checkAnswer = async (sel, cor) => {
        if(sel === cor) {
            await updateDoc(doc(db, "users", userGlobal.uid), { bpcoins: increment(10) });
            alert("Correct! +10 BP");
        } else {
            alert("Wrong! Correct was " + cor);
        }
        if(idx < quizArr.length - 1) { idx++; showQ(); } 
        else { alert("Quiz Finished!"); location.reload(); }
    };
    showQ();
};

window.closeModal = () => document.getElementById('modal').classList.add('hidden');

// --- ADMIN PANEL ---
async function renderAdmin() {
    const body = document.getElementById('appBody');
    body.innerHTML = `<h2 class="text-red-500 font-black italic mb-6 uppercase tracking-widest">Master Admin</h2><div id="admList" class="space-y-3"></div>`;
    const snap = await getDocs(collection(db, "quizzes"));
    const list = document.getElementById('admList');
    snap.forEach(d => {
        list.innerHTML += `
            <div class="p-5 glass-card rounded-2xl flex justify-between items-center border-slate-800">
                <span class="text-xs font-bold uppercase">${d.data().chapter} - ${d.data().subject}</span>
                <button onclick="window.delDoc('quizzes', '${d.id}')" class="text-red-500 font-black text-[10px] uppercase">Delete</button>
            </div>
        `;
    });
}
window.delDoc = async (col, id) => { if(confirm("Delete this?")) { await deleteDoc(doc(db, col, id)); location.reload(); } };
                    
