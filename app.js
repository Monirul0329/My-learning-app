import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

let currentSubject = "";
let currentChapter = "";

const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');
let isLoginMode = true;

if(toggleAuth) {
    toggleAuth.onclick = () => {
        isLoginMode = !isLoginMode;
        document.getElementById('signupForm').classList.toggle('hidden');
        authBtn.innerText = isLoginMode ? 'Continue' : 'Create Account';
    };
}

authBtn.onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    try {
        if(!isLoginMode) {
            const name = document.getElementById('regName').value;
            const city = document.getElementById('regCity').value;
            const role = document.getElementById('regRole').value;
            const txn = document.getElementById('regTxn').value;
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), { name, city, role, txn, email, approved: false, bpcoins: 0, progress: 0 });
            alert("Registered! Wait for admin approval.");
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch(e) { alert(e.message); }
};

onAuthStateChanged(auth, (user) => {
    if(user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            const data = snap.data();
            if(data && data.approved) {
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                
                const role = data.role;
                document.getElementById('adminPanel').classList.add('hidden');
                document.getElementById('teacherPanel').classList.add('hidden');
                document.getElementById('dashboardHome').classList.add('hidden');

                if(role === 'admin') {
                    document.getElementById('adminPanel').classList.remove('hidden');
                    loadAdminTable();
                } else if(role === 'teacher') {
                    document.getElementById('teacherPanel').classList.remove('hidden');
                } else {
                    document.getElementById('dashboardHome').classList.remove('hidden');
                    document.getElementById('studentStats').classList.remove('hidden');
                    renderDashboard();
                }
                document.getElementById('coins').innerText = data.bpcoins || 0;
                document.getElementById('progText').innerText = (data.progress || 0) + "%";
                document.getElementById('progBar').style.width = (data.progress || 0) + "%";
            } else { alert("Wait for Admin Approval!"); signOut(auth); }
        });
    } else { document.getElementById('authPage').classList.remove('hidden'); }
});

document.getElementById('globalBackBtn').onclick = () => {
    if (currentChapter) { currentChapter = ""; renderChapters(currentSubject); }
    else if (currentSubject) { currentSubject = ""; renderDashboard(); }
};

function renderDashboard() {
    currentSubject = ""; currentChapter = "";
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = "";
    ["Biology", "Physics", "Chemistry"].forEach(sub => {
        const card = document.createElement('div');
        card.className = "p-6 bg-slate-900 rounded-[2rem] border border-slate-800 flex justify-between items-center cursor-pointer";
        card.innerHTML = `<h3 class="text-xl font-black uppercase italic">${sub}</h3><i class="fas fa-arrow-right text-yellow-500"></i>`;
        card.onclick = () => renderChapters(sub);
        grid.appendChild(card);
    });
}

async function renderChapters(subject) {
    currentSubject = subject;
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = `<h2 class="text-2xl font-black text-yellow-500 italic mb-4">${subject}</h2>`;
    const q = query(collection(db, "study_materials"), where("subject", "==", subject));
    const snap = await getDocs(q);
    const chapters = [...new Set(snap.docs.map(doc => doc.data().chapter))];
    
    chapters.forEach(ch => {
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-800/50 rounded-2xl mb-2 border border-slate-700 cursor-pointer";
        div.innerHTML = `<span class="font-bold">${ch}</span>`;
        div.onclick = () => renderTopics(subject, ch);
        grid.appendChild(div);
    });
}

async function renderTopics(subject, chapter) {
    currentChapter = chapter;
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = `<h2 class="text-xl font-bold text-slate-400 mb-4 italic">${chapter}</h2>`;
    const q = query(collection(db, "study_materials"), where("subject", "==", subject), where("chapter", "==", chapter));
    const snap = await getDocs(q);
    snap.forEach(docSnap => {
        const d = docSnap.data();
        grid.innerHTML += `<div class="p-4 bg-slate-900 rounded-2xl mb-2 flex justify-between border border-slate-800">
            <span>${d.topic}</span>
            <a href="${d.link}" target="_blank" class="text-red-500 font-bold">WATCH</a>
        </div>`;
    });
}

async function loadAdminTable() {
    const table = document.getElementById('adminUserTable');
    const snap = await getDocs(collection(db, "users"));
    table.innerHTML = "";
    snap.forEach(userDoc => {
        const u = userDoc.data();
        if(!u.approved) {
            table.innerHTML += `<tr class="border-b border-slate-800">
                <td class="p-4">${u.name}</td>
                <td class="p-4 font-mono text-yellow-500">${u.txn || 'N/A'}</td>
                <td class="p-4"><button onclick="approveUser('${userDoc.id}')" class="text-green-500 font-bold">Approve</button></td>
            </tr>`;
        }
    });
}

window.approveUser = async (id) => { await updateDoc(doc(db, "users", id), { approved: true }); loadAdminTable(); };

document.getElementById('uploadBtn').onclick = async () => {
    const subject = document.getElementById('upSubject').value;
    const chapter = document.getElementById('upChapter').value;
    const topic = document.getElementById('upTopic').value;
    const link = document.getElementById('upLink').value;
    await addDoc(collection(db, "study_materials"), { subject, chapter, topic, link });
    alert("Uploaded!");
};

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
        
