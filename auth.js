import { db } from "./firebase.js";
const loginBtn = document.getElementById("loginBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const forgotBtn = document.getElementById("forgotBtn");

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth } from "./firebase.js";

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("User data not found in Firestore");
      return;
    }

    const userData = userSnap.data();

    if (!userData.approved) {
      alert("Your account is not approved yet");
      return;
    }

    if (userData.role === "admin") {
      window.location.href = "admin.html";
    } else if (userData.role === "teacher") {
      window.location.href = "teacher.html";
    } else if (userData.role === "student") {
      window.location.href = "student.html";
    } else {
      alert("Invalid role");
    }

  } catch (error) {
    alert(error.message);
  }
});

// 🔹 Register
registerBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Registration Successful");
  } catch (error) {
    alert(error.message);
  }
});

// 🔹 Forgot Password
forgotBtn.addEventListener("click", async () => {
  const email = emailInput.value;

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent");
  } catch (error) {
    alert(error.message);
  }
});
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

window.adminLogin = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists() && snap.data().role === "admin") {
    window.location.href = "admin.html";
  } else {
    alert("Not Admin");
  }
};

window.teacherLogin = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists() && snap.data().role === "teacher") {
    window.location.href = "teacher.html";
  } else {
    alert("Not Teacher");
  }
};

window.studentLogin = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists() && snap.data().role === "student") {
    window.location.href = "student.html";
  } else {
    alert("Not Student");
  }
};
