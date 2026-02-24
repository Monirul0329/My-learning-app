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
