import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

// ১. টিচার ড্যাশবোর্ড রেন্ডার করা (PW Style)
export async function loadTeacherDashboard(userData) {
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="glass p-6 rounded-[2.5rem] border-t-4 border-yellow-500 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-black text-yellow-500 italic uppercase">${userData.subject}</h2>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Instructor: ${userData.name}</p>
                </div>
                <div class="text-right">
                    <p class="text-[9px] text-slate-500 uppercase font-black">Location</p>
                    <p class="text-xs font-bold text-white">${userData.city}</p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <button onclick="window.showTeacherSection('content')" class="p-4 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-layer-group text-yellow-500 mb-2"></i>
                    <p class="text-[10px] font-black uppercase">Structure</p>
                </button>
                <button onclick="window.showTeacherSection('quiz')" class="p-4 glass rounded-2xl border border-slate-800 text-center active:scale-95 transition">
                    <i class="fas fa-images text-yellow-500 mb-2"></i>
                    <p class="text-[10px] font-black uppercase">Bulk Quiz</p>
                </button>
            </div>

            <div id="teacherActionArea" class="space-y-4">
                <p class="text-center text-slate-600 text-[10px] uppercase font-bold py-10">Select an action to start managing</p>
            </div>
        </div>
    `;
}

// ২. চ্যাপ্টার ও টপিক তৈরির সেকশন
window.showTeacherSection = async (type) => {
    const area = document.getElementById('teacherActionArea');
    
    if(type === 'content') {
        area.innerHTML = `
            <div class="glass p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-black uppercase text-yellow-500 mb-4">Create New Structure</h3>
                <input type="text" id="newChap" placeholder="Enter Chapter Name" class="input-premium mb-3">
                <button onclick="window.saveChapter()" class="btn-gold py-3 text-[10px]">Add Chapter</button>
                
                <hr class="my-6 border-slate-800">
                
                <select id="chapSelect" class="input-premium mb-3"></select>
                <input type="text" id="newTopic" placeholder="Enter Topic Name" class="input-premium mb-3">
                <button onclick="window.saveTopic()" class="btn-gold py-3 text-[10px] bg-blue-600 text-white">Add Topic</button>
            </div>
        `;
        loadChapterDropdown();
    } 
    
    else if(type === 'quiz') {
        area.innerHTML = `
            <div class="glass p-6 rounded-3xl border border-slate-800">
                <h3 class="text-xs font-black uppercase text-yellow-500 mb-4">Bulk Image Quiz Upload</h3>
                <select id="quizChap" onchange="window.updateQuizTopics()" class="input-premium mb-3"></select>
                <select id="quizTopic" class="input-premium mb-3"></select>
                
                <div class="border-2 border-dashed border-slate-800 p-6 rounded-2xl text-center mb-4">
                    <input type="file" id="bulkImages" multiple accept="image/*" class="hidden">
                    <label for="bulkImages" class="cursor-pointer text-slate-500 text-[10px] font-bold uppercase">
                        <i class="fas fa-cloud-upload-alt text-2xl mb-2 block"></i> Select Multiple JPEG Questions
                    </label>
                </div>
                
                <select id="correctAns" class="input-premium mb-4">
                    <option value="A">Correct Option: A</option>
                    <option value="B">Correct Option: B</option>
                    <option value="C">Correct Option: C</option>
                    <option value="D">Correct Option: D</option>
                </select>
                
                <button onclick="window.uploadBulkQuiz()" class="btn-gold py-4">Publish to Students</button>
            </div>
        `;
        loadChapterDropdown('quizChap');
    }
};

// ৩. ডাটাবেসে সেভ করার লজিক
window.saveChapter = async () => {
    const name = document.getElementById('newChap').value;
    const user = JSON.parse(localStorage.getItem('user')); // Auth থেকে সেভ করা
    await addDoc(collection(db, "structure"), {
        type: 'chapter',
        name: name,
        subject: user.subject,
        createdAt: serverTimestamp()
    });
    alert("Chapter Created!");
    showTeacherSection('content');
};

// ৪. বাল্ক কুইজ আপলোড (JPEG to Base64)
window.uploadBulkQuiz = async () => {
    const files = document.getElementById('bulkImages').files;
    const chap = document.getElementById('quizChap').value;
    const topic = document.getElementById('quizTopic').value;
    const ans = document.getElementById('correctAns').value;

    if(files.length === 0) return alert("Select Images!");

    for (let file of files) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            await addDoc(collection(db, "quizzes"), {
                image: reader.result,
                answer: ans,
                chapter: chap,
                topic: topic,
                subject: JSON.parse(localStorage.getItem('user')).subject,
                createdAt: serverTimestamp()
            });
        };
    }
    alert("All Questions Uploaded Successfully!");
};

