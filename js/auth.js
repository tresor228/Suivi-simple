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

// Connexion - Formulaire de login.htm
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageElement = document.getElementById('loginMessage');
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Connexion...';
    submitBtn.disabled = true;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Vérifier si c'est l'admin
      if (email === 'bernardalade92@gmail.com') {
        window.location.href = 'admin-dashboard.htm';
      } else {
        window.location.href = 'user-dashboard.htm';
      }
    } catch (err) {
      if (messageElement) {
        messageElement.style.color = 'red';
        messageElement.innerText = 'Erreur de connexion: Email ou mot de passe incorrect';
      }
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  };
}

// Inscription - Formulaire de login.htm
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    const messageElement = document.getElementById('loginMessage');
    
    if (password !== confirmPassword) {
      messageElement.style.color = 'red';
      messageElement.innerText = 'Les mots de passe ne correspondent pas';
      return;
    }
    
    if (password.length < 6) {
      messageElement.style.color = 'red';
      messageElement.innerText = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }
    
    try {
      messageElement.style.color = 'blue';
      messageElement.innerText = 'Création du compte en cours...';
      
      const cred = await createUserWithEmailAndPassword(auth, email, password);
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
      if (err.code === 'auth/email-already-in-use') {
        messageElement.innerText = 'Cette adresse email est déjà utilisée';
      } else if (err.code === 'auth/invalid-email') {
        messageElement.innerText = 'Adresse email invalide';
      } else if (err.code === 'auth/weak-password') {
        messageElement.innerText = 'Le mot de passe est trop faible';
      } else {
        messageElement.innerText = 'Erreur inscription: ' + err.message;
      }
      console.error('Erreur Firebase:', err);
    }
  };
}

// Inscription pour le modal dans index.htm
document.addEventListener('DOMContentLoaded', function() {
  const modalRegisterForm = document.getElementById('modalRegisterForm');
  if (modalRegisterForm) {
    modalRegisterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const lastName = document.getElementById('modalLastName').value;
      const firstName = document.getElementById('modalFirstName').value;
      const email = document.getElementById('modalRegisterEmail').value;
      const phone = document.getElementById('modalPhone').value;  
      const password = document.getElementById('modalRegisterPassword').value;
      const confirmPassword = document.getElementById('modalConfirmPassword').value;
      
      const messageElement = document.getElementById('modalRegisterMessage');
      
      if (password !== confirmPassword) {
        messageElement.innerText = 'Les mots de passe ne correspondent pas';
        messageElement.style.color = 'red';
        return;
      }
      
      if (password.length < 6) {
        messageElement.innerText = 'Le mot de passe doit contenir au moins 6 caractères';
        messageElement.style.color = 'red';
        return;
      }
      
      const submitBtn = modalRegisterForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Inscription...';
      submitBtn.disabled = true;
      
      try {
        messageElement.innerText = 'Création du compte en cours...';
        messageElement.style.color = 'blue';
        
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const randomId = 'HD' + Math.floor(100 + Math.random() * 900);
        
        await setDoc(doc(db, 'users', cred.user.uid), {
          email: email,
          fullName: `${firstName} ${lastName}`,
          phone: phone,
          address: '',
          identifiant: randomId,
          createdAt: new Date().toISOString()
        });
        
        messageElement.style.color = 'green';
        messageElement.innerText = 'Compte créé avec succès! Votre ID: ' + randomId + '. Vous pouvez vous connecter.';
        modalRegisterForm.reset();
        
        setTimeout(() => {
          const registerModal = document.getElementById('registerModal');
          if (registerModal) {
            registerModal.classList.remove('active');
            document.body.style.overflow = 'auto';
          }
        }, 2000);
        
      } catch (err) {
        messageElement.style.color = 'red';
        if (err.code === 'auth/email-already-in-use') {
          messageElement.innerText = 'Cette adresse email est déjà utilisée';
        } else if (err.code === 'auth/invalid-email') {
          messageElement.innerText = 'Adresse email invalide';
        } else if (err.code === 'auth/weak-password') {
          messageElement.innerText = 'Le mot de passe est trop faible';
        } else {
          messageElement.innerText = 'Erreur inscription: ' + err.message;
        }
        console.error('Erreur Firebase:', err);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Connexion pour le modal dans index.htm
  const modalLoginForm = document.getElementById('modalLoginForm');
  if (modalLoginForm) {
    modalLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('modalLoginEmail').value;
      const password = document.getElementById('modalLoginPassword').value;
      const messageElement = document.getElementById('modalLoginMessage');
      
      // Vérifier que les champs ne sont pas vides
      if (!email || !password) {
        messageElement.innerText = 'Veuillez remplir tous les champs';
        messageElement.style.color = 'red';
        return;
      }
      
      const submitBtn = modalLoginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Connexion...';
      submitBtn.disabled = true;
      
      try {
        // VRAIE authentification Firebase - pas de simulation
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Si on arrive ici, l'authentification a réussi
        messageElement.innerText = 'Connexion réussie! Redirection...';
        messageElement.style.color = 'green';
        
        // Vérifier si c'est l'admin
        if (email === 'bernardalade92@gmail.com') {
          setTimeout(() => {
            window.location.href = 'admin-dashboard.htm';
          }, 1000);
        } else {
          setTimeout(() => {
            window.location.href = 'user-dashboard.htm';
          }, 1000);
        }
      } catch (err) {
        // En cas d'erreur Firebase (mauvais identifiants, compte inexistant, etc.)
        let errorMessage = 'Erreur de connexion: ';
        
        switch(err.code) {
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
        
        messageElement.innerText = errorMessage;
        messageElement.style.color = 'red';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});

// Fonction pour afficher des messages (si elle n'existe pas déjà)
function showMessage(message, type = 'info') {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  messageEl.textContent = message;
  
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 350px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideInRight 0.3s ease;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
  `;
  
  document.body.appendChild(messageEl);
  
  setTimeout(() => {
    messageEl.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => messageEl.remove(), 300);
  }, 4000);
}

// Mot de passe oublié
const resetForm = document.getElementById('resetForm');
if (resetForm) {
  resetForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const messageElement = document.getElementById('loginMessage');
    
    try {
      await sendPasswordResetEmail(auth, email);
      messageElement.style.color = 'green';
      messageElement.innerText = 'Lien de réinitialisation envoyé, vérifiez votre boîte mail.';
      document.getElementById('formReset').style.display = 'none';
    } catch (err) {
      messageElement.style.color = 'red';
      messageElement.innerText = 'Erreur: ' + err.message;
    }
  };
}