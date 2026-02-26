import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

export async function loadAdminDashboard() {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="glass p-6 rounded-[2.5rem] border-t-4 border-red-600">
                <h2 class="text-2xl font-black text-white italic uppercase">Master Control</h2>
                <p class="text-[10px] text-red-500 font-bold uppercase tracking-widest">Admin Authorization: Active</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <button onclick="window.showAdminSection('payments')" class="p-4 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-money-check-alt text-yellow-500 mb-2"></i>
                    <p class="text-[10px] font-black uppercase">Fees Approval</p>
                </button>
                <button onclick="window.showAdminSection('users')" class="p-4 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-users text-blue-500 mb-2"></i>
                    <p class="text-[10px] font-black uppercase">Student List</p>
                </button>
                <button onclick="window.showAdminSection('content')" class="p-4 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-edit text-green-500 mb-2"></i>
                    <p class="text-[10px] font-black uppercase">Manage Content</p>
                </button>
                <button onclick="window.showAdminSection('stats')" class="p-4 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-chart-line text-purple-500 mb-2"></i>
                    <p class="text-[10px] font-black uppercase">App Stats</p>
                </button>
            </div>

            <div id="adminActionArea" class="space-y-4 min-h-[300px]">
                <p class="text-center text-slate-600 text-[10px] uppercase font-bold py-20">Monitoring System Online...</p>
            </div>
        </div>
    `;
}

// ১. অ্যাডমিন সেকশন কন্ট্রোল
window.showAdminSection = async (type) => {
    const area = document.getElementById('adminActionArea');
    area.innerHTML = `<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-yellow-500"></i></div>`;

    if (type === 'payments') {
        const q = query(collection(db, "users"), where("payment_status", "==", "pending"));
        const snap = await getDocs(q);
        
        area.innerHTML = `<h3 class="text-xs font-black text-yellow-500 uppercase mb-4">Pending Approvals</h3>`;
        if(snap.empty) area.innerHTML += `<p class="text-slate-500 text-center text-xs">No pending requests.</p>`;
        
        snap.forEach(userDoc => {
            const u = userDoc.data();
            area.innerHTML += `
                <div class="glass p-4 rounded-2xl border border-slate-800 flex justify-between items-center mb-3">
                    <div class="text-left">
                        <p class="text-white font-bold text-sm">${u.name}</p>
                        <p class="text-[9px] text-slate-500 font-bold uppercase">ID: ${u.payment_request}</p>
                        <p class="text-[9px] text-blue-500 font-bold uppercase">${u.city}</p>
                    </div>
                    <button onclick="window.approveUser('${userDoc.id}')" class="bg-green-600 text-white text-[9px] font-black px-4 py-2 rounded-lg uppercase">Approve</button>
                </div>
            `;
        });
    }

    if (type === 'users') {
        const snap = await getDocs(collection(db, "users"));
        area.innerHTML = `<h3 class="text-xs font-black text-blue-500 uppercase mb-4">All Registered Users</h3>`;
        
        snap.forEach(userDoc => {
            const u = userDoc.data();
            area.innerHTML += `
                <div class="glass p-4 rounded-2xl border border-slate-800 flex justify-between items-center mb-2">
                    <div>
                        <p class="text-xs font-bold text-white">${u.name} (${u.role})</p>
                        <p class="text-[8px] text-slate-500 uppercase">${u.city} | BP: ${u.bp_coins}</p>
                    </div>
                    <div class="flex gap-2">
                        <span class="px-2 py-1 rounded text-[8px] font-black ${u.paid ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}">
                            ${u.paid ? 'PAID' : 'UNPAID'}
                        </span>
                        <button onclick="window.deleteUser('${userDoc.id}')" class="text-red-500 p-2"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }
};

// ২. পেমেন্ট অ্যাপ্রুভাল লজিক
window.approveUser = async (uid) => {
    if(confirm("Confirm this student as PAID?")) {
        await updateDoc(doc(db, "users", uid), {
            paid: true,
            payment_status: "approved"
        });
        alert("Student Unlocked!");
        showAdminSection('payments');
    }
};

// ৩. কন্টেন্ট মডারেশন (Delete Logic)
window.deleteContent = async (col, id) => {
    if(confirm("Are you sure you want to delete this content?")) {
        await deleteDoc(doc(db, col, id));
        alert("Deleted Successfully!");
        showAdminSection('content');
    }
};
              
