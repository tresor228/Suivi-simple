import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Variables globales
let currentUser = null;
let userProfileData = null;

// Vérification de l'authentification
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadUserProfile(user.uid);
    updateUserDisplay();
  } else {
    // Rediriger vers la page de connexion si non connecté
    window.location.href = 'login.htm';
  }
});

// Charger le profil utilisateur depuis Firestore
async function loadUserProfile(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      userProfileData = userDoc.data();
    } else {
      // Données par défaut si pas de profil en DB
      userProfileData = {
        email: currentUser.email,
        fullName: 'Utilisateur',
        phone: 'Non renseigné',
        address: 'Non renseigné',
        identifiant: 'HD' + Math.floor(100 + Math.random() * 900),
        createdAt: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    // Données par défaut en cas d'erreur
    userProfileData = {
      email: currentUser.email,
      fullName: 'Utilisateur',
      phone: 'Non renseigné',
      address: 'Non renseigné',
      identifiant: 'HD' + Math.floor(100 + Math.random() * 900),
      createdAt: new Date().toISOString()
    };
  }
}

// Mettre à jour l'affichage utilisateur
function updateUserDisplay() {
  // Mettre à jour le badge utilisateur
  const userBadge = document.getElementById('userBadge');
  if (userBadge && userProfileData) {
    const emailSpan = userBadge.querySelector('span');
    if (emailSpan) {
      emailSpan.textContent = userProfileData.email;
    }
  }
  
  // Mettre à jour les informations du profil
  updateProfileInfo();
}

// Mettre à jour les informations du profil
function updateProfileInfo() {
  const personalInfoDiv = document.getElementById('personalInfo');
  if (personalInfoDiv && userProfileData) {
    personalInfoDiv.innerHTML = `
      <div class="info-card">
        <label>Nom Complet</label>
        <p>${userProfileData.fullName || 'Non renseigné'}</p>
      </div>
      <div class="info-card">
        <label>Email</label>
        <p>${userProfileData.email}</p>
      </div>
      <div class="info-card">
        <label>Téléphone</label>
        <p>${userProfileData.phone || 'Non renseigné'}</p>
      </div>
      <div class="info-card">
        <label>Adresse</label>
        <p>${userProfileData.address || 'Non renseigné'}</p>
      </div>
      <div class="info-card">
        <label>ID Client</label>
        <p class="monospace">${userProfileData.identifiant}</p>
      </div>
      <div class="info-card">
        <label>Membre depuis</label>
        <p>${new Date(userProfileData.createdAt).toLocaleDateString('fr-FR')}</p>
      </div>
    `;
    
    // Animation d'apparition des cartes
    const cards = personalInfoDiv.querySelectorAll('.info-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }
}

// Fonction de déconnexion
function deconnexion() {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    const btn = event.target;
    btn.textContent = '⏳ Déconnexion...';
    btn.disabled = true;
    
    signOut(auth).then(() => {
      window.location.href = 'login.htm';
    }).catch((error) => {
      console.error('Erreur de déconnexion:', error);
      btn.textContent = '🚪 Déconnexion';
      btn.disabled = false;
    });
  }
}

// Rendre la fonction globale
window.deconnexion = deconnexion;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initImageUploads();
  initPackageForm();
  
  // Afficher la première section par défaut
  showSection('mesColis');
});

function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section');
      showSection(sectionId);
      
      // Mettre à jour les boutons actifs
      navButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function showSection(sectionId) {
  // Masquer toutes les sections
  document.querySelectorAll('.dashboard-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Afficher la section demandée
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
    // Animation d'apparition
    targetSection.style.opacity = '0';
    targetSection.style.transform = 'translateY(20px)';
    setTimeout(() => {
      targetSection.style.transition = 'all 0.3s ease';
      targetSection.style.opacity = '1';
      targetSection.style.transform = 'translateY(0)';
    }, 50);
  }
}

function initImageUploads() {
  setupImagePreview('productImage', 'productImagePreview');
  setupImagePreview('paymentImage', 'paymentImagePreview');
}

function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if (input && preview) {
    input.addEventListener('change', function() {
      preview.innerHTML = '';
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.maxWidth = '120px';
          img.style.maxHeight = '120px';
          img.style.borderRadius = '12px';
          img.style.objectFit = 'cover';
          img.style.border = '2px solid #e2e8f0';
          preview.appendChild(img);
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }
}

function initPackageForm() {
  const form = document.getElementById('addPackageForm');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Enregistrement...';
    
    // Simulation d'un délai d'enregistrement
    setTimeout(() => {
      showFormMessage('✅ Colis enregistré avec succès!', 'success');
      form.reset();
      document.getElementById('productImagePreview').innerHTML = '';
      document.getElementById('paymentImagePreview').innerHTML = '';
      
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      
      // Simuler l'ajout d'un nouveau colis dans la liste
      addNewPackageToList();
    }, 2000);
  });
}

function addNewPackageToList() {
  const packagesList = document.getElementById('userColisList');
  const packageName = document.getElementById('packageName').value;
  const packageValue = document.getElementById('packageValue').value;
  const recipientName = document.getElementById('recipientName').value;
  
  // Supprimer le message vide s'il existe
  const emptyMessage = packagesList.querySelector('.empty-message');
  if (emptyMessage) {
    emptyMessage.remove();
  }
  
  const newPackageCard = document.createElement('div');
  newPackageCard.className = 'package-card';
  newPackageCard.style.animationDelay = '0s';
  
  newPackageCard.innerHTML = `
    <div class="package-header">
      <h3>${packageName}</h3>
      <span class="status-badge en_attente">🕒 En attente</span>
    </div>
    <div class="package-details">
      <div class="detail">
        <label>Valeur:</label>
        <span>${parseInt(packageValue).toLocaleString('fr-FR')} FCFA</span>
      </div>
      ${recipientName ? `
      <div class="detail">
        <label>Destinataire:</label>
        <span>${recipientName}</span>
      </div>
      ` : ''}
      <div class="detail">
        <label>Date d'ajout:</label>
        <span>${new Date().toLocaleDateString('fr-FR')}</span>
      </div>
    </div>
    <div class="package-images">
      <div class="package-image" style="background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; width: 80px; height: 80px; border-radius: 12px;">📦</div>
    </div>
  `;
  
  packagesList.insertBefore(newPackageCard, packagesList.firstChild);
  
  // Animation d'apparition
  newPackageCard.style.opacity = '0';
  newPackageCard.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    newPackageCard.style.transition = 'all 0.5s ease';
    newPackageCard.style.opacity = '1';
    newPackageCard.style.transform = 'translateY(0)';
  }, 100);
  
  // Retourner automatiquement à la section "Mes Colis"
  setTimeout(() => {
    showSection('mesColis');
    // Mettre à jour le bouton actif
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-section') === 'mesColis') {
        btn.classList.add('active');
      }
    });
  }, 1000);
}

function showFormMessage(message, type) {
  const messageDiv = document.getElementById('formMessage');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `form-message ${type}`;
    
    // Auto-hide après 5 secondes
    setTimeout(() => {
      messageDiv.style.opacity = '0';
      messageDiv.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'form-message';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
      }, 300);
    }, 5000);
  }
}

function afficherHistorique() {
  const section = document.getElementById('historiqueSection');
  if (section) {
    const isVisible = section.style.display === 'block';
    
    if (isVisible) {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
      // Animation d'apparition
      section.style.opacity = '0';
      setTimeout(() => {
        section.style.transition = 'opacity 0.5s ease';
        section.style.opacity = '1';
      }, 50);
    }
  }
}

// Rendre les fonctions globales
window.afficherHistorique = afficherHistorique;

// Notifications de bienvenue
setTimeout(() => {
  if (currentUser) {
    showNotification('🎉 Bienvenue dans votre espace colis !', 'success');
  }
}, 3000);

// Fonction pour afficher les notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; margin-left: 10px;">&times;</button>
    </div>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    z-index: 1000;
    animation: slideInRight 0.3s ease;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  // Auto-suppression après 5 secondes
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// CSS pour les animations des notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
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
  
  .notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .monospace {
    font-family: 'Courier New', monospace;
    font-weight: bold;
    color: #4f46e5;
  }
`;
document.head.appendChild(notificationStyles);