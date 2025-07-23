// Initialisation
document.addEventListener('DOMContentLoaded', function() {
  initNavigation();
  initAuthState();
  initImageUploads();
  initPackageForm();
});

// Gestion de la navigation
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section');
      showSection(sectionId);
    });
  });
}

function showSection(sectionId) {
  // Masquer toutes les sections
  document.querySelectorAll('.dashboard-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Afficher la section sélectionnée
  document.getElementById(sectionId).style.display = 'block';
  
  // Mettre à jour les boutons actifs
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-section') === sectionId) {
      btn.classList.add('active');
    }
  });
}

// Gestion de l'authentification
function initAuthState() {
  firebase.auth().onAuthStateChanged(async user => {
    if (user) {
      displayUserBadge(user);
      await loadUserProfile(user);
      await loadUserPackages(user);
      setupAutoArchive(user);
    } else {
      window.location.href = 'login.htm';
    }
  });
}

function displayUserBadge(user) {
  const userBadge = document.getElementById('userBadge');
  userBadge.innerHTML = `
    <span>${user.email}</span>
    <img src="${user.photoURL || 'https://i.imgur.com/8Km9tLL.png'}" alt="Photo profil" class="user-avatar">
  `;
}

// Chargement du profil utilisateur
async function loadUserProfile(user) {
  const personalInfoDiv = document.getElementById('personalInfo');
  
  try {
    const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    personalInfoDiv.innerHTML = `
      <div class="info-card">
        <label>Nom Complet</label>
        <p>${userData.fullName || 'Non renseigné'}</p>
      </div>
      <div class="info-card">
        <label>Email</label>
        <p>${user.email}</p>
      </div>
      <div class="info-card">
        <label>Téléphone</label>
        <p>${userData.phone || 'Non renseigné'}</p>
      </div>
      <div class="info-card">
        <label>Adresse</label>
        <p>${userData.address || 'Non renseigné'}</p>
      </div>
      <div class="info-card">
        <label>ID Client</label>
        <p class="monospace">${user.uid}</p>
      </div>
      <div class="info-card">
        <label>Membre depuis</label>
        <p>${new Date(user.metadata.creationTime).toLocaleDateString('fr-FR')}</p>
      </div>
    `;
  } catch (error) {
    personalInfoDiv.innerHTML = `
      <div class="error-message">
        Erreur de chargement du profil. Veuillez réessayer.
      </div>
    `;
  }
}

// Gestion des colis
async function loadUserPackages(user) {
  const packagesList = document.getElementById('userColisList');
  packagesList.innerHTML = '<div class="loading">Chargement en cours...</div>';

  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const query = await firebase.firestore().collection('colis')
      .where('clientId', '==', user.uid)
      .where('status', 'in', ['en_attente', 'en_livraison'])
      .orderBy('timestamp', 'desc')
      .get();

    if (query.empty) {
      packagesList.innerHTML = '<p class="empty-message">Aucun colis en cours</p>';
      return;
    }

    packagesList.innerHTML = '';
    query.forEach(doc => {
      const package = doc.data();
      packagesList.appendChild(createPackageCard(doc.id, package));
    });
  } catch (error) {
    packagesList.innerHTML = `
      <div class="error-message">
        Erreur de chargement des colis: ${error.message}
      </div>
    `;
  }
}

function createPackageCard(id, package) {
  const card = document.createElement('div');
  card.className = 'package-card';
  
  card.innerHTML = `
    <div class="package-header">
      <h3>${package.packageName || 'Colis sans nom'}</h3>
      <span class="status-badge ${package.status}">
        ${getStatusLabel(package.status)}
      </span>
    </div>
    
    <div class="package-details">
      <div class="detail">
        <label>Valeur:</label>
        <span>${package.packageValue ? package.packageValue.toLocaleString('fr-FR') : '0'} FCFA</span>
      </div>
      
      ${package.recipientName ? `
      <div class="detail">
        <label>Destinataire:</label>
        <span>${package.recipientName}</span>
      </div>
      ` : ''}
      
      <div class="detail">
        <label>Date d'ajout:</label>
        <span>${package.timestamp?.toDate().toLocaleDateString('fr-FR') || 'N/A'}</span>
      </div>
    </div>
    
    <div class="package-images">
      ${package.productImageUrl ? `
        <img src="${package.productImageUrl}" alt="Photo du produit" class="package-image">
      ` : ''}
      
      ${package.paymentImageUrl ? `
        <img src="${package.paymentImageUrl}" alt="Preuve de paiement" class="package-image">
      ` : ''}
    </div>
  `;
  
  return card;
}

function getStatusLabel(status) {
  const statusMap = {
    'en_attente': '🕒 En attente',
    'en_livraison': '🚚 En cours',
    'livre': '✅ Livré'
  };
  return statusMap[status] || status;
}

// Gestion de l'historique
function afficherHistorique() {
  const section = document.getElementById('historiqueSection');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
  if (section.style.display === 'block') {
    loadHistory();
  }
}

async function loadHistory() {
  const user = firebase.auth().currentUser;
  const historyList = document.getElementById('historiqueList');
  historyList.innerHTML = '<div class="loading">Chargement de l\'historique...</div>';

  try {
    const query = await firebase.firestore().collection('historique_colis')
      .where('clientId', '==', user.uid)
      .orderBy('archivedAt', 'desc')
      .get();

    if (query.empty) {
      historyList.innerHTML = '<p class="empty-message">Aucun colis dans l\'historique</p>';
      return;
    }

    historyList.innerHTML = '';
    query.forEach(doc => {
      const package = doc.data();
      historyList.appendChild(createHistoryCard(package));
    });
  } catch (error) {
    historyList.innerHTML = `
      <div class="error-message">
        Erreur de chargement de l'historique: ${error.message}
      </div>
    `;
  }
}

function createHistoryCard(package) {
  const card = document.createElement('div');
  card.className = 'package-card history';
  
  card.innerHTML = `
    <div class="package-header">
      <h3>${package.packageName}</h3>
      <span class="status-badge livre">Archivé</span>
    </div>
    
    <div class="package-details">
      <div class="detail">
        <label>Livré le:</label>
        <span>${new Date(package.archivedAt).toLocaleDateString('fr-FR')}</span>
      </div>
      
      <div class="detail">
        <label>Valeur:</label>
        <span>${package.packageValue?.toLocaleString('fr-FR') || '0'} FCFA</span>
      </div>
    </div>
    
    ${package.productImageUrl ? `
    <div class="package-images">
      <img src="${package.productImageUrl}" alt="Photo du produit" class="package-image">
    </div>
    ` : ''}
  `;
  
  return card;
}

// Archivage automatique
async function setupAutoArchive(user) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const packagesToArchive = await firebase.firestore().collection('colis')
      .where('clientId', '==', user.uid)
      .where('status', '==', 'livre')
      .where('timestamp', '<=', sevenDaysAgo)
      .get();

    const batch = firebase.firestore().batch();
    const historyRef = firebase.firestore().collection('historique_colis');

    packagesToArchive.forEach(doc => {
      const packageData = doc.data();
      historyRef.doc(doc.id).set({
        ...packageData,
        archivedAt: new Date().toISOString()
      });
      batch.delete(doc.ref);
    });

    if (packagesToArchive.size > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error("Erreur d'archivage automatique:", error);
  }
}

// Gestion des images
function initImageUploads() {
  setupImagePreview('productImage', 'productImagePreview');
  setupImagePreview('paymentImage', 'paymentImagePreview');
}

function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  input.addEventListener('change', function() {
    preview.innerHTML = '';
    if (this.files && this.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

// Gestion du formulaire
function initPackageForm() {
  const form = document.getElementById('addPackageForm');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;

    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enregistrement...';

    try {
      // Upload des images
      const productImageUrl = await uploadFile('productImage', `packages/${user.uid}/products/${Date.now()}`);
      const paymentImageUrl = await uploadFile('paymentImage', `packages/${user.uid}/payments/${Date.now()}`);

      // Enregistrement du colis
      await firebase.firestore().collection('colis').add({
        clientId: user.uid,
        clientEmail: user.email,
        packageName: document.getElementById('packageName').value.trim(),
        packageValue: parseFloat(document.getElementById('packageValue').value),
        recipientName: document.getElementById('recipientName').value.trim() || null,
        productImageUrl,
        paymentImageUrl,
        status: 'en_attente',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      showFormMessage('Colis enregistré avec succès!', 'success');
      form.reset();
      document.getElementById('productImagePreview').innerHTML = '';
      document.getElementById('paymentImagePreview').innerHTML = '';
      await loadUserPackages(user);
    } catch (error) {
      showFormMessage(`Erreur: ${error.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enregistrer le Colis';
    }
  });
}

async function uploadFile(inputId, path) {
  const file = document.getElementById(inputId).files[0];
  if (!file) return null;

  const storageRef = firebase.storage().ref(path);
  await storageRef.put(file);
  return await storageRef.getDownloadURL();
}

function showFormMessage(message, type) {
  const messageDiv = document.getElementById('formMessage');
  messageDiv.textContent = message;
  messageDiv.className = `form-message ${type}`;
}

// Déconnexion
function deconnexion() {
  firebase.auth().signOut().then(() => {
    window.location.href = 'login.htm';
  }).catch(error => {
    console.error("Erreur de déconnexion:", error);
  });
}