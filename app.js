import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
    bio: [
        { name: "The Living World", progress: 0 }, { name: "Biological Classification", progress: 0 },
        { name: "Plant Kingdom", progress: 0 }, { name: "Animal Kingdom", progress: 0 },
        { name: "Morphology of Flowering Plants", progress: 0 }, { name: "Anatomy of Flowering Plants", progress: 0 },
        { name: "Structural Organisation in Animals", progress: 0 }, { name: "Cell: The Unit of Life", progress: 0 },
        { name: "Biomolecules", progress: 0 }, { name: "Cell Cycle and Cell Division", progress: 0 },
        { name: "Photosynthesis in Higher Plants", progress: 0 }, { name: "Respiration in Plants", progress: 0 },
        { name: "Plant Growth and Development", progress: 0 }, { name: "Breathing and Exchange of Gases", progress: 0 },
        { name: "Body Fluids and Circulation", progress: 0 }, { name: "Excretory Products and Elimination", progress: 0 },
        { name: "Locomotion and Movement", progress: 0 }, { name: "Neural Control and Coordination", progress: 0 },
        { name: "Chemical Coordination and Integration", progress: 0 }, { name: "Sexual Reproduction in Flowering Plants", progress: 0 },
        { name: "Human Reproduction", progress: 0 }, { name: "Reproductive Health", progress: 0 },
        { name: "Principles of Inheritance and Variation", progress: 0 }, { name: "Molecular Basis of Inheritance", progress: 0 },
        { name: "Evolution", progress: 0 }, { name: "Human Health and Disease", progress: 0 },
        { name: "Microbes in Human Welfare", progress: 0 }, { name: "Biotechnology: Principles", progress: 0 },
        { name: "Biotechnology and its Applications", progress: 0 }, { name: "Organisms and Populations", progress: 0 },
        { name: "Ecosystem", progress: 0 }, { name: "Biodiversity and Conservation", progress: 0 }
    ],
    phy: {
        c11p1: ["Units & Measurements", "Motion in Straight Line", "Motion in Plane", "Laws of Motion"],
        c11p2: ["Work Energy Power", "Rotational Motion", "Gravitation", "Properties of Solids"],
        c12p1: ["Electrostatics", "Current Electricity", "Magnetism", "EMI & AC"],
        c12p2: ["Ray Optics", "Wave Optics", "Modern Physics", "Semiconductors"]
    },
    chem: {
        physical: ["Mole Concept", "Atomic Structure", "Thermodynamics", "Equilibrium", "Solutions"],
        inorganic: ["Periodic Table", "Chemical Bonding", "p-Block", "d-f Block", "Coordination"],
        organic: ["GOC", "Hydrocarbons", "Haloalkanes", "Aldehydes", "Amines"]
    }
};

let activeUser = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        activeUser = user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().is_approved) {
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('dashboardSection').classList.remove('hidden');
            document.getElementById('welcomeUser').innerText = `Dr. ${userDoc.data().name}`;
            document.getElementById('userPointsDisplay').innerText = userDoc.data().bp_coins || 0;
            switchSubject('bio');
        } else {
            document.getElementById('msg').innerText = "Monirul Sir ekhono approve koreni!";
            setTimeout(() => signOut(auth), 3000);
        }
    } else {
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
    }
});

window.switchSubject = (sub) => {
    const tree = document.getElementById('syllabusTree');
    tree.innerHTML = '';
    
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('bg-yellow-600', 'text-slate-950'));
    document.getElementById(`tab-${sub}`).classList.add('bg-yellow-600', 'text-slate-950');

    if (sub === 'bio') {
        renderChapters(syllabus.bio, "Biology (32 Chapters)");
    } else if (sub === 'phy') {
        renderSection(syllabus.phy.c11p1, "Physics 11 - Part 1");
        renderSection(syllabus.phy.c11p2, "Physics 11 - Part 2");
        renderSection(syllabus.phy.c12p1, "Physics 12 - Part 1");
        renderSection(syllabus.phy.c12p2, "Physics 12 - Part 2");
    } else if (sub === 'chem') {
        renderSection(syllabus.chem.physical, "Physical Chemistry");
        renderSection(syllabus.chem.inorganic, "Inorganic Chemistry");
        renderSection(syllabus.chem.organic, "Organic Chemistry");
    }
};

function renderChapters(list, title) {
    const tree = document.getElementById('syllabusTree');
    tree.innerHTML += `<p class="text-[10px] font-bold text-slate-500 uppercase mt-6 mb-2 pl-2 tracking-tighter">${title}</p>`;
    list.forEach(ch => {
        tree.innerHTML += `
            <div class="p-4 mb-2 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-yellow-500/50 transition-all cursor-pointer">
                <div class="flex justify-between text-xs font-bold mb-2">
                    <span>${ch.name}</span>
                    <span class="text-yellow-500">${ch.progress}%</span>
                </div>
                <div class="w-full bg-slate-800 h-1 rounded-full"><div class="bg-yellow-500 h-full" style="width:${ch.progress}%"></div></div>
            </div>`;
    });
}

function renderSection(list, title) {
    const tree = document.getElementById('syllabusTree');
    tree.innerHTML += `<p class="text-[10px] font-bold text-slate-500 uppercase mt-6 mb-2 pl-2">${title}</p>`;
    list.forEach(name => {
        tree.innerHTML += `
            <div class="p-4 mb-2 bg-slate-900/40 rounded-xl border border-slate-800 hover:border-blue-500/50 cursor-pointer">
                <h4 class="text-[11px] font-bold">${name}</h4>
            </div>`;
    });
}

document.getElementById('btnAction').onclick = async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), { name, email, is_approved: false, bp_coins: 0 });
        document.getElementById('msg').innerText = "Request Sent! Monirul-ke bolo approve korte.";
    } catch (e) { alert(e.message); }
};

document.getElementById('btnLogin').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert("Login Failed!"); }
};

document.getElementById('btnLogout').onclick = () => signOut(auth);
        
