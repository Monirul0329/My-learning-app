import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, addDoc, orderBy, limit, deleteDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

let currentSubject = "";
let currentChapter = "";
let isLoginMode = true;

const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');

if(toggleAuth) {
    toggleAuth.onclick = () => {
        isLoginMode = !isLoginMode;
        document.getElementById('signupFields').classList.toggle('hidden');
        authBtn.innerText = isLoginMode ? 'Continue' : 'Create Account';
        toggleAuth.innerText = isLoginMode ? 'Create Account' : 'Back to Login';
    };
}

authBtn.onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    if(!email || !pass) return;
    try {
        if(!isLoginMode) {
            const data = {
                name: document.getElementById('regName').value,
                city: document.getElementById('regCity').value,
                role: document.getElementById('regRole').value,
                txn: document.getElementById('regTxn').value,
                email, approved: false, bpcoins: 0, progress: 0, streak: 1
            };
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), data);
            alert("Registration successful! Wait for admin approval.");
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch(e) { document.getElementById('authMsg').innerText = e.message; }
};

onAuthStateChanged(auth, (user) => {
    if(user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            const u = snap.data();
            if(u && u.approved) {
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                
                const r = u.role;
                document.getElementById('adminPanel').classList.toggle('hidden', r !== 'admin');
                document.getElementById('teacherPanel').classList.toggle('hidden', r !== 'teacher');
                document.getElementById('dashboardHome').classList.toggle('hidden', r === 'admin' || r === 'teacher');
                document.getElementById('studentStats').classList.toggle('hidden', r === 'admin' || r === 'teacher');
                document.getElementById('leaderboard').classList.toggle('hidden', r === 'admin' || r === 'teacher');

                if(r === 'admin') loadAdminData();
                if(r === 'student') { 
                    renderDashboard(); 
                    loadLeaderboard();
                    updateStreak();
                    calculateRank(u.bpcoins);
                }

                document.getElementById('coins').innerText = u.bpcoins || 0;
                document.getElementById('progText').innerText = (u.progress || 0) + "%";
                document.getElementById('progBar').style.width = (u.progress || 0) + "%";
            } else if(u) { alert("Account pending approval."); signOut(auth); }
        });
        syncNotice();
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

document.getElementById('globalBackBtn').onclick = () => {
    if (currentChapter) { currentChapter = ""; renderChapters(currentSubject); }
    else if (currentSubject) { currentSubject = ""; renderDashboard(); }
};

function renderDashboard() {
    currentSubject = ""; currentChapter = "";
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = "";
    ["01. Biology", "02. Physics", "03. Chemistry"].forEach(sub => {
        const card = document.createElement('div');
        card.className = "p-6 bg-slate-900 rounded-[2rem] border border-slate-800 flex justify-between items-center cursor-pointer hover:border-yellow-500 transition-all group";
        card.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 font-black text-xs">${sub.split('.')[0]}</div>
                <h3 class="text-lg font-black uppercase italic">${sub.split('.')[1]}</h3>
            </div>
            <i class="fas fa-chevron-right text-slate-700 group-hover:text-yellow-500"></i>`;
        card.onclick = () => renderChapters(sub);
        grid.appendChild(card);
    });
}

async function renderChapters(subject) {
    currentSubject = subject;
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = `<h2 class="text-2xl font-black text-yellow-500 italic mb-6 uppercase">${subject.split('.')[1]}</h2>`;
    
    const q = query(collection(db, "study_materials"), where("subject", "==", subject), orderBy("chapterNum", "asc"));
    const snap = await getDocs(q);
    const chapters = [];
    const seen = new Set();

    snap.forEach(doc => {
        const d = doc.data();
        if(!seen.has(d.chapter)) { chapters.push({name: d.chapter, num: d.chapterNum}); seen.add(d.chapter); }
    });

    chapters.forEach(ch => {
        const div = document.createElement('div');
        div.className = "p-5 bg-slate-800/40 rounded-2xl mb-3 border border-slate-800 flex items-center gap-4 cursor-pointer hover:bg-slate-800";
        div.innerHTML = `<div class="bg-yellow-500 text-black text-[9px] font-black px-2 py-0.5 rounded">CH ${ch.num}</div><span class="font-bold">${ch.name}</span>`;
        div.onclick = () => renderTopics(subject, ch.name);
        grid.appendChild(div);
    });
}

async function renderTopics(subject, chapter) {
    currentChapter = chapter;
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = `<h2 class="text-lg font-bold text-slate-400 mb-6 italic decoration-yellow-500 underline underline-offset-8">${chapter}</h2>`;
    const q = query(collection(db, "study_materials"), where("subject", "==", subject), where("chapter", "==", chapter));
    const snap = await getDocs(q);
    
    snap.forEach((docSnap, i) => {
        const d = docSnap.data();
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-900 rounded-2xl mb-3 flex justify-between items-center border border-slate-800";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-[10px] font-bold text-slate-600">${i+1}.</span>
                <span class="text-sm font-semibold">${d.topic}</span>
            </div>
            <a href="${d.link}" target="_blank" onclick="handleVideoClick('${docSnap.id}')" class="bg-red-600 px-4 py-2 rounded-xl text-[9px] font-black hover:scale-105 transition-all">WATCH</a>`;
        grid.appendChild(div);
    });
}

async function loadAdminData() {
    const table = document.getElementById('adminUserTable');
    const snap = await getDocs(collection(db, "users"));
    table.innerHTML = "";
    let approvedCount = 0;
    snap.forEach(userDoc => {
        const u = userDoc.data();
        if(u.approved) approvedCount++;
        table.innerHTML += `
            <tr class="hover:bg-slate-800/20">
                <td class="p-4"><div class="font-bold">${u.name}</div><div class="text-[9px] text-slate-500">${u.role}</div></td>
                <td class="p-4 font-mono text-yellow-500">${u.txn || 'N/A'}</td>
                <td class="p-4 text-right">
                    ${!u.approved ? `<button onclick="approveUser('${userDoc.id}')" class="text-green-500 font-bold underline">Approve</button>` : `<span class="text-slate-600">Active</span>`}
                </td>
            </tr>`;
    });
    document.getElementById('revenue').innerText = approvedCount * 500;
}

document.getElementById('uploadBtn').onclick = async () => {
    const data = {
        subject: document.getElementById('upSubject').value,
        chapterNum: parseInt(document.getElementById('upChapterNum').value),
        chapter: document.getElementById('upChapter').value,
        topic: document.getElementById('upTopic').value,
        link: document.getElementById('upLink').value,
        timestamp: Date.now()
    };
    if(!data.chapter || !data.topic || !data.link) return alert("Fill all fields");
    await addDoc(collection(db, "study_materials"), data);
    alert("Content Published!");
    document.getElementById('upTopic').value = "";
};

window.approveUser = async (id) => { await updateDoc(doc(db, "users", id), { approved: true }); loadAdminData(); };

async function loadLeaderboard() {
    const q = query(collection(db, "users"), orderBy("bpcoins", "desc"), limit(5));
    const snap = await getDocs(q);
    const list = document.getElementById('leaderboardList');
    list.innerHTML = "";
    snap.forEach((d, i) => {
        const u = d.data();
        list.innerHTML += `
            <div class="p-4 flex justify-between items-center ${i===0?'bg-yellow-500/5':''}">
                <div class="flex items-center gap-3"><span class="font-black text-slate-700">#${i+1}</span><span class="text-sm font-bold">${u.name}</span></div>
                <div class="text-yellow-500 font-black text-xs">${u.bpcoins} BP</div>
            </div>`;
    });
}

function syncNotice() {
    onSnapshot(doc(db, "settings", "globalNotice"), (d) => {
        if(d.exists()) document.getElementById('adminNotice').innerText = d.data().text;
    });
}

window.handleVideoClick = async (id) => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, { 
        bpcoins: (parseInt(document.getElementById('coins').innerText) + 10),
        progress: Math.min(100, (parseInt(document.getElementById('progText').innerText) + 1))
    });
};

function updateStreak() {
    const today = new Date().toDateString();
    if(localStorage.getItem('lastVisit') !== today) {
        localStorage.setItem('lastVisit', today);
    }
}

async function calculateRank(coins) {
    const q = query(collection(db, "users"), where("bpcoins", ">", coins));
    const snap = await getDocs(q);
    document.getElementById('userRank').innerText = snap.size + 1;
}

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
                
