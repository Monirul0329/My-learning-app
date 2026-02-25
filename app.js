import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const syllabus = {
    biology: [
        { id: "01", name: "The Living World", isFree: true, topics: ["1.1 What is Living?", "1.2 Taxonomy"] },
        { id: "02", name: "Biological Classification", isFree: false, topics: ["2.1 Kingdom Monera", "2.2 Kingdom Protista"] }
    ]
};

let currentMode = 'signup';
let currentUserData = null;

const setTab = (mode) => {
    currentMode = mode;
    document.getElementById('signupFields').style.display = mode === 'signup' ? 'block' : 'none';
    document.getElementById('actionBtn').innerText = mode === 'signup' ? 'Register Now' : 'Login Now';
    document.getElementById('tabSignup').classList.toggle('bg-yellow-600', mode === 'signup');
    document.getElementById('tabSignup').classList.toggle('text-slate-950', mode === 'signup');
    document.getElementById('tabLogin').classList.toggle('bg-yellow-600', mode === 'login');
    document.getElementById('tabLogin').classList.toggle('text-slate-950', mode === 'login');
};

document.getElementById('tabSignup').onclick = () => setTab('signup');
document.getElementById('tabLogin').onclick = () => setTab('login');

document.getElementById('actionBtn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    const msg = document.getElementById('authMsg');

    try {
        if (currentMode === 'signup') {
            const name = document.getElementById('regName').value;
            const city = document.getElementById('regCity').value;
            const role = document.getElementById('regRole').value;
            const txn = document.getElementById('regTxn').value;
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name, city, role, email, transaction_id: txn,
                approved: role === 'admin', is_paid: false, bp_coins: 0
            });
            msg.innerText = "Registered! Wait for Approval.";
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch (e) { msg.innerText = e.message; }
};

onAuthStateChanged(auth, async (u) => {
    if (u) {
        onSnapshot(doc(db, "users", u.uid), (d) => {
            currentUserData = d.data();
            if (currentUserData && currentUserData.approved) {
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('dashboardPage').classList.remove('hidden');
                document.getElementById('bpBox').innerText = currentUserData.bp_coins + " BP";
                renderDashboard();
            } else {
                document.getElementById('authMsg').innerText = "Pending Admin Approval!";
            }
        });
    }
});

function renderDashboard() {
    const main = document.getElementById('mainContent');
    main.innerHTML = `<h3 class="text-[10px] font-black text-slate-500 uppercase">Subjects</h3>`;
    Object.keys(syllabus).forEach(sub => {
        const btn = document.createElement('button');
        btn.className = "w-full p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex justify-between items-center capitalize";
        btn.innerHTML = `<span class="font-black text-lg">${sub}</span><i class="fas fa-chevron-right text-slate-700"></i>`;
        btn.onclick = () => openSub(sub);
        main.appendChild(btn);
    });
}

function openSub(sub) {
    const overlay = document.getElementById('overlay');
    const data = document.getElementById('overlayData');
    overlay.classList.remove('hidden');
    data.innerHTML = `<h2 class="text-2xl font-black text-yellow-500 mb-6 uppercase">${sub} Syllabus</h2>`;
    syllabus[sub].forEach(ch => {
        const locked = !currentUserData.is_paid && !ch.isFree;
        const div = document.createElement('div');
        div.className = `p-6 bg-slate-900 border ${locked ? 'border-red-900/30' : 'border-slate-800'} rounded-3xl mb-4`;
        div.innerHTML = `
            <p class="text-[10px] font-bold text-indigo-400 mb-2 uppercase">Chapter ${ch.id}</p>
            <h4 class="font-bold text-lg mb-4">${ch.name}</h4>
            <div class="space-y-2">
                ${ch.topics.map(t => `
                    <div class="topic-item p-4 bg-slate-800 rounded-xl text-sm font-bold flex justify-between items-center cursor-pointer">
                        <span>${t}</span>
                        <i class="fas ${locked ? 'fa-lock text-red-500' : 'fa-play text-green-500'}"></i>
                    </div>
                `).join('')}
            </div>`;
        
        div.querySelectorAll('.topic-item').forEach((item, i) => {
            item.onclick = () => {
                if (!locked) alert("Opening Topic: " + ch.topics[i]);
                else alert("🔒 Locked! Complete payment for full access.");
            };
        });
        data.appendChild(div);
    });
}

document.getElementById('closeOverlayBtn').onclick = () => document.getElementById('overlay').classList.add('hidden');
        
