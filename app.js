import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDlmQWV3IN_asZolPyaBLBb7L_RG0uriZM",
    authDomain: "mneet-f9bc7.firebaseapp.com",
    projectId: "mneet-f9bc7",
    storageBucket: "mneet-f9bc7.firebasestorage.app",
    appId: "1:944379440196:web:9d26b632b3e778d247e011"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const syllabus = {
    bio: [
        { id: "01", name: "The Living World", pdf: "https://ncert.nic.in/textbook/pdf/kebo101.pdf", topics: ["1.1 What is Living?", "1.2 Taxonomy"] },
        { id: "08", name: "Cell: Unit of Life", pdf: "https://ncert.nic.in/textbook/pdf/kebo108.pdf", topics: ["8.1 Prokaryotic", "8.2 Eukaryotic"] }
    ],
    phy: {
        c11: [{ id: "01", name: "Units & Measurements", pdf: "https://ncert.nic.in/textbook/pdf/keph101.pdf", topics: ["1.1 Dimensions"] }]
    }
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('topBar').classList.remove('hidden');
        const d = await getDoc(doc(db, "users", user.uid));
        const role = d.data().role || 'student';
        const bp = d.data().bp_coins || 0;
        
        document.getElementById('bpCoins').innerText = bp;
        updateRankUI(bp);

        if(role === 'admin') renderAdmin();
        else if(role === 'teacher') renderTeacher();
        else renderStudentHome();
    } else {
        renderLogin();
    }
});

function renderStudentHome() {
    const main = document.getElementById('mainApp');
    main.innerHTML = `
        <div class="space-y-6">
            <div class="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/20">
                <h2 class="text-3xl font-black">Hello, Doc!</h2>
                <p class="text-indigo-200 text-xs mt-2 uppercase tracking-widest">Syllabus Completion: 0%</p>
            </div>

            <h3 class="text-sm font-black text-slate-500 uppercase px-2">Main Sections</h3>
            <div class="grid grid-cols-1 gap-4">
                <button onclick="renderSubjectMenu('bio')" class="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] flex justify-between items-center group hover:border-yellow-500">
                    <span class="font-bold"><i class="fas fa-dna mr-3 text-yellow-500"></i> BIOLOGY</span>
                    <i class="fas fa-arrow-right text-slate-700 group-hover:text-yellow-500"></i>
                </button>
                <button onclick="renderSubjectMenu('phy')" class="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] flex justify-between items-center group">
                    <span class="font-bold"><i class="fas fa-bolt mr-3 text-blue-500"></i> PHYSICS</span>
                    <i class="fas fa-arrow-right"></i>
                </button>
                <button onclick="renderNCERTHub()" class="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] flex justify-between items-center group">
                    <span class="font-bold text-emerald-500"><i class="fas fa-book-open mr-3"></i> NCERT BOOKS (PDF)</span>
                    <i class="fas fa-file-pdf"></i>
                </button>
            </div>
        </div>
    `;
}

window.renderNCERTHub = () => {
    const main = document.getElementById('mainApp');
    main.innerHTML = `
        <h2 class="text-2xl font-black mb-6 px-2">NCERT Library</h2>
        <div class="space-y-4">
            <div class="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
                <h4 class="text-xs font-black text-yellow-500 mb-4">BIOLOGY CLASS 11</h4>
                <div class="space-y-2">
                    ${syllabus.bio.map(ch => `
                        <button onclick="openPDF('${ch.pdf}', '${ch.name}')" class="w-full text-left p-3 bg-slate-800/50 rounded-xl text-[11px] font-bold flex justify-between">
                            <span>CH-${ch.id}: ${ch.name}</span>
                            <i class="fas fa-eye text-indigo-400"></i>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
};

window.openPDF = (url, title) => {
    document.getElementById('pdfTitle').innerText = title;
    document.getElementById('pdfFrame').src = url;
    document.getElementById('pdfModal').classList.remove('hidden');
};

window.closePDF = () => {
    document.getElementById('pdfModal').classList.add('hidden');
    document.getElementById('pdfFrame').src = "";
};

function updateRankUI(bp) {
    let rank = "Aspirant";
    if(bp > 1000) rank = "Junior Resident";
    if(bp > 5000) rank = "Senior Surgeon";
    document.getElementById('userRank').innerText = rank;
}

document.getElementById('backBtn').onclick = () => renderStudentHome();
