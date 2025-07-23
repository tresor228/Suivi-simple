// Initialisation
let allPackages = [];
let allHistory = [];

document.addEventListener('DOMContentLoaded', function() {
  initAuthCheck();
  initNavigation();
  initEventListeners();
  loadInitialData();
});

// Vérification du statut admin
function initAuthCheck() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user || !user.email.endsWith('@admin.com')) {
      window.location.href = 'login.htm';
    }
  });
}

// Navigation
function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const sectionId = this.dataset.section;
      showSection(sectionId);
      
      if (sectionId === 'gestionColis') refreshPackages();
      if (sectionId === 'historiqueColis') refreshHistory();
    });
  });
}

function showSection(sectionId) {
  document.querySelectorAll('.dashboard-section').forEach(section => {
    section.style.display = 'none';
  });
  document.getElementById(sectionId).style.display = 'block';
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionId);
  });
}

// Chargement des données
async function loadInitialData() {
  await Promise.all([loadAllPackages(), loadHistory()]);
  setupAutoArchive();
}

async function loadAllPackages() {
  try {
    const snapshot = await firebase.firestore().collection('colis')
      .orderBy('createdAt', 'desc')
      .get();
    
    allPackages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    refreshPackages();
  } catch (error) {
    console.error("Erreur chargement colis:", error);
  }
}

async function loadHistory() {
  try {
    const snapshot = await firebase.firestore().collection('historique_colis')
      .orderBy('archivedAt', 'desc')
      .get();
    
    allHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    refreshHistory();
  } catch (error) {
    console.error("Erreur chargement historique:", error);
  }
}

// Affichage des colis
function refreshPackages() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  
  const filtered = allPackages.filter(p => 
    (
      p.trackingNumber.toLowerCase().includes(searchTerm) || 
      p.recipientName.toLowerCase().includes(searchTerm)
    ) &&
    (statusFilter === '' || p.status === statusFilter)
  );
  
  renderPackages(filtered);
}

function renderPackages(packages) {
  const container = document.getElementById('colisList');
  container.innerHTML = '';
  
  if (packages.length === 0) {
    container.innerHTML = '<p class="empty">Aucun colis trouvé</p>';
    return;
  }
  
  packages.forEach(p => {
    container.appendChild(createPackageCard(p));
  });
}

function createPackageCard(p) {
  const card = document.createElement('div');
  card.className = `package-card ${p.status}`;
  card.dataset.id = p.id;
  
  const daysInTransit = p.status === 'en_livraison' && p.deliveryStart
    ? `<div class="days">En transit depuis ${Math.floor((new Date() - new Date(p.deliveryStart)) / (1000 * 60 * 60 * 24))} jours</div>`
    : '';
  
  card.innerHTML = `
    <div class="package-header">
      <span class="tracking">${p.trackingNumber}</span>
      <span class="status">${getStatusLabel(p.status)}</span>
    </div>
    
    <div class="package-body">
      <div class="details">
        <p><strong>Destinataire:</strong> ${p.recipientName}</p>
        <p><strong>Téléphone:</strong> ${p.recipientPhone}</p>
        <p><strong>Transport:</strong> ${p.transportType}</p>
        <p><strong>Enregistré le:</strong> ${p.createdAt?.toDate().toLocaleDateString('fr-FR')}</p>
      </div>
      
      ${daysInTransit}
      
      <div class="package-image">
        <img src="${p.imageUrl}" alt="Photo du colis">
      </div>
    </div>
    
    <div class="package-footer">
      <div class="actions">
        ${p.status === 'en_attente' ? `<button class="btn-shipping" data-id="${p.id}">Mettre en livraison</button>` : ''}
        ${p.status === 'en_livraison' ? `<button class="btn-delivered" data-id="${p.id}">Marquer livré</button>` : ''}
      </div>
      <label class="select-checkbox">
        <input type="checkbox" data-id="${p.id}">
        Sélectionner
      </label>
    </div>
  `;
  
  // Écouteurs d'événements
  const shippingBtn = card.querySelector('.btn-shipping');
  if (shippingBtn) shippingBtn.addEventListener('click', () => updateStatus(p.id, 'en_livraison'));
  
  const deliveredBtn = card.querySelector('.btn-delivered');
  if (deliveredBtn) deliveredBtn.addEventListener('click', () => updateStatus(p.id, 'livre'));
  
  card.querySelector('input[type="checkbox"]').addEventListener('change', updateSelection);
  
  return card;
}

// Gestion de l'historique
function refreshHistory() {
  const searchTerm = document.getElementById('historySearch').value.toLowerCase();
  const filtered = allHistory.filter(h => 
    h.trackingNumber.toLowerCase().includes(searchTerm) || 
    h.recipientName.toLowerCase().includes(searchTerm)
  );
  
  renderHistory(filtered);
}

function renderHistory(history) {
  const container = document.getElementById('historiqueList');
  container.innerHTML = '';
  
  if (history.length === 0) {
    container.innerHTML = '<p class="empty">Aucun colis archivé</p>';
    return;
  }
  
  history.forEach(h => {
    container.appendChild(createHistoryCard(h));
  });
}

function createHistoryCard(h) {
  const card = document.createElement('div');
  card.className = 'history-card';
  
  card.innerHTML = `
    <div class="card-header">
      <span class="tracking">${h.trackingNumber}</span>
      <span class="date">Archivé le: ${new Date(h.archivedAt).toLocaleDateString('fr-FR')}</span>
    </div>
    
    <div class="card-body">
      <div class="details">
        <p><strong>Destinataire:</strong> ${h.recipientName}</p>
        <p><strong>Statut:</strong> ${getStatusLabel(h.status)}</p>
        <p><strong>Transport:</strong> ${h.transportType}</p>
      </div>
      
      <div class="package-image">
        <img src="${h.imageUrl}" alt="Photo du colis">
      </div>
    </div>
  `;
  
  return card;
}

// Archivage automatique
async function setupAutoArchive() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  try {
    const toArchive = allPackages.filter(p => 
      p.status === 'livre' && 
      new Date(p.createdAt?.toDate()) < sevenDaysAgo
    );
    
    if (toArchive.length > 0) {
      const batch = firebase.firestore().batch();
      const archiveBatch = firebase.firestore().batch();
      const archiveRef = firebase.firestore().collection('historique_colis');
      
      toArchive.forEach(p => {
        archiveBatch.set(archiveRef.doc(p.id), {
          ...p,
          archivedAt: new Date().toISOString()
        });
        batch.delete(firebase.firestore().collection('colis').doc(p.id));
      });
      
      await Promise.all([batch.commit(), archiveBatch.commit()]);
      await loadAllPackages();
      await loadHistory();
    }
  } catch (error) {
    console.error("Erreur archivage auto:", error);
  }
}

// Formulaire d'ajout
document.getElementById('colisForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const submitBtn = this.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enregistrement...';

  try {
    // Upload de l'image
    const imageFile = document.getElementById('packageImage').files[0];
    if (!imageFile) throw new Error('Photo du colis requise');

    // Validation du type de transport
    const transportType = document.getElementById('transportType').value;
    if (!transportType) throw new Error('Veuillez choisir un type de transport.');

    // Numéro de suivi obligatoire
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    if (!trackingNumber) throw new Error('Le numéro de suivi est obligatoire.');
    // Nom et téléphone du destinataire peuvent être vides
    const recipientName = document.getElementById('recipientName').value.trim();
    const recipientPhone = document.getElementById('recipientPhone').value.trim();
    const notes = document.getElementById('packageNotes').value.trim() || null;

    const imageUrl = await uploadFile(imageFile, `packages/${Date.now()}_${imageFile.name}`);

    const packageData = {
      recipientName: recipientName || null,
      recipientPhone: recipientPhone || null,
      trackingNumber,
      transportType,
      imageUrl,
      notes,
      status: 'en_attente',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };

    // Utiliser le numéro de suivi comme ID
    await firebase.firestore().collection('colis').doc(trackingNumber).set(packageData);

    showMessage('Colis enregistré avec succès!', 'success');
    this.reset();
    document.getElementById('packageImagePreview').innerHTML = '';
    loadAllPackages();
  } catch (error) {
    showMessage(`Erreur: ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enregistrer';
  }
});

// Utilitaires
function getStatusLabel(status) {
  const statusMap = {
    'en_attente': '🕒 En attente',
    'en_livraison': '🚚 En livraison',
    'livre': '✅ Livré'
  };
  return statusMap[status] || status;
}

async function uploadFile(file, path) {
  const storageRef = firebase.storage().ref(path);
  await storageRef.put(file);
  return await storageRef.getDownloadURL();
}

function showMessage(text, type) {
  const msgDiv = document.getElementById('formMessage');
  msgDiv.textContent = text;
  msgDiv.className = `message ${type}`;
  setTimeout(() => msgDiv.textContent = '', 3000);
}

// Déconnexion
document.getElementById('logoutBtn').addEventListener('click', () => {
  firebase.auth().signOut().then(() => {
    window.location.href = 'login.htm';
  });
});