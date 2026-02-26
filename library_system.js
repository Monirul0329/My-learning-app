import { getFirestore, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

// ১. মেইন লাইব্রেরি ড্যাশবোর্ড (Subject Selection)
export async function loadLibrary() {
    const dashboard = document.getElementById('dashboard');
    
    dashboard.innerHTML = `
        <div class="animate-fade-in space-y-6">
            <div class="glass p-6 rounded-[2.5rem] border-t-4 border-blue-500">
                <h2 class="text-2xl font-black text-white italic uppercase tracking-tighter">Study Library</h2>
                <p class="text-[10px] text-blue-500 font-bold uppercase tracking-widest">NCERT & Previous Year Questions</p>
            </div>

            <div class="space-y-4">
                <button onclick="window.loadChapters('Biology')" class="w-full p-8 glass rounded-[2.5rem] flex justify-between items-center border border-green-500/20 active:scale-95 transition">
                    <div class="text-left">
                        <p class="text-[10px] text-green-500 font-black uppercase">Subject 01</p>
                        <p class="text-2xl font-black italic text-white uppercase">Biology</p>
                    </div>
                    <i class="fas fa-dna text-green-500 text-3xl"></i>
                </button>

                <button onclick="window.loadChapters('Physics')" class="w-full p-8 glass rounded-[2.5rem] flex justify-between items-center border border-blue-500/20 active:scale-95 transition">
                    <div class="text-left">
                        <p class="text-[10px] text-blue-500 font-black uppercase">Subject 02</p>
                        <p class="text-2xl font-black italic text-white uppercase">Physics</p>
                    </div>
                    <i class="fas fa-atom text-blue-500 text-3xl"></i>
                </button>

                <button onclick="window.loadChapters('Chemistry')" class="w-full p-8 glass rounded-[2.5rem] flex justify-between items-center border border-yellow-500/20 active:scale-95 transition">
                    <div class="text-left">
                        <p class="text-[10px] text-yellow-500 font-black uppercase">Subject 03</p>
                        <p class="text-2xl font-black italic text-white uppercase">Chemistry</p>
                    </div>
                    <i class="fas fa-flask text-yellow-500 text-3xl"></i>
                </button>
            </div>
        </div>
    `;
}

// ২. চ্যাপ্টার লিস্ট লোড করা
window.loadChapters = async (subject) => {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `<div class="text-center py-20"><i class="fas fa-spinner fa-spin text-yellow-500 text-2xl"></i></div>`;

    const q = query(collection(db, "structure"), where("subject", "==", subject), where("type", "==", "chapter"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);

    dashboard.innerHTML = `
        <div class="animate-fade-in space-y-4">
            <button onclick="window.loadLibrary()" class="text-yellow-500 text-[10px] font-black uppercase mb-4"><i class="fas fa-arrow-left mr-2"></i> Back to Subjects</button>
            <h3 class="text-xl font-black text-white italic uppercase underline decoration-yellow-500">${subject} Chapters</h3>
            <div id="chapterList" class="space-y-3"></div>
        </div>
    `;

    const list = document.getElementById('chapterList');
    if(snap.empty) list.innerHTML = `<p class="text-slate-600 text-xs italic">No chapters added by teacher yet.</p>`;

    snap.forEach(doc => {
        const chap = doc.data();
        list.innerHTML += `
            <div class="glass p-5 rounded-3xl border border-slate-800">
                <p class="text-sm font-bold text-white mb-4">${chap.name}</p>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="window.openMaterial('${chap.name}', 'NCERT')" class="bg-blue-600/20 border border-blue-500/30 text-blue-500 py-2 rounded-xl text-[10px] font-black uppercase">Read NCERT</button>
                    <button onclick="window.openMaterial('${chap.name}', 'PYQ')" class="bg-yellow-600/20 border border-yellow-500/30 text-yellow-500 py-2 rounded-xl text-[10px] font-black uppercase">Solve PYQ</button>
                </div>
            </div>
        `;
    });
};

// ৩. কন্টেন্ট ওপেন করা (PDF বা প্র্যাকটিস মোড)
window.openMaterial = async (chapterName, mode) => {
    alert(`Opening ${mode} for ${chapterName}... (Connecting to secure library)`);
    // Ekhane teacher er upload kora PDF ba links fetch hobe
};
      
