import { loadTeacherDashboard } from './teacher_logic.js';
import { loadStudentDashboard } from './student_logic.js';
import { loadAdminDashboard } from './admin_logic.js';
import { startQuiz } from './quiz_engine.js';
import { loadVideoSection } from './video_system.js';
import { loadLibrary } from './library_system.js';

// ১. গ্লোবাল ফাংশন কানেক্টর (HTML থেকে কল করার জন্য)
window.startPracticeZone = () => {
    // Student Dashboard theke Quiz shuru korar logic
    const user = JSON.parse(localStorage.getItem('user'));
    // Example: Bio > Cell > Topic 1
    startQuiz(user.subject || 'Biology', 'Chapter 1', 'Topic 1', user);
};

window.openLibrary = (mode) => {
    loadLibrary();
};

window.watchLecture = (url) => {
    loadVideoSection('Chapter 1', 'Topic 1', url);
};

// ২. ড্যাশবোর্ড রাউটিং লজিক (Role অনুযায়ী)
export function routeUser(userData) {
    // User data localStorage-e save rakha jate onno file access pay
    localStorage.setItem('user', JSON.stringify(userData));

    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = ""; // Clear previous content

    if (userData.role === 'admin') {
        loadAdminDashboard(userData);
    } else if (userData.role === 'teacher') {
        loadTeacherDashboard(userData);
    } else {
        loadStudentDashboard(userData);
    }
}

// ৩. লাইভ ক্লাস নোটিফিকেশন চেক (PW Style)
export function checkLiveStatus() {
    // Ekhane Firebase theke live class check hobe
    console.log("Checking for Live Classes...");
    // Jodi live thake, dashboard-e ekta top alert dekhabe
}

// ৪. ইউজার সিটি ও ডাটা মনিটরিং
console.log("mNeet PRO Engine Started...");
          
