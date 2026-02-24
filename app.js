import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = { };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const biologyCourse = [
    {
        chapter: "Cell: The Unit of Life",
        topics: [
            { 
                name: "Cell Theory", 
                questions: [
                    { q: "Who proposed cell theory?", a: ["Hooke", "Schleiden & Schwann", "Virchow", "Brown"], c: 1 },
                    { q: "Omnis cellula-e cellula means?", a: ["All cells grow", "Cells from pre-existing cells", "Cell is unit", "None"], c: 1 }
                ] 
            }
        ]
    }
];

let quizState = {
    questions: [],
    currentIdx: 0,
    answers: [],
    timeLeft: 0,
    timer: null,
    attempt: 1,
    points: 0
};

function startTopicQuiz(topicIdx, chapIdx) {
    const topic = biologyCourse[chapIdx].topics[topicIdx];
    quizState.questions = topic.questions;
    quizState.currentIdx = 0;
    quizState.answers = new Array(topic.questions.length).fill(null);
    quizState.timeLeft = quizState.attempt === 1 ? 60 : (quizState.attempt === 2 ? 45 : 35);
    
    document.getElementById('quizView').classList.remove('hidden');
    renderQuestion();
    runTimer();
}

function renderQuestion() {
    const q = quizState.questions[quizState.currentIdx];
    document.getElementById('questionText').innerText = q.q;
    document.getElementById('qProgress').style.width = `${((quizState.currentIdx + 1) / quizState.questions.length) * 100}%`;
    
    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';
    
    q.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = `p-5 rounded-2xl border border-slate-800 text-left font-bold transition-all ${quizState.answers[quizState.currentIdx] === i ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-900'}`;
        btn.innerText = opt;
        
        if(quizState.timeLeft > 0) {
            btn.onclick = () => {
                quizState.answers[quizState.currentIdx] = i;
                renderQuestion();
            };
        } else {
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }
        grid.appendChild(btn);
    });
}

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

document.getElementById('nextBtn').onclick = () => {
    if(quizState.currentIdx < quizState.questions.length - 1) {
        quizState.currentIdx++;
        renderQuestion();
    } else {
        calculateResults();
    }
};

document.getElementById('prevBtn').onclick = () => {
    if(quizState.currentIdx > 0) {
        quizState.currentIdx--;
        renderQuestion();
    }
};

function calculateResults() {
    clearInterval(quizState.timer);
    let correct = 0, wrong = 0, skip = 0;
    
    quizState.questions.forEach((q, i) => {
        const userAns = quizState.answers[i];
        if(userAns === null) skip++;
        else if(userAns === q.c) {
            correct++;
            quizState.points += 4;
        } else {
            wrong++;
            quizState.points -= 2;
        }
    });

    const accuracy = ((correct / quizState.questions.length) * 100).toFixed(1);
    
    document.getElementById('resCorrect').innerText = correct;
    document.getElementById('resWrong').innerText = wrong;
    document.getElementById('resSkip').innerText = skip;
    document.getElementById('resAccuracy').innerText = accuracy + "%";
    document.getElementById('userRank').innerText = quizState.points + " BP";
    document.getElementById('distTopper').innerText = (120 - quizState.points) + " BP";
    
    document.getElementById('resultPanel').classList.remove('hidden');
}
