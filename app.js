import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const adminEmail = "mi4286803@gmail.com";


const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const mainPlayer = document.getElementById('mainPlayer');
const adminPanel = document.getElementById('adminPanel');


onSnapshot(doc(db, "settings", "current_class"), (doc) => {
    if (doc.exists()) {
        const data = doc.data();
        let videoId = data.url.split('v=')[1] || data.url.split('/').pop();
        mainPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        document.getElementById('classTitle').innerText = data.title;
    }
});


onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().is_approved === true) {
            document.getElementById('welcomeUser').innerText = `Dr. ${userDoc.data().name}`;
            authSection.classList.add('hidden');
            dashboardSection.classList.remove('hidden');
            
            if(user.email === adminEmail) adminPanel.classList.remove('hidden');
            
        } else {
            document.getElementById('msg').innerText = "Wait for Monirul Sir's Approval!";
            setTimeout(() => signOut(auth), 5000);
        }
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

document.getElementById('btnUpdateVideo').onclick = async () => {
    const url = document.getElementById('videoLink').value;
    if(!url) return alert("Paste Video Link!");
    try {
        await updateDoc(doc(db, "settings", "current_class"), {
            url: url,
            title: "New Biology Live Class"
        });
        alert("Live Class Updated for All Students!");
    } catch (e) {
      
        await setDoc(doc(db, "settings", "current_class"), { url: url, title: "Biology Class" });
    }
};

document.getElementById('btnAction').onclick = async () => {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), { name, email, is_approved: false });
        document.getElementById('msg').innerText = "Request Sent!";
    } catch (err) { document.getElementById('msg').innerText = err.message; }
};

document.getElementById('btnLogin').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('pass').value;
    try { await signInWithEmailAndPassword(auth, email, pass); } catch (e) { alert("Error!"); }
};
document.getElementById('btnLogout').onclick = () => signOut(auth);
          
