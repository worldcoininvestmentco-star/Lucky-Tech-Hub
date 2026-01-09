
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
  import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

  const firebaseConfig = {
    apiKey: "AIzaSyBVdLiFM6S0e26y8rYdd-6TOypB4Qn4VUk",
    authDomain: "lucky-tech-hub.firebaseapp.com",
    projectId: "lucky-tech-hub",
    storageBucket: "lucky-tech-hub.firebasestorage.app",
    messagingSenderId: "282917279268",
    appId: "1:282917279268:web:748375ae2869f4ecfc2ab1"
  };

  const app = initializeApp(firebaseConfig);
  window.auth = getAuth(app);
  window.db = getFirestore(app);
  window.storage = getStorage(app);
