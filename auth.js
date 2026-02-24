import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            
            if (userData.role === "student" && userData.is_approved === false) {
                alert("Tomar account ekhono admin approve koreni!");
                await auth.signOut();
            } else {
                window.location.href = "dashboard.html";
            }
        }
    } catch (error) {
        alert("Login Error: " + error.message);
    }
};
