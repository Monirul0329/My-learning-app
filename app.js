import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

                // Hide all sections first
                document.getElementById('adminPanel').classList.add('hidden');
                document.getElementById('teacherPanel').classList.add('hidden');
                document.getElementById('dashboardHome').classList.add('hidden');
                document.getElementById('studentStats').classList.add('hidden');

                if(role === 'admin') {
                    document.getElementById('adminPanel').classList.remove('hidden');
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
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

function showMsg(text) {
    authMsg.innerText = text;
    authMsg.classList.remove('hidden');
}

function renderDashboard() {
    const grid = document.getElementById('subjectGrid');
    if(!grid) return;
    grid.innerHTML = ""; 

    Object.keys(syllabusData).forEach(sectionTitle => {
        const sectionHeader = document.createElement('h2');
        sectionHeader.className = "text-xl font-black text-yellow-500 mt-8 mb-4 uppercase tracking-tighter w-full";
        sectionHeader.innerText = sectionTitle;
        grid.appendChild(sectionHeader);

        const sectionContent = syllabusData[sectionTitle];
        Object.keys(sectionContent).forEach(subject => {
            const card = document.createElement('div');
            card.className = "p-6 bg-[#0f172a] rounded-[2rem] border border-slate-800 flex justify-between items-center mb-4 hover:border-yellow-500/50 transition-all cursor-pointer shadow-lg";
            card.innerHTML = `
                <div>
                    <h3 class="text-xl font-black text-slate-100 italic">${subject}</h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase">${sectionTitle === "Let's Study" ? "Video & Quiz" : "PDF Library"}</p>
                </div>
                <div class="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-yellow-500">
                    <i class="fas ${sectionTitle === "Let's Study" ? "fa-play" : "fa-book-open"}"></i>
                </div>
            `;
            card.onclick = () => alert(`Opening ${subject} in ${sectionTitle}`);
            grid.appendChild(card);
        });
    });
}

document.getElementById('globalBackBtn').onclick = () => {
    alert("Back button clicked");
};
             
