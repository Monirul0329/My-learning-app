import { collection, addDoc, serverTimestamp, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export async function initTeacher(userData, db) {
    const container = document.getElementById('appBody');
    renderTeacherUI(container, userData);

    // Load Chapters into Dropdowns
    const updateDropdowns = async () => {
        const q = query(collection(db, "chapters"), where("subject", "==", userData.subject));
        const snap = await getDocs(q);
        const drops = ['targetChap', 'quizTopic'];
        drops.forEach(id => {
            const el = document.getElementById(id);
            el.innerHTML = '<option>Select Chapter</option>';
            snap.forEach(doc => {
                el.innerHTML += `<option value="${doc.data().name}">${doc.data().name}</option>`;
            });
        });
    };
    updateDropdowns();

    // Teacher Actions
    window.saveChapter = async () => {
        const name = document.getElementById('chapterTitle').value;
        if(!name) return;
        await addDoc(collection(db, "chapters"), { name, subject: userData.subject });
        alert("Chapter Created!");
        updateDropdowns();
    };

    window.uploadVideo = async () => {
        const chap = document.getElementById('targetChap').value;
        const link = document.getElementById('videoLink').value;
        if(!chap || !link) return;
        await addDoc(collection(db, "materials"), { 
            type: 'video', chapter: chap, link, subject: userData.subject, createdAt: serverTimestamp() 
        });
        alert("Video Published!");
    };

    window.uploadQuiz = async () => {
        const img = document.getElementById('qImg').value;
        const ans = document.getElementById('correctOpt').value;
        const chap = document.getElementById('quizTopic').value;
        if(!img || !chap) return;
        await addDoc(collection(db, "quizzes"), {
            image: img, answer: ans, chapter: chap, subject: userData.subject, type: 'topic-wise'
        });
        alert("Question Added!");
    };
}

function renderTeacherUI(container, userData) {
    container.innerHTML = `
        <div class="space-y-6">
            <div class="p-6 bg-slate-900 rounded-3xl border border-yellow-500/20">
                <h2 class="text-yellow-500 font-black italic">${userData.subject} Panel</h2>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                    <h3 class="text-[10px] font-black uppercase mb-4">Structure</h3>
                    <input type="text" id="chapterTitle" placeholder="Chapter Name" class="w-full p-3 rounded-xl bg-black border border-slate-800 mb-2 text-xs">
                    <button onclick="saveChapter()" class="w-full bg-blue-600 text-[10px] font-black py-2 rounded-xl uppercase">Create</button>
                </div>
                <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                    <h3 class="text-[10px] font-black uppercase mb-4">Video</h3>
                    <select id="targetChap" class="w-full p-3 rounded-xl bg-black border border-slate-800 mb-2 text-xs"></select>
                    <input type="text" id="videoLink" placeholder="Video URL" class="w-full p-3 rounded-xl bg-black border border-slate-800 mb-2 text-xs">
                    <button onclick="uploadVideo()" class="w-full bg-green-600 text-[10px] font-black py-2 rounded-xl uppercase">Upload</button>
                </div>
            </div>
            <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <h3 class="text-[10px] font-black uppercase mb-4">Image Quiz (JPEG)</h3>
                <input type="text" id="qImg" placeholder="Direct Image URL" class="w-full p-3 rounded-xl bg-black border border-slate-800 mb-2 text-xs">
                <select id="correctOpt" class="w-full p-3 rounded-xl bg-black border border-slate-800 mb-2 text-xs">
                    <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select>
                <select id="quizTopic" class="w-full p-3 rounded-xl bg-black border border-slate-800 mb-2 text-xs"></select>
                <button onclick="uploadQuiz()" class="w-full bg-yellow-600 text-black text-[10px] font-black py-3 rounded-xl uppercase">Publish Question</button>
            </div>
        </div>`;
                         }
