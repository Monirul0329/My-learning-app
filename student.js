import { db, auth } from './firebase-config.js';
import { doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const chapters = {
    bio: [
        { id: "01", name: "The Living World", topics: ["1.1 What is Living?", "1.2 Taxonomy"] },
        { id: "08", name: "Cell: Unit of Life", topics: ["8.1 Prokaryotic Cell", "8.2 Eukaryotic Cell"] }
    ],
    phy: [
        { id: "01", name: "Units & Measurements", topics: ["1.1 Dimensions", "1.2 Significant Figures"] }
    ]
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (d) => {
            const data = d.data();
            document.getElementById('bpDisplay').innerText = data.bp_coins || 0;
            document.getElementById('studentLevel').innerText = data.bp_coins > 2000 ? "Resident Doctor" : "Aspirant";
        });
    }
});

window.openSubject = (sub) => {
    const screen = document.getElementById('contentScreen');
    const dataArea = document.getElementById('screenData');
    screen.classList.remove('hidden');
    
    let html = `<h2 class="text-3xl font-black mb-8 uppercase">${sub} Syllabus</h2>`;
    chapters[sub].forEach(ch => {
        html += `
            <div class="mb-8">
                <h4 class="text-xs font-black text-slate-500 mb-3">CHAPTER ${ch.id}: ${ch.name}</h4>
                <div class="space-y-2">
                    ${ch.topics.map(t => `
                        <div onclick="showQuizTypes('${t}')" class="p-5 bg-slate-900 rounded-[1.5rem] border border-slate-800 hover:border-yellow-500 cursor-pointer text-sm font-bold">
                            ${t}
                        </div>
                    `).join('')}
                </div>
            </div>`;
    });
    dataArea.innerHTML = html;
};

window.showQuizTypes = (topic) => {
    const dataArea = document.getElementById('screenData');
    dataArea.innerHTML = `
        <h2 class="text-2xl font-black mb-2">${topic}</h2>
        <p class="text-slate-500 text-xs mb-8">Select Question Type (+4 / -2 Marking)</p>
        <div class="grid grid-cols-1 gap-4">
            <button class="p-6 bg-slate-900 border-2 border-slate-800 rounded-3xl text-left font-bold hover:border-yellow-500">A. Statement Base Quiz</button>
            <button class="p-6 bg-slate-900 border-2 border-slate-800 rounded-3xl text-left font-bold hover:border-yellow-500">B. Assertion Reason Quiz</button>
            <button class="p-6 bg-slate-900 border-2 border-slate-800 rounded-3xl text-left font-bold hover:border-yellow-500">C. Correct/Incorrect Quiz</button>
            <button class="p-6 bg-slate-900 border-2 border-slate-800 rounded-3xl text-left font-bold hover:border-yellow-500">D. Diagram Base Quiz</button>
            <button class="p-6 bg-slate-900 border-2 border-slate-800 rounded-3xl text-left font-bold hover:border-yellow-500">E. Matching Column Quiz</button>
        </div>
    `;
};

window.closeContent = () => document.getElementById('contentScreen').classList.add('hidden');
