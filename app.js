const courseData = [
    {
        id: "chapter1",
        title: "Cell: The Unit of Life",
        topics: [
            {
                id: "t1",
                title: "Introduction & Cell Theory",
                video: "https://www.youtube.com/embed/Sc6S_XfGvY0",
                questions: [
                    { q: "Who discovered the living cell?", a: ["Hooke", "Leeuwenhoek", "Schwann", "Virchow"], correct: 1 },
                    { q: "Omnis cellula-e cellula was given by?", a: ["Robert Brown", "Rudolf Virchow", "Purkinje", "Singer"], correct: 1 }
                ]
            }
        ]
    }
];

let currentQuiz = {
    questions: [],
    index: 0,
    mode: 'practice',
    points: 0,
    timer: null,
    timeLeft: 30
};

function handleAnswer(choice) {
    const q = currentQuiz.questions[currentQuiz.index];
    const buttons = document.querySelectorAll('.option-btn');
    
    if (currentQuiz.mode === 'practice') {
        if (choice === q.correct) {
            currentQuiz.points += 10;
            buttons[choice].classList.add('bg-green-600', 'border-green-400');
            playSound('success');
        } else {
            currentQuiz.points -= 5;
            buttons[choice].classList.add('bg-red-600', 'border-red-400');
            buttons[q.correct].classList.add('bg-green-600', 'border-green-400');
        }
        updateXPDisplay();
    } else {
      
        q.userAnswer = choice;
        buttons[choice].classList.add('bg-indigo-600', 'border-indigo-400');
    }
}

function startTimer() {
    clearInterval(currentQuiz.timer);
    currentQuiz.timeLeft = 30;
    document.getElementById('quizTimer').innerText = "00:30";
    
    currentQuiz.timer = setInterval(() => {
        currentQuiz.timeLeft--;
        document.getElementById('quizTimer').innerText = `00:${currentQuiz.timeLeft < 10 ? '0' : ''}${currentQuiz.timeLeft}`;
        
        if (currentQuiz.timeLeft <= 0) {
            clearInterval(currentQuiz.timer);
            nextQuestion();
        }
    }, 1000);
}

function updateProgress() {
    const totalChapters = courseData.length;
    const completed = 1;
    const percent = Math.round((completed / totalChapters) * 100);
    document.getElementById('overallBar').style.width = percent + '%';
    document.getElementById('overallPercent').innerText = percent + '%';
}

function loadChapters() {
    const list = document.getElementById('chapterList');
    courseData.forEach(ch => {
        const div = document.createElement('div');
        div.className = "p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-yellow-500 cursor-pointer transition-all";
        div.innerHTML = `
            <h4 class="font-bold text-sm">${ch.title}</h4>
            <div class="flex justify-between items-center mt-2">
                <div class="h-1 bg-slate-800 flex-1 rounded-full mr-4">
                    <div class="bg-green-500 h-full w-[40%] rounded-full"></div>
                </div>
                <span class="text-[10px] text-slate-500 font-bold">40%</span>
            </div>
        `;
        div.onclick = () => openChapter(ch);
        list.appendChild(div);
    });
          }
