// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
// Supprimez cette ligne ou ajoutez l'import si vous voulez utiliser Analytics
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyC8iVLLZOwCjxS_eAvtvWCDAdEjbSnDJVg",
    authDomain: "suivi-mood.firebaseapp.com",
    projectId: "suivi-mood",
    storageBucket: "suivi-mood.firebasestorage.app",
    messagingSenderId: "810367255230",
    appId: "1:810367255230:web:ce0978cf9b068ed2d294ef",
    measurementId: "G-27Z787N8ED"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Supprimez cette ligne ou décommentez si vous voulez utiliser Analytics
// export const analytics = getAnalytics(app);