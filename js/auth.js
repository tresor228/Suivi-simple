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
      await firebase.auth().signInWithEmailAndPassword(email, password);
      window.location.href = 'user-dashboard.htm';
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
      await firebase.auth().createUserWithEmailAndPassword(email, password);
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
      await firebase.auth().sendPasswordResetEmail(email);
      document.getElementById('loginMessage').innerText = 'Lien envoyé, vérifiez votre boîte mail.';
      document.getElementById('formReset').style.display = 'none';
    } catch (err) {
      document.getElementById('loginMessage').innerText = err.message;
    }
  };
}