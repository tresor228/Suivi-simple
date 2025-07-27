import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { collection, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

function afficherFormInscription() {
  document.getElementById('formInscription').style.display = 'block';
  document.getElementById('formReset').style.display = 'none';
}

function afficherFormReset() {
  document.getElementById('formInscription').style.display = 'none';
  document.getElementById('formReset').style.display = 'block';
}

function masquerForms() {
  document.getElementById('formInscription').style.display = 'none';
  document.getElementById('formReset').style.display = 'none';
}

// Rendre les fonctions globales
window.afficherFormInscription = afficherFormInscription;
window.afficherFormReset = afficherFormReset;
window.masquerForms = masquerForms;

// Connexion
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirection selon l'utilisateur
      if (email === 'bernardalade92@gmail.com' && password === 'Suivi2025') {
        window.location.href = 'admin-dashboard.htm';
      } else {
        window.location.href = 'user-dashboard.htm';
      }
    } catch (err) {
      const messageElement = document.getElementById('loginMessage');
      if (messageElement) {
        messageElement.innerText = 'Erreur de connexion: ' + err.message;
      }
    }
  };
}

// Inscription
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const messageElement = document.getElementById('loginMessage');
    
    if (password !== confirmPassword) {
      messageElement.innerText = 'Les mots de passe ne correspondent pas';
      return;
    }
    
    if (password.length < 6) {
      messageElement.innerText = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }
    
    try {
      messageElement.innerText = 'Création du compte en cours...';
      
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Générer un identifiant unique du type HD123
      const randomId = 'HD' + Math.floor(100 + Math.random() * 900);
      
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: email,
        fullName: 'Nouvel utilisateur',
        phone: '',
        address: '',
        identifiant: randomId,
        createdAt: new Date().toISOString()
      });
      
      messageElement.style.color = 'green';
      messageElement.innerText = 'Compte créé avec succès! Votre ID: ' + randomId + '. Vous pouvez vous connecter.';
      document.getElementById('formInscription').style.display = 'none';
      registerForm.reset();
    } catch (err) {
      messageElement.style.color = 'red';
      messageElement.innerText = 'Erreur inscription: ' + err.message;
      console.error('Erreur Firebase:', err);
    }
  };
}

// Mot de passe oublié
const resetForm = document.getElementById('resetForm');
if (resetForm) {
  resetForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    try {
      await sendPasswordResetEmail(auth, email);
      document.getElementById('loginMessage').innerText = 'Lien de réinitialisation envoyé, vérifiez votre boîte mail.';
      document.getElementById('formReset').style.display = 'none';
    } catch (err) {
      document.getElementById('loginMessage').innerText = 'Erreur: ' + err.message;
    }
  };
}