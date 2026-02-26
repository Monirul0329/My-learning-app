import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, orderBy, limit, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
let activeSub = null;
let rewardInt = null;

// --- ROLE GATE ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                userData = snap.data();
                if(userData.blocked) { alert("Blocked!"); signOut(auth); return; }
                setupDashboard();
            }
        });
    } else showAuth();
});

function setupDashboard() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('mainHeader').classList.remove('hidden');
    document.getElementById('appContent').classList.remove('hidden');
    document.getElementById('roleLabel').innerText = userData.role;

    const nav = document.getElementById('navBar');
    nav.innerHTML = '';

    if (userData.role === 'student') {
        nav.innerHTML = `
            <button onclick="renderStudentHome()" class="nav-tab active px-3 font-black text-[10px] uppercase whitespace-nowrap">Home</button>
            <button onclick="renderStudentPrime()" class="nav-tab px-3 font-black text-[10px] uppercase whitespace-nowrap">Prime</button>
            <button onclick="renderStudentPractice()" class="nav-tab px-3 font-black text-[10px] uppercase whitespace-nowrap">Practice</button>
            <button onclick="renderLibrary()" class="nav-tab px-3 font-black text-[10px] uppercase whitespace-nowrap">NCERT/PYQ</button>
            <button onclick="renderLeaderboard()" class="nav-tab px-3 font-black text-[10px] uppercase whitespace-nowrap">Rank</button>
        `;
        renderStudentHome();
    } else if (userData.role === 'teacher') {
        nav.innerHTML = `<button onclick="renderTeacherDashboard()" class="nav-tab active px-3 font-black text-[10px] uppercase whitespace-nowrap">Teacher Panel</button>`;
        renderTeacherDashboard();
    } else if (userData.role === 'admin') {
        nav.innerHTML = `
            <button onclick="renderAdminUsers()" class="nav-tab active px-3 font-black text-[10px] uppercase whitespace-nowrap">User Control</button>
            <button onclick="renderAdminPayments()" class="nav-tab px-3 font-black text-[10px] uppercase whitespace-nowrap">Payments</button>
        `;
        renderAdminUsers();
    }
}

// --- STUDENT FLOW ---

window.renderStudentHome = () => {
    updateNav('Home');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `
        <div class="bg-yellow-600/10 border border-yellow-500/20 p-6 rounded-[2.5rem] mb-6">
            <h2 class="text-xl font-black italic text-yellow-500 uppercase">Live Lecture</h2>
            <div id="liveView" class="mt-4">Loading...</div>
        </div>
        ${!userData.paid ? `
            <div class="bg-slate-900 p-6 rounded-[2.5rem] border border-red-500/20">
                <h3 class="text-red-500 font-black text-xs uppercase mb-2">Payment Required</h3>
                <p class="text-[9px] text-slate-400 mb-4">Access Prime Lectures, Quiz, Books & Ranking.</p>
                <input type="text" id="txId" placeholder="Enter Transaction ID" class="w-full bg-slate-950 p-4 rounded-xl text-xs mb-2 border border-slate-800">
                <button onclick="submitPayment()" class="w-full bg-yellow-600 text-black py-4 rounded-xl font-black uppercase text-xs">Unlock All Features</button>
            </div>
        ` : `<div class="p-5 bg-green-500/10 border border-green-500/20 rounded-3xl text-green-500 text-center font-black text-[10px] uppercase italic">Premium Student Access Active</div>`}
    `;
    fetchLive();
};

window.renderStudentPrime = () => {
    if(!userData.paid) { renderLockScreen(); return; }
    updateNav('Prime');
    renderSubjectMenu('video');
};

window.renderStudentPractice = () => {
    if(!userData.paid) { renderLockScreen(); return; }
    updateNav('Practice');
    renderSubjectMenu('quiz');
};

function renderSubjectMenu(type) {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-yellow-500 font-black text-xs uppercase mb-4 italic">Choose Subject</h2>`;
    ["Biology", "Physics", "Chemistry"].forEach(sub => {
        const div = document.createElement('div');
        div.className = "p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 mb-3 flex justify-between cursor-pointer";
        div.innerHTML = `<span class="font-black italic uppercase text-slate-200">${sub}</span><i class="fas fa-play-circle text-yellow-500"></i>`;
        div.onclick = () => renderChapterGrid(sub, type);
        container.appendChild(div);
    });
}

// --- TEACHER FLOW ---

window.renderTeacherDashboard = () => {
    updateNav('Teacher Panel');
    const container = document.getElementById('viewContainer');
    if(!activeSub) {
        container.innerHTML = `<h2 class="text-yellow-500 font-black text-xs uppercase mb-4 italic">Department</h2>`;
        ["Biology", "Physics", "Chemistry"].forEach(s => {
            const btn = document.createElement('button');
            btn.className = "w-full p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 mb-3 font-black uppercase italic";
            btn.innerText = s;
            btn.onclick = () => { activeSub = s; renderTeacherDashboard(); };
            container.appendChild(btn);
        });
        return;
    }

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-yellow-500 font-black text-xs uppercase italic">${activeSub} Management</h2>
            <button onclick="activeSub=null;renderTeacherDashboard()" class="text-[9px] text-slate-500 underline">Switch</button>
        </div>
        <div class="space-y-4">
            <div class="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
                <h3 class="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Add Structure</h3>
                <input type="text" id="tChap" placeholder="Chapter Name" class="w-full bg-slate-950 p-4 rounded-xl mb-2 text-xs">
                <input type="text" id="tTopic" placeholder="Topic Name" class="w-full bg-slate-950 p-4 rounded-xl mb-4 text-xs">
                <button onclick="saveStructure()" class="w-full bg-yellow-600 text-black py-3 rounded-xl font-black uppercase text-[10px]">Create Chapter/Topic</button>
            </div>
            <div class="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
                <h3 class="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">Upload Content</h3>
                <select id="tType" class="w-full bg-slate-950 p-4 rounded-xl mb-2 text-xs text-slate-400">
                    <option value="video">Lecture Video</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="book">NCERT PDF Link</option>
                </select>
                <input type="text" id="tTargetChap" placeholder="Target Chapter Name" class="w-full bg-slate-950 p-4 rounded-xl mb-2 text-xs">
                <input type="text" id="tLink" placeholder="Link (Drive/Youtube/Quiz)" class="w-full bg-slate-950 p-4 rounded-xl mb-4 text-xs">
                <button onclick="saveContent()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-[10px]">Publish Content</button>
            </div>
        </div>
    `;
};

window.saveStructure = async () => {
    const chapter = document.getElementById('tChap').value;
    const topic = document.getElementById('tTopic').value;
    if(!chapter || !topic) return;
    await addDoc(collection(db, "structure"), { subject: activeSub, chapter, topic, time: serverTimestamp() });
    alert("Chapter Created!");
    document.getElementById('tChap').value = '';
};

window.saveContent = async () => {
    const type = document.getElementById('tType').value;
    const chapter = document.getElementById('tTargetChap').value;
    const link = document.getElementById('tLink').value;
    if(!chapter || !link) return;
    await addDoc(collection(db, "materials"), { subject: activeSub, chapter, link, type, time: serverTimestamp() });
    alert("Content Published!");
    document.getElementById('tLink').value = '';
};

// --- RANK SYSTEM ---

window.renderLeaderboard = () => {
    if(!userData.paid) { renderLockScreen(); return; }
    updateNav('Rank');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-red-500 font-black text-xs uppercase mb-6 italic">Global Ranking</h2><div id="rankBody" class="space-y-3"></div>`;
    
    const q = query(collection(db, "users"), where("role", "==", "student"), orderBy("bpcoins", "desc"), limit(20));
    onSnapshot(q, (snap) => {
        const body = document.getElementById('rankBody');
        body.innerHTML = '';
        let i = 1;
        snap.forEach(d => {
            const u = d.data();
            const bp = u.bpcoins || 0;
            let zone = i <= 3 ? "Promotion" : (i > 15 ? "Demotion" : "Stay");
            let color = i <= 3 ? "text-green-500" : (i > 15 ? "text-red-500" : "text-slate-500");
            body.innerHTML += `
                <div class="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div class="flex gap-4 items-center">
                        <span class="text-slate-600 font-black italic">#${i++}</span>
                        <div>
                            <div class="text-xs font-black uppercase">${u.name}</div>
                            <div class="text-[7px] font-bold ${color} uppercase tracking-widest">${zone} Zone</div>
                        </div>
                    </div>
                    <div class="text-yellow-500 font-black text-xs">${bp} BP</div>
                </div>
            `;
        });
    });
};

// --- ADMIN FINANCE & USERS ---

window.renderAdminUsers = async () => {
    updateNav('User Control');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-slate-500 font-black text-[10px] uppercase mb-4 italic">Student Management</h2>`;
    const snap = await getDocs(collection(db, "users"));
    snap.forEach(d => {
        const u = d.data();
        const div = document.createElement('div');
        div.className = "p-5 bg-slate-900 rounded-[2.5rem] border border-slate-800 mb-3";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <div class="text-xs font-black uppercase">${u.name} <span class="text-slate-500">(${u.city})</span></div>
                    <div class="text-[9px] text-slate-600 font-bold">${u.email}</div>
                </div>
                <div class="text-[10px] font-black ${u.paid?'text-green-500':'text-red-500'} italic uppercase">${u.paid?'Paid':'Unpaid'}</div>
            </div>
            <div class="flex gap-2">
                <button onclick="setPaid('${d.id}', ${u.paid})" class="flex-1 bg-blue-600/10 text-blue-500 text-[8px] font-black py-2 rounded-xl border border-blue-500/10 uppercase">Toggle Payment</button>
                <button onclick="setBlock('${d.id}', ${u.blocked})" class="flex-1 bg-red-600/10 text-red-500 text-[8px] font-black py-2 rounded-xl border border-red-500/10 uppercase">Block User</button>
            </div>
        `;
        container.appendChild(div);
    });
};

window.renderAdminPayments = async () => {
    updateNav('Payments');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-yellow-500 font-black text-[10px] uppercase mb-4 italic">Verification Requests</h2>`;
    const q = query(collection(db, "pay_requests"), where("status", "==", "pending"));
    const snap = await getDocs(q);
    snap.forEach(d => {
        const r = d.data();
        container.innerHTML += `
            <div class="p-5 bg-slate-900 rounded-2xl border border-slate-800 mb-2">
                <div class="text-xs font-bold uppercase">${r.name}</div>
                <div class="text-[10px] text-yellow-600 font-mono my-2">TXID: ${r.txId}</div>
                <button onclick="approvePay('${d.id}', '${r.uid}')" class="w-full bg-green-600 text-black font-black text-[9px] py-2 rounded-lg uppercase">Approve & Unlock</button>
            </div>
        `;
    });
};

// --- HELPERS ---

window.submitPayment = async () => {
    const txId = document.getElementById('txId').value;
    if(!txId) return;
    await addDoc(collection(db, "pay_requests"), { uid: auth.currentUser.uid, name: userData.name, txId, status: "pending", time: serverTimestamp() });
    alert("Request Sent! Admin will verify shortly.");
};

window.approvePay = async (reqId, userId) => {
    await updateDoc(doc(db, "users", userId), { paid: true });
    await deleteDoc(doc(db, "pay_requests", reqId));
    renderAdminPayments();
};

window.openPlayer = (link, title, type) => {
    document.getElementById('playerModal').classList.remove('hidden');
    document.getElementById('modalTitle').innerText = title;
    const body = document.getElementById('modalBody');
    
    if(type === 'video') {
        let url = link.includes('youtube.com') ? link.replace('watch?v=', 'embed/') : link.replace('/view', '/preview');
        body.innerHTML = `
            <div class="aspect-video bg-black rounded-2xl overflow-hidden mb-4"><iframe src="${url}" class="w-full h-full" allowfullscreen></iframe></div>
            <div class="flex-1 bg-slate-900/50 rounded-2xl p-4 flex flex-col h-[300px]">
                <div id="chatBox" class="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-4"></div>
                <div class="flex gap-2">
                    <input type="text" id="cIn" placeholder="Ask something..." class="flex-1 bg-slate-950 p-3 rounded-xl text-xs outline-none border border-slate-800">
                    <button onclick="sendChat('${title}')" class="bg-yellow-600 text-black px-4 rounded-xl"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        // Reward Logic
        clearInterval(rewardInt);
        rewardInt = setInterval(async () => {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { bpcoins: (userData.bpcoins || 0) + 4 });
        }, 60000);
    } else {
        body.innerHTML = `<iframe src="${link}" class="w-full h-full border-0 rounded-2xl min-h-[500px]"></iframe>`;
    }
};

window.sendChat = async (vid) => {
    const input = document.getElementById('cIn');
    if(!input.value.trim()) return;
    await addDoc(collection(db, "chats"), { vid, user: userData.name, msg: input.value, time: serverTimestamp() });
    input.value = '';
};

function renderLockScreen() {
    updateNav('Locked');
    document.getElementById('viewContainer').innerHTML = `
        <div class="flex flex-col items-center justify-center mt-20 text-center">
            <i class="fas fa-lock text-5xl text-slate-800 mb-4"></i>
            <h2 class="text-xl font-black uppercase text-slate-600">Locked Content</h2>
            <p class="text-[10px] text-slate-500 max-w-xs mt-2">Premium students only. Please complete payment from the Home screen to unlock.</p>
        </div>
    `;
}

function updateNav(label) {
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.remove('active', 'text-yellow-500');
        if(t.innerText.toLowerCase() === label.toLowerCase()) t.classList.add('active', 'text-yellow-500');
    });
}

document.getElementById('closeModal').onclick = () => {
    document.getElementById('playerModal').classList.add('hidden');
    document.getElementById('modalBody').innerHTML = '';
    clearInterval(rewardInt);
};

document.getElementById('authBtn').onclick = async () => {
    const e = document.getElementById('email').value.trim();
    const p = document.getElementById('pass').value.trim();
    const isSignup = !document.getElementById('signupGroup').classList.contains('hidden');
    try {
        if(isSignup) {
            const res = await createUserWithEmailAndPassword(auth, e, p);
            await setDoc(doc(db, "users", res.user.uid), { name: document.getElementById('regName').value, city: document.getElementById('regCity').value, role: document.getElementById('regRole').value, email: e, paid: false, blocked: false, bpcoins: 0 });
        } else await signInWithEmailAndPassword(auth, e, p);
    } catch(err) { alert(err.message); }
};

document.getElementById('toggleAuth').onclick = () => document.getElementById('signupGroup').classList.toggle('hidden');
document.getElementById('globalBackBtn').onclick = () => renderStudentHome();
        
