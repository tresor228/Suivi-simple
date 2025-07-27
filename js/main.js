// Navigation scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile menu toggle
function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('active');
}

// Rendre la fonction globale
window.toggleMobileMenu = toggleMobileMenu;

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Close mobile menu if open
    document.getElementById('navLinks').classList.remove('active');
  });
});

// Modal functions
function openModal(modalType) {
  const modal = document.getElementById(modalType + 'Modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalType) {
  const modal = document.getElementById(modalType + 'Modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function switchModal(fromModal, toModal) {
  closeModal(fromModal);
  setTimeout(() => openModal(toModal), 100);
}

// Rendre les fonctions accessibles globalement
window.openModal = openModal;
window.closeModal = closeModal;
window.switchModal = switchModal;

// Event listeners pour les boutons d'authentification
document.addEventListener('DOMContentLoaded', () => {
  // Boutons dans la navbar
  const loginBtn = document.querySelector('.btn-outline');
  const registerBtn = document.querySelector('.btn-primary');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('login');
    });
  }
  
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('register');
    });
  }
  
  // Boutons de fermeture des modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  });
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      activeModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }
});

// Form handling
document.addEventListener('DOMContentLoaded', () => {
  // Login form
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
        // Simulation d'authentification - à remplacer par Firebase
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

  // Register form
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
      
      if (password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
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
        // Simulation d'inscription - à remplacer par Firebase
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showMessage(`Inscription réussie ! Votre identifiant est ${userId}. Vous pouvez maintenant vous connecter.`, 'success');
        registerForm.reset();
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

  // Tracking form
  const trackingForm = document.querySelector('.tracking-form');
  if (trackingForm) {
    trackingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const trackingNumber = document.querySelector('.tracking-input').value;
      
      if (trackingNumber.trim()) {
        showMessage('Recherche en cours...', 'info');
        setTimeout(() => {
          showMessage(`Colis ${trackingNumber} : En transit vers Lomé`, 'success');
        }, 1500);
      }
    });
  }
});

// Utility function to show messages
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

// Styles pour les animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
`;
document.head.appendChild(style);