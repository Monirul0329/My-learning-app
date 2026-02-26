import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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
let currentChatSub = null;
let rewardInterval = null;
const LEVELS = ["Novice", "Starter", "Architect", "Master", "Clinician", "Titan", "Voyager", "Conqueror", "Elite", "Legend"];

// UI Navigation History
let currentView = 'Home';

// Auth Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                userData = snap.data();
                if(userData.blocked) { alert("Account Blocked!"); signOut(auth); return; }
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                if(userData.role === 'admin') document.getElementById('tabAdmin').classList.remove('hidden');
                updateTopBar();
                renderHome();
            }
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

function updateTopBar() {
    document.getElementById('coins').innerText = userData.bpcoins || 0;
    const lv = Math.min(Math.floor((userData.bpcoins || 0) / 500), 9);
    document.getElementById('userLevelDisplay').innerText = `Level: ${LEVELS[lv]}`;
}

// Mobile Back Button Logic
history.pushState(null, null, location.href);
window.onpopstate = () => {
    history.pushState(null, null, location.href);
    renderHome();
};

// --- Home/Store View ---
async function renderHome() {
    setActiveTab('tabHome');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `
        <div class="bg-yellow-600/10 border border-yellow-500/20 p-5 rounded-3xl mb-4">
            <h2 class="text-lg font-black italic text-yellow-500 uppercase">Live Stream</h2>
            <div id="liveList" class="mt-3">Searching...</div>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <h3 class="font-black text-slate-200 italic uppercase">mNeet 2026 Batch</h3>
            ${!userData.paid ? `
                <p class="text-[10px] text-slate-500 mt-2 mb-4">Unlock premium video lectures & materials.</p>
                <button onclick="alert('Contact Admin for Payment')" class="w-full bg-yellow-600 text-black py-4 rounded-xl font-black uppercase">Enroll Now</button>
            ` : `<p class="text-green-500 text-[10px] mt-4 font-bold uppercase italic italic"><i class="fas fa-check-circle"></i> Batch Unlocked</p>`}
        </div>
    `;
    const q = query(collection(db, "materials"), where("type", "==", "video"), limit(1));
    const snap = await getDocs(q);
    const list = document.getElementById('liveList');
    if(snap.empty) { list.innerHTML = '<p class="text-slate-700 text-xs italic">No live classes right now.</p>'; }
    snap.forEach(d => {
        const data = d.data();
        list.innerHTML = `<div class="flex justify-between items-center bg-slate-950 p-4 rounded-2xl">
            <span class="text-xs font-bold uppercase">${data.chapter}</span>
            <button onclick="accessVideo('${data.link}', '${data.chapter}')" class="bg-yellow-600 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase">JOIN</button>
        </div>`;
    });
}

window.accessVideo = (link, title) => {
    if(!userData.paid) { alert("This feature is for Paid users."); return; }
    openPlayer(link, title);
};

// --- Prime Lectures View ---
function renderPrime() {
    if(!userData.paid) { alert("Please pay to unlock Prime."); renderHome(); return; }
    setActiveTab('tabPrime');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-yellow-500 font-black text-xs uppercase mb-4">Prime Subjects</h2>`;
    ["Biology", "Physics", "Chemistry"].forEach(sub => {
        const d = document.createElement('div');
        d.className = "p-5 bg-slate-900 rounded-3xl border border-slate-800 mb-3 flex justify-between cursor-pointer";
        d.innerHTML = `<span class="font-black uppercase text-slate-200">${sub}</span><i class="fas fa-play text-yellow-600"></i>`;
        d.onclick = () => renderVideos(sub);
        container.appendChild(d);
    });
}

async function renderVideos(sub) {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-slate-500 font-bold text-xs uppercase mb-4">${sub} Videos</h2>`;
    const q = query(collection(db, "materials"), where("type", "==", "video"), where("subject", "==", sub));
    const snap = await getDocs(q);
    snap.forEach(d => {
        const data = d.data();
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-900 rounded-2xl mb-2 flex justify-between border border-slate-800";
        div.innerHTML = `<span class="text-xs font-bold uppercase">${data.chapter}</span><button onclick="openPlayer('${data.link}', '${data.chapter}')" class="bg-yellow-600 text-black px-4 py-2 rounded-xl text-[9px] font-black">WATCH</button>`;
        container.appendChild(div);
    });
}

window.openPlayer = (link, title) => {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('hidden');
    let url = link.includes('youtube.com') ? link.replace('watch?v=', 'embed/') : link.replace('/view', '/preview');
    document.getElementById('playerBox').innerHTML = `<iframe src="${url}" allowfullscreen allow="autoplay"></iframe>`;
    
    clearInterval(rewardInterval);
    rewardInterval = setInterval(async () => {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { bpcoins: (userData.bpcoins || 0) + 4 });
    }, 60000);

    if(currentChatSub) currentChatSub();
    const q = query(collection(db, "chats"), where("vid", "==", title), orderBy("time", "asc"), limit(50));
    currentChatSub = onSnapshot(q, (s) => {
        const box = document.getElementById('chatBox');
        box.innerHTML = '';
        s.forEach(c => {
            const m = c.data();
            box.innerHTML += `<div class="text-[10px]"><b class="text-yellow-500">${m.user}:</b> <span class="text-slate-300">${m.msg}</span></div>`;
        });
        box.scrollTop = box.scrollHeight;
    });

    document.getElementById('sendChat').onclick = async () => {
        const inp = document.getElementById('chatInput');
        if(!inp.value.trim()) return;
        await addDoc(collection(db, "chats"), { vid: title, user: userData.name, msg: inp.value, time: serverTimestamp() });
        inp.value = '';
    };
};

document.getElementById('closeVideo').onclick = () => {
    document.getElementById('videoModal').classList.add('hidden');
    document.getElementById('playerBox').innerHTML = '';
    clearInterval(rewardInterval);
};

// --- Admin Panel ---
async function renderAdmin() {
    setActiveTab('tabAdmin');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-red-500 font-black text-xs uppercase mb-4">Admin: User Control</h2>`;
    const snap = await getDocs(collection(db, "users"));
    snap.forEach(u => {
        const d = u.data();
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-900 rounded-3xl border border-slate-800 mb-3";
        div.innerHTML = `
            <div class="flex justify-between mb-2">
                <span class="text-xs font-bold uppercase">${d.name} (${d.city || 'N/A'})</span>
                <span class="text-[9px] ${d.paid?'text-green-500':'text-red-500'} font-black">${d.paid?'PAID':'UNPAID'}</span>
            </div>
            <div class="flex gap-2">
                <button onclick="updateUser('${u.id}', 'paid', ${d.paid})" class="flex-1 bg-blue-600/20 text-blue-500 text-[8px] font-bold py-2 rounded-xl">Pay Toggle</button>
                <button onclick="updateUser('${u.id}', 'blocked', ${d.blocked})" class="flex-1 bg-red-600/20 text-red-500 text-[8px] font-bold py-2 rounded-xl">Block Toggle</button>
            </div>
        `;
        container.appendChild(div);
    });
}

window.updateUser = async (id, field, cur) => {
    let obj = {}; obj[field] = !cur;
    await updateDoc(doc(db, "users", id), obj);
    renderAdmin();
};

// Auth Actions
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
                email, role: document.getElementById('regRole').value, 
                paid: false, blocked: false, bpcoins: 0 
            });
        } else await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) { document.getElementById('authMsg').innerText = e.message; }
};

document.getElementById('forgotBtn').onclick = async () => {
    const e = document.getElementById('email').value;
    if(e) { await sendPasswordResetEmail(auth, e); alert("Reset link sent!"); }
};

document.getElementById('tabHome').onclick = renderHome;
document.getElementById('tabPrime').onclick = renderPrime;
document.getElementById('tabAdmin').onclick = renderAdmin;
document.getElementById('tabPractice').onclick = () => { setActiveTab('tabPractice'); document.getElementById('viewContainer').innerHTML = '<p class="text-center mt-10">Quizzes Coming Soon</p>'; };
document.getElementById('tabNcert').onclick = () => { setActiveTab('tabNcert'); document.getElementById('viewContainer').innerHTML = '<p class="text-center mt-10">Books Coming Soon</p>'; };
document.getElementById('tabRank').onclick = async () => {
    setActiveTab('tabRank');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-red-500 font-black text-xs uppercase mb-4">Leaderboard</h2>`;
    const q = query(collection(db, "users"), orderBy("bpcoins", "desc"), limit(10));
    const s = await getDocs(q);
    s.forEach(d => {
        container.innerHTML += `<div class="p-4 bg-slate-900 rounded-2xl mb-2 border border-slate-800 flex justify-between">
            <span class="text-xs font-bold">${d.data().name}</span>
            <span class="text-yellow-500 font-bold">${d.data().bpcoins || 0} BP</span>
        </div>`;
    });
};

function setActiveTab(id) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active', 'text-yellow-500'));
    document.getElementById(id).classList.add('active', 'text-yellow-500');
}

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
document.getElementById('toggleAuth').onclick = () => document.getElementById('signupFields').classList.toggle('hidden');
document.getElementById('globalBackBtn').onclick = () => renderHome();
    
