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
let userGlobalData = null;

// --- AUTH LOGIC ---
window.setRole = (role) => {
    currentRole = role;
    document.querySelectorAll('#roleSelection button').forEach(b => {
        b.classList.remove('btn-active'); b.classList.add('text-slate-500');
    });
    document.getElementById(`role-${role}`).classList.add('btn-active');
    document.getElementById('regSubject').classList.toggle('hidden', role !== 'teacher');
};

window.toggleAuthMode = () => {
    isSignupMode = !isSignupMode;
    document.getElementById('signupFields').classList.toggle('hidden');
    document.getElementById('authBtn').innerText = isSignupMode ? 'Register' : 'Sign In';
};

window.handleAuth = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    if(!email || !pass) return alert("Fill all fields");

    try {
        if(isSignupMode) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            const userData = {
                uid: res.user.uid,
                name: document.getElementById('regName').value,
                email, role: currentRole, 
                subject: currentRole === 'teacher' ? document.getElementById('regSubject').value : 'All',
                bpcoins: 0, attempts: {}, fee: 0, paid: false
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
        userGlobalData = snap.data();
        document.getElementById('authPage').classList.add('hidden');
        document.getElementById('navbar').classList.remove('hidden');
        body.classList.remove('hidden');
        
        if(userGlobalData.role === 'admin') renderAdmin();
        else if(userGlobalData.role === 'teacher') renderTeacher();
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
            <div class="bg-slate-900 p-6 rounded-[2rem] border border-yellow-500/20 shadow-xl">
                <h2 class="text-yellow-500 font-black italic uppercase">${userGlobalData.subject} Panel</h2>
            </div>
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 class="text-[10px] font-black uppercase mb-4 text-slate-500">1. Structure Manager</h3>
                <input type="text" id="chapInp" placeholder="Chapter Name" class="w-full p-4 rounded-xl bg-black border border-slate-800 mb-2">
                <button id="addChapBtn" class="w-full bg-blue-600 py-3 rounded-xl font-black uppercase text-[10px]">Create Chapter</button>
            </div>
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 class="text-[10px] font-black uppercase mb-4 text-slate-500">2. Quiz Builder (Gallery Image)</h3>
                <input type="file" id="quizImgFile" accept="image/*" class="w-full mb-4 text-xs">
                <select id="quizAnsInp" class="w-full p-4 rounded-xl bg-black border border-slate-800 mb-4">
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select>
                <select id="chapSelect" class="w-full p-4 rounded-xl bg-black border border-slate-800 mb-4"></select>
                <button id="pubQuizBtn" class="w-full bg-yellow-600 py-4 rounded-xl font-black text-black uppercase">Publish Question</button>
            </div>
        </div>
    `;

    // Dropdown and Upload Logic
    const chapSnap = await getDocs(query(collection(db, "chapters"), where("subject", "==", userGlobalData.subject)));
    const select = document.getElementById('chapSelect');
    chapSnap.forEach(d => select.innerHTML += `<option value="${d.data().name}">${d.data().name}</option>`);

    document.getElementById('addChapBtn').onclick = async () => {
        const name = document.getElementById('chapInp').value;
        await addDoc(collection(db, "chapters"), { name, subject: userGlobalData.subject });
        alert("Done!"); location.reload();
    };

    document.getElementById('pubQuizBtn').onclick = async () => {
        const file = document.getElementById('quizImgFile').files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            await addDoc(collection(db, "quizzes"), {
                image: reader.result, answer: document.getElementById('quizAnsInp').value,
                chapter: select.value, subject: userGlobalData.subject, type: 'topic-wise'
            });
            alert("Quiz Published!");
        };
    };
}

// --- STUDENT PANEL ---
function renderStudent() {
    document.getElementById('coinBox').classList.remove('hidden');
    document.getElementById('bpDisplay').innerText = `${userGlobalData.bpcoins} BP`;
    const body = document.getElementById('appBody');
    body.innerHTML = `
        <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 text-center">
                <div class="text-[10px] font-black text-slate-500 uppercase">Level</div>
                <div class="text-xl font-black italic text-yellow-500 uppercase">Warrior</div>
            </div>
            <div class="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 text-center">
                <div class="text-[10px] font-black text-slate-500 uppercase">Chapters</div>
                <div class="text-xl font-black italic text-green-500">12%</div>
            </div>
        </div>
        <button onclick="window.startPractice()" class="w-full p-8 bg-yellow-600 rounded-[2.5rem] flex justify-between items-center text-black active:scale-95 transition">
            <span class="text-xl font-black italic uppercase">Practice Quiz</span>
            <i class="fas fa-brain text-2xl"></i>
        </button>
    `;
}

window.startPractice = async () => {
    const snap = await getDocs(collection(db, "quizzes"));
    let quizArr = []; snap.forEach(d => quizArr.push(d.data()));
    if(quizArr.length === 0) return alert("No quiz yet");

    document.getElementById('modal').classList.remove('hidden');
    const content = document.getElementById('modalContent');
    let idx = 0;
    
    const showQ = () => {
        content.innerHTML = `
            <div class="max-w-md mx-auto">
                <img src="${quizArr[idx].image}" class="w-full rounded-3xl border-4 border-slate-800 mb-6">
                <div class="grid grid-cols-2 gap-4">
                    ${['A','B','C','D'].map(o => `<button onclick="window.ans('${o}', '${quizArr[idx].answer}')" class="p-6 bg-slate-900 rounded-2xl font-black text-xl hover:bg-yellow-600 hover:text-black transition">${o}</button>`).join('')}
                </div>
            </div>
        `;
    };
    window.ans = async (sel, cor) => {
        if(sel === cor) await updateDoc(doc(db, "users", userGlobalData.uid), { bpcoins: increment(10) });
        if(idx < quizArr.length - 1) { idx++; showQ(); } else { alert("Quiz Over!"); location.reload(); }
    };
    showQ();
};

window.closeModal = () => document.getElementById('modal').classList.add('hidden');

// --- ADMIN PANEL ---
async function renderAdmin() {
    const body = document.getElementById('appBody');
    body.innerHTML = `<h2 class="text-red-500 font-black italic mb-6">ADMIN PANEL</h2><div id="contentList" class="space-y-3"></div>`;
    const snap = await getDocs(collection(db, "quizzes"));
    const list = document.getElementById('contentList');
    snap.forEach(d => {
        list.innerHTML += `
            <div class="p-4 bg-slate-900 rounded-2xl flex justify-between items-center border border-slate-800">
                <span class="text-xs uppercase font-bold">${d.data().chapter}</span>
                <button onclick="window.delQuiz('${d.id}')" class="text-red-500 font-black text-[10px]">DELETE</button>
            </div>
        `;
    });
}
window.delQuiz = async (id) => { if(confirm("Delete?")) { await deleteDoc(doc(db, "quizzes", id)); location.reload(); } };

