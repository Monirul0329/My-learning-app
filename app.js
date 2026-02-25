
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
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
)
  
document.getElementById('forgotBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    if(!email) { alert("Enter email address!"); return; }
    try {
        await sendPasswordResetEmail(auth, email);
        showMsg("Reset link sent to Gmail!");
    } catch(e) { showMsg(e.message); }
};

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
                showMsg("Pending Approval from Admin.");
                document.getElementById('authPage').classList.remove('hidden');
                document.getElementById('mainHeader').classList.add('hidden');
                document.getElementById('appContent').classList.add('hidden');
            }
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
    }
});

async function loadPendingUsers() {
    const listDiv = document.getElementById('pendingUserList');
    if(!listDiv) return;
    const q = query(collection(db, "users"), where("approved", "==", false));
    const querySnapshot = await getDocs(q);
    listDiv.innerHTML = "";
    if(querySnapshot.empty) {
        listDiv.innerHTML = "<p class='text-slate-500 text-xs italic'>No pending requests.</p>";
        return;
    }
    querySnapshot.forEach((userDoc) => {
        const user = userDoc.data();
        const card = document.createElement('div');
        card.className = "bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center mb-2";
        card.innerHTML = `
            <div>
                <p class="font-bold text-slate-100">${user.name || 'Unknown'}</p>
                <p class="text-[10px] text-slate-400 uppercase tracking-widest">${user.city} | Txn: ${user.txn}</p>
            </div>
            <button onclick="approveUser('${userDoc.id}')" class="bg-green-600 hover:bg-green-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all">Approve</button>
        `;
        listDiv.appendChild(card);
    });
}

window.approveUser = async (userId) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { approved: true });
        alert("User Approved!");
        loadPendingUsers();
    } catch(e) { alert("Error: " + e.message); }
};

function renderDashboard() {
    const grid = document.getElementById('subjectGrid');
    if(!grid) return;
    grid.innerHTML = ""; 
// renderDashboard er ekdom shurute eita add koro
const quizCard = document.createElement('div');
quizCard.className = "p-6 bg-gradient-to-br from-yellow-600 to-yellow-400 rounded-[2rem] mb-6 cursor-pointer transform transition hover:scale-105";
quizCard.innerHTML = `
    <div class="flex justify-between items-center text-slate-950">
        <div>
            <h3 class="text-2xl font-black italic">DAILY NCERT QUIZ</h3>
            <p class="text-[10px] font-bold uppercase">Earn 10 BP Coins per answer</p>
        </div>
        <i class="fas fa-brain text-3xl opacity-50"></i>
    </div>
`;
quizCard.onclick = () => startQuiz();
grid.appendChild(quizCard);
  
    Object.keys(syllabusData).forEach(sectionTitle => {
        const sectionHeader = document.createElement('
// 1. Teacher Quiz Upload
const uploadQuizBtn = document.getElementById('uploadQuizBtn');
if(uploadQuizBtn) {
    uploadQuizBtn.onclick = async () => {
        const line = document.getElementById('quizText').value.trim();
        const answer = document.getElementById('quizCorrectAns').value.trim().toLowerCase();
        
        if(!line || !answer) { alert("Fill Quiz Fields!"); return; }
        try {
            await addDoc(collection(db, "quizzes"), {
                line, answer, createdAt: new Date()
            });
            alert("Quiz Posted! 🎯");
            document.getElementById('quizText').value = "";
            document.getElementById('quizCorrectAns').value = "";
        } catch(e) { alert(e.message); }
    };
}

// 2. Student Quiz Loading
async function startQuiz() {
    document.getElementById('dashboardHome').classList.add('hidden');
    document.getElementById('quizSection').classList.remove('hidden');
    
    const q = query(collection(db, "quizzes"));
    const snap = await getDocs(q);
    
    if(snap.empty) {
        document.getElementById('quizLine').innerText = "No quizzes available today.";
        return;
    }

    // Random ekta quiz dekhao
    const randomQuiz = snap.docs[Math.floor(Math.random() * snap.docs.length)].data();
    document.getElementById('quizLine').innerText = randomQuiz.line;
    
    document.getElementById('checkAnsBtn').onclick = async () => {
        const userAns = document.getElementById('quizAnswer').value.trim().toLowerCase();
        if(userAns === randomQuiz.answer) {
            alert("Sothik Uttor! You earned 10 BP Coins! 🎉");
            // Coins update logic
            const userRef = doc(db, "users", auth.currentUser.uid);
            const currentCoins = parseInt(document.getElementById('coins').innerText);
            await updateDoc(userRef, { bpcoins: currentCoins + 10 });
            renderDashboard(); // Reset dashboard
        } else {
            alert("Bhul uttor! Try again.");
        }
    };
                                    }
      
