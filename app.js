import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// [Firebase Config remains the same as before]
const firebaseConfig = { /* Tomar real config ekhane thakbe */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- GLOBAL STATE ---
let user = null;

onAuthStateChanged(auth, async (u) => {
    if(u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        user = snap.data();
        renderDashboard();
    } else {
        showAuthPage();
    }
});

// --- MAIN ROUTER ---
function renderDashboard() {
    const body = document.getElementById('appBody');
    document.getElementById('navbar').classList.remove('hidden');
    
    if(user.role === 'teacher') {
        // Teacher Dashboard with Chapter & Image Quiz Upload
        body.innerHTML = `
            <div class="space-y-4">
                <div class="p-6 bg-slate-900 rounded-3xl border border-yellow-500/20">
                    <h2 class="text-yellow-500 font-black uppercase text-lg">${user.subject} Teacher</h2>
                </div>
                <div class="p-6 bg-slate-900 rounded-3xl border border-slate-800">
                    <input type="text" id="chapInp" placeholder="Chapter Name" class="w-full p-4 bg-black rounded-xl mb-2 text-sm">
                    <button onclick="window.addChap()" class="w-full bg-blue-600 py-3 rounded-xl font-bold uppercase text-[10px]">Create Chapter</button>
                </div>
                <div class="p-6 bg-slate-900 rounded-3xl border border-slate-800">
                    <h3 class="text-xs font-bold text-slate-500 mb-4 uppercase">Upload Image Quiz</h3>
                    <input type="file" id="quizImg" accept="image/*" class="w-full mb-4 text-xs">
                    <select id="ansKey" class="w-full p-4 bg-black rounded-xl mb-3 text-sm">
                        <option value="A">Answer A</option><option value="B">Answer B</option>
                        <option value="C">Answer C</option><option value="D">Answer D</option>
                    </select>
                    <select id="chapList" class="w-full p-4 bg-black rounded-xl mb-4 text-sm"></select>
                    <button onclick="window.pubQuiz()" class="w-full bg-yellow-600 py-4 rounded-xl font-black text-black uppercase">Publish Direct Quiz</button>
                </div>
            </div>
        `;
        loadChapters();
    } else if(user.role === 'student') {
        // Student Dashboard with BP Coins & Quiz Zone
        body.innerHTML = `
            <div class="grid grid-cols-2 gap-4 mb-6 text-center">
                <div class="p-6 bg-slate-900 rounded-3xl border border-slate-800">
                    <div class="text-[9px] font-black text-slate-500 uppercase">BP Coins</div>
                    <div class="text-2xl font-black text-yellow-500">${user.bpcoins}</div>
                </div>
                <div class="p-6 bg-slate-900 rounded-3xl border border-slate-800">
                    <div class="text-[9px] font-black text-slate-500 uppercase">Rank</div>
                    <div class="text-xl font-black text-blue-500">Warrior</div>
                </div>
            </div>
            <button onclick="window.openQuizZone()" class="w-full p-10 bg-yellow-600 rounded-[2.5rem] text-black font-black italic text-xl uppercase shadow-xl">Start Practice Quiz</button>
        `;
    }
}

// --- LOGIC FUNCTIONS (SUMMARY) ---
window.pubQuiz = async () => {
    const file = document.getElementById('quizImg').files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file); // Direct image binary conversion
    reader.onload = async () => {
        await addDoc(collection(db, "quizzes"), {
            image: reader.result,
            answer: document.getElementById('ansKey').value,
            chapter: document.getElementById('chapList').value,
            subject: user.subject,
            createdAt: serverTimestamp()
        });
        alert("Published Successfully!");
    };
};

window.openQuizZone = async () => {
    const qSnap = await getDocs(collection(db, "quizzes"));
    // Show Quiz with Timer and BP Increment logic
    // (Ami baki logic ekhane summarize korechi)
};

window.logout = () => signOut(auth);
            
