import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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


const syllabus = {
    bio: [
        { id: "01", name: "The Living World", topics: ["1.1 What is Living?", "1.2 Taxonomy"] },
        { id: "02", name: "Biological Classification", topics: ["2.1 Kingdom Monera", "2.2 Fungi"] },
        { id: "08", name: "Cell: The Unit of Life", topics: ["8.1 Prokaryotic Cell", "8.2 Eukaryotic Cell"] }
      
    ],
    phy: {
        c11: [
            { id: "01", name: "Units and Measurements", topics: ["1.1 Dimensions", "1.2 Errors"] },
            { id: "02", name: "Motion in a Straight Line", topics: ["2.1 Velocity", "2.2 Acceleration"] }
        ],
        c12: [
            { id: "16", name: "Electrostatic Potential", topics: ["16.1 Capacitance", "16.2 Dielectrics"] }
        ]
    },
    chem: {
        physical: [{ id: "01", name: "Some Basic Concepts", topics: ["1.1 Mole Concept"] }],
        inorganic: [{ id: "05", name: "Chemical Bonding", topics: ["5.1 VSEPR Theory"] }],
        organic: [{ id: "12", name: "GOC", topics: ["12.1 Isomerism"] }]
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('dashboardSection').classList.remove('hidden');
        switchSubject('bio');
    }
});

window.switchSubject = (sub) => {
    const tree = document.getElementById('syllabusTree');
    tree.innerHTML = '';
    
    document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('bg-yellow-600', 'text-slate-950'));
    document.getElementById(`tab-${sub}`).classList.add('bg-yellow-600', 'text-slate-950');

    if(sub === 'bio') renderBio();
    if(sub === 'phy') renderPhy();
    if(sub === 'chem') renderChem();
};

function renderBio() {
    syllabus.bio.forEach(ch => createChapterCard(ch));
}

function renderPhy() {
    treeLabel("CLASS 11 - PHYSICS");
    syllabus.phy.c11.forEach(ch => createChapterCard(ch));
    treeLabel("CLASS 12 - PHYSICS");
    syllabus.phy.c12.forEach(ch => createChapterCard(ch));
}

function renderChem() {
    treeLabel("PHYSICAL CHEMISTRY");
    syllabus.chem.physical.forEach(ch => createChapterCard(ch));
    treeLabel("INORGANIC CHEMISTRY");
    syllabus.chem.inorganic.forEach(ch => createChapterCard(ch));
    treeLabel("ORGANIC CHEMISTRY");
    syllabus.chem.organic.forEach(ch => createChapterCard(ch));
}

function createChapterCard(ch) {
    const tree = document.getElementById('syllabusTree');
    const div = document.createElement('div');
    div.className = "mb-4 border-l-2 border-slate-800 pl-4";
    div.innerHTML = `
        <h4 class="text-xs font-black text-slate-400 mb-2 uppercase">CH-${ch.id}: ${ch.name}</h4>
        <div class="space-y-1">
            ${ch.topics.map(t => `
                <div onclick="showQuizTypes('${t}')" class="p-3 text-[11px] bg-slate-900 rounded-lg hover:bg-yellow-500 hover:text-slate-950 cursor-pointer transition-all">
                    ${t}
                </div>
            `).join('')}
        </div>
    `;
    tree.appendChild(div);
}

function treeLabel(text) {
    document.getElementById('syllabusTree').innerHTML += `<p class="text-[10px] font-black text-yellow-500/50 mt-6 mb-2 tracking-widest">${text}</p>`;
}

window.showQuizTypes = (topic) => {
    document.getElementById('quizTypeSelector').classList.remove('hidden');
    document.getElementById('mainView').innerHTML = `
        <div class="text-center">
            <h2 class="text-2xl font-bold text-white mb-2">${topic}</h2>
            <p class="text-slate-500">Select a Question Type from above to start the Battle.</p>
        </div>
    `;
};
