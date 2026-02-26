import { getFirestore, collection, query, where, getDocs, updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft;
let attemptCount = 0; // Re-attempt track korar jonno

// ১. কুইজ শুরু করা (Topic-wise Bulk)
export async function startQuiz(subject, chapter, topic, userData) {
    const q = query(collection(db, "quizzes"), 
              where("subject", "==", subject),
              where("chapter", "==", chapter),
              where("topic", "==", topic));
    
    const snap = await getDocs(q);
    currentQuiz = [];
    snap.forEach(d => currentQuiz.push({id: d.id, ...d.data()}));

    if(currentQuiz.length === 0) return alert("No questions in this topic yet!");

    // ২. অ্যাডভান্সড টাইমার লজিক (Re-attempt speed up)
    // First time 60s, 2nd time 40s, 3rd time 20s (Example)
    attemptCount = userData.attempts?.[topic] || 0;
    timeLeft = Math.max(60 - (attemptCount * 20), 10); // Minimum 10 second thakbe
    
    currentIndex = 0;
    score = 0;
    renderQuizUI();
    startTimer();
}

// ৩. কুইজ ইন্টারফেস (Image + Options)
function renderQuizUI() {
    const dashboard = document.getElementById('dashboard');
    const q = currentQuiz[currentIndex];
    
    dashboard.innerHTML = `
        <div class="animate-fade-in space-y-6">
            <div class="flex justify-between items-center glass p-4 rounded-2xl border-b-2 border-yellow-500">
                <span class="text-xs font-black text-yellow-500 uppercase">Q: ${currentIndex + 1}/${currentQuiz.length}</span>
                <div id="timerDisplay" class="bg-red-600 text-white px-4 py-1 rounded-full font-mono font-bold animate-pulse">
                    00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}
                </div>
            </div>

            <div class="glass p-4 rounded-[2rem] border border-slate-800">
                <img src="${q.image}" class="w-full rounded-2xl mb-6 border-2 border-slate-900 shadow-2xl">
                
                <div class="grid grid-cols-2 gap-4">
                    ${['A', 'B', 'C', 'D'].map(opt => `
                        <button onclick="window.submitAnswer('${opt}', '${q.answer}')" 
                                class="p-6 bg-slate-900 rounded-2xl font-black text-xl hover:bg-yellow-600 hover:text-black transition-all active:scale-90">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="flex justify-between gap-4">
                <button class="flex-1 p-3 glass rounded-xl text-slate-500 text-[10px] font-bold uppercase">Previous</button>
                <button class="flex-1 p-3 glass rounded-xl text-slate-500 text-[10px] font-bold uppercase">Skip</button>
            </div>
        </div>
    `;
}

// ৪. টাইমার ফাংশন
function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timerDisplay').innerText = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
        if(timeLeft <= 0) {
            clearInterval(timer);
            finishQuiz();
        }
    }, 1000);
}

// ৫. আনসার সাবমিট ও বিপি কয়েন ক্যালকুলেশন (+4 / -2)
window.submitAnswer = (selected, correct) => {
    if(selected === correct) {
        score += 4; // +4 for Correct
    } else {
        score -= 2; // -2 for Wrong
    }

    if(currentIndex < currentQuiz.length - 1) {
        currentIndex++;
        renderQuizUI();
    } else {
        finishQuiz();
    }
};

// ৬. রেজাল্ট ড্যাশবোর্ড ও রিওয়ার্ড গেইন
async function finishQuiz() {
    clearInterval(timer);
    const user = JSON.parse(localStorage.getItem('user'));
    
    // ডাটাবেস আপডেট
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
        bp_coins: increment(score),
        [`attempts.${currentQuiz[0].topic}`]: increment(1)
    });

    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <div class="glass p-10 rounded-[3rem] text-center border-t-8 border-yellow-500 animate-bounce-in">
            <h2 class="text-4xl font-black italic text-white mb-2 uppercase">Quiz Done!</h2>
            <p class="text-xs text-slate-500 font-bold mb-8 uppercase tracking-widest">Performance Analysis</p>
            
            <div class="flex justify-center gap-6 mb-10">
                <div class="bg-black p-6 rounded-3xl border border-slate-800">
                    <p class="text-[9px] text-yellow-500 font-black mb-1">BP GAINED</p>
                    <p class="text-3xl font-black text-white">${score}</p>
                </div>
                <div class="bg-black p-6 rounded-3xl border border-slate-800">
                    <p class="text-[9px] text-blue-500 font-black mb-1">SPEED LVL</p>
                    <p class="text-3xl font-black text-white">${attemptCount + 1}x</p>
                </div>
            </div>

            <button onclick="location.reload()" class="btn-gold py-4 shadow-2xl shadow-yellow-600/40">Back to Dashboard</button>
            <p class="mt-6 text-[10px] text-slate-600 font-bold uppercase">Next time the timer will be FASTER!</p>
        </div>
    `;
}

