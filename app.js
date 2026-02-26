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
let navHistory = [];
let rewardInterval = null;
let currentChatSub = null;
const LEVELS = ["Medical Novice", "Cortex Activator", "Syllabus Architect", "Master Clinician", "Test-Tube Titan", "The Diagnostician", "Vitality Voyager", "Neural Conqueror", "The White-Coat Elite", "LEGENDARY SURGEON"];

window.onpopstate = () => {
    if(navHistory.length > 1) {
        navHistory.pop();
        const prevView = navHistory[navHistory.length - 1];
        prevView();
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                userData = snap.data();
                if(userData.blocked) { alert("Your account is blocked!"); signOut(auth); return; }
                
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                
                if(userData.role === 'admin') {
                    document.getElementById('tabAdmin').classList.remove('hidden');
                }
                
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
    const coins = userData.bpcoins || 0;
    document.getElementById('coins').innerText = coins;
    const lvIndex = Math.min(Math.floor(coins / 500), LEVELS.length - 1);
    document.getElementById('userLevelDisplay').innerText = `Level: ${LEVELS[lvIndex]}`;
}

async function renderHome() {
    setActiveTab('tabHome');
    navHistory.push(renderHome);
    const container = document.getElementById('viewContainer');
    
    container.innerHTML = `
        <div class="bg-yellow-600/10 border border-yellow-500/20 p-6 rounded-[2.5rem] mb-6">
            <h2 class="text-xl font-black italic text-yellow-500 uppercase">Live Now</h2>
            <div id="liveFeed" class="mt-3">Loading live classes...</div>
        </div>
        
        <div class="space-y-4">
            <h3 class="text-[10px] font-black uppercase text-slate-500 tracking-widest">Enrollment Status</h3>
            <div class="course-card p-6 rounded-[2.5rem] border border-slate-800">
                <div class="flex justify-between items-center mb-4">
                    <h4 class="font-black text-lg italic uppercase text-slate-200">mNeet Pro 2026 Batch</h4>
                    <span class="text-yellow-500 font-bold text-[10px]">FULL ACCESS</span>
                </div>
                ${!userData.paid ? `
                    <button id="payTrigger" class="w-full bg-yellow-600 text-black py-4 rounded-2xl font-black uppercase shadow-lg shadow-yellow-600/20">Pay to Unlock Prime Lectures</button>
                ` : `
                    <div class="bg-green-500/10 text-green-500 p-4 rounded-2xl text-center font-black text-xs uppercase italic border border-green-500/20">
                        <i class="fas fa-check-circle mr-2"></i> All Prime Features Unlocked
                    </div>
                `}
            </div>
        </div>
    `;

    if(document.getElementById('payTrigger')) {
        document.getElementById('payTrigger').onclick = () => alert("Please contact the Administrator to complete your payment and unlock Prime Lectures.");
    }
    fetchLiveFeed();
}

async function fetchLiveFeed() {
    const q = query(collection(db, "materials"), where("type", "==", "video"), limit(1));
    const snap = await getDocs(q);
    const feed = document.getElementById('liveFeed');
    if(snap.empty) {
        feed.innerHTML = `<p class="text-slate-600 text-[10px] italic">No live classes available at this moment.</p>`;
        return;
    }
    snap.forEach(d => {
        const data = d.data();
        feed.innerHTML = `
            <div class="flex justify-between items-center bg-slate-950/50 p-4 rounded-2xl border border-yellow-600/20">
                <div>
                    <div class="text-red-500 font-black text-[9px] animate-pulse uppercase">● Live Class</div>
                    <div class="text-xs font-bold uppercase text-slate-200">${data.chapter}</div>
                </div>
                <button onclick="handlePrimeAccess('${data.link}', '${data.chapter}')" class="bg-yellow-600 text-black px-5 py-2 rounded-xl text-[10px] font-black uppercase">Join Class</button>
            </div>
        `;
    });
}

window.handlePrimeAccess = (link, title) => {
    if(!userData.paid) { alert("This feature is for Paid Students only. Please unlock the course."); return; }
    openVideo(link, title);
};

function renderPrime() {
    if(!userData.paid) { alert("Access Denied! Prime Lectures are locked."); renderHome(); return; }
    setActiveTab('tabPrime');
    navHistory.push(renderPrime);
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-yellow-500 font-black text-[10px] uppercase italic mb-4">Prime Subjects</h2>`;
    
    ["Biology", "Physics", "Chemistry"].forEach(sub => {
        const div = document.createElement('div');
        div.className = "p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex justify-between items-center mb-3 cursor-pointer active:scale-95 transition-all";
        div.innerHTML = `<span class="font-black italic text-sm text-slate-200 uppercase">${sub}</span><i class="fas fa-play-circle text-yellow-600"></i>`;
        div.onclick = () => renderMaterialsList("video", sub);
        container.appendChild(div);
    });
}

async function renderMaterialsList(type, sub) {
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-slate-500 font-black text-[10px] uppercase mb-4">${sub} > ${type.toUpperCase()}</h2>`;
    const q = query(collection(db, "materials"), where("type", "==", type), where("subject", "==", sub));
    const snap = await getDocs(q);
    
    if(snap.empty) {
        container.innerHTML += `<p class="text-slate-700 text-[10px] italic">No content found in this section.</p>`;
    }

    snap.forEach(d => {
        const data = d.data();
        const div = document.createElement('div');
        div.className = "p-5 bg-slate-900 rounded-2xl mb-2 flex justify-between items-center border border-slate-800";
        div.innerHTML = `
            <span class="text-xs font-bold text-slate-200 uppercase">${data.chapter}</span>
            <button class="bg-yellow-600 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase">${type==='video' ? 'Watch' : 'Open'}</button>
        `;
        div.querySelector('button').onclick = () => type==='video' ? openVideo(data.link, data.chapter) : window.open(data.link);
        container.appendChild(div);
    });
}

function openVideo(link, title) {
    const modal = document.getElementById('videoModal');
    const player = document.getElementById('playerBox');
    const chatBox = document.getElementById('chatBox');
    modal.classList.remove('hidden');
    document.getElementById('playingTitle').innerText = title;
    
    let embedUrl = link.includes('youtube.com/watch?v=') ? link.replace('watch?v=', 'embed/') : link.replace('/view', '/preview');
    player.innerHTML = `<iframe src="${embedUrl}" allowfullscreen allow="autoplay"></iframe>`;
    
    clearInterval(rewardInterval);
    rewardInterval = setInterval(async () => {
        const newTotal = (userData.bpcoins || 0) + 4;
        await updateDoc(doc(db, "users", auth.currentUser.uid), { bpcoins: newTotal });
    }, 60000);

    if(currentChatSub) currentChatSub();
    const qChat = query(collection(db, "chats"), where("videoId", "==", title), orderBy("time", "asc"), limit(50));
    currentChatSub = onSnapshot(qChat, (snap) => {
        chatBox.innerHTML = '';
        snap.forEach(d => {
            const c = d.data();
            chatBox.innerHTML += `<div class="mb-1"><span class="text-yellow-500 font-bold text-[10px]">${c.user}:</span> <span class="text-slate-300 text-[10px]">${c.msg}</span></div>`;
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    });

    document.getElementById('sendChat').onclick = async () => {
        const input = document.getElementById('chatInput');
        if(!input.value.trim()) return;
        await addDoc(collection(db, "chats"), { videoId: title, user: userData.name, msg: input.value, time: serverTimestamp() });
        input.value = '';
    };
}

document.getElementById('closeVideo').onclick = () => {
    document.getElementById('videoModal').classList.add('hidden');
    document.getElementById('playerBox').innerHTML = '';
    clearInterval(rewardInterval);
    if(currentChatSub) currentChatSub();
};

async function renderAdmin() {
    setActiveTab('tabAdmin');
    navHistory.push(renderAdmin);
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-red-500 font-black text-[10px] uppercase mb-4 italic">User Management Console</h2>`;
    
    const snap = await getDocs(collection(db, "users"));
    snap.forEach(uDoc => {
        const d = uDoc.data();
        const div = document.createElement('div');
        div.className = "p-5 bg-slate-900 rounded-[2rem] border border-slate-800 mb-3";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <div class="text-xs font-black uppercase text-slate-100">${d.name} <span class="text-[8px] text-slate-500 italic">(${d.city || 'No City'})</span></div>
                    <div class="text-[9px] text-slate-600">${d.email}</div>
                </div>
                <div class="text-[9px] font-black ${d.paid?'text-green-500':'text-red-500'} uppercase">${d.paid?'Paid':'Unpaid'}</div>
            </div>
            <div class="flex gap-2 mt-3">
                <button onclick="adminTogglePay('${uDoc.id}', ${d.paid})" class="flex-1 bg-blue-600/10 text-blue-500 text-[8px] font-bold py-2 rounded-xl border border-blue-500/20 uppercase tracking-tighter">Toggle Payment</button>
                <button onclick="adminToggleBlock('${uDoc.id}', ${d.blocked})" class="flex-1 bg-red-600/10 text-red-500 text-[8px] font-bold py-2 rounded-xl border border-red-500/20 uppercase tracking-tighter">${d.blocked?'Unblock User':'Block User'}</button>
            </div>
        `;
        container.appendChild(div);
    });
}

window.adminTogglePay = async (id, cur) => { await updateDoc(doc(db, "users", id), { paid: !cur }); renderAdmin(); };
window.adminToggleBlock = async (id, cur) => { await updateDoc(doc(db, "users", id), { blocked: !cur }); renderAdmin(); };

document.getElementById('authBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const isSignup = !document.getElementById('signupFields').classList.contains('hidden');
    const msg = document.getElementById('authMsg');
    
    try {
        if (isSignup) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), { 
                name: document.getElementById('regName').value, 
                city: document.getElementById('regCity').value,
                email: email, role: document.getElementById('regRole').value, 
                paid: false, blocked: false, bpcoins: 0 
            });
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch (e) { msg.innerText = e.message; }
};

document.getElementById('forgotBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    if(!email) { alert("Please enter your email address first."); return; }
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset link sent to your email.");
    } catch (e) { alert(e.message); }
};

document.getElementById('tabHome').onclick = renderHome;
document.getElementById('tabPrime').onclick = renderPrime;
document.getElementById('tabAdmin').onclick = renderAdmin;

document.getElementById('tabPractice').onclick = () => {
    setActiveTab('tabPractice');
    document.getElementById('viewContainer').innerHTML = `<p class="text-slate-500 text-[10px] uppercase font-bold text-center mt-10">Practice Zone: MCQs & DPPs are being uploaded.</p>`;
};

document.getElementById('tabNcert').onclick = () => {
    setActiveTab('tabNcert');
    document.getElementById('viewContainer').innerHTML = `<p class="text-slate-500 text-[10px] uppercase font-bold text-center mt-10">NCERT & PYQ Library will be available shortly.</p>`;
};

document.getElementById('tabRank').onclick = async () => {
    setActiveTab('tabRank');
    const container = document.getElementById('viewContainer');
    container.innerHTML = `<h2 class="text-red-500 font-black text-[10px] uppercase mb-6 italic">Weekly Global Rank</h2>`;
    const q = query(collection(db, "users"), orderBy("bpcoins", "desc"), limit(10));
    const snap = await getDocs(q);
    let i = 1;
    snap.forEach(d => {
        const u = d.data();
        container.innerHTML += `
            <div class="flex justify-between items-center p-4 bg-slate-900 rounded-2xl mb-2 border border-slate-800">
                <span class="text-xs font-black text-slate-400">#${i++} ${u.name}</span>
                <span class="text-yellow-500 font-black text-xs">${u.bpcoins || 0} BP</span>
            </div>
        `;
    });
};

function setActiveTab(id) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active', 'text-yellow-500'));
    document.getElementById(id).classList.add('active', 'text-yellow-500');
}

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
document.getElementById('toggleAuth').onclick = () => document.getElementById('signupFields').classList.toggle('hidden');
document.getElementById('globalBackBtn').onclick = () => history.back();
                    
