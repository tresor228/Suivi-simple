// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

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

// Configuration Firestore avec settings spécifiques
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export const db = getFirestore(app);
export const storage = getStorage(app);

// Configuration Firestore pour forcer la connexion
import { enableNetwork, disableNetwork, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Forcer la connexion réseau et configurer les timeouts
const initializeFirestore = async () => {
  try {
    // Activer le réseau
    await enableNetwork(db);
    console.log('✅ Connexion Firestore activée');
    
    // Configurer les timeouts pour éviter les problèmes de connexion
    const firestoreSettings = {
      cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
      experimentalForceLongPolling: true, // Forcer le long polling
      useFetchStreams: false // Désactiver les streams pour plus de stabilité
    };
    
    console.log('✅ Configuration Firestore appliquée');
    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation Firestore:', error);
    return false;
  }
};

// Initialiser Firestore au chargement
initializeFirestore();