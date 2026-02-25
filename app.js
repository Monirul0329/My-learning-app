import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const LEVELS = [
    "Medical Novice", "Cortex Activator", "Syllabus Architect", "Master Clinician", "Test-Tube Titan",
    "The Diagnostician", "Vitality Voyager", "Neural Conqueror", "The White-Coat Elite", "LEGENDARY SURGEON"
];

const SYLLABUS = {
    "Biology": ["01. The Living World", "02. Cell Cycle", "03. Human Physiology"],
    "Physics": ["01. Units & Dimensions", "02. Laws of Motion"],
    "Chemistry": ["01. Atomic Structure", "02. Periodic Table"]
};

let userData = null;
let currentTab = 'study';
let navHistory = [];

onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            userData = snap.data();
            if (userData?.blocked) {
                alert("You are BLOCKED by Admin.");
                signOut(auth);
                return;
            }
            document.getElementById('authPage').classList.add('hidden');
            document.getElementById('mainHeader').classList.remove('hidden');
            document.getElementById('appContent').classList.remove('hidden');
            initPanel();
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

function initPanel() {
    const r = userData.role;
    document.getElementById('studentPanel').classList.toggle('hidden', r !== 'student');
    document.getElementById('teacherPanel').classList.toggle('hidden', r !== 'teacher');
    document.getElementById('adminPanel').classList.toggle('hidden', r !== 'admin');
    
    updateLevelDisplay();
    if(r === 'student') renderSubjects();
    if(r === 'teacher') loadTeacherControls();
    if(r === 'admin') loadAdminDashboard();
}

function updateLevelDisplay() {
    const coins = userData.bpcoins || 0;
    const levelIdx = Math.min(Math.floor(coins / 500), 9);
    document.getElementById('userLevelDisplay').innerText = `Level: ${LEVELS[levelIdx]}`;
    document.getElementById('coins').innerText = coins;
}

function renderSubjects() {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Subjects</h2>`;
    
    Object.keys(SYLLABUS).forEach(sub => {
        const div = document.createElement('div');
        div.className = "p-6 bg-slate-900 rounded-[2rem] border border-slate-800 flex justify-between items-center cursor-pointer";
        div.innerHTML = `<div><div class="text-[8px] font-bold text-yellow-500 mb-1">NEET 2026</div><div class="font-black italic uppercase text-sm">${sub}</div></div><i class="fas fa-chevron-right text-slate-700"></i>`;
        div.onclick = () => { navHistory.push(() => renderSubjects()); renderChapters(sub); };
        grid.appendChild(div);
    });
}

async function renderChapters(sub) {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-yellow-500 font-black italic mb-4">${sub}</h2>`;
    SYLLABUS[sub].forEach((ch, idx) => {
        const isLocked = !userData.paid && idx !== 0;
        const div = document.createElement('div');
        div.className = `p-4 bg-slate-800/40 rounded-2xl mb-3 flex justify-between items-center ${isLocked ? 'opacity-40 grayscale pointer-events-none lock-overlay' : 'cursor-pointer'}`;
        div.innerHTML = `<span class="font-bold text-xs">${ch}</span><i class="fas fa-play text-[10px] text-yellow-500"></i>`;
        div.onclick = () => { navHistory.push(() => renderChapters(sub)); renderTopics(sub, ch); };
        grid.appendChild(div);
    });
}

async function renderTopics(sub, ch) {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-slate-500 font-bold mb-4 uppercase text-[10px]">${ch}</h2>`;
    
    const type = currentTab === 'study' ? 'video' : (currentTab === 'quiz' ? 'quiz' : 'pdf');
    const q = query(collection(db, "materials"), where("subject", "==", sub), where("chapter", "==", ch), where("type", "==", type));
    const snap = await getDocs(q);

    snap.forEach((docSnap, i) => {
        const d = docSnap.data();
        const isTopicLocked = !userData.paid && i !== 0;
        const div = document.createElement('div');
        div.className = `p-4 bg-slate-950 rounded-2xl mb-3 flex justify-between items-center border border-slate-900 ${isTopicLocked ? 'opacity-30 pointer-events-none lock-overlay' : ''}`;
        div.innerHTML = `<div class="text-[11px] font-bold">${d.topic}</div><button onclick="openContent('${d.link}', '${d.type}')" class="bg-yellow-600 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase">Open</button>`;
        grid.appendChild(div);
    });
}

async function loadAdminDashboard() {
    const list = document.getElementById('adminUserList');
    onSnapshot(collection(db, "users"), (snap) => {
        list.innerHTML = "";
        snap.forEach(uDoc => {
            const u = uDoc.data();
            if(u.role === 'admin') return;
            const div = document.createElement('div');
            div.className = "p-4 bg-slate-900 rounded-2xl flex justify-between items-center border border-slate-800";
            div.innerHTML = `
                <div><div class="font-bold text-xs">${u.name} (${u.role})</div><div class="text-[9px] text-slate-500">${u.email}</div></div>
                <div class="flex gap-2">
                    <button onclick="toggleBlock('${uDoc.id}', ${u.blocked || false})" class="p-2 bg-red-900/20 text-red-500 rounded-lg text-[10px]">${u.blocked ? 'UNBLOCK' : 'BLOCK'}</button>
                    <button onclick="togglePaid('${uDoc.id}', ${u.paid || false})" class="p-2 bg-green-900/20 text-green-500 rounded-lg text-[10px]">${u.paid ? 'PAID' : 'FREE'}</button>
                    <button onclick="deleteUser('${uDoc.id}')" class="p-2 text-slate-600"><i class="fas fa-trash"></i></button>
                </div>`;
            list.appendChild(div);
        });
    });
}

window.toggleBlock = async (id, current) => { await updateDoc(doc(db, "users", id), { blocked: !current }); };
window.togglePaid = async (id, current) => { await updateDoc(doc(db, "users", id), { paid: !current }); };
window.deleteUser = async (id) => { if(confirm("Delete User?")) await deleteDoc(doc(db, "users", id)); };

window.rewardUser = async (amount) => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), { bpcoins: (userData.bpcoins || 0) + amount });
};

function loadTeacherControls() {
    const sel = document.getElementById('upSubject');
    sel.innerHTML = Object.keys(SYLLABUS).map(s => `<option value="${s}">${s}</option>`).join('');
}

document.getElementById('uploadBtn').onclick = async () => {
    const data = {
        type: document.getElementById('upType').value,
        subject: document.getElementById('upSubject').value,
        chapter: document.getElementById('upChapter').value,
        topic: document.getElementById('upTopic').value,
        link: document.getElementById('upLink').value,
        timestamp: Date.now()
    };
    await addDoc(collection(db, "materials"), data);
    alert("Content Live!");
};

document.getElementById('toggleAuth').onclick = () => {
    const s = document.getElementById('signupFields');
    const isL = s.classList.contains('hidden');
    s.classList.toggle('hidden');
    document.getElementById('authBtn').innerText = isL ? 'JOIN MNEET' : 'CONTINUE';
};

document.getElementById('authBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    const isS = !document.getElementById('signupFields').classList.contains('hidden');
    try {
        if(isS) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name: document.getElementById('regName').value,
                email, role: document.getElementById('regRole').value,
                paid: false, blocked: false, bpcoins: 0
            });
        } else { await signInWithEmailAndPassword(auth, email, pass); }
    } catch(e) { document.getElementById('authMsg').innerText = e.message; }
};

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
document.getElementById('globalBackBtn').onclick = () => { if(navHistory.length > 0) (navHistory.pop())(); };
window.changeTab = (t) => { currentTab = t; renderSubjects(); };
                                
