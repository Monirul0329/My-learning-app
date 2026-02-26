import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, collection, query, where, getDocs, updateDoc, orderBy, limit, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
const LEVELS = ["Medical Novice", "Cortex Activator", "Syllabus Architect", "Master Clinician", "Test-Tube Titan", "The Diagnostician", "Vitality Voyager", "Neural Conqueror", "The White-Coat Elite", "LEGENDARY SURGEON"];

const SYLLABUS = {
    "Biology": {
        "01. The Living World": ["1.1 What is Living?", "1.2 Diversity", "1.3 Taxonomy"],
        "02. Biological Classification": ["2.1 Monera", "2.2 Protista", "2.3 Fungi"],
        "03. Plant Kingdom": ["3.1 Algae", "3.2 Bryophytes", "3.3 Pteridophytes"],
        "04. Animal Kingdom": ["4.1 Classification", "4.2 Non-Chordates"],
        "05. Morphology": ["5.1 Root", "5.2 Stem", "5.3 Leaf"],
        "06. Anatomy": ["6.1 Tissues", "6.2 Tissue System"],
        "07. Structural Organisation": ["7.1 Animal Tissues"],
        "08. Cell: Unit of Life": ["8.1 Prokaryotic", "8.2 Eukaryotic"],
        "09. Biomolecules": ["9.1 Proteins", "9.2 Enzymes"],
        "10. Cell Cycle": ["10.1 Mitosis", "10.2 Meiosis"],
        "11. Photosynthesis": ["11.1 Light Reaction", "11.2 Dark Reaction"],
        "12. Respiration": ["12.1 Glycolysis", "12.2 Krebs Cycle"],
        "13. Plant Growth": ["13.1 Regulators"],
        "14. Breathing": ["14.1 Mechanism"],
        "15. Body Fluids": ["15.1 Blood", "15.2 Heart"],
        "16. Excretion": ["16.1 Nephron"],
        "17. Locomotion": ["17.1 Muscle", "17.2 Skeleton"],
        "18. Neural Control": ["18.1 Nerve Impulse"],
        "19. Chemical Coordination": ["19.1 Hormones"],
        "20. Sexual Reproduction": ["20.1 Pollination"],
        "21. Human Reproduction": ["21.1 Gametogenesis"],
        "22. Reproductive Health": ["22.1 Birth Control"],
        "23. Inheritance": ["23.1 Mendel's Laws"],
        "24. Molecular Basis": ["24.1 DNA Replication"],
        "25. Evolution": ["25.1 Darwinism"],
        "26. Health & Disease": ["26.1 Immunity", "26.2 AIDS"],
        "27. Microbes": ["27.1 Sewage Treatment"],
        "28. Bio Principles": ["28.1 Recombinant DNA"],
        "29. Bio Applications": ["29.1 Insulin"],
        "30. Organisms": ["30.1 Populations"],
        "31. Ecosystem": ["31.1 Energy Flow"],
        "32. Biodiversity": ["32.1 Conservation"]
    },
    "Physics": {
        "01. Units": ["1.1 SI Units"],
        "02. Straight Line": ["2.1 Kinematics"],
        "03. Motion Plane": ["3.1 Vectors"],
        "04. Laws of Motion": ["4.1 Friction"],
        "05. Work Energy": ["5.1 Power"],
        "06. System Particles": ["6.1 Rotation"],
        "07. Gravitation": ["7.1 Kepler's Laws"],
        "08. Thermodynamics": ["8.1 Heat Engines"],
        "09. Electrostatics": ["9.1 Gauss Law"],
        "10. Ray Optics": ["10.1 Reflection"]
    },
    "Chemistry": {
        "Physical Chemistry": {
            "01. Some Basic Concepts": ["1.1 Mole Concept", "1.2 Stoichiometry"],
            "02. Structure of Atom": ["2.1 Quantum Numbers"]
        },
        "Inorganic Chemistry": {
            "01. Classification of Elements": ["1.1 Periodic Trends"],
            "02. Chemical Bonding": ["2.1 VSEPR Theory"]
        },
        "Organic Chemistry": {
            "01. GOC": ["1.1 Isomerism", "1.2 Inductive Effect"],
            "02. Hydrocarbons": ["2.1 Alkanes"]
        }
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                userData = snap.data();
                if (userData.blocked) { alert("BLOCKED!"); signOut(auth); return; }
                document.getElementById('authPage').classList.add('hidden');
                document.getElementById('mainHeader').classList.remove('hidden');
                document.getElementById('appContent').classList.remove('hidden');
                updateUI();
                showPanel(userData.role);
            }
        });
    } else {
        document.getElementById('authPage').classList.remove('hidden');
        document.getElementById('mainHeader').classList.add('hidden');
        document.getElementById('appContent').classList.add('hidden');
    }
});

function updateUI() {
    const coins = userData.bpcoins || 0;
    document.getElementById('coins').innerText = coins;
    const levelIndex = Math.min(Math.floor(coins / 500), LEVELS.length - 1);
    document.getElementById('userLevelDisplay').innerText = `Level: ${LEVELS[levelIndex]}`;
}

function showPanel(role) {
    document.getElementById('studentPanel').classList.toggle('hidden', role !== 'student');
    document.getElementById('teacherPanel').classList.toggle('hidden', role !== 'teacher');
    if (role === 'student') renderSubjects();
    if (role === 'teacher') setupTeacherPanel();
}

function renderSubjects() {
    const grid = document.getElementById('mainGrid');
    if (!grid) return;
    grid.innerHTML = `<h2 class="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-widest italic">Choose Your Subject</h2>`;
    ["Biology", "Physics", "Chemistry"].forEach(sub => {
        const div = document.createElement('div');
        div.className = "p-6 bg-slate-900 rounded-[2rem] border border-slate-800 flex justify-between items-center cursor-pointer mb-3 active:scale-95 transition-all";
        div.innerHTML = `<div><div class="font-black italic text-sm text-slate-200 uppercase">${sub}</div></div><i class="fas fa-chevron-right text-slate-700"></i>`;
        div.onclick = () => {
            navHistory.push(() => renderSubjects());
            if (sub === "Chemistry") renderChemistryParts();
            else renderChapters(sub);
        };
        grid.appendChild(div);
    });
}

function renderChemistryParts() {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-yellow-500 font-bold mb-4 uppercase text-[10px]">Chemistry Categories</h2>`;
    ["Physical Chemistry", "Inorganic Chemistry", "Organic Chemistry"].forEach(part => {
        const div = document.createElement('div');
        div.className = "p-5 bg-slate-800 rounded-2xl mb-3 flex justify-between items-center cursor-pointer border border-slate-700 active:scale-95";
        div.innerHTML = `<span class="font-bold text-xs uppercase italic">${part}</span><i class="fas fa-flask text-slate-500"></i>`;
        div.onclick = () => {
            navHistory.push(() => renderChemistryParts());
            renderChapters("Chemistry", part); 
        };
        grid.appendChild(div);
    });
}

function renderChapters(sub, part = null) {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-slate-400 font-bold mb-4 uppercase text-[10px]">${part ? part : sub}</h2>`;
    const chapters = (sub === "Chemistry" && part) ? Object.keys(SYLLABUS.Chemistry[part]) : Object.keys(SYLLABUS[sub]);
    chapters.forEach((ch) => {
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-900 rounded-xl mb-2 flex justify-between items-center border border-slate-800 cursor-pointer";
        div.innerHTML = `<span class="text-xs font-bold text-slate-300 italic">${ch}</span><i class="fas fa-play-circle text-yellow-600"></i>`;
        div.onclick = () => {
            navHistory.push(() => renderChapters(sub, part));
            renderTopics(sub, ch, part);
        };
        grid.appendChild(div);
    });
}

function renderTopics(sub, ch, part = null) {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-xs font-bold mb-4 text-slate-500 italic">${ch}</h2>`;
    const topics = (sub === "Chemistry" && part) ? SYLLABUS.Chemistry[part][ch] : SYLLABUS[sub][ch];
    topics.forEach(t => {
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-950 rounded-xl mb-2 border border-slate-900 flex justify-between items-center";
        div.innerHTML = `<span class="text-xs text-slate-300 font-medium">${t}</span><button class="bg-yellow-600 text-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-yellow-600/10 active:scale-90 transition-all">Start</button>`;
        div.querySelector('button').onclick = async () => {
            const newCoins = (userData.bpcoins || 0) + 10;
            await updateDoc(doc(db, "users", auth.currentUser.uid), { bpcoins: newCoins });
            alert("Goal Started! +10 BP Coins");
        };
        grid.appendChild(div);
    });
}

async function renderRank() {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-red-500 font-black mb-6 uppercase text-[10px] tracking-widest italic">Global Leaderboard</h2>`;
    const q = query(collection(db, "users"), orderBy("bpcoins", "desc"), limit(10));
    const snap = await getDocs(q);
    let rank = 1;
    snap.forEach(userDoc => {
        const data = userDoc.data();
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-900/50 rounded-2xl mb-2 flex justify-between items-center border border-slate-800/50";
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="text-slate-600 font-black italic text-lg">#${rank++}</span>
                <div>
                    <div class="text-[11px] font-black text-slate-200 uppercase italic">${data.name || 'Student'}</div>
                    <div class="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">${data.role}</div>
                </div>
            </div>
            <div class="text-yellow-500 font-black text-xs italic">${data.bpcoins || 0} BP</div>`;
        grid.appendChild(div);
    });
}

function renderNCERT() {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-blue-500 font-bold mb-4 uppercase text-[10px] tracking-widest italic">NCERT PDF Library</h2>`;
    ["Biology", "Physics", "Chemistry"].forEach(sub => {
        const div = document.createElement('div');
        div.className = "p-5 bg-blue-900/10 rounded-2xl mb-3 border border-blue-900/30 flex justify-between items-center cursor-pointer active:scale-95 transition-all";
        div.innerHTML = `<span class="font-black text-slate-200 text-xs uppercase italic">${sub} NCERT</span><i class="fas fa-file-pdf text-blue-500"></i>`;
        div.onclick = () => {
            navHistory.push(() => renderNCERT());
            renderNCERTPDFs(sub);
        };
        grid.appendChild(div);
    });
}

async function renderNCERTPDFs(sub) {
    const grid = document.getElementById('mainGrid');
    grid.innerHTML = `<h2 class="text-blue-400 font-bold mb-4 text-[10px] uppercase italic">${sub} Chapters</h2>`;
    const q = query(collection(db, "materials"), where("type", "==", "pdf"), where("subject", "==", sub));
    const snap = await getDocs(q);
    if (snap.empty) grid.innerHTML += `<p class="text-[10px] text-slate-700 italic">Coming Soon...</p>`;
    snap.forEach(doc => {
        const data = doc.data();
        const div = document.createElement('div');
        div.className = "p-4 bg-slate-900 rounded-xl mb-2 flex justify-between items-center border border-slate-800";
        div.innerHTML = `<span class="text-[10px] text-slate-400 font-bold uppercase">${data.chapter}</span><a href="${data.link}" target="_blank" class="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">Open PDF</a>`;
        grid.appendChild(div);
    });
}

function setupTeacherPanel() {
    const subSel = document.getElementById('upSubject');
    if(subSel) subSel.innerHTML = `<option value="">Subject</option>` + ["Biology", "Physics", "Chemistry"].map(s => `<option value="${s}">${s}</option>`).join('');
}

document.getElementById('uploadBtn').onclick = async () => {
    const data = {
        type: document.getElementById('upType').value,
        subject: document.getElementById('upSubject').value,
        chapter: document.getElementById('upChapter').value,
        link: document.getElementById('upLink').value,
        createdAt: Date.now()
    };
    if(!data.link || !data.subject) return alert("Fill all fields!");
    await addDoc(collection(db, "materials"), data);
    alert("Published successfully!");
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
                email: email,
                role: document.getElementById('regRole').value,
                paid: false, blocked: false, bpcoins: 0
            });
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
    } catch (e) { document.getElementById('authMsg').innerText = e.message; }
};

document.getElementById('tabStudy').onclick = () => {
    setActiveTab('tabStudy');
    navHistory = [];
    renderSubjects();
};
document.getElementById('tabNcert').onclick = () => {
    setActiveTab('tabNcert');
    navHistory = [];
    renderNCERT();
};
document.getElementById('tabRank').onclick = () => {
    setActiveTab('tabRank');
    navHistory = [];
    renderRank();
};

function setActiveTab(id) {
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.remove('active', 'text-yellow-500');
        t.classList.add('text-slate-500');
    });
    document.getElementById(id).classList.add('active', 'text-yellow-500');
}

document.getElementById('logoutBtn').onclick = () => signOut(auth).then(() => location.reload());
document.getElementById('globalBackBtn').onclick = () => { if(navHistory.length > 0) (navHistory.pop())(); };
document.getElementById('toggleAuth').onclick = () => document.getElementById('signupFields').classList.toggle('hidden');
        
