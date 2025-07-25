import { auth, db } from '../firebase-config.js';

function afficherFormInscription() {
  document.getElementById('formInscription').style.display = 'block';
  document.getElementById('formReset').style.display = 'none';
}
function afficherFormReset() {
  document.getElementById('formInscription').style.display = 'none';
  document.getElementById('formReset').style.display = 'block';
}

// Connexion
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
      await auth.signInWithEmailAndPassword(email, password);
      // Redirection selon l'utilisateur
      if (email === 'bernardalade92@gmail.com' && password === 'Suivi2025') {
        window.location.href = 'admin-dashboard.htm';
      } else {
        window.location.href = 'user-dashboard.htm';
      }
    } catch (err) {
      document.getElementById('loginMessage').innerText = err.message;
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
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      // Générer un identifiant unique du type HD123
      const randomId = 'HD' + Math.floor(100 + Math.random() * 900);
      await db.collection('users').doc(cred.user.uid).set({
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        identifiant: randomId,
        createdAt: new Date().toISOString()
      });
      document.getElementById('loginMessage').innerText = 'Compte créé, vous pouvez vous connecter.';
      document.getElementById('formInscription').style.display = 'none';
    } catch (err) {
      document.getElementById('loginMessage').innerText = err.message;
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
      await auth.sendPasswordResetEmail(email);
      document.getElementById('loginMessage').innerText = 'Lien envoyé, vérifiez votre boîte mail.';
      document.getElementById('formReset').style.display = 'none';
    } catch (err) {
      document.getElementById('loginMessage').innerText = err.message;
    }
  };
}