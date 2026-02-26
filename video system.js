import { getFirestore, doc, updateDoc, increment, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();
let videoTimer;
let secondsWatched = 0;

// ১. ভিডিও লেকচার ড্যাশবোর্ড লোড করা
export async function loadVideoSection(chapter, topic, videoUrl) {
    const dashboard = document.getElementById('dashboard');
    secondsWatched = 0;
    
    dashboard.innerHTML = `
        <div class="animate-fade-in space-y-4">
            <div class="glass p-2 rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl">
                <iframe id="lectureVideo" class="w-full aspect-video rounded-3xl" 
                    src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
            </div>

            <div class="flex justify-between items-center bg-black p-4 rounded-2xl border border-yellow-500/20">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-yellow-600/10 rounded-full flex items-center justify-center">
                        <i class="fas fa-coins text-yellow-500"></i>
                    </div>
                    <div>
                        <p class="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Potential Reward</p>
                        <p id="pendingBP" class="text-xs font-black text-white">0 BP Earned</p>
                    </div>
                </div>
                <div id="liveStatus" class="hidden px-3 py-1 bg-red-600 rounded-full text-[8px] font-black text-white animate-pulse">LIVE NOW</div>
            </div>

            <div class="glass p-6 rounded-[2.5rem] border border-slate-800">
                <h3 class="text-xs font-black text-yellow-500 uppercase mb-4">Doubt Solver & Comments</h3>
                <div id="commentBox" class="h-48 overflow-y-auto space-y-3 mb-4 pr-2 custom-scrollbar">
                    </div>
                <div class="flex gap-2">
                    <input type="text" id="commentInput" placeholder="Ask your doubt..." class="input-premium flex-1 py-2 text-sm">
                    <button onclick="window.sendComment('${topic}')" class="bg-yellow-600 text-black px-4 rounded-xl active:scale-95"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;

    startRewardTracking();
    loadComments(topic);
}

// ২. বিপি কয়েন রিওয়ার্ড লজিক (+4 BP per 1 Minute)
function startRewardTracking() {
    clearInterval(videoTimer);
    videoTimer = setInterval(() => {
        secondsWatched++;
        // প্রতি ৬০ সেকেন্ডে +৪ বিপি
        if (secondsWatched % 60 === 0) {
            const earned = (secondsWatched / 60) * 4;
            document.getElementById('pendingBP').innerText = `${earned} BP Earned`;
            updateUserBP(4); // ডাটাবেসে সাথে সাথে যোগ হবে
        }
    }, 1000);
}

// ৩. ডাটাবেসে বিপি কয়েন আপডেট
async function updateUserBP(amount) {
    const user = JSON.parse(localStorage.getItem('user'));
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
        bp_coins: increment(amount)
    });
}

// ৪. ডাউট সলভিং কমেন্ট সিস্টেম (Real-time)
async function loadComments(topicId) {
    const q = query(collection(db, "comments"), where("topicId", "==", topicId), orderBy("createdAt", "asc"));
    
    onSnapshot(q, (snapshot) => {
        const box = document.getElementById('commentBox');
        box.innerHTML = "";
        snapshot.forEach(doc => {
            const c = doc.data();
            box.innerHTML += `
                <div class="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                    <p class="text-[8px] text-yellow-500 font-bold uppercase">${c.userName}</p>
                    <p class="text-xs text-white mt-1">${c.text}</p>
                </div>
            `;
            box.scrollTop = box.scrollHeight;
        });
    });
}

window.sendComment = async (topicId) => {
    const text = document.getElementById('commentInput').value;
    const user = JSON.parse(localStorage.getItem('user'));
    if(!text) return;

    await addDoc(collection(db, "comments"), {
        topicId: topicId,
        userName: user.name,
        text: text,
        createdAt: serverTimestamp()
    });
    document.getElementById('commentInput').value = "";
};
      
