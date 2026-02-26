import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDlmQWV3IN_asZolPyaBLBb7L_RG0uriZM",
    authDomain: "mneet-f9bc7.firebaseapp.com",
    projectId: "mneet-f9bc7",
    storageBucket: "mneet-f9bc7.firebasestorage.app",
    messagingSenderId: "944379440196",
    appId: "1:944379440196:web:9d26b632b3e778d247e011",
    measurementId: "G-70T6K3DLGT"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentRole = 'student';
let isLoginMode = true;

// Role Change Logic
window.setRole = (role) => {
    currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('role-active'));
    document.getElementById(`btn-${role}`).classList.add('role-active');
    
    // Teacher hole subject option dekhabe
    const subField = document.getElementById('regSubject');
    if(role === 'teacher' && !isLoginMode) subField.classList.remove('hidden');
    else subField.classList.add('hidden');
};

// Signup/Login Toggle
window.toggleAuth = () => {
    isLoginMode = !isLoginMode;
    document.getElementById('signupFields').classList.toggle('hidden');
    document.getElementById('authBtn').innerText = isLoginMode ? "Sign In" : "Create Account";
    document.getElementById('toggleText').innerText = isLoginMode ? "Create New Account" : "Back to Login";
    setRole(currentRole);
};

// Main Auth Logic
window.handleAuth = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    
    if(isLoginMode) {
        // Login
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            checkUserRole(userCredential.user.uid);
        } catch (error) { alert("Error: " + error.message); }
    } else {
        // Registration with City & Role
        const name = document.getElementById('regName').value;
        const city = document.getElementById('regCity').value;
        const subject = document.getElementById('regSubject').value;

        if(!name || !city) return alert("Please fill all fields!");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const userData = {
                uid: userCredential.user.uid,
                name: name,
                city: city,
                role: currentRole,
                paid: false,
                bp_coins: 0,
                level: 1
            };
            if(currentRole === 'teacher') userData.subject = subject;

            await setDoc(doc(db, "users", userCredential.user.uid), userData);
            alert("Account Created Successfully!");
            location.reload();
        } catch (error) { alert("Registration Failed: " + error.message); }
    }
};

// Role check and Dashboard Routing
async function checkUserRole(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        const data = userDoc.data();
        document.getElementById('authPage').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');
        
        if(data.role === 'teacher') {
            loadTeacherDashboard(data);
        } else if(data.role === 'admin') {
            loadAdminDashboard(data);
        } else {
            loadStudentDashboard(data);
        }
    }
}

// Global Logout
window.logout = () => signOut(auth).then(() => location.reload());

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) checkUserRole(user.uid);
});

// Load Dashboards (Placeholders for now)
function loadTeacherDashboard(data) {
    document.getElementById('dashboard').innerHTML = `
        <div class="glass p-6 rounded-3xl border-t-2 border-yellow-500">
            <h2 class="text-2xl font-bold text-yellow-500">Welcome, Professor ${data.name}</h2>
            <p class="text-xs text-slate-400 uppercase tracking-widest mt-1">Dashboard: ${data.subject}</p>
            <div class="grid grid-cols-2 gap-4 mt-8">
                <div class="bg-black p-6 rounded-2xl border border-slate-800 text-center">
                    <i class="fas fa-video text-yellow-500 text-2xl mb-2"></i>
                    <p class="text-[10px] uppercase font-bold">Go Live</p>
                </div>
                <div class="bg-black p-6 rounded-2xl border border-slate-800 text-center">
                    <i class="fas fa-upload text-yellow-500 text-2xl mb-2"></i>
                    <p class="text-[10px] uppercase font-bold">Upload Quiz</p>
                </div>
            </div>
            <p class="text-center text-[9px] text-slate-600 mt-10">Use Teacher App for full control</p>
        </div>
    `;
}

function loadStudentDashboard(data) {
    document.getElementById('coinBox').classList.remove('hidden');
    document.getElementById('bpDisplay').innerText = `${data.bp_coins} BP`;
    document.getElementById('dashboard').innerHTML = `
        <div class="glass p-6 rounded-3xl">
            <h3 class="text-xl font-bold">Hello, ${data.name}</h3>
            <p class="text-xs text-slate-500 italic">${data.city} | Level ${data.level}</p>
            
            <div id="paymentBox" class="${data.paid ? 'hidden' : 'block'} mt-6 p-4 bg-yellow-600/10 border border-yellow-500/20 rounded-2xl">
                <p class="text-xs font-bold text-yellow-500 uppercase tracking-tighter">Account Status: Unpaid</p>
                <button class="btn-gold mt-4 text-[12px] py-2">Pay via PhonePe / GPay</button>
            </div>
        </div>
    `;
      }
      
