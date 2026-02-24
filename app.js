import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

const btnSignup = document.getElementById('btnSignup');
if(btnSignup) {
    btnSignup.onclick = async () => {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;

        if(!name || !email || !pass) {
            alert("Fields empty!");
            return;
        }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), {
                name: name,
                email: email,
                is_approved: false
            });
            alert("Success! Approved holei class pabe.");
        } catch (err) {
            alert("Firebase Error: " + err.message);
        }
    };
}
