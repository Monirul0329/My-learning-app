import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, addDoc, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const SYLLABUS = {
    "01. Biology": ["The Living World", "Plant Kingdom", "Cell Cycle", "Human Physiology"],
    "02. Physics": ["Kinematics", "Laws of Motion", "Optics", "Thermodynamics"],
    "03. Chemistry": ["Atomic Structure", "Periodic Table", "Organic Chemistry"]
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
                initApp();
            } else if (u) {
                document.getElementById('authMsg').innerText = "Access Pending. Contact Admin.";
                signOut(auth);
            }
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

function initApp() {
    document.getElementById('adminPanel').classList.toggle('hidden', userData.role !== 'admin');
    document.getElementById('teacherPanel').classList.toggle('hidden', userData.role !== 'teacher');
    document.getElementById('coins').innerText = userData.bpcoins || 0;
    if(userData.role === 'admin') loadAdminData();
    if(userData.role === 'teacher') loadTeacherForm();
    renderSubjects();
}

window.changeTab = (tab) => {
    currentTab = tab;
    document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active', 'text-yellow-500'));
    document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active', 'text-yellow-500');
    navHistory = [];
    renderSubjects();
};

document.getElementById('globalBackBtn').onclick = () => {
    if(navHistory.length > 0) (navHistory.pop())();
};

function renderSubjects() {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-4">NEET 2026 - ${currentTab === 'study' ? 'Lectures' : 'PDFs'}</p>`;
    
    Object.keys(SYLLABUS).forEach(sub => {
        const div = document.createElement('div');
        div.className = "p-5 bg-slate-900 rounded-3xl border border-slate-800 flex justify-between items-center cursor-pointer active:scale-95 transition-all";
        div.innerHTML = `<div class="flex items-center gap-4"><div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-bold">${sub.charAt(1)}</div><span class="font-black italic uppercase text-xs">${sub.split('. ')[1]}</span></div><i class="fas fa-chevron-right text-slate-700"></i>`;
        div.onclick = () => {
            navHistory.push(() => renderSubjects());
            renderChapters(sub);
        };
        grid.appendChild(div);
    });
}

async function renderChapters(subject) {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-yellow-500 font-black italic mb-6 text-xl">${subject}</h2>`;
    
    const q = query(collection(db, "materials"), where("subject", "==", subject), where("type", "==", (currentTab === 'study' ? 'video' : 'pdf')));
    const snap = await getDocs(q);
    const chapters = [...new Set(snap.docs.map(d => d.data().chapter))];

    if(chapters.length === 0) grid.innerHTML += `<p class="text-slate-600 italic text-xs">Empty Chapter.</p>`;

    chapters.forEach(ch => {
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-800/40 rounded-2xl mb-3 border border-slate-800 flex justify-between items-center cursor-pointer";
        div.innerHTML = `<span class="font-bold text-sm">${ch}</span><i class="fas fa-plus text-[10px] text-yellow-500 opacity-50"></i>`;
        div.onclick = () => {
            navHistory.push(() => renderChapters(subject));
            renderTopics(subject, ch);
        };
        grid.appendChild(div);
    });
}

async function renderTopics(subject, chapter) {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-slate-400 font-bold italic mb-6 border-l-4 border-yellow-500 pl-3">${chapter}</h2>`;
    
    const q = query(collection(db, "materials"), where("subject", "==", subject), where("chapter", "==", chapter), where("type", "==", (currentTab === 'study' ? 'video' : 'pdf')));
    const snap = await getDocs(q);

    snap.forEach((docSnap, i) => {
        const d = docSnap.data();
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-950 rounded-2xl mb-3 flex justify-between items-center border border-slate-900";
        div.innerHTML = `<div class="text-xs font-semibold"><span class="text-slate-600 mr-2">${i+1}.</span>${d.topic}</div>
                         <a href="${d.link}" target="_blank" onclick="rewardUser()" class="${currentTab==='study'?'bg-red-600':'bg-blue-600'} px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Open</a>`;
        grid.appendChild(div);
    });
}

async function loadAdminData() {
    const container = document.getElementById('adminUserTable');
    onSnapshot(query(collection(db, "users"), where("approved", "==", false)), (snap) => {
        container.innerHTML = "";
        snap.forEach(uDoc => {
            const u = uDoc.data();
            const div = document.createElement('div');
            div.className = "p-4 bg-slate-900 rounded-2xl flex justify-between items-center border border-red-900/20";
            div.innerHTML = `<div><div class="font-bold text-xs">${u.name}</div><div class="text-[9px] text-yellow-500 font-mono">${u.txn}</div></div>
                             <button onclick="approveUser('${uDoc.id}')" class="bg-green-600 text-[9px] font-black px-4 py-2 rounded-xl">APPROVE</button>`;
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
    await addDoc(collection(db, "materials"), data);
    alert("Live Now!");
};

window.rewardUser = async () => {
    await updateDoc(doc(db, "users", auth.currentUser.uid), { bpcoins: (userData.bpcoins || 0) + 5 });
};

document.getElementById('toggleAuth').onclick = () => {
    const isL = document.getElementById('signupFields').classList.contains('hidden');
    document.getElementById('signupFields').classList.toggle('hidden');
    document.getElementById('authBtn').innerText = isL ? 'Join mNeet' : 'Continue';
};

document.getElementById('authBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const isS = !document.getElementById('signupFields').classList.contains('hidden');
    try {
        if(isS) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name: document.getElementById('regName').value,
                city: document.getElementById('regCity').value,
                txn: document.getElementById('regTxn').value,
                role: document.getElementById('regRole').value,
                email, approved: false, bpcoins: 0
            });
            alert("Sent for Approval.");
        } else { await signInWithEmailAndPassword(auth, email, pass); }
    } catch(e) { document.getElementById('authMsg').innerText = e.message; }
};

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
                
