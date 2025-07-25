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
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      // Add loading state
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Connexion...';
      submitBtn.disabled = true;
      setTimeout(() => {
        if (email === 'bernardalade92@gmail.com' && password === 'Suivi2025') {
          showMessage('Connexion admin réussie ! Redirection...', 'success');
          setTimeout(() => {
            window.location.href = 'admin-dashboard.htm';
          }, 1500);
        } else {
          showMessage('Connexion réussie ! Redirection...', 'success');
          setTimeout(() => {
            window.location.href = 'user-dashboard.htm';
          }, 1500);
        }
      }, 2000);
    });
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const fullName = document.getElementById('registerFullName').value;
      const phone = document.getElementById('registerPhone').value;
      const address = document.getElementById('registerAddress').value;
      if (password !== confirmPassword) {
        showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
      }
      if (!email || !password || !fullName || !phone || !address) {
        showMessage('Veuillez remplir tous les champs', 'error');
        return;
      }
      // Générer un identifiant unique de type HD123
      const userId = 'HD' + Math.floor(100 + Math.random() * 900);
      // Add loading state
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Inscription...';
      submitBtn.disabled = true;
      setTimeout(() => {
        showMessage(`Inscription réussie ! Votre identifiant est ${userId}. Vous pouvez maintenant vous connecter.`, 'success');
        setTimeout(() => {
          switchModal('register', 'login');
        }, 2000);
      }, 2000);
    });
  }

  // Password reset form
  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail').value;
      if (!email) {
        showMessage('Veuillez entrer votre email', 'error');
        return;
      }
      const submitBtn = resetForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Envoi...';
      submitBtn.disabled = true;
      setTimeout(() => {
        showMessage('Un lien de réinitialisation a été envoyé à votre adresse email.', 'success');
        submitBtn.textContent = 'Envoyer';
        submitBtn.disabled = false;
      }, 2000);
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
        // Simulate tracking lookup
        setTimeout(() => {
          showMessage(`Colis ${trackingNumber} : En transit vers Lomé`, 'success');
        }, 1500);
      }
    });
  }
});

// Utility function to show messages
function showMessage(message, type = 'info') {
  // Create message element
  const messageEl = document.createElement('div');
  messageEl.className = `message ${type}`;
  messageEl.textContent = message;
  
  // Find container to append message
  const container = document.querySelector('.modal.active .modal-content') || 
                   document.querySelector('.tracking-section') || 
                   document.querySelector('.container');
  
  if (container) {
    // Remove existing messages
    const existingMessages = container.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Add new message
    container.insertBefore(messageEl, container.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 5000);
  }
}

// Counter animation for stats
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  counters.forEach(counter => {
    const target = parseInt(counter.textContent.replace(/\D/g, ''));
    const increment = target / 100;
    let current = 0;
    
    const updateCounter = () => {
      if (current < target) {
        current += increment;
        if (counter.textContent.includes('+')) {
          counter.textContent = Math.ceil(current) + '+';
        } else if (counter.textContent.includes('/')) {
          counter.textContent = Math.ceil(current) + '/7';
        } else {
          counter.textContent = Math.ceil(current);
        }
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = counter.textContent; // Keep original format
      }
    };
    
    updateCounter();
  });
}

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      
      // Animate counters when stats section is visible
      if (entry.target.querySelector('.stat-number')) {
        animateCounters();
      }
    }
  });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.service-card, .process-step, .contact-item, .stats-grid');
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
  // Add hover effect to service cards
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });
  
  // Add click effect to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Create ripple effect
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);