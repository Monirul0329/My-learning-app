import { auth } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const forgotBtn = document.getElementById("forgotBtn");

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

// 🔹 Login
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login Successful");
    window.location.href = "dashboard.html";
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

// 🔹 Auto Redirect if already logged in
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
