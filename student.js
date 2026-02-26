import { collection, getDocs, query, where, doc, updateDoc, increment, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let quizData = [];
let currentIdx = 0;
let score = 0;
let timerInt;
let startTime;
let attemptCount = 0;

export function initStudent(userData, db) {
    const container = document.getElementById('appBody');
    renderStudentHome(container, userData);

    // --- NAVIGATION ---
    window.showQuizModes = () => {
        container.innerHTML = `
            <div class="animate-fade-in">
                <h2 class="text-yellow-500 font-black mb-6 uppercase italic tracking-widest text-center">Practice Zone</h2>
                <div class="grid gap-4">
                    <button onclick="selectQuizType('topic-wise')" class="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 flex justify-between items-center group active:scale-95 transition">
                        <div class="text-left">
                            <div class="text-xs font-black text-yellow-600 uppercase">Mode 01</div>
                            <div class="text-lg font-black italic uppercase">Topic Wise Quiz</div>
                        </div>
                        <i class="fas fa-layer-group text-slate-700 group-hover:text-yellow-500 transition"></i>
                    </button>
                    <button onclick="selectQuizType('chapter-wise')" class="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 flex justify-between items-center group active:scale-95 transition">
                        <div class="text-left">
                            <div class="text-xs font-black text-blue-600 uppercase">Mode 02</div>
                            <div class="text-lg font-black italic uppercase">Chapter Wise Quiz</div>
                        </div>
                        <i class="fas fa-book text-slate-700 group-hover:text-blue-500 transition"></i>
                    </button>
                </div>
            </div>
        `;
    };

    window.selectQuizType = async (type) => {
        // Selection Logic for Chapters/Topics
        const q = query(collection(db, type === 'topic-wise' ? "structure/topics" : "chapters"), where("subject", "==", "Biology")); // Subject placeholder
        const snap = await getDocs(q);
        
        container.innerHTML = `<h2 class="text-yellow-500 font-black mb-6 uppercase italic text-center">Select ${type === 'topic-wise' ? 'Topic' : 'Chapter'}</h2><div class="grid gap-2">`;
        snap.forEach(d => {
            const name = d.data().name;
            container.innerHTML += `<button onclick="fetchQuizData('${type}', '${name}')" class="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold uppercase text-left hover:border-yellow-600 transition">${name}</button>`;
        });
        container.innerHTML += `</div><button onclick="showQuizModes()" class="mt-6 text-slate-500 text-[10px] font-black uppercase w-full text-center">Back</button>`;
    };

    window.fetchQuizData = async (type, filterValue) => {
        const qField = type === 'topic-wise' ? 'topic' : 'chapter';
        const q = query(collection(db, "quizzes"), where(qField, "==", filterValue));
        const snap = await getDocs(q);
        
        quizData = [];
        snap.forEach(d => quizData.push({ id: d.id, ...d.data() }));
        
        if (quizData.length > 0) {
            attemptCount = userData.attempts?.[filterValue] || 0;
            startQuizSystem();
        } else {
            alert("Ei section-e akhon kono proshno nei!");
        }
    };

    // --- QUIZ ENGINE ---
    function startQuizSystem() {
        document.getElementById('playerModal').classList.remove('hidden');
        document.getElementById('timerDisplay').classList.remove('hidden');
        currentIdx = 0;
        score = 0;
        startTime = Date.now();
        showQuestion();
        
        // Re-attempt Timer Logic: Proti bar attempt barle somoy 10 sec kore kombe
        let baseTime = 60; 
        let adjustedTime = Math.max(20, baseTime - (attemptCount * 10)); 
        startTimer(adjustedTime);
    }

    function showQuestion() {
        const q = quizData[currentIdx];
        const modal = document.getElementById('modalContent');
        modal.innerHTML = `
            <div class="max-w-xl w-full animate-fade-in">
                <div class="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-4">
                    <span>Question ${currentIdx + 1}/${quizData.length}</span>
                    <span>Attempt: ${attemptCount + 1}</span>
                </div>
                <div class="bg-slate-900 p-2 rounded-[2rem] border-4 border-slate-800 shadow-2xl mb-8 overflow-hidden">
                    <img src="${q.image}" class="w-full rounded-[1.5rem] object-contain max-h-[350px]">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    ${['A', 'B', 'C', 'D'].map(opt => `
                        <button onclick="handleAnswer('${opt}')" class="py-5 bg-slate-900 rounded-2xl font-black text-lg border border-slate-800 hover:bg-yellow-600 hover:text-black hover:border-yellow-600 active:scale-95 transition">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                <div class="flex justify-between mt-10">
                    <button onclick="prevQ()" class="px-6 py-2 rounded-full bg-slate-800 text-[10px] font-black uppercase text-slate-400 ${currentIdx === 0 ? 'opacity-0 pointer-events-none' : ''}">Prev</button>
                    <button onclick="nextQ()" class="px-6 py-2 rounded-full bg-slate-800 text-[10px] font-black uppercase text-yellow-500">Skip</button>
                </div>
            </div>
        `;
    }

    window.handleAnswer = (selected) => {
        if (selected === quizData[currentIdx].answer) score++;
        nextQ();
    };

    window.nextQ = () => {
        if (currentIdx < quizData.length - 1) {
            currentIdx++;
            showQuestion();
        } else {
            finishQuiz();
        }
    };

    window.prevQ = () => {
        if (currentIdx > 0) {
            currentIdx--;
            showQuestion();
        }
    };

    async function finishQuiz() {
        clearInterval(timerInt);
        document.getElementById('playerModal').classList.add('hidden');
        
        const accuracy = ((score / quizData.length) * 100).toFixed(1);
        const bpEarned = Math.floor(score * 5 * (1 / (attemptCount + 1))); // Attempt barle point kombe
        
        // Update User Progress
        const userRef = doc(db, "users", userData.uid);
        await updateDoc(userRef, {
            bpcoins: increment(bpEarned),
            [`attempts.${quizData[0].topic || quizData[0].chapter}`]: increment(1)
        });

        // Result Dashboard Logic
        renderResult(accuracy, bpEarned);
    }

    function renderResult(acc, coins) {
        container.innerHTML = `
            <div class="p-8 bg-slate-900 rounded-[3rem] border border-yellow-500/30 text-center animate-bounce-in shadow-2xl">
                <div class="w-20 h-20 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fas fa-trophy text-3xl text-yellow-500"></i>
                </div>
                <h2 class="text-3xl font-black text-yellow-500 italic mb-2 uppercase">Quiz Result</h2>
                <div class="grid grid-cols-2 gap-4 my-8">
                    <div class="p-5 bg-black/40 rounded-[2rem] border border-slate-800">
                        <div class="text-[9px] text-slate-500 uppercase font-black mb-1">Accuracy</div>
                        <div class="text-3xl font-black">${acc}%</div>
                    </div>
                    <div class="p-5 bg-black/40 rounded-[2rem] border border-slate-800">
                        <div class="text-[9px] text-slate-500 uppercase font-black mb-1">BP Gained</div>
                        <div class="text-3xl font-black text-yellow-500">+${coins}</div>
                    </div>
                </div>
                <div class="bg-black/20 p-4 rounded-2xl mb-8">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Status: <span class="${acc >= 90 ? 'text-green-500' : 'text-red-500'}">${acc >= 90 ? 'PROMOTION ZONE' : 'STAY ZONE'}</span>
                    </p>
                </div>
                <button onclick="location.reload()" class="w-full py-5 bg-yellow-600 text-black font-black rounded-2xl uppercase shadow-lg shadow-yellow-600/20 active:scale-95 transition">Collect Rewards</button>
            </div>
        `;
    }

    function startTimer(sec) {
        let timeLeft = sec;
        document.getElementById('timerDisplay').innerText = `00:${timeLeft}`;
        timerInt = setInterval(() => {
            timeLeft--;
            document.getElementById('timerDisplay').innerText = `00:${timeLeft < 10 ? '0' + timeLeft : timeLeft}`;
            if (timeLeft <= 0) finishQuiz();
        }, 1000);
    }
}

function renderStudentHome(container, userData) {
    // Stats and Level Logic (Already provided in summary)
    container.innerHTML = `
        <div class="animate-fade-in">
            <div class="flex justify-between items-end mb-8">
                <div>
                    <h3 class="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Welcome Back</h3>
                    <h2 class="text-2xl font-black italic uppercase">${userData.name.split(' ')[0]}</h2>
                </div>
                <div class="text-right">
                    <div class="text-green-500 text-[10px] font-black uppercase italic">Study Day: ${userData.studyDays || 1}</div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800">
                    <div class="text-[9px] font-black text-slate-500 uppercase mb-2">Completion</div>
                    <div class="text-2xl font-black text-blue-500">32%</div>
                </div>
                <div class="p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800">
                    <div class="text-[9px] font-black text-slate-500 uppercase mb-2">Rank Status</div>
                    <div class="text-2xl font-black text-yellow-500 uppercase italic">Warrior</div>
                </div>
            </div>

            <div class="space-y-4">
                <button class="w-full p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 flex justify-between items-center group active:scale-[0.98] transition">
                    <span class="text-lg font-black italic uppercase">Prime Lectures</span>
                    <i class="fas fa-play text-yellow-500"></i>
                </button>
                <button onclick="showQuizModes()" class="w-full p-8 bg-yellow-600 text-black rounded-[2.5rem] flex justify-between items-center active:scale-[0.98] transition shadow-xl shadow-yellow-600/10">
                    <span class="text-lg font-black italic uppercase">Practice Zone</span>
                    <i class="fas fa-brain"></i>
                </button>
            </div>
        </div>
    `;
    }
                        
