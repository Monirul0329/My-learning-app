import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYw3wJTOurtrgQffR2DsQ1mqj__w6-4_s",
  authDomain: "nest-mr-bio.firebaseapp.com",
  projectId: "nest-mr-bio",
  storageBucket: "nest-mr-bio.firebasestorage.app",
  messagingSenderId: "1051338751163",
  appId: "1:1051338751163:web:59e5f33e44b265b31fbd9e",
  measurementId: "G-DXZD3SVH46"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

registerBtn.onclick = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "student",
      approved: false,
      paid: false
    });

    alert("Registered! Wait for admin approval.");
  } catch (error) {
    alert(error.message);
  }
};

loginBtn.onclick = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    const user = userCredential.user;

    const userSnap = await getDoc(doc(db, "users", user.uid));

    if (!userSnap.exists()) {
      alert("User data not found!");
      return;
    }

    const userData = userSnap.data();

    if (!userData.approved) {
      alert("Waiting for admin approval");
      return;
    }

    if (userData.role === "teacher") {
      window.location.href = "teacher.html";
    } else {
      window.location.href = "student.html";
    }

  } catch (error) {
    alert(error.message);
  }
};
