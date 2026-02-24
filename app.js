import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDlmQWV3IN_asZolPyaBLBb7L_RG0uriZM",
  authDomain: "mneet-f9bc7.firebaseapp.com",
  projectId: "mneet-f9bc7",
  storageBucket: "mneet-f9bc7.firebasestorage.app",
  messagingSenderId: "944379440196",
  appId: "1:944379440196:web:9d26b632b3e778d247e011",
  measurementId: "G-70T6K3DLGT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const questions = [
    { q: "Basic unit of life is?", a: ["Tissue", "Organ", "Cell", "Atom"], c: 2 },
    { q: "Who proposed Cell Theory?", a: ["Robert Hooke", "Schleiden & Schwann", "Virchow", "Darwin"], c: 1 },
    { q: "Powerhouse of the cell?", a: ["Ribosome", "Nucleus", "Mitochondria", "Golgi"], c: 2 }
];

let userScore = 0;
let currentQ = 0;
let attempt = 1;
let timer;
let timeLeft;
let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().is_approved) {
            document.getElementById('welcomeUser').innerText = `Dr. ${userDoc.data().name}`;
            userScore = userDoc.data().bp_coins || 0;
            attempt = userDoc.data().attempt_count || 1;
            document.getElementById('userPoints').innerText = userScore;
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('dashboardSection').classList.remove('hidden');
            loadQuiz();
        } else {
            document.getElementById('msg').innerText = "Access Pending! Wait for Monirul Sir.";
            setTimeout(() => signOut(auth), 5000);
        }
    } else {
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
    }
});

function loadQuiz() {
    if (currentQ >= questions.length) {
        finishQuiz();
        return;
    }

    const data = questions[currentQ];
    document.getElementById('questionText').innerText = data.q;
    document.getElementById('attemptCount').innerText = attempt;
    document.getElementById('progressBar').style.width = `${((currentQ) / questions.length) * 100}%`;
    
    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';
    
    data.a.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = "p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left font-bold hover:border-yellow-500 transition-all option-btn";
        btn.innerText = opt;
    
        if (attempt > 1) {
            btn.classList.add('opacity-60', 'cursor-not-allowed');
            if (i === data.c) btn.classList.add('border-green-500', 'text-green-500');
        } else {
            btn.onclick = () => handleAnswer(i, btn);
        }
        grid.appendChild(btn);
    });

    startTimer();
}

function handleAnswer(choice, btn) {
    clearInterval(timer);
    const correct = questions[currentQ].c;
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');

    if (choice === correct) {
        userScore += 4;
        btn.classList.add('bg-green-600', 'border-green-400');
    } else {
        userScore -= 2;
        btn.classList.add('bg-red-600', 'border-red-400', 'animate-shake');
        allBtns[correct].classList.add('bg-green-600', 'border-green-400');
    }
    
    document.getElementById('userPoints').innerText = userScore;
    updateDoc(doc(db, "users", currentUser.uid), { bp_coins: userScore });
}

function startTimer() {
    clearInterval(timer);
    timeLeft = attempt === 1 ? 60 : (attempt === 2 ? 45 : 35);
    
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('quizTimer').innerText = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

document.getElementById('nextBtn').onclick = nextQuestion;

function nextQuestion() {
    currentQ++;
    loadQuiz();
}

async function finishQuiz() {
    clearInterval(timer);
    alert(`Quiz Done! Total BP Coins: ${userScore}`);
    attempt++;
    await updateDoc(doc(db, "users", currentUser.uid), { attempt_count: attempt });
    location.reload();
}

document.getElementById('btnAction').onclick = async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), { name, email, is_approved: false, bp_coins: 0, attempt_count: 1 });
        document.getElementById('msg').innerText = "Request Sent! Wait for approval.";
    } catch (e) { document.getElementById('msg').innerText = e.message; }
};

document.getElementById('btnLogin').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert("Error!"); }
};

document.getElementById('btnLogout').onclick = () => signOut(auth);
        
