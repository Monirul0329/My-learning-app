import { auth, db } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let user = null;
const syllabus = {
    biology: [
        { id: "01", name: "The Living World", isFree: true, topics: ["1.1 Defining Life", "1.2 Taxonomical Aids"] },
        { id: "02", name: "Biological Classification", isFree: false, topics: ["2.1 Kingdom Monera", "2.2 Kingdom Protista"] }
    ],
    physics: [
        { id: "01", name: "Units & Measurements", isFree: true, topics: ["1.1 Dimensions", "1.2 Errors"] }
    ]
};

onSnapshot(doc(db, "users", auth.currentUser?.uid || 'temp'), (d) => {
    user = d.data();
    if(user) document.getElementById('bpBox').innerText = `${user.bp_coins} BP`;
});

window.renderSubjects = () => {
    const list = document.getElementById('subjectList');
    list.innerHTML = Object.keys(syllabus).map((sub, index) => `
        <button onclick="openSyllabus('${sub}')" class="w-full p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex justify-between items-center">
            <span class="font-black uppercase">${index+1}. ${sub} Battle</span>
            <i class="fas fa-chevron-right text-slate-700"></i>
        </button>
    `).join('');
};

window.openSyllabus = (sub) => {
    const panel = document.getElementById('contentPanel');
    const data = document.getElementById('panelData');
    panel.classList.remove('hidden');
    data.innerHTML = syllabus[sub].map(ch => {
        const locked = !user.is_paid && !ch.isFree;
        return `
            <div class="mb-6 p-6 bg-slate-900 rounded-[2rem] border ${locked ? 'border-red-900/30' : 'border-slate-800'}">
                <p class="text-[10px] font-bold text-slate-500 mb-2 uppercase">Chapter ${ch.id}</p>
                <h4 class="font-black text-lg mb-4">${ch.name}</h4>
                <div class="space-y-2">
                    ${ch.topics.map(t => `
                        <div onclick="access('${ch.id}', '${t}')" class="p-4 bg-slate-800 rounded-2xl text-sm font-bold flex justify-between items-center">
                            <span>${t}</span>
                            <i class="fas ${locked ? 'fa-lock text-red-500' : 'fa-play text-green-500'}"></i>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }).join('');
};

window.access = (chId, topic) => {
    const chapter = Object.values(syllabus).flat().find(c => c.id === chId);
    if(user.is_paid || chapter.isFree) {
        alert("Opening: " + topic + " (5 Quiz Types A-E)");

    } else { alert("🔒 Chapter Locked! Please complete payment."); }
};

window.closePanel = () => document.getElementById('contentPanel').classList.add('hidden');
renderSubjects();
