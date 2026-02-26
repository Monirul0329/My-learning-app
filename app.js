import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, orderBy, limit, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// Global State
window.selectedRole = 'student';
window.userData = null;
let rewardTracker = null;

// --- INITIALIZATION ---
window.setAuthRole = (role) => {
    window.selectedRole = role;
    document.querySelectorAll('#roleSelector button').forEach(b => {
        b.classList.remove('bg-yellow-600', 'text-black');
        b.classList.add('text-slate-500');
    });
    const id = role === 'student' ? 'roleStud' : (role === 'teacher' ? 'roleTech' : 'roleAdm');
    document.getElementById(id).classList.add('bg-yellow-600', 'text-black');
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                window.userData = snap.data();
                if(window.userData.blocked) { alert("Access Blocked!"); signOut(auth); return; }
                initAppFlow();
            }
        });
    } else {
        showAuthScreen();
    }
});

function initAppFlow() {
    document.getElementById('authPage').classList.add('hidden');
    document.getElementById('mainHeader').classList.remove('hidden');
    document.getElementById('appContent').classList.remove('hidden');
    document.getElementById('roleDisplay').innerText = window.userData.role.toUpperCase();

    const nav = document.getElementById('navTabs');
    nav.innerHTML = '';

    if (window.userData.role === 'student') {
        document.getElementById('coinBox').classList.remove('hidden');
        nav.innerHTML = `
            <button onclick="renderHome()" class="nav-tab active px-3 pb-2 uppercase text-[10px] font-black">Home</button>
            <button onclick="renderCourse('video')" class="nav-tab px-3 pb-2 uppercase text-[10px] font-black">Prime</button>
            <button onclick="renderCourse('quiz')" class="nav-tab px-3 pb-2 uppercase text-[10px] font-black">Practice</button>
            <button onclick="renderCourse('book')" class="nav-tab px-3 pb-2 uppercase text-[10px] font-black">NCERT/PYQ</button>
            <button onclick="renderRanking()" class="nav-tab px-3 pb-2 uppercase text-[10px] font-black">Rank</button>
        `;
        renderHome();
    } else if (window.userData.role === 'teacher') {
        renderTeacherPanel();
    } else if (window.userData.role === 'admin') {
        renderAdminPanel();
    }
}

// --- STUDENT LOGIC ---
window.renderHome = () => {
    switchActiveTab('Home');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `
        <div class="bg-yellow-600/10 border border-yellow-500/20 p-6 rounded-[2.5rem] mb-6">
            <h2 class="text-xl font-black italic text-yellow-500">LIVE SESSIONS</h2>
            <div id="liveContainer" class="mt-4 text-xs text-slate-400 italic">No live classes right now...</div>
        </div>
        ${!window.userData.paid ? `
            <div class="bg-slate-900 p-6 rounded-[2.5rem] border border-red-500/20 text-center">
                <h3 class="text-red-500 font-black text-xs uppercase mb-2">Account Unpaid</h3>
                <p class="text-[9px] text-slate-500 mb-4">Pay once to unlock lifetime access for WB State Courses.</p>
                <input type="text" id="txnId" placeholder="Transaction ID" class="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-3 text-center">
                <button onclick="requestPayment()" class="w-full bg-yellow-600 text-black py-4 rounded-xl font-black uppercase text-xs">Submit & Unlock</button>
            </div>
        ` : `<div class="p-5 bg-green-500/10 border border-green-500/20 rounded-[2rem] text-green-500 text-center font-black text-[10px] uppercase">✓ Premium Access Active</div>`}
    `;
};

window.renderCourse = (type) => {
    if(!window.userData.paid) { alert("Please pay to unlock this section."); renderHome(); return; }
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-yellow-500 font-black text-xs uppercase mb-4 italic">Select Subject</h2>`;
    ["Biology", "Physics", "Chemistry"].forEach(sub => {
        const div = document.createElement('div');
        div.className = "p-6 bg-slate-900 rounded-[2rem] border border-slate-800 mb-3 flex justify-between cursor-pointer font-black text-xs italic uppercase";
        div.innerHTML = `<span>${sub}</span><i class="fas fa-chevron-right"></i>`;
        div.onclick = () => loadContentList(sub, type);
        container.appendChild(div);
    });
};

async function loadContentList(sub, type) {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-slate-500 font-black text-[10px] mb-4 uppercase">${sub} > ${type}</h2>`;
    const q = query(collection(db, "materials"), where("subject", "==", sub), where("type", "==", type));
    const snap = await getDocs(q);
    snap.forEach(d => {
        const data = d.data();
        container.innerHTML += `
            <div class="p-4 bg-slate-900 rounded-2xl mb-2 flex justify-between items-center border border-slate-800">
                <span class="text-xs font-bold uppercase tracking-tighter">${data.chapter}</span>
                <button onclick="playContent('${data.link}', '${data.chapter}', '${type}')" class="bg-yellow-600 text-black px-5 py-2 rounded-xl text-[9px] font-black uppercase">Open</button>
            </div>`;
    });
}

// --- TEACHER PANEL ---
window.renderTeacherPanel = () => {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `
        <div class="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 mb-6">
            <h2 class="text-yellow-500 font-black text-xs uppercase mb-4 italic">Upload Portal</h2>
            <select id="tSub" class="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-2">
                <option value="Biology">Biology</option><option value="Physics">Physics</option><option value="Chemistry">Chemistry</option>
            </select>
            <select id="tType" class="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-2">
                <option value="video">Lecture Video</option><option value="quiz">Interactive Quiz</option><option value="book">NCERT/PYQ</option>
            </select>
            <input type="text" id="tChap" placeholder="Chapter Name" class="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-2">
            <input type="text" id="tLink" placeholder="Resource Link (Drive/YT)" class="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs mb-4">
            <button onclick="teacherUpload()" class="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs">Publish Content</button>
        </div>
    `;
};

window.teacherUpload = async () => {
    const sub = document.getElementById('tSub').value;
    const type = document.getElementById('tType').value;
    const chap = document.getElementById('tChap').value;
    const link = document.getElementById('tLink').value;
    if(!chap || !link) return;
    await addDoc(collection(db, "materials"), { subject: sub, type, chapter: chap, link, createdAt: serverTimestamp() });
    alert("Success! Content is now live for students.");
};

// --- AUTH & SYSTEM UTILS ---
document.getElementById('authBtn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const isSignup = !document.getElementById('signupFields').classList.contains('hidden');
    
    try {
        if(isSignup) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name: document.getElementById('regName').value,
                city: document.getElementById('regCity').value,
                role: window.selectedRole,
                email: email, paid: false, blocked: false, bpcoins: 0
            });
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch(e) { alert(e.message); }
});

window.playContent = (link, title, type) => {
    document.getElementById('contentModal').classList.remove('hidden');
    document.getElementById('modalTitle').innerText = title;
    const area = document.getElementById('playerArea');
    
    if(type === 'video') {
        let embed = link.includes('youtube.com') ? link.replace('watch?v=', 'embed/') : link.replace('/view', '/preview');
        area.innerHTML = `<div class="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"><iframe src="${embed}" class="w-full h-full" allowfullscreen allow="autoplay"></iframe></div><div class="mt-4 p-4 bg-slate-900 rounded-2xl h-[200px] text-[10px] text-slate-500 italic">Discussion area loading...</div>`;
        
        clearInterval(rewardTracker);
        rewardTracker = setInterval(async () => {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { bpcoins: (window.userData.bpcoins || 0) + 4 });
        }, 60000);
    } else {
        area.innerHTML = `<iframe src="${link}" class="w-full h-full min-h-[500px] rounded-2xl border-0"></iframe>`;
    }
};

document.getElementById('closeModal').onclick = () => {
    document.getElementById('contentModal').classList.add('hidden');
    document.getElementById('playerArea').innerHTML = '';
    clearInterval(rewardTracker);
};

document.getElementById('forgotBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    if(!email) { alert("Enter email first!"); return; }
    await sendPasswordResetEmail(auth, email);
    alert("Reset link sent!");
};

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
document.getElementById('toggleAuth').onclick = () => document.getElementById('signupFields').classList.toggle('hidden');
function switchActiveTab(l) { document.querySelectorAll('.nav-tab').forEach(t => { t.classList.remove('active', 'text-yellow-500'); if(t.innerText.toLowerCase() === l.toLowerCase()) t.classList.add('active', 'text-yellow-500'); }); }
function showAuthScreen() { document.getElementById('authPage').classList.remove('hidden'); document.getElementById('mainHeader').classList.add('hidden'); document.getElementById('appContent').classList.add('hidden'); }
    
