import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const studentSignup = async (email, password, name, phone, city) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore e data save kora
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            phone: phone,
            city: city,
            email: email,
            role: "student",
            is_approved: false // Admin approve korle true hobe
        });

        alert("Signup Success! Approval er jonno wait koro.");
    } catch (error) {
        alert("Signup Error: " + error.message);
    }
};
