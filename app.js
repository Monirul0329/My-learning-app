import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, orderBy, limit, addDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

let userData = null;
let selectedRole = 'student';
let rewardTimer = null;
let activeTeacherSubject = null;

// --- AUTH & ROLE HANDLING ---
window.setAuthRole = (role) => {
    selectedRole = role;
    document.querySelectorAll('#roleSelector button').forEach(btn => {
        btn.classList.remove('bg-yellow-600', 'text-black');
        btn.classList.add('text-slate-500');
    });
    const activeBtn = role === 'student' ? 'roleStud' : (role === 'teacher' ? 'roleTech' : 'roleAdm');
    document.getElementById(activeBtn).classList.add('bg-yellow-600', 'text-black');
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                userData = snap.data();
                if(userData.blocked) { alert("Account Blocked!"); signOut(auth); return; }
                loadDashboard();
            }
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

function loadDashboard() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('mainHeader').classList.remove('hidden');
    document.getElementById('appContent').classList.remove('hidden');
    document.getElementById('roleDisplay').innerText = userData.role;

    const nav = document.getElementById('navTabs');
    nav.innerHTML = '';

    if (userData.role === 'student') {
        document.getElementById('coinBox').classList.remove('hidden');
        nav.innerHTML = `
            <button onclick="renderStudentHome()" class="nav-tab active px-3 pb-2 font-black text-[10px] uppercase">Home</button>
            <button onclick="renderStudentPrime()" class="nav-tab px-3 pb-2 font-black text-[10px] uppercase">Prime</button>
            <button onclick="renderStudentPractice()" class="nav-tab px-3 pb-2 font-black text-[10px] uppercase">Practice</button>
            <button onclick="renderNCERT()" class="nav-tab px-3 pb-2 font-black text-[10px] uppercase">NCERT/PYQ</button>
            <button onclick="renderRank()" class="nav-tab px-3 pb-2 font-black text-[10px] uppercase">Rank</button>
        `;
        renderStudentHome();
    } else if (userData.role === 'teacher') {
        nav.innerHTML = `<button class="nav-tab active px-3 pb-2 font-black text-[10px] uppercase">Teacher Panel</button>`;
        renderTeacherPanel();
    } else if (userData.role === 'admin') {
        nav.innerHTML = `
            <button onclick="renderAdminUsers()" class="nav-tab active px-3 pb-2 font-black text-[10px] uppercase">Users</button>
            <button onclick="renderAdminRequests()" class="nav-tab px-3 pb-2 font-black text-[10px] uppercase">Payments</button>
        `;
        renderAdminUsers();
    }
}

// --- TEACHER PANEL (CHAPTER & CONTENT MANAGEMENT) ---
window.renderTeacherPanel = () => {
    const container = document.getElementById('viewContainer');
    if(!activeTeacherSubject) {
        container.innerHTML = `<h2 class="text-yellow-500 font-black text-xs uppercase mb-4 italic">Select Department</h2>`;
        ["Biology", "Physics", "Chemistry"].forEach(s => {
            container.innerHTML += `<button onclick="setTeacherSubject('${s}')" class="w-full p-6 bg-slate-900 rounded-[2rem] border border-slate-800 mb-3 font-black uppercase italic">${s}</button>`;
        });
        return;
    }

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-yellow-500 font-black text-xs uppercase italic">${activeTeacherSubject} Control</h2>
            <button onclick="activeTeacherSubject=null;renderTeacherPanel()" class="text-[9px] text-slate-500 underline">Switch Subject</button>
        </div>
        <div class="space-y-4">
            <div class="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
                <h3 class="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Create Chapter Structure</h3>
                <input type="text" id="tChap" placeholder="Chapter Name" class="w-full p-4 rounded-xl mb-2 text-xs">
                <input type="text" id="tTopic" placeholder="Topic Name" class="w-full p-4 rounded-xl mb-4 text-xs">
                <button onclick="saveStructure()" class="w-full bg-yellow-600 text-black py-3 rounded-xl font-black uppercase text-[10px]">Save Structure</button>
            </div>
            <div class="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
                <h3 class="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Upload Content</h3>
                <select id="tType" class="w-full p-4 rounded-xl mb-2 text-xs">
                    <option value="video">Premium Video</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="book">NCERT Reading</option>
                    <option value="pyq">Previous Year Quest</option>
                </select>
                <input type="text" id="tTargetChap" placeholder="Exact Chapter Name" class="w-full p-4 rounded-xl mb-2 text-xs">
                <input type="text" id="tLink" placeholder="Drive/YouTube/Quiz URL" class="w-full p-4 rounded-xl mb-4 text-xs">
                <button onclick="saveContent()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px]">Publish Content</button>
            </div>
        </div>
    `;
};

window.setTeacherSubject = (s) => { activeTeacherSubject = s; renderTeacherPanel(); };

window.saveStructure = async () => {
    const chapter = document.getElementById('tChap').value;
    const topic = document.getElementById('tTopic').value;
    if(!chapter || !topic) return;
    await addDoc(collection(db, "structure"), { subject: activeTeacherSubject, chapter, topic });
    alert("Structure Added!");
    document.getElementById('tChap').value = '';
};

window.saveContent = async () => {
    const type = document.getElementById('tType').value;
    const chapter = document.getElementById('tTargetChap').value;
    const link = document.getElementById('tLink').value;
    if(!chapter || !link) return;
    await addDoc(collection(db, "materials"), { subject: activeTeacherSubject, chapter, link, type, time: serverTimestamp() });
    alert("Material Uploaded!");
    document.getElementById('tLink').value = '';
};

// --- STUDENT CONTENT & GATING ---
window.renderStudentHome = () => {
    setActiveTab('Home');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `
        <div class="bg-yellow-600/10 border border-yellow-500/20 p-6 rounded-[2.5rem] mb-6">
            <h2 class="text-xl font-black italic text-yellow-500 uppercase">Live Now</h2>
            <div id="liveFeed" class="mt-4">Checking for sessions...</div>
        </div>
        ${!userData.paid ? `
            <div class="bg-slate-900 p-6 rounded-[2.5rem] border border-red-500/20 text-center">
                <h3 class="text-red-500 font-black text-xs uppercase mb-2">Unpaid Account</h3>
                <p class="text-[9px] text-slate-400 mb-4 italic">Complete payment to unlock all features.</p>
                <input type="text" id="txId" placeholder="Enter Transaction ID" class="w-full p-4 rounded-xl text-xs mb-2 text-center">
                <button onclick="submitPayRequest()" class="w-full bg-yellow-600 text-black py-4 rounded-xl font-black uppercase text-xs">Unlock Now</button>
            </div>
        ` : `<div class="p-5 bg-green-600/10 border border-green-600/20 rounded-[2rem] text-green-500 text-center font-black text-[10px] uppercase italic">Premium Access Active</div>`}
    `;
    fetchLive();
};

window.submitPayRequest = async () => {
    const tid = document.getElementById('txId').value;
    if(!tid) return;
    await addDoc(collection(db, "pay_requests"), { uid: auth.currentUser.uid, name: userData.name, tid, status: 'pending', time: serverTimestamp() });
    alert("Request Sent! Admin will verify soon.");
};

// Gating Logic
function checkLock() { if(!userData.paid) { alert("This section is LOCKED!"); renderStudentHome(); return false; } return true; }

window.renderStudentPrime = () => { if(checkLock()) renderSubMenu('video'); };
window.renderStudentPractice = () => { if(checkLock()) renderSubMenu('quiz'); };
window.renderNCERT = () => { if(checkLock()) renderSubMenu('book'); };

function renderSubMenu(type) {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-yellow-500 font-black text-xs uppercase mb-4 italic">Select Subject</h2>`;
    ["Biology", "Physics", "Chemistry"].forEach(sub => {
        container.innerHTML += `<div onclick="renderChapterList('${sub}', '${type}')" class="p-6 bg-slate-900 rounded-[2rem] border border-slate-800 mb-3 flex justify-between cursor-pointer font-black uppercase text-xs italic"><span>${sub}</span><i class="fas fa-arrow-right"></i></div>`;
    });
}

async function renderChapterList(sub, type) {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-slate-500 font-black text-[10px] uppercase mb-4">${sub} > Content</h2>`;
    const q = query(collection(db, "materials"), where("subject", "==", sub), where("type", "==", type));
    const snap = await getDocs(q);
    snap.forEach(d => {
        const m = d.data();
        container.innerHTML += `<div class="p-4 bg-slate-900 rounded-2xl mb-2 flex justify-between border border-slate-800"><span class="text-xs font-bold uppercase">${m.chapter}</span><button onclick="openContent('${m.link}', '${m.chapter}', '${type}')" class="bg-yellow-600 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase">Open</button></div>`;
    });
}

// --- RANK & LEVELS ---
window.renderRank = () => {
    if(!checkLock()) return;
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-red-500 font-black text-xs uppercase mb-6 italic tracking-tighter">Global Leaderboard</h2><div id="rankList" class="space-y-3"></div>`;
    const q = query(collection(db, "users"), where("role", "==", "student"), orderBy("bpcoins", "desc"), limit(20));
    onSnapshot(q, (snap) => {
        const list = document.getElementById('rankList');
        list.innerHTML = '';
        let i = 1;
        snap.forEach(d => {
            const u = d.data();
            const zone = i <= 3 ? "Promotion" : (i > 15 ? "Demotion" : "Stay");
            list.innerHTML += `<div class="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center"><div class="flex gap-4"><b>#${i++}</b><div><div class="text-xs font-black uppercase">${u.name}</div><div class="text-[7px] uppercase font-bold text-slate-500">${zone} Zone</div></div></div><b class="text-yellow-500 text-xs">${u.bpcoins || 0} BP</b></div>`;
        });
    });
};

// --- AUTH ACTIONS ---
document.getElementById('authBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const isSignup = !document.getElementById('signupFields').classList.contains('hidden');
    try {
        if(isSignup) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), { name: document.getElementById('regName').value, city: document.getElementById('regCity').value, role: selectedRole, email, paid: false, blocked: false, bpcoins: 0 });
        } else await signInWithEmailAndPassword(auth, email, pass);
    } catch(err) { document.getElementById('authMsg').innerText = err.message; }
};

document.getElementById('forgotBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    if(email) { await sendPasswordResetEmail(auth, email); alert("Password Reset Email Sent!"); }
    else alert("Please enter email first!");
};

// UI Core Utilities
function setActiveTab(label) {
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.remove('active', 'text-yellow-500');
        if(t.innerText.toLowerCase() === label.toLowerCase()) t.classList.add('active', 'text-yellow-500');
    });
}

window.openContent = (link, title, type) => {
    document.getElementById('contentModal').classList.remove('hidden');
    document.getElementById('modalTitle').innerText = title;
    const area = document.getElementById('playerArea');
    if(type === 'video') {
        let url = link.includes('youtube.com') ? link.replace('watch?v=', 'embed/') : link.replace('/view', '/preview');
        area.innerHTML = `<div class="aspect-video bg-black rounded-2xl overflow-hidden mb-4"><iframe src="${url}" class="w-full h-full" allowfullscreen allow="autoplay"></iframe></div><div id="chatBox" class="bg-slate-900 p-4 rounded-2xl h-[300px] overflow-y-auto no-scrollbar"></div>`;
        clearInterval(rewardTimer);
        rewardTimer = setInterval(async () => {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { bpcoins: (userData.bpcoins || 0) + 4 });
        }, 60000);
    } else area.innerHTML = `<iframe src="${link}" class="w-full h-full min-h-[500px] rounded-2xl border-0"></iframe>`;
};

document.getElementById('closeModal').onclick = () => { document.getElementById('contentModal').classList.add('hidden'); clearInterval(rewardTimer); };
document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
document.getElementById('toggleAuth').onclick = () => document.getElementById('signupFields').classList.toggle('hidden');
document.getElementById('globalBackBtn').onclick = () => renderStudentHome();
        
