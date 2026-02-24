import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const role = userDoc.data().role;
            
            if (role === 'admin') window.location.href = 'admin.html';
            else if (role === 'teacher') window.location.href = 'teacher.html';
            else window.location.href = 'student.html';
        }
    } else {
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
});

window.login = async (email, pass) => {
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        alert("Invalid Login: " + error.message);
    }
};

window.logout = () => signOut(auth);
        
