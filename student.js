import { db, auth } from './firebase-config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

let currentUser = null;

const syllabusData = {
    biology: [
        { id: "01", name: "The Living World", topics: ["1.1 Defining Life", "1.2 Taxonomy"], isFree: true },
        { id: "02", name: "Classification", topics: ["2.1 Monera", "2.2 Protista"], isFree: false }
    ]
};

onAuthStateChanged(auth, user => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), d => {
            currentUser = d.data();
            document.getElementById('bpDisplay').innerText = currentUser.bp_coins || 0;
        });
    } else {
        window.location.href = 'index.html';
    }
});

window.loadSubject = (sub) => {
    const screen = document.getElementById('contentScreen');
    const dataArea = document.getElementById('screenData');
    screen.classList.remove('hidden');
    
    let html = `<h2 class="text-2xl font-black mb-6 uppercase text-yellow-500">${sub} Syllabus</h2>`;
    syllabusData[sub].forEach(ch => {
        const isLocked = !currentUser.is_paid && !ch.isFree;
        html += `
            <div class="p-6 bg-slate-900 border ${isLocked ? 'border-red-900/30' : 'border-slate-800'} rounded-3xl relative">
                <h4 class="text-xs font-black text-slate-500 mb-4 uppercase">CH-${ch.id}: ${ch.name}</h4>
                <div class="space-y-2">
                    ${ch.topics.map(t => `
                        <div onclick="accessTopic('${ch.id}', '${t}')" class="p-4 bg-slate-800 rounded-xl text-sm font-bold flex justify-between items-center cursor-pointer hover:bg-slate-700">
                            <span>${t}</span>
                            ${isLocked ? '<i class="fas fa-lock text-red-500"></i>' : '<i class="fas fa-play text-green-500"></i>'}
                        </div>
                    `).join('')}
                </div>
            </div>`;
    });
    dataArea.innerHTML = html;
};

window.accessTopic = (chId, topic) => {
    const chapter = syllabusData.biology.find(c => c.id === chId);
    if (currentUser.is_paid || (chapter && chapter.isFree)) {
        renderQuizOptions(topic);
    } else {
        alert("Locked! Please complete your payment for full access.");
    }
};

window.renderQuizOptions = (topic) => {
    document.getElementById('screenData').innerHTML = `
        <h2 class="text-xl font-bold mb-6">${topic} - Select Quiz Type</h2>
        <div class="grid grid-cols-1 gap-3">
            <button class="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-left font-bold hover:border-yellow-500">A. Statement Base Quiz</button>
            <button class="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-left font-bold hover:border-yellow-500">B. Assertion-Reason Quiz</button>
            <button class="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-left font-bold hover:border-yellow-500">C. Correct/Incorrect Quiz</button>
            <button class="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-left font-bold hover:border-yellow-500">D. Diagram Base Quiz</button>
            <button class="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-left font-bold hover:border-yellow-500">E. Matching Column Quiz</button>
        </div>
    `;
};

window.closeScreen = () => document.getElementById('contentScreen').classList.add('hidden');
