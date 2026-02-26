import { collection, addDoc, serverTimestamp, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export async function initTeacher(userData, db) {
    const container = document.getElementById('appBody');
    
    // UI Render
    container.innerHTML = `
        <div class="space-y-6 animate-fade-in">
            <div class="p-6 bg-slate-900 rounded-[2.5rem] border border-yellow-500/20 shadow-xl">
                <h2 class="text-yellow-500 font-black italic uppercase tracking-wider text-xl">${userData.subject} Instructor Panel</h2>
                <p class="text-[10px] text-slate-500 mt-1 font-bold">WELCOME, ${userData.name.toUpperCase()}</p>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
                    <h3 class="text-[10px] font-black uppercase mb-4 text-slate-400"><i class="fas fa-folder-plus mr-2"></i>1. Setup Structure</h3>
                    <input type="text" id="chapterTitle" placeholder="Enter Chapter Name" class="w-full p-4 rounded-xl bg-black border border-slate-800 mb-3 text-xs outline-none focus:border-yellow-600">
                    <button onclick="saveChapter()" class="w-full bg-blue-600 text-white text-[10px] font-black py-3 rounded-xl uppercase hover:bg-blue-700 transition">Create Chapter</button>
                    
                    <div class="my-4 border-t border-slate-800"></div>
                    
                    <select id="parentChap" class="w-full p-4 rounded-xl bg-black border border-slate-800 mb-2 text-xs text-slate-400 outline-none"></select>
                    <input type="text" id="topicTitle" placeholder="Enter Topic Name (for Quiz)" class="w-full p-4 rounded-xl bg-black border border-slate-800 mb-3 text-xs outline-none">
                    <button onclick="saveTopic()" class="w-full bg-slate-800 text-yellow-500 text-[10px] font-black py-3 rounded-xl uppercase hover:bg-slate-700 transition">Add Topic</button>
                </div>

                <div class="bg-slate-900 p-6 rounded-[2rem] border border-slate-800">
                    <h3 class="text-[10px] font-black uppercase mb-4 text-slate-400"><i class="fas fa-video mr-2"></i>2. Upload Lecture</h3>
                    <select id="videoChap" class="w-full p-4 rounded-xl bg-black border border-slate-800 mb-2 text-xs text-slate-400 outline-none"></select>
                    <input type="text" id="videoLink" placeholder="YouTube/Drive Video Link" class="w-full p-4 rounded-xl bg-black border border-slate-800 mb-4 text-xs outline-none">
                    <button onclick="uploadVideo()" class="w-full bg-green-600 text-white text-[10px] font-black py-4 rounded-xl uppercase hover:bg-green-700 transition shadow-lg">Publish Video</button>
                </div>
            </div>

            <div class="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
                <h3 class="text-[10px] font-black uppercase mb-4 text-slate-400"><i class="fas fa-question-circle mr-2"></i>3. Direct Image Quiz Builder</h3>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-3">
                        <label class="block text-[9px] font-black text-slate-500 uppercase ml-2">Select Question Image (JPEG/PNG)</label>
                        <input type="file" id="qFile" accept="image/*" class="w-full p-3 rounded-xl bg-black border border-slate-800 text-xs text-slate-500">
                        
                        <label class="block text-[9px] font-black text-slate-500 uppercase ml-2">Correct Answer Key</label>
                        <select id="correctOpt" class="w-full p-4 rounded-xl bg-black border border-slate-800 text-xs outline-none">
                            <option value="A">Option A</option><option value="B">Option B</option>
                            <option value="C">Option C</option><option value="D">Option D</option>
                        </select>
                    </div>
                    <div class="flex flex-col justify-end">
                        <label class="block text-[9px] font-black text-slate-500 uppercase ml-2 mb-2">Assign to Topic</label>
                        <select id="quizTopicSelect" class="w-full p-4 rounded-xl bg-black border border-slate-800 mb-4 text-xs text-slate-400 outline-none"></select>
                        <button onclick="uploadDirectQuiz()" class="w-full bg-yellow-600 text-black text-xs font-black py-5 rounded-2xl uppercase hover:scale-[1.02] transition shadow-xl">Publish Direct Question</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // --- LOGIC FUNCTIONS ---

    // Update Dropdowns for Chapters & Topics
    const refreshLists = async () => {
        const chapSnap = await getDocs(query(collection(db, "chapters"), where("subject", "==", userData.subject)));
        const topicSnap = await getDocs(query(collection(collection(db, "structure"), "topics"), where("subject", "==", userData.subject)));
        
        const chapDrops = ['parentChap', 'videoChap'];
        chapDrops.forEach(id => {
            const el = document.getElementById(id);
            el.innerHTML = '<option value="">Select Chapter</option>';
            chapSnap.forEach(doc => el.innerHTML += `<option value="${doc.data().name}">${doc.data().name}</option>`);
        });

        const qTopic = document.getElementById('quizTopicSelect');
        qTopic.innerHTML = '<option value="">Select Topic</option>';
        topicSnap.forEach(doc => qTopic.innerHTML += `<option value="${doc.data().name}">${doc.data().name} (${doc.data().chapter})</option>`);
    };
    refreshLists();

    window.saveChapter = async () => {
        const name = document.getElementById('chapterTitle').value.trim();
        if(!name) return alert("Enter Name");
        await addDoc(collection(db, "chapters"), { name, subject: userData.subject });
        alert("Chapter Created!");
        document.getElementById('chapterTitle').value = "";
        refreshLists();
    };

    window.saveTopic = async () => {
        const name = document.getElementById('topicTitle').value.trim();
        const parent = document.getElementById('parentChap').value;
        if(!name || !parent) return alert("Fill all fields");
        await addDoc(collection(collection(db, "structure"), "topics"), { 
            name, chapter: parent, subject: userData.subject 
        });
        alert("Topic Added!");
        document.getElementById('topicTitle').value = "";
        refreshLists();
    };

    window.uploadVideo = async () => {
        const chap = document.getElementById('videoChap').value;
        const link = document.getElementById('videoLink').value.trim();
        if(!chap || !link) return alert("Select Chapter & Link");
        await addDoc(collection(db, "materials"), {
            type: 'video', chapter: chap, link, subject: userData.subject, createdAt: serverTimestamp()
        });
        alert("Lecture Video Published!");
        document.getElementById('videoLink').value = "";
    };

    window.uploadDirectQuiz = async () => {
        const fileInput = document.getElementById('qFile');
        const ans = document.getElementById('correctOpt').value;
        const topic = document.getElementById('quizTopicSelect').value;

        if(!fileInput.files[0] || !topic) return alert("Select Image and Topic!");

        const reader = new FileReader();
        reader.readAsDataURL(fileInput.files[0]); // Base64 Conversion
        reader.onload = async () => {
            const base64Data = reader.result;
            await addDoc(collection(db, "quizzes"), {
                image: base64Data,
                answer: ans,
                topic: topic,
                subject: userData.subject,
                createdAt: serverTimestamp()
            });
            alert("Quiz Question Published Directly!");
            fileInput.value = "";
        };
    };
        }
q
