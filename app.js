import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyDlmQWV3IN_asZolPyaBLBb7L_RG0uriZM",
    authDomain: "mneet-f9bc7.firebaseapp.com",
    projectId: "mneet-f9bc7",
    storageBucket: "mneet-f9bc7.firebasestorage.app",
    appId: "1:944379440196:web:9d26b632b3e778d247e011"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const d = await getDoc(doc(db, "users", user.uid));
        const data = d.data();
        if(window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
        updateUI(data);
    } else if(!window.location.pathname.includes('index.html')) {
        window.location.href = 'index.html';
    }
});

function updateUI(user) {
    if(document.getElementById('bpVal')) {
        document.getElementById('bpVal').innerText = `${user.bp_coins} BP`;
        document.getElementById('rankName').innerText = user.bp_coins > 2000 ? "Resident Doctor" : "Aspirant";
    }
}

window.nav = (target) => {
    
    console.log("Navigating to:", target);
    if(target === 'ncert') renderNCERT();
};

window.adminLogin = async (e, p) => {
    await signInWithEmailAndPassword(auth, e, p);
};
