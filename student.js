// Student Dashboard: BP Coins, Level logic, Percentage, Quiz Timer & Result
export function initStudent(userData, db) {
    const container = document.getElementById('appBody');
    
    // Level Calculation Logic
    const progress = calculateProgress(userData); // Total Chapter %
    const zone = calculateZone(userData.rank); // Promotion/Demotion

    container.innerHTML = `
        <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="bg-slate-900 p-4 rounded-3xl border border-slate-800">
                <div class="text-[8px] text-slate-500 uppercase font-black">Study Days</div>
                <div class="text-xl font-black text-yellow-500">${userData.studyDays || 0}</div>
            </div>
            <div class="bg-slate-900 p-4 rounded-3xl border border-slate-800">
                <div class="text-[8px] text-slate-500 uppercase font-black">Course Complete</div>
                <div class="text-xl font-black text-green-500">${progress}%</div>
            </div>
        </div>

        <div class="bg-yellow-600 text-black p-5 rounded-[2rem] mb-6 flex justify-between items-center">
            <div>
                <div class="text-[10px] font-black uppercase">Current Level</div>
                <div class="text-2xl font-black italic">${userData.levelName || 'NOVICE'}</div>
            </div>
            <div class="text-right">
                <div class="text-[10px] font-black uppercase">Zone</div>
                <div class="text-lg font-bold">${zone}</div>
            </div>
        </div>

        <div class="space-y-4">
            <button onclick="showChapters('video')" class="w-full p-6 bg-slate-900 rounded-3xl border border-slate-800 flex justify-between">
                <span class="font-black italic uppercase">Prime Lectures</span>
                <i class="fas fa-play-circle text-yellow-500"></i>
            </button>
            <button onclick="showQuizModes()" class="w-full p-6 bg-slate-900 rounded-3xl border border-slate-800 flex justify-between">
                <span class="font-black italic uppercase">Practice Quiz</span>
                <i class="fas fa-brain text-yellow-500"></i>
            </button>
        </div>
    `;

    // Quiz Engine with Timer, Prev/Next, Result Dashboard
    window.startQuiz = (mode, id) => {
        // Mode: Topic-wise or Chapter-wise
        // Timer Logic (Decreases on re-attempt)
        // Question Array with JPEG display
        // Final Submit triggers result dashboard & BP Coins
    };
}

