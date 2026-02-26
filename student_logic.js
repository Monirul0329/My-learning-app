import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

export async function loadStudentDashboard(userData) {
    const dashboard = document.getElementById('dashboard');
    
    // ১. পেমেন্ট স্ট্যাটাস চেক (Unpaid হলে সব লক)
    if (!userData.paid) {
        renderPaymentGateway(userData);
        return;
    }

    // ২. পেইড স্টুডেন্ট ড্যাশবোর্ড (Premium PW Look)
    dashboard.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="glass p-6 rounded-[2.5rem] border-b-4 border-yellow-500">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <p class="text-[10px] text-slate-500 font-black uppercase">Current Rank</p>
                        <h2 id="levelName" class="text-2xl font-black text-yellow-500 italic uppercase">Warrior</h2>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-slate-500 font-black uppercase">Study Days</p>
                        <p class="text-xl font-black text-white">12 Days</p>
                    </div>
                </div>
                
                <div class="relative w-full h-4 bg-black rounded-full overflow-hidden border border-slate-800">
                    <div id="progBar" class="h-full bg-gradient-to-right from-red-600 via-yellow-500 to-green-500" style="width: 45%"></div>
                </div>
                <div class="flex justify-between text-[8px] font-black uppercase mt-2">
                    <span class="text-red-500">Demotion Zone</span>
                    <span class="text-yellow-500">Stay Zone</span>
                    <span class="text-green-500">Promotion Zone</span>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="glass p-4 rounded-3xl text-center border border-slate-800">
                    <p class="text-[9px] text-slate-500 font-bold uppercase">Chapter Done</p>
                    <p class="text-lg font-black text-blue-500">65%</p>
                </div>
                <div class="glass p-4 rounded-3xl text-center border border-slate-800">
                    <p class="text-[9px] text-slate-500 font-bold uppercase">Live Status</p>
                    <p class="text-xs font-black text-green-500 animate-pulse">● LIVE NOW</p>
                </div>
            </div>

            <div class="grid grid-cols-1 gap-4">
                <button onclick="window.openLibrary('NCERT')" class="p-6 glass rounded-[2rem] flex justify-between items-center border border-slate-800 active:scale-95 transition">
                    <div class="text-left">
                        <p class="text-[10px] text-slate-500 font-black uppercase">Academic</p>
                        <p class="text-lg font-black italic uppercase">NCERT Books</p>
                    </div>
                    <i class="fas fa-book-open text-yellow-500 text-2xl"></i>
                </button>

                <button onclick="window.openLibrary('PYQ')" class="p-6 glass rounded-[2rem] flex justify-between items-center border border-slate-800 active:scale-95 transition">
                    <div class="text-left">
                        <p class="text-[10px] text-slate-500 font-black uppercase">Previous Years</p>
                        <p class="text-lg font-black italic uppercase">Solve PYQ</p>
                    </div>
                    <i class="fas fa-history text-blue-500 text-2xl"></i>
                </button>

                <button onclick="window.startPracticeZone()" class="p-8 bg-yellow-600 rounded-[2.5rem] flex justify-between items-center text-black shadow-xl active:scale-95 transition">
                    <div class="text-left">
                        <p class="text-[10px] font-black uppercase opacity-60">Speed Booster</p>
                        <p class="text-xl font-black italic uppercase">Practice Quiz</p>
                    </div>
                    <i class="fas fa-bolt text-2xl"></i>
                </button>
            </div>
        </div>
    `;
    updateLevelStatus(userData.bp_coins);
}

// ৩. পেমেন্ট গেটওয়ে লজিক (PhonePe Style)
function renderPaymentGateway(userData) {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <div class="glass p-8 rounded-[2.5rem] border-t-4 border-red-500 animate-fade-in text-center">
            <i class="fas fa-lock text-4xl text-red-500 mb-4"></i>
            <h2 class="text-2xl font-black uppercase italic text-white">Access Locked</h2>
            <p class="text-xs text-slate-500 mt-2 mb-8">Pay the course fee to unlock NCERT, PYQ, and Quiz Zone.</p>
            
            <div class="bg-black p-6 rounded-3xl border border-slate-800 mb-6">
                <p class="text-[10px] text-yellow-500 font-bold uppercase mb-4">Scan QR to Pay via PhonePe / GPay</p>
                <div class="w-48 h-48 bg-white mx-auto mb-4 rounded-xl flex items-center justify-center">
                    <span class="text-black text-[10px] font-bold">ADMIN QR CODE HERE</span>
                </div>
                <p class="text-xs font-bold text-white">UPI: mneet.pro@upi</p>
            </div>

            <input type="text" id="transID" placeholder="Enter Transaction ID" class="input-premium mb-4">
            <button onclick="window.submitPayment('${userData.uid}')" class="btn-gold">Confirm Payment</button>
        </div>
    `;
}

// ৪. লেভেল ও জোন আপডেট লজিক
function updateLevelStatus(coins) {
    const progBar = document.getElementById('progBar');
    const levelName = document.getElementById('levelName');
    
    // Example logic for Stay, Promotion, Demotion
    if (coins < 100) {
        levelName.innerText = "Beginner (Demotion Zone)";
        progBar.style.width = "20%";
        progBar.style.background = "red";
    } else if (coins >= 100 && coins < 500) {
        levelName.innerText = "Warrior (Stay Zone)";
        progBar.style.width = "50%";
        progBar.style.background = "yellow";
    } else {
        levelName.innerText = "Elite (Promotion Zone)";
        progBar.style.width = "90%";
        progBar.style.background = "green";
    }
}

// ৫. পেমেন্ট সাবমিট
window.submitPayment = async (uid) => {
    const tid = document.getElementById('transID').value;
    if(!tid) return alert("Please enter Transaction ID!");
    
    // Admin প্যানেলে রিকোয়েস্ট সেভ হবে
    await updateDoc(doc(db, "users", uid), {
        payment_request: tid,
        payment_status: "pending"
    });
    alert("Payment Request Sent! Admin will approve shortly.");
};
        
