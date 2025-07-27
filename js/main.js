// Form handling - Corrections uniquement
document.addEventListener('DOMContentLoaded', () => {
  // Login form - Correction
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      // Add loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Connexion...';
      submitBtn.disabled = true;
      
      try {
        // Simulation d'authentification - remplacer par Firebase
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (email === 'bernardalade92@gmail.com' && password === 'Suivi2025') {
          showMessage('Connexion admin réussie ! Redirection...', 'success');
          setTimeout(() => {
            window.location.href = 'admin-dashboard.htm';
          }, 1500);
        } else if (email && password) {
          showMessage('Connexion réussie ! Redirection...', 'success');
          setTimeout(() => {
            window.location.href = 'user-dashboard.htm';
          }, 1500);
        } else {
          throw new Error('Email ou mot de passe incorrect');
        }
      } catch (error) {
        showMessage('Erreur de connexion: ' + error.message, 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Register form - Correction
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (password !== confirmPassword) {
        showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
      }
      
      if (!email || !password) {
        showMessage('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }
      
      // Générer un identifiant unique de type HD123
      const userId = 'HD' + Math.floor(100 + Math.random() * 900);
      
      // Add loading state
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Inscription...';
      submitBtn.disabled = true;
      
      try {
        // Simulation d'inscription - remplacer par Firebase
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showMessage(`Inscription réussie ! Votre identifiant est ${userId}. Vous pouvez maintenant vous connecter.`, 'success');
        setTimeout(() => {
          switchModal('register', 'login');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }, 2000);
      } catch (error) {
        showMessage('Erreur lors de l\'inscription: ' + error.message, 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Password reset form - Correction
  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value;
      
      if (!email) {
        showMessage('Veuillez entrer votre email', 'error');
        return;
      }
      
      const submitBtn = resetForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Envoi...';
      submitBtn.disabled = true;
      
      try {
        // Simulation d'envoi email - remplacer par Firebase
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showMessage('Un lien de réinitialisation a été envoyé à votre adresse email.', 'success');
      } catch (error) {
        showMessage('Erreur lors de l\'envoi: ' + error.message, 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});