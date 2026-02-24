import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDYw3wJTOurtrgQffR2DsQ1mqj__w6-4_s",
    authDomain: "nest-mr-bio.firebaseapp.com",
    databaseURL: "https://nest-mr-bio-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "nest-mr-bio",
    storageBucket: "nest-mr-bio.firebasestorage.app",
    messagingSenderId: "1051338751163",
    appId: "1:1051338751163:web:59e5f33e44b265b31fbd9e",
    measurementId: "G-DXZD3SVH46"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const questionList = document.getElementById("questionList");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  if (!userData.approved) {
    alert("Waiting for admin approval");
    return;
  }

  let q;

  if (userData.paid === true || userData.freeAccess === true) {
    q = query(
      collection(db, "questions"),
      where("topicId", "==", "topic1")
    );
  } else {
    q = query(
      collection(db, "questions"),
      where("topicId", "==", "topic1"),
      where("isSample", "==", true)
    );
  }

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const p = document.createElement("p");
    p.innerText = doc.data().question;
    questionList.appendChild(p);
  });

});
