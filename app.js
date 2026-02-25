import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
const LEVELS = ["Medical Novice", "Cortex Activator", "Syllabus Architect", "Master Clinician", "Test-Tube Titan", "The Diagnostician", "Vitality Voyager", "Neural Conqueror", "The White-Coat Elite", "LEGENDARY SURGEON"];

onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                userData = snap.data();
                if (userData.blocked) {
                    alert("Your account is BLOCKED.");
                    signOut(auth);
                    return;
                }
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                
                showPanel(userData.role);
            }
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

function showPanel(role) {
    document.getElementById('studentPanel').classList.toggle('hidden', role !== 'student');
    document.getElementById('teacherPanel').classList.toggle('hidden', role !== 'teacher');
    document.getElementById('adminPanel').classList.toggle('hidden', role !== 'admin');

    if (role === 'student') renderSubjects();
    if (role === 'admin') loadAdminUsers();
    if (role === 'teacher') setupTeacherPanel();
    
    const coins = userData.bpcoins || 0;
    document.getElementById('coins').innerText = coins;
    const lvlIdx = Math.min(Math.floor(coins / 1000), 9);
    document.getElementById('userLevelDisplay').innerText = "Rank: " + LEVELS[lvlIdx];
}

function loadAdminUsers() {
    const container = document.getElementById('adminUserList');
    onSnapshot(collection(db, "users"), (snap) => {
        container.innerHTML = `<h3 class="text-xs font-bold text-slate-500 mb-4 uppercase">User Management (${snap.size})</h3>`;
        snap.forEach(uDoc => {
            const u = uDoc.data();
            if (u.role === 'admin') return;

            const card = document.createElement('div');
            card.className = "p-4 bg-slate-900 rounded-2xl border border-slate-800 flex justify-between items-center mb-3";
            card.innerHTML = `
                <div>
                    <div class="font-bold text-sm">${u.name} <span class="text-[9px] bg-slate-800 px-2 rounded-full">${u.role}</span></div>
                    <div class="text-[10px] text-slate-500">${u.email}</div>
                    <div class="text-[9px] text-yellow-500 mt-1">${u.paid ? '● PREMIUM' : '○ FREE'} | ${u.blocked ? 'BLOCKED' : 'ACTIVE'}</div>
                </div>
                <div class="flex gap-2">
                    <button onclick="updateUserStatus('${uDoc.id}', 'paid', ${!u.paid})" class="p-2 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-bold"><i class="fas fa-check-circle"></i></button>
                    <button onclick="updateUserStatus('${uDoc.id}', 'blocked', ${!u.blocked})" class="p-2 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-bold"><i class="fas fa-ban"></i></button>
                    <button onclick="removeUser('${uDoc.id}')" class="p-2 rounded-lg bg-slate-800 text-slate-400 text-[10px]"><i class="fas fa-trash"></i></button>
                </div>`;
            container.appendChild(card);
        });
    });
}

window.updateUserStatus = async (uid, field, value) => {
    await updateDoc(doc(db, "users", uid), { [field]: value });
};
window.removeUser = async (uid) => {
    if(confirm("Permanently delete this user?")) await deleteDoc(doc(db, "users", uid));
};

function setupTeacherPanel() {
    const subSel = document.getElementById('upSubject');
    const subjects = ["Biology", "Physics", "Chemistry"];
    subSel.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
}

document.getElementById('uploadBtn').onclick = async () => {
    const material = {
        type: document.getElementById('upType').value,
        subject: document.getElementById('upSubject').value,
        chapter: document.getElementById('upChapter').value,
        topic: document.getElementById('upTopic').value,
        link: document.getElementById('upLink').value,
        createdAt: Date.now()
    };
    if(!material.chapter || !material.topic || !material.link) return alert("Fill all info!");
    await addDoc(collection(db, "materials"), material);
    alert("Content Uploaded Successfully!");
};

document.getElementById('authBtn').onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    const isSignup = !document.getElementById('signupFields').classList.contains('hidden');

    try {
        if (isSignup) {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name: document.getElementById('regName').value,
                city: document.getElementById('regCity').value,
                email: email,
                role: document.getElementById('regRole').value,
                paid: false,
                blocked: false,
                bpcoins: 0
            });
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch (e) {
        document.getElementById('authMsg').innerText = e.message;
    }
};

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
document.getElementById('toggleAuth').onclick = () => {
    document.getElementById('signupFields').classList.toggle('hidden');
    const isSignup = !document.getElementById('signupFields').classList.contains('hidden');
    document.getElementById('authBtn').innerText = isSignup ? 'CREATE ACCOUNT' : 'CONTINUE';
};
        
