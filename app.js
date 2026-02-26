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
function renderSubjects() {
    const grid = document.getElementById('mainGrid');
    if (!grid) return;

    grid.innerHTML = `<h2 class="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-widest">Select Subject</h2>`;

    Object.keys(SYLLABUS).forEach(sub => {
        const div = document.createElement('div');
        div.className = "p-6 bg-slate-900 rounded-[2rem] border border-slate-800 flex justify-between items-center cursor-pointer mb-3 active:scale-95 transition-all shadow-xl";
        
        div.innerHTML = `
            <div>
                <div class="text-[8px] font-bold text-yellow-500 mb-1 tracking-tighter uppercase">NEET Master 2026</div>
                <div class="font-black italic text-sm text-slate-200 uppercase">${sub}</div>
            </div>
            <i class="fas fa-chevron-right text-slate-700"></i>
        `;
        
        div.onclick = () => { 
            navHistory.push(() => renderSubjects()); 
            renderChapters(sub); 
        };
        grid.appendChild(div);
    });
                }
const SYLLABUS = {
    "Biology": {
        "01. The Living World": ["1.1 What is Living?", "1.2 Diversity in Living World", "1.3 Taxonomic Categories"],
        "02. Biological Classification": ["2.1 Kingdom Monera", "2.2 Kingdom Protista", "2.3 Fungi, Plantae, Animalia", "2.4 Viruses & Lichens"],
        "03. Plant Kingdom": ["3.1 Algae", "3.2 Bryophytes", "3.3 Pteridophytes", "3.4 Gymnosperms & Angiosperms"],
        "04. Animal Kingdom": ["4.1 Basis of Classification", "4.2 Non-Chordates", "4.3 Chordates"],
        "05. Morphology of Flowering Plants": ["5.1 Root, Stem, Leaf", "5.2 Inflorescence", "5.3 Flower, Fruit, Seed"],
        "06. Anatomy of Flowering Plants": ["6.1 Tissues", "6.2 Tissue System", "6.3 Dicot & Monocot Anatomy"],
        "07. Structural Organisation in Animals": ["7.1 Animal Tissues", "7.2 Cockroach/Frog Study"],
        "08. Cell: The Unit of Life": ["8.1 Prokaryotic Cell", "8.2 Eukaryotic Cell", "8.3 Cell Organelles"],
        "09. Biomolecules": ["9.1 Carbohydrates & Proteins", "9.2 Nucleic Acids", "9.3 Enzymes"],
        "10. Cell Cycle & Cell Division": ["10.1 Interphase", "10.2 Mitosis", "10.3 Meiosis"],
        "11. Photosynthesis in Higher Plants": ["11.1 Light Reaction", "11.2 Dark Reaction (C3/C4)"],
        "12. Respiration in Plants": ["12.1 Glycolysis", "12.2 Krebs Cycle", "12.3 ETS"],
        "13. Plant Growth & Development": ["13.1 Growth Regulators (Auxin, Cytokinin)", "13.2 Photoperiodism"],
        "14. Breathing & Exchange of Gases": ["14.1 Mechanism of Breathing", "14.2 Gas Transport"],
        "15. Body Fluids & Circulation": ["15.1 Blood & Lymph", "15.2 Heart & Cardiac Cycle"],
        "16. Excretory Products & Elimination": ["16.1 Nephron Structure", "16.2 Urine Formation"],
        "17. Locomotion & Movement": ["17.1 Muscle Contraction", "17.2 Skeletal System"],
        "18. Neural Control & Coordination": ["18.1 Nerve Impulse", "18.2 Reflex Action"],
        "19. Chemical Coordination": ["19.1 Endocrine Glands", "19.2 Hormone Action"],
        "20. Sexual Reproduction in Flowering Plants": ["20.1 Pollination", "20.2 Double Fertilization"],
        "21. Human Reproduction": ["21.1 Male/Female System", "21.2 Gametogenesis", "21.3 Fertilization"],
        "22. Reproductive Health": ["22.1 Birth Control", "22.2 Infertility & IVF"],
        "23. Principles of Inheritance": ["23.1 Mendel’s Laws", "23.2 Sex Determination", "23.3 Genetic Disorders"],
        "24. Molecular Basis of Inheritance": ["24.1 DNA & RNA", "24.2 Replication", "24.3 Transcription & Translation"],
        "25. Evolution": ["25.1 Origin of Life", "25.2 Darwinism", "25.3 Human Evolution"],
        "26. Human Health & Disease": ["26.1 Common Diseases", "26.2 Immunity", "26.3 AIDS & Cancer"],
        "27. Microbes in Human Welfare": ["27.1 Household & Industrial Products", "27.2 Sewage Treatment"],
        "28. Biotechnology: Principles": ["28.1 Recombinant DNA Technology", "28.2 Restriction Enzymes"],
        "29. Biotechnology: Applications": ["29.1 Bt Cotton & Insulin", "29.2 Gene Therapy"],
        "30. Organisms & Populations": ["30.1 Population Attributes", "30.2 Interactions"],
        "31. Ecosystem": ["31.1 Productivity & Decomposition", "31.2 Energy Flow"],
        "32. Biodiversity & Conservation": ["32.1 Patterns of Biodiversity", "32.2 In-situ & Ex-situ Conservation"]
    },
    "Physics": {
        "01. Units & Measurements": ["1.1 SI Units", "1.2 Error Analysis", "1.3 Dimensions"],
        "02. Motion in a Straight Line": ["2.1 Kinematics Graphs", "2.2 Relative Velocity"],
        "03. Motion in a Plane": ["3.1 Vector Addition", "3.2 Projectile Motion"],
        "04. Laws of Motion": ["4.1 Newton’s Laws", "4.2 Friction", "4.3 Circular Motion"],
        "05. Work, Energy & Power": ["5.1 Work-Energy Theorem", "5.2 Collisions"],
        "06. System of Particles": ["6.1 Center of Mass", "6.2 Torque & Angular Momentum"],
        "07. Gravitation": ["7.1 Kepler’s Laws", "7.2 Gravitational Potential"],
        "08. Thermodynamics": ["8.1 Laws of Thermodynamics", "8.2 Heat Engines"],
        "09. Electrostatics": ["9.1 Coulomb’s Law", "9.2 Gauss Theorem"],
        "10. Ray Optics": ["10.1 Reflection & Refraction", "10.2 Optical Instruments"]
    },
    "Physical Chemistry": {
        "01. Basic Concepts": ["1.1 Mole Concept", "1.2 Stoichiometry"],
        "02. Structure of Atom": ["2.1 Bohr’s Model", "2.2 Quantum Numbers"],
        "03. Chemical Thermodynamics": ["3.1 Enthalpy", "3.2 Entropy & Gibbs Free Energy"],
        "04. Equilibrium": ["4.1 Ionic Equilibrium", "4.2 pH Scale"],
        "05. Chemical Kinetics": ["5.1 Rate Laws", "5.2 Activation Energy"]
    },
    "Inorganic Chemistry": {
        "01. Periodic Classification": ["1.1 Periodic Trends", "1.2 Ionization Enthalpy"],
        "02. Chemical Bonding": ["2.1 VSEPR Theory", "2.2 Hybridization"],
        "03. p-Block Elements": ["3.1 Group 13 to 18"],
        "04. d & f Block Elements": ["4.1 Transition Elements", "4.2 Lanthanoids"],
        "05. Coordination Compounds": ["5.1 IUPAC Naming", "5.2 Crystal Field Theory"]
    },
    "Organic Chemistry": {
        "01. General Organic Chemistry": ["1.1 Isomerism", "1.2 Electronic Effects (Inductive, Resonance)"],
        "02. Hydrocarbons": ["2.1 Alkanes, Alkenes, Alkynes"],
        "03. Haloalkanes & Haloarenes": ["3.1 SN1 & SN2 Reactions"],
        "04. Alcohol, Phenol & Ether": ["4.1 Chemical Properties", "4.2 Identification Tests"],
        "05. Aldehydes & Ketones": ["5.1 Nucleophilic Addition", "5.2 Name Reactions"],
        "06. Amines": ["6.1 Basicity of Amines"]
    }
};
                                              

let userData = null;
const LEVELS = ["Medical Novice", "Cortex Activator", "Syllabus Architect", "Master Clinician", "Test-Tube Titan", "The Diagnostician", "Vitality Voyager", "Neural Conqueror", "The White-Coat Elite", "LEGENDARY SURGEON"];

onAuthStateChanged(auth, (user) => {
   onAuthStateChanged(auth, (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (snap) => {
            if (snap.exists()) {
                userData = snap.data();
                initApp(userData.role); 
            } else {
                console.log("No Firestore data for this UID. Creating entry...");
    
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
    const chSel = document.getElementById('upChapter');
    const topSel = document.getElementById('upTopic');

    subSel.innerHTML = `<option value="">Select Subject</option>` + 
        Object.keys(SYLLABUS).map(s => `<option value="${s}">${s}</option>`).join('');
    subSel.onchange = () => {
        const sub = subSel.value;
        if(sub && SYLLABUS[sub]) {
            const chapters = Object.keys(SYLLABUS[sub]);
            document.getElementById('upChapter').outerHTML = `<select id="upChapter" class="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs"></select>`;
            const newChSel = document.getElementById('upChapter');
            newChSel.innerHTML = `<option value="">Select Chapter</option>` + 
                chapters.map(c => `<option value="${c}">${c}</option>`).join('');
            
            newChSel.onchange = () => {
                const ch = newChSel.value;
                if(ch && SYLLABUS[sub][ch]) {
                    document.getElementById('upTopic').outerHTML = `<select id="upTopic" class="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs"></select>`;
                    const newTopSel = document.getElementById('upTopic');
                    newTopSel.innerHTML = SYLLABUS[sub][ch].map(t => `<option value="${t}">${t}</option>`).join('');
                }
            };
        }
    };
}

document.getElementById('uploadBtn').onclick = async () => {
    const type = document.getElementById('upType').value;
    const subject = document.getElementById('upSubject').value;
    const chapter = document.getElementById('upChapter').value;
    const topic = document.getElementById('upTopic').value;
    const link = document.getElementById('upLink').value;

    if(!subject || !chapter || !topic || !link) {
        alert("Please fill all fields!");
        return;
    }

    try {
        await addDoc(collection(db, "materials"), {
            type, subject, chapter, topic, link,
            teacherId: auth.currentUser.uid,
            teacherName: userData.name,
            createdAt: Date.now()
        });
        alert("Success! Content published to Student Dashboard.");
        document.getElementById('upLink').value = "";
    } catch(e) {
        alert("Upload failed: " + e.message);
    }
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
        
window.updateStatus = async (uid, field, value) => {
    try {
        const userRef = doc(db, "users", uid);
        
        await updateDoc(userRef, { 
            [field]: value 
        });
        
        const msg = field === 'paid' ? (value ? "User Unlocked (Paid)" : "User Locked (Free)") : (value ? "User Blocked" : "User Unblocked");
        alert(msg);
        
    } catch (e) {
        console.error("Update failed:", e);
        alert("Failed to update status. Check internet or permissions.");
    }
};
    
