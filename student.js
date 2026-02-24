import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let userData = null;

const syllabus = {
    biology: [
        { id: "01", name: "The Living World", isFree: true },
        { id: "02", name: "Biological Classification", isFree: false }
    ]
};

onAuthStateChanged(auth, user => {
    if (user) {
        onSnapshot(doc(db, "users", user.uid), (d) => {
            userData = d.data();

            if(document.getElementById('bpDisplay')) document.getElementById('bpDisplay').innerText = userData.bp_coins + " BP";
        });
    } else {
        window.location.href = 'index.html';
    }
});

window.checkAccess = (chapterId) => {
    const chapter = syllabus.biology.find(c => c.id === chapterId);
    if (userData.is_paid || (chapter && chapter.isFree)) {
        return true;
    } else {
        alert("🔒 Content Locked! Chapter 01 is free. Pay to unlock all.");
        return false;
    }
};
