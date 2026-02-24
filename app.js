import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
        { id: "08", name: "Cell: The Unit of Life", topics: ["8.1 Cell Theory", "8.2 Eukaryotic Cell"] }
    ],
    phy: {
        c11: [{ id: "01", name: "Units & Measurements", topics: ["1.1 Dimensions", "1.2 Significant Figures"] }],
        c12: [{ id: "15", name: "Ray Optics", topics: ["15.1 Reflection", "15.2 Refraction"] }]
    },
    chem: {
        physical: [{ id: "01", name: "Some Basic Concepts", topics: ["1.1 Mole Concept"] }],
        inorganic: [{ id: "03", name: "Chemical Bonding", topics: ["3.1 Hybridization"] }],
        organic: [{ id: "10", name: "GOC", topics: ["10.1 Inductive Effect"] }]
    }
};

let userState = { bp: 0, attempt: 1, uid: null };
let quizState = { currentQ: 0, timeLeft: 0, timer: null, answers: [] };

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userState.uid = user.uid;
        const d = await getDoc(doc(db, "users", user.uid));
        userState.bp = d.data().bp_coins || 0;
        userState.attempt = d.data().attempt_count || 1;
        document.getElementById('dashboardSection').classList.remove('hidden');
        document.getElementById('userPointsDisplay').innerText = userState.bp;
        document.getElementById('attemptDisplay').innerText = userState.attempt;
        switchSubject('bio');
    }
});

window.switchSubject = (sub) => {
  
    document.querySelectorAll('[id^="tab-"]').forEach(btn => btn.className = "w-full py-4 rounded-2xl font-black text-xs border border-slate-800 hover:bg-slate-900 flex items-center px-6 gap-3 transition-all");
    document.getElementById(`tab-${sub}`).className = "w-full py-4 rounded-2xl font-black text-xs border border-slate-800 bg-yellow-600 text-slate-950 flex items-center px-6 gap-3 transition-all";
    
    const tree = document.getElementById('syllabusTree');
    tree.innerHTML = '';
    
    if(sub === 'bio') syllabus.bio.forEach(ch => renderChapter(ch, "BIO"));
    else if(sub === 'phy') {
        renderLabel("CLASS 11 PHYSICS"); syllabus.phy.c11.forEach(ch => renderChapter(ch, "PHY"));
        renderLabel("CLASS 12 PHYSICS"); syllabus.phy.c12.forEach(ch => renderChapter(ch, "PHY"));
    }
    else if(sub === 'chem') {
        renderLabel("PHYSICAL"); syllabus.chem.physical.forEach(ch => renderChapter(ch, "CHEM"));
        renderLabel("ORGANIC"); syllabus.chem.organic.forEach(ch => renderChapter(ch, "CHEM"));
    }
};

function renderChapter(ch, sub) {
    const tree = document.getElementById('syllabusTree');
    tree.innerHTML += `
        <div class="mb-6">
            <h4 class="text-[10px] font-black text-slate-500 mb-2 px-2">${sub} CH-${ch.id}: ${ch.name}</h4>
            <div class="space-y-1">
                ${ch.topics.map(t => `<div onclick="initQuizFlow('${t}')" class="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 hover:border-yellow-500 cursor-pointer text-[11px] font-bold">${t}</div>`).join('')}
            </div>
        </div>`;
}

window.initQuizFlow = (topic) => {
    document.getElementById('selectedTopicTitle').innerText = topic;
    document.getElementById('quizTypePanel').classList.remove('hidden');
    document.getElementById('quizArena').classList.add('hidden');
    document.getElementById('pdfViewer').classList.add('hidden');
    
    const types = ['A. Statement Base', 'B. Assertion Reason', 'C. Correct/Incorrect', 'D. Diagram Base', 'E. Matching Column'];
    const grid = document.getElementById('quizTypeGrid');
    grid.innerHTML = types.map(type => `
        <button onclick="startFinalQuiz('${topic}', '${type}')" class="bg-slate-900 border-2 border-slate-800 p-6 rounded-[2rem] hover:border-yellow-500 transition-all text-center">
            <span class="text-yellow-500 font-black text-xl block mb-1">${type.split('.')[0]}</span>
            <p class="text-[10px] font-bold text-slate-400">${type.split('. ')[1]}</p>
        </button>`).join('');
};

window.startFinalQuiz = (topic, type) => {
    document.getElementById('quizTypePanel').classList.add('hidden');
    document.getElementById('quizArena').classList.remove('hidden');
  
    quizState.timeLeft = userState.attempt === 1 ? 60 : (userState.attempt === 2 ? 45 : 35);
    runTimer();

};

function runTimer() {
    clearInterval(quizState.timer);
    quizState.timer = setInterval(() => {
        if(quizState.timeLeft > 0) {
            quizState.timeLeft--;
            document.getElementById('quizTimer').innerText = `00:${quizState.timeLeft < 10 ? '0' : ''}${quizState.timeLeft}`;
        } else {
          
            const btns = document.querySelectorAll('#optionsGrid button');
            btns.forEach(b => b.onclick = null);
        }
    }, 1000);
}

window.openNCERT = () => {
    document.getElementById('pdfViewer').classList.remove('hidden');
    document.getElementById('quizTypePanel').classList.add('hidden');
    document.getElementById('quizArena').classList.add('hidden');
};

function renderLabel(l) { document.getElementById('syllabusTree').innerHTML += `<p class="text-[9px] font-black text-yellow-500/50 mt-6 mb-2 tracking-widest pl-2">${l}</p>`; }
          
