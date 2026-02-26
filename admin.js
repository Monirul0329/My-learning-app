import { collection, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export async function initAdmin(db) {
    const container = document.getElementById('appBody');
    container.innerHTML = `
        <div class="space-y-6">
            <div class="bg-slate-900 p-6 rounded-3xl border border-red-500/20">
                <h2 class="text-red-500 font-black italic uppercase">Admin Master Panel</h2>
            </div>
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-black uppercase mb-4">Set Student Fee</h3>
                <input type="text" id="stdEmail" placeholder="Student Email" class="w-full p-3 rounded-xl bg-black border border-slate-800 mb-2 text-xs">
                <input type="number" id="feeAmt" placeholder="Fee Amount" class="w-full p-3 rounded-xl bg-black border border-slate-800 mb-4 text-xs">
                <button onclick="setFee()" class="w-full bg-blue-600 font-black py-3 rounded-xl uppercase text-xs">Apply Fee</button>
            </div>
            <div id="contentList" class="space-y-2">
                <h3 class="text-xs font-black uppercase mb-2 text-slate-500">Manage Content</h3>
                </div>
        </div>
    `;

    // Load Content for Admin
    const snap = await getDocs(collection(db, "materials"));
    const list = document.getElementById('contentList');
    snap.forEach(d => {
        list.innerHTML += `
            <div class="p-4 bg-slate-950 rounded-2xl flex justify-between items-center border border-slate-800">
                <span class="text-[10px] font-bold uppercase">${d.data().chapter}</span>
                <button onclick="delCon('${d.id}')" class="text-red-500 text-xs font-black">DELETE</button>
            </div>
        `;
    });

    window.delCon = async (id) => {
        if(confirm("Delete this content?")) {
            await deleteDoc(doc(db, "materials", id));
            location.reload();
        }
    };
}
