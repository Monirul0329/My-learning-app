import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, addDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDlmQWV3IN_asZolPyaBLBb7L_RG0uriZM",
    authDomain: "mneet-f9bc7.firebaseapp.com",
    projectId: "mneet-f9bc7",
    storageBucket: "mneet-f9bc7.firebasestorage.app",
    messagingSenderId: "944379440196",
    appId: "1:944379440196:web:9d26b632b3e778d247e011",
    measurementId: "G-70T6K3DLGT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global Navigation State
let currentSubject = "";
let currentChapter = "";

// 1. Back Button Logic
document.getElementById('globalBackBtn').onclick = () => {
    if (currentChapter !== "") {
        renderChapters(currentSubject);
        currentChapter = "";
    } else if (currentSubject !== "") {
        renderDashboard();
        currentSubject = "";
    } else {
        // Jodi already dashboard-e thake
        renderDashboard();
    }
};

// 2. Auth State Logic
onAuthStateChanged(auth, (user) => {
    if(user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            const data = snap.data();
            if(data && data.approved === true) {
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                
                if(data.role === 'admin') {
                    document.getElementById('adminPanel').classList.remove('hidden');
                    loadAllUsersForAdmin(); // Advanced Admin Panel
                } else if(data.role === 'teacher') {
                    document.getElementById('teacherPanel').classList.remove('hidden');
                } else {
                    document.getElementById('dashboardHome').classList.remove('hidden');
                    document.getElementById('studentStats').classList.remove('hidden');
                    renderDashboard();
                }
                document.getElementById('coins').innerText = data.bpcoins || 0;
            } else {
                showMsg("Pending Approval from Admin.");
            }
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
    }
});

// 3. Nested Navigation Logic (Subject > Chapter > Topic)
function renderDashboard() {
    currentSubject = "";
    currentChapter = "";
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = ""; 

    ["Biology", "Physics", "Chemistry"].forEach(sub => {
        const card = document.createElement('div');
        card.className = "p-6 bg-[#0f172a] rounded-[2rem] border border-slate-800 flex justify-between items-center mb-4 cursor-pointer hover:border-yellow-500 transition-all";
        card.innerHTML = `<h3 class="text-xl font-black text-white italic">${sub}</h3><i class="fas fa-chevron-right text-yellow-500"></i>`;
        card.onclick = () => renderChapters(sub);
        grid.appendChild(card);
    });
}

async function renderChapters(subject) {
    currentSubject = subject;
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = `<h2 class="text-2xl font-black text-yellow-500 mb-6 italic uppercase">${subject} Chapters</h2>`;

    const q = query(collection(db, "study_materials"), where("subject", "==", subject));
    const snap = await getDocs(q);
    const chapters = [...new Set(snap.docs.map(doc => doc.data().chapter))];

    if(chapters.length === 0) grid.innerHTML += `<p class="text-slate-500">No chapters found.</p>`;

    chapters.forEach(ch => {
        const card = document.createElement('div');
        card.className = "p-4 bg-slate-900 rounded-xl mb-3 border border-slate-800 cursor-pointer hover:bg-slate-800";
        card.innerHTML = `<span class="font-bold text-slate-200">${ch}</span>`;
        card.onclick = () => renderTopics(subject, ch);
        grid.appendChild(card);
    });
}

async function renderTopics(subject, chapter) {
    currentChapter = chapter;
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = `<h2 class="text-xl font-bold text-slate-400 mb-4 italic">${chapter} - Topics</h2>`;

    const q = query(collection(db, "study_materials"), where("subject", "==", subject), where("chapter", "==", chapter));
    const snap = await getDocs(q);
    
    snap.forEach(docSnap => {
        const data = docSnap.data();
        const card = document.createElement('div');
        card.className = "p-4 bg-[#0f172a] rounded-xl mb-3 flex justify-between items-center border border-slate-800 shadow-sm";
        card.innerHTML = `<span class="text-slate-100">${data.topic}</span>
                          <a href="${data.link}" target="_blank" class="bg-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Watch</a>`;
        grid.appendChild(card);
    });
}

// 4. Advanced Admin Control
async function loadAllUsersForAdmin() {
    const listDiv = document.getElementById('pendingUserList');
    const snap = await getDocs(collection(db, "users"));
    listDiv.innerHTML = "";
    
    snap.forEach(docSnap => {
        const user = docSnap.data();
        const card = document.createElement('div');
        card.className = "bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center mb-3";
        card.innerHTML = `
            <div>
                <p class="font-bold text-slate-100">${user.name} <span class="text-[10px] text-yellow-500">(${user.role})</span></p>
                <p class="text-[10px] text-slate-400">TXN: ${user.txn || 'N/A'}</p>
                <p class="text-[10px] ${user.approved ? 'text-green-500' : 'text-red-500'} font-bold">${user.approved ? 'ACTIVE' : 'PENDING'}</p>
            </div>
            ${!user.approved ? `<button onclick="approveUser('${docSnap.id}')" class="bg-green-600 text-xs px-4 py-2 rounded-xl font-bold">Approve</button>` : ''}
        `;
        listDiv.appendChild(card);
    });
}

window.approveUser = async (id) => {
    await updateDoc(doc(db, "users", id), { approved: true });
    alert("User Approved!");
    loadAllUsersForAdmin();
};

function showMsg(text) { authMsg.innerText = text; authMsg.classList.remove('hidden'); }
                   
