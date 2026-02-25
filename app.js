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

const syllabusData = {
    "Let's Study": {
        "Biology": [
            { chapter: "The Living World", topics: ["What is Living?", "Taxonomic Categories"] },
            { chapter: "Biological Classification", topics: ["Kingdom Monera", "Kingdom Protista", "Viruses"] }
        ],
        "Physics": [
            { chapter: "Units and Measurements", topics: ["SI Units", "Dimensional Analysis"] },
            { chapter: "Motion in a Straight Line", topics: ["Speed & Velocity", "Acceleration"] }
        ],
        "Chemistry": [
            { chapter: "Some Basic Concepts", topics: ["Mole Concept", "Stoichiometry"] },
            { chapter: "Structure of Atom", topics: ["Bohr's Model", "Quantum Numbers"] }
        ]
    },
    "NCERT Books Reading": {
        "Biology": ["Class 11 Bio PDF", "Class 12 Bio PDF"],
        "Physics": ["Class 11 Physics PDF", "Class 12 Physics PDF"],
        "Chemistry": ["Class 11 Chem PDF", "Class 12 Chem PDF"]
    }
};

const authBtn = document.getElementById('authBtn');
const toggleAuth = document.getElementById('toggleAuth');
const authMsg = document.getElementById('authMsg');
const signupForm = document.getElementById('signupForm');
let isLoginMode = true;

if(toggleAuth) {
    toggleAuth.onclick = () => {
        isLoginMode = !isLoginMode;
        signupForm.classList.toggle('hidden');
        authBtn.innerText = isLoginMode ? 'Login Now' : 'Create Account';
        toggleAuth.innerText = isLoginMode ? 'Create Account' : 'Back to Login';
        authMsg.classList.add('hidden');
    };
}

authBtn.onclick = async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value.trim();
    if(!email || !pass) { showMsg("Fill all fields!"); return; }
    try {
        if(!isLoginMode) {
            const name = document.getElementById('regName').value;
            const city = document.getElementById('regCity').value;
            const role = document.getElementById('regRole').value;
            const txn = document.getElementById('regTxn').value;
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name, city, role, txn, email, approved: false, bpcoins: 0, progress: 0
            });
            showMsg("Registered! Wait for Admin Approval.");
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch(e) { showMsg(e.message); }
};

onAuthStateChanged(auth, (user) => {
    if(user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            const data = snap.data();
            if(data && data.approved === true) {
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                
                const role = data.role;
                document.getElementById('adminPanel').classList.add('hidden');
                document.getElementById('teacherPanel').classList.add('hidden');
                document.getElementById('dashboardHome').classList.add('hidden');
                document.getElementById('studentStats').classList.add('hidden');

                if(role === 'admin') {
                    document.getElementById('adminPanel').classList.remove('hidden');
                    loadPendingUsers();
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
            } else {
                showMsg("Wait for Admin Approval.");
            }
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

document.getElementById('logoutBtn').onclick = async () => {
    await signOut(auth);
    location.reload();
};

function renderDashboard() {
    const grid = document.getElementById('subjectGrid');
    if(!grid) return;
    grid.innerHTML = ""; 

    const welcome = document.createElement('div');
    welcome.className = "mb-6";
    welcome.innerHTML = `<h2 class="text-3xl font-black text-white italic">FUTURE DOCTOR!</h2>`;
    grid.appendChild(welcome);
    
    const quizCard = document.createElement('div');
    quizCard.className = "p-6 bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-[2rem] mb-6 cursor-pointer shadow-xl";
    quizCard.innerHTML = `<h3 class="text-2xl font-black italic text-slate-950">DAILY NCERT QUIZ</h3>`;
    quizCard.onclick = () => startQuiz();
    grid.appendChild(quizCard);
    
    Object.keys(syllabusData).forEach(section => {
        const header = document.createElement('h2');
        header.className = "text-xl font-black text-yellow-500 mt-6 mb-3 uppercase";
        header.innerText = section;
        grid.appendChild(header);

        Object.keys(syllabusData[section]).forEach(subject => {
            const card = document.createElement('div');
            card.className = "p-6 bg-[#0f172a] rounded-[2rem] border border-slate-800 mb-4 cursor-pointer";
            card.innerHTML = `<h3 class="text-xl font-bold">${subject}</h3>`;
            card.onclick = () => section === "Let's Study" ? openChapterContent(subject) : alert("Library Updating...");
            grid.appendChild(card);
        });
    });
    loadLeaderboard();
}

async function loadLeaderboard() {
    const lbDiv = document.getElementById('leaderboardList');
    if(!lbDiv) return;
    const q = query(collection(db, "users"), orderBy("bpcoins", "desc"), limit(5));
    onSnapshot(q, (snapshot) => {
        lbDiv.innerHTML = "";
        snapshot.forEach((doc, index) => {
            const u = doc.data();
            lbDiv.innerHTML += `<div class="p-4 border-b border-slate-800 flex justify-between">
                <span>${index+1}. ${u.name}</span>
                <span class="text-yellow-500 font-bold">${u.bpcoins} BP</span>
            </div>`;
        });
    });
}

async function startQuiz() {
    document.getElementById('dashboardHome').classList.add('hidden');
    document.getElementById('quizSection').classList.remove('hidden');
    const q = await getDocs(collection(db, "quizzes"));
    if(q.empty) return;
    const quiz = q.docs[0].data();
    document.getElementById('quizLine').innerText = quiz.line;
    document.getElementById('checkAnsBtn').onclick = async () => {
        if(document.getElementById('quizAnswer').value.toLowerCase() === quiz.answer) {
            alert("Correct! +10 BP");
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, { bpcoins: parseInt(document.getElementById('coins').innerText) + 10 });
            renderDashboard();
            document.getElementById('quizSection').classList.add('hidden');
        }
    };
}

window.updateProgress = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDocs(query(collection(db, "users"), where("email", "==", auth.currentUser.email)));
    userSnap.forEach(async (d) => {
        let p = d.data().progress || 0;
        if(p < 100) await updateDoc(userRef, { progress: p + 5 });
    });
};

function openChapterContent(subject) {
    const grid = document.getElementById('subjectGrid');
    grid.innerHTML = `<button onclick="renderDashboard()" class="mb-4 text-xs">← Back</button><h2 class="text-xl text-yellow-500 mb-4">${subject}</h2>`;
    const q = query(collection(db, "study_materials"), where("subject", "==", subject));
    onSnapshot(q, (snap) => {
        snap.forEach(doc => {
            const m = doc.data();
            grid.innerHTML += `<div class="p-4 bg-slate-900 rounded-2xl mb-2 flex justify-between">
                <span>${m.topic}</span>
                <a href="${m.link}" onclick="updateProgress()" target="_blank" class="text-red-500">Watch</a>
            </div>`;
        });
    });
}

function showMsg(text) { authMsg.innerText = text; authMsg.classList.remove('hidden'); }
            
