import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, addDoc, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
ll
const SYLLABUS = {
    "01. Biology": ["The Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology of Flowering Plants", "Structural Organisation", "Cell: The Unit of Life", "Biomolecules"],
    "02. Physics": ["Units and Measurements", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power", "System of Particles"],
    "03. Chemistry": ["Some Basic Concepts", "Structure of Atom", "Classification of Elements", "Chemical Bonding", "Thermodynamics", "Equilibrium"]
};

let currentTab = 'study';
let navHistory = [];
let userData = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            const u = snap.data();
            if (u && u.approved) {
                userData = u;
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                initUserInterface();
            } else if (u) {
                alert("Account Pending Approval by Admin.");
                signOut(auth);
            }
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

function initUserInterface() {
    const r = userData.role;
    document.getElementById('adminPanel').classList.toggle('hidden', r !== 'admin');
    document.getElementById('teacherPanel').classList.toggle('hidden', r !== 'teacher');
    document.getElementById('coins').innerText = userData.bpcoins || 0;
    
    if(r === 'admin') loadAdminData();
    if(r === 'teacher') loadTeacherForm();
    renderSubjects();
}

window.changeTab = (tab) => {
    currentTab = tab;
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active', 'text-yellow-500'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.add('text-slate-500'));
    const activeTab = document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
    activeTab.classList.add('active', 'text-yellow-500');
    navHistory = [];
    renderSubjects();
};

document.getElementById('globalBackBtn').onclick = () => {
    if(navHistory.length > 0) {
        const lastPage = navHistory.pop();
        lastPage();
    }
};

function renderSubjects() {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">${currentTab === 'study' ? "Let's Study" : "NCERT Books"}</h2>`;
    
    Object.keys(SYLLABUS).forEach(sub => {
        const div = document.createElement('div');
        div.className = "p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex justify-between items-center cursor-pointer hover:border-yellow-600 transition-all active:scale-95";
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-black italic">${sub.charAt(0)}${sub.charAt(1)}</div>
                <div>
                    <h3 class="font-black italic uppercase text-sm tracking-tight">${sub.split('. ')[1]}</h3>
                    <p class="text-[8px] text-slate-600 uppercase font-bold tracking-widest">NEET 2026 Syllabus</p>
                </div>
            </div>
            <i class="fas fa-arrow-right text-slate-800"></i>`;
        div.onclick = () => {
            navHistory.push(() => renderSubjects());
            renderChapters(sub);
        };
        grid.appendChild(div);
    });
}

async function renderChapters(subject) {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<div class="mb-6"><span class="text-yellow-500 text-[9px] font-black uppercase tracking-widest">${subject}</span><h2 class="text-2xl font-black italic uppercase">Chapters</h2></div>`;
    
    const contentType = currentTab === 'study' ? 'video' : 'pdf';
    const q = query(collection(db, "materials"), where("subject", "==", subject), where("type", "==", contentType));
    const snap = await getDocs(q);
    const uniqueChapters = [...new Set(snap.docs.map(doc => doc.data().chapter))];

    if(uniqueChapters.length === 0) grid.innerHTML += `<p class="text-slate-600 text-xs italic">No content uploaded yet.</p>`;

    uniqueChapters.forEach(ch => {
        const div = document.createElement('div');
        div.className = "p-5 bg-slate-800/40 rounded-3xl mb-3 border border-slate-800 flex justify-between items-center cursor-pointer active:scale-95";
        div.innerHTML = `<span class="font-bold text-sm tracking-tight">${ch}</span><i class="fas fa-plus text-[10px] text-slate-700"></i>`;
        div.onclick = () => {
            navHistory.push(() => renderChapters(subject));
            renderTopics(subject, ch);
        };
        grid.appendChild(div);
    });
}

async function renderTopics(subject, chapter) {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-lg font-black text-slate-400 mb-6 italic border-l-4 border-yellow-500 pl-4">${chapter}</h2>`;
    
    const contentType = currentTab === 'study' ? 'video' : 'pdf';
    const q = query(collection(db, "materials"), where("subject", "==", subject), where("chapter", "==", chapter), where("type", "==", contentType));
    const snap = await getDocs(q);

    snap.forEach((docSnap, index) => {
        const d = docSnap.data();
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-950 rounded-2xl mb-3 flex justify-between items-center border border-slate-900";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-[9px] font-black text-slate-700">${index + 1}</span>
                <span class="text-xs font-semibold text-slate-300">${d.topic}</span>
            </div>
            <a href="${d.link}" target="_blank" onclick="rewardUser()" class="${contentType==='video'?'bg-red-600':'bg-blue-600'} text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter shadow-lg">${contentType==='video'?'Watch':'Download'}</a>`;
        grid.appendChild(div);
    });
}

async function loadAdminData() {
    const container = document.getElementById('adminUserTable');
    const q = query(collection(db, "users"), where("approved", "==", false));
    onSnapshot(q, (snap) => {
        container.innerHTML = "";
        snap.forEach(uDoc => {
            const u = uDoc.data();
            const div = document.createElement('div');
            div.className = "p-5 bg-slate-900 rounded-3xl border border-red-900/20 flex justify-between items-center shadow-xl";
            div.innerHTML = `
                <div>
                    <div class="text-xs font-black uppercase text-slate-200">${u.name}</div>
                    <div class="text-[9px] font-mono text-yellow-500 mt-1">Txn: ${u.txn || 'No ID'}</div>
                </div>
                <button onclick="approveUser('${uDoc.id}')" class="bg-green-600 text-[10px] font-black px-4 py-2 rounded-xl active:scale-90">APPROVE</button>`;
            container.appendChild(div);
        });
    });
}

window.approveUser = async (id) => { await updateDoc(doc(db, "users", id), { approved: true }); };

function loadTeacherForm() {
    const subSel = document.getElementById('upSubject');
    subSel.innerHTML = "";
    Object.keys(SYLLABUS).forEach(s => subSel.innerHTML += `<option value="${s}">${s}</option>`);
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
    if(!data.chapter || !data.topic || !data.link) return alert("Fill all details");
    await addDoc(collection(db, "materials"), data);
    alert("Content Published Successfully!");
};

window.rewardUser = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { bpcoins: (userData.bpcoins || 0) + 5 });
};

document.getElementById('toggleAuth').onclick = () => {
    const isLogin = document.getElementById('signupFields').classList.contains('hidden');
    document.getElementById('signupFields').classList.toggle('hidden');
    document.getElementById('authBtn').innerText = isLogin ? 'Create Account' : 'Continue';
};

document.getElementById('authBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const isSignup = !document.getElementById('signupFields').classList.contains('hidden');

    try {
        if(isSignup) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name: document.getElementById('regName').value,
                city: document.getElementById('regCity').value,
                txn: document.getElementById('regTxn').value,
                role: document.getElementById('regRole').value,
                email, approved: false, bpcoins: 0
            });
            alert("Application Sent! Please wait for Admin Approval.");
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch(e) { document.getElementById('authMsg').innerText = e.message; }
};

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
