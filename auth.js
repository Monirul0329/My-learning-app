import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

registerBtn.onclick = async () => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email.value,
    password.value
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    approved: false,
    paid: false,
    freeAccess: false
  });

  alert("Registered! Wait for admin approval.");
};

loginBtn.onclick = async () => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email.value,
    password.value
  );

  const user = userCredential.user;

  const userSnap = await getDoc(doc(db, "users", user.uid));
  const userData = userSnap.data();

  if (!userData.approved) {
    alert("Waiting for admin approval");
    return;
  }

  window.location.href = "student.html";
};
