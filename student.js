import { collection, getDocs, query, where, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let quizData = [];
let currentIdx = 0;
let score = 0;
let timerInt;

export function initStudent(userData, db) {
    const container = document.getElementById('appBody');
    renderStudentHome(container, userData);

    window.showQuizModes = () => {
        container.innerHTML = `
            <h2 class="text-yellow-500 font-black mb-4 uppercase italic">Select Quiz Mode</h2>
            <button onclick="loadQuiz('topic-wise')" class="w-full p-6 bg-slate-900 rounded-3xl mb-3 border border-slate-800 uppercase font-black italic">Topic Wise</button>
            <button onclick="loadQuiz('chapter-wise')" class="w-full p-6 bg-slate-900 rounded-3xl mb-3 border border-slate-800 uppercase font-black italic">Chapter Wise</button>
        `;
    };

    window.loadQuiz = async (type) => {
        const q = query(collection(db, "quizzes"), where("type", "==", type));
        const snap = await getDocs(q);
        quizData = [];
        snap.forEach(d => quizData.push({id: d.id, ...d.data()}));
        if(quizData.length > 0) startQuizSystem();
        else alert("No Quiz Available!");
    };

    function startQuizSystem() {
        document.getElementById('playerModal').classList.remove('hidden');
        document.getElementById('timerDisplay').classList.remove('hidden');
        currentIdx = 0; score = 0;
        showQuestion();
        startTimer(60); // 60 Seconds per question
    }

    function showQuestion() {
        const q = quizData[currentIdx];
        const modal = document.getElementById('modalContent');
        modal.innerHTML = `
            <div class="max-w-xl mx-auto">
                <img src="${q.image}" class="w-full rounded-2xl mb-6 border-4 border-slate-800">
                <div class="grid grid-cols-2 gap-3">
                    ${['A','B','C','D'].map(opt => `
                        <button onclick="checkAns('${opt}')" class="p-4 bg-slate-900 rounded-xl font-black hover:bg-yellow-600 hover:text-black transition">${opt}</button>
                    `).join('')}
                </div>
                <div class="flex justify-between mt-8">
                    <button onclick="prevQ()" class="text-slate-500 font-black uppercase text-xs">Previous</button>
                    <button onclick="nextQ()" class="text-yellow-500 font-black uppercase text-xs">Next</button>
                </div>
            </div>
        `;
    }

    window.checkAns = (opt) => {
        if(opt === quizData[currentIdx].answer) score++;
        nextQ();
    };

    window.nextQ = () => {
        if(currentIdx < quizData.length - 1) { currentIdx++; showQuestion(); }
        else finishQuiz();
    };

    async function finishQuiz() {
        clearInterval(timerInt);
        document.getElementById('playerModal').classList.add('hidden');
        const bpEarned = score * 5;
        await updateDoc(doc(db, "users", userData.uid), { bpcoins: increment(bpEarned) });
        
        container.innerHTML = `
            <div class="bg-slate-900 p-8 rounded-[3rem] text-center border border-yellow-500/30">
                <h2 class="text-3xl font-black text-yellow-500 italic mb-2">RESULT</h2>
                <div class="text-5xl font-black mb-4">${score}/${quizData.length}</div>
                <p class="text-xs text-slate-500 uppercase font-bold mb-6">Earned: ${bpEarned} BP Coins</p>
                <button onclick="location.reload()" class="bg-yellow-600 text-black px-8 py-3 rounded-xl font-black uppercase">Continue</button>
            </div>
        `;
    }

    function startTimer(sec) {
        let t = sec;
        timerInt = setInterval(() => {
            t--;
            document.getElementById('timerDisplay').innerText = `00:${t < 10 ? '0'+t : t}`;
            if(t <= 0) finishQuiz();
        }, 1000);
    }
}

function renderStudentHome(container, userData) {
    container.innerHTML = `
        <div class="bg-slate-900 p-6 rounded-[2rem] mb-6 border border-slate-800 flex justify-between items-center">
            <div>
                <div class="text-[10px] text-slate-500 font-black uppercase">Level</div>
                <div class="text-xl font-black italic text-yellow-500">${userData.levelName || 'NOVICE'}</div>
            </div>
            <div class="text-right">
                <div class="text-[10px] text-slate-500 font-black uppercase">Course Progress</div>
                <div class="text-xl font-black italic text-green-500">24%</div>
            </div>
        </div>
        <button onclick="showQuizModes()" class="w-full p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 mb-4 flex justify-between items-center group active:scale-95 transition">
            <span class="text-lg font-black italic uppercase">Practice Zone</span>
            <i class="fas fa-brain text-yellow-500 text-2xl"></i>
        </button>
    `;
           }
                
