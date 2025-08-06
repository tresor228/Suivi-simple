// js/login-page.js
import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { collection, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Fonction pour afficher des messages
function showMessage(message, type = 'info') {
  const messageEl = document.getElementById('loginMessage');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.style.color = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    messageEl.style.display = 'block';
    messageEl.style.padding = '12px';
    messageEl.style.borderRadius = '8px';
    messageEl.style.marginTop = '16px';
    messageEl.style.backgroundColor = type === 'success' ? '#dcfce7' : type === 'error' ? '#fef2f2' : '#eff6ff';
    messageEl.style.border = `1px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'}`;
    
    // Auto-hide après 5 secondes
    setTimeout(() => {
      messageEl.style.display = 'none';
      messageEl.textContent = '';
    }, 5000);
  }
}

// Fonctions pour afficher/masquer les formulaires
function afficherFormInscription() {
  document.getElementById('formInscription').style.display = 'block';
  document.getElementById('formReset').style.display = 'none';
  document.getElementById('loginMessage').style.display = 'none';
}

function afficherFormReset() {
  document.getElementById('formInscription').style.display = 'none';
  document.getElementById('formReset').style.display = 'block';
  document.getElementById('loginMessage').style.display = 'none';
}

function masquerForms() {
  document.getElementById('formInscription').style.display = 'none';
  document.getElementById('formReset').style.display = 'none';
  document.getElementById('loginMessage').style.display = 'none';
}

// Rendre les fonctions globales
window.afficherFormInscription = afficherFormInscription;
window.afficherFormReset = afficherFormReset;
window.masquerForms = masquerForms;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  
  // Formulaire de connexion
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      
      // Validation basique
      if (!email || !password) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
      }
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '⏳ Connexion...';
      submitBtn.disabled = true;
      
      try {
        // Authentification Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        showMessage('Connexion réussie! Redirection...', 'success');
        
        // Vérifier si c'est l'admin
        if (email === 'bernardalade92@gmail.com') {
          setTimeout(() => {
            window.location.href = 'admin-dashboard.htm';
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.href = 'user-dashboard.htm';
          }, 1500);
        }
        
      } catch (error) {
        console.error('Erreur de connexion:', error);
        
        let errorMessage = 'Erreur de connexion: ';
        switch(error.code) {
          case 'auth/user-not-found':
            errorMessage += 'Aucun compte trouvé avec cet email';
            break;
          case 'auth/wrong-password':
            errorMessage += 'Mot de passe incorrect';
            break;
          case 'auth/invalid-email':
            errorMessage += 'Format d\'email invalide';
            break;
          case 'auth/too-many-requests':
            errorMessage += 'Trop de tentatives. Veuillez patienter.';
            break;
          case 'auth/invalid-credential':
            errorMessage += 'Identifiants invalides';
            break;
          default:
            errorMessage += 'Email ou mot de passe incorrect';
        }
        
        showMessage(errorMessage, 'error');
        
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // Formulaire d'inscription
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Validations
      if (!email || !password || !confirmPassword) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
      }
      
      if (password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
      }
      
      const submitBtn = signupForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '⏳ Inscription...';
      submitBtn.disabled = true;
      
      try {
        showMessage('Création du compte en cours...', 'info');
        
        // Créer le compte Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Générer un ID utilisateur
        const randomId = 'HD' + Math.floor(100 + Math.random() * 900);
        
        // Sauvegarder les données utilisateur dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: email,
          fullName: 'Nouvel utilisateur', // Nom par défaut pour inscription rapide
          phone: '',
          address: '',
          identifiant: randomId,
          createdAt: new Date().toISOString()
        });
        
        showMessage(`Compte créé avec succès! Votre ID client: ${randomId}. Vous pouvez maintenant vous connecter.`, 'success');
        
        // Réinitialiser le formulaire et revenir à la connexion
        signupForm.reset();
        setTimeout(() => {
          masquerForms();
        }, 3000);
        
      } catch (error) {
        console.error('Erreur inscription:', error);
        
        let errorMessage = 'Erreur lors de l\'inscription: ';
        switch(error.code) {
          case 'auth/email-already-in-use':
            errorMessage += 'Cette adresse email est déjà utilisée';
            break;
          case 'auth/invalid-email':
            errorMessage += 'Adresse email invalide';
            break;
          case 'auth/weak-password':
            errorMessage += 'Le mot de passe est trop faible';
            break;
          case 'auth/operation-not-allowed':
            errorMessage += 'Inscription désactivée. Contactez l\'administrateur.';
            break;
          default:
            errorMessage += error.message;
        }
        
        showMessage(errorMessage, 'error');
        
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
  
  // Formulaire de réinitialisation de mot de passe
  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('resetEmail').value.trim();
      
      if (!email) {
        showMessage('Veuillez saisir votre adresse email', 'error');
        return;
      }
      
      const submitBtn = resetForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '⏳ Envoi...';
      submitBtn.disabled = true;
      
      try {
        await sendPasswordResetEmail(auth, email);
        showMessage('Email de réinitialisation envoyé! Vérifiez votre boîte mail (y compris les spams).', 'success');
        
        // Revenir au formulaire de connexion après 3 secondes
        setTimeout(() => {
          masquerForms();
          resetForm.reset();
        }, 3000);
        
      } catch (error) {
        console.error('Erreur reset password:', error);
        
        let errorMessage = 'Erreur: ';
        switch(error.code) {
          case 'auth/user-not-found':
            errorMessage += 'Aucun compte trouvé avec cet email';
            break;
          case 'auth/invalid-email':
            errorMessage += 'Adresse email invalide';
            break;
          case 'auth/too-many-requests':
            errorMessage += 'Trop de demandes. Veuillez patienter.';
            break;
          default:
            errorMessage += error.message;
        }
        
        showMessage(errorMessage, 'error');
        
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});

// Vérifier si l'utilisateur est déjà connecté
auth.onAuthStateChanged((user) => {
  if (user) {
    // L'utilisateur est déjà connecté, le rediriger
    if (user.email === 'bernardalade92@gmail.com') {
      window.location.href = 'admin-dashboard.htm';
    } else {
      window.location.href = 'user-dashboard.htm';
    }
  }
});