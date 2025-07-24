// Configuration Firebase simulée (remplacez par votre vraie config)
    const firebaseConfig = {
      // Votre configuration Firebase ici
    };

    // Simulation des données pour la démo
    let allPackages = [
      {
        id: 'TRK001234567',
        trackingNumber: 'TRK001234567',
        recipientName: 'Jean Dupont',
        recipientPhone: '+228 90 12 34 56',
        transportType: 'aérien',
        status: 'en_attente',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        notes: 'Colis fragile - manipuler avec précaution',
        createdAt: new Date('2024-01-15'),
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: 'TRK987654321',
        trackingNumber: 'TRK987654321',
        recipientName: 'Marie Martin',
        recipientPhone: '+228 91 23 45 67',
        transportType: 'maritime',
        status: 'en_livraison',
        imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400',
        notes: 'Livraison express demandée',
        createdAt: new Date('2024-01-10'),
        deliveryStart: new Date('2024-01-12'),
        lastUpdated: new Date('2024-01-12')
      },
      {
        id: 'TRK555666777',
        trackingNumber: 'TRK555666777',
        recipientName: 'Pierre Kofi',
        recipientPhone: '+228 92 34 56 78',
        transportType: 'aérien',
        status: 'livre',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
        notes: null,
        createdAt: new Date('2024-01-05'),
        deliveryStart: new Date('2024-01-07'),
        deliveredAt: new Date('2024-01-14'),
        lastUpdated: new Date('2024-01-14')
      }
    ];

    let allHistory = [
      {
        id: 'TRK111222333',
        trackingNumber: 'TRK111222333',
        recipientName: 'Ama Koko',
        recipientPhone: '+228 93 45 67 89',
        transportType: 'maritime',
        status: 'livre',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        archivedAt: new Date('2024-01-01'),
        deliveredAt: new Date('2023-12-28')
      }
    ];

    let selectedPackages = new Set();

    // Initialisation
    document.addEventListener('DOMContentLoaded', function() {
      initNavigation();
      initEventListeners();
      loadInitialData();
      updateStats();
    });

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

    // Événements
    function initEventListeners() {
      // Recherche en temps réel
      document.getElementById('searchInput').addEventListener('input', refreshPackages);
      document.getElementById('statusFilter').addEventListener('change', refreshPackages);
      document.getElementById('historySearch').addEventListener('input', refreshHistory);
      document.getElementById('historyStatusFilter').addEventListener('change', refreshHistory);

      // Actions par lot
      document.getElementById('markShippingBtn').addEventListener('click', () => batchUpdateStatus('en_livraison'));
      document.getElementById('markDeliveredBtn').addEventListener('click', () => batchUpdateStatus('livre'));
      document.getElementById('archiveBtn').addEventListener('click', batchArchive);

      // Preview de l'image
      document.getElementById('packageImage').addEventListener('change', handleImagePreview);

      // Modal pour images
      document.getElementById('imageModal').addEventListener('click', closeModal);

      // Déconnexion simulée
      document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
          alert('Déconnexion simulée - redirection vers la page de connexion');
        }
      });
    }

    // Chargement des données
    function loadInitialData() {
      refreshPackages();
      refreshHistory();
    }

    // Statistiques
    function updateStats() {
      const total = allPackages.length;
      const pending = allPackages.filter(p => p.status === 'en_attente').length;
      const shipping = allPackages.filter(p => p.status === 'en_livraison').length;
      const delivered = allPackages.filter(p => p.status === 'livre').length;

      document.getElementById('totalPackages').textContent = total;
      document.getElementById('pendingPackages').textContent = pending;
      document.getElementById('shippingPackages').textContent = shipping;
      document.getElementById('deliveredPackages').textContent = delivered;
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

      updateBatchActions();
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
          <span class="status ${p.status}">${getStatusLabel(p.status)}</span>
        </div>
        
        <div class="package-body">
          <div class="details">
            <p><strong>Destinataire:</strong> ${p.recipientName}</p>
            <p><strong>Téléphone:</strong> ${p.recipientPhone}</p>
            <p><strong>Transport:</strong> ${p.transportType}</p>
            <p><strong>Enregistré le:</strong> ${p.createdAt.toLocaleDateString('fr-FR')}</p>
            ${p.notes ? `<p><strong>Notes:</strong> ${p.notes}</p>` : ''}
          </div>
          
          ${daysInTransit}
          
          <div class="package-image">
            <img src="${p.imageUrl}" alt="Photo du colis" onclick="openModal('${p.imageUrl}')">
          </div>
        </div>
        
        <div class="package-footer">
          <div class="actions">
            ${p.status === 'en_attente' ? `<button class="btn-shipping" onclick="updateStatus('${p.id}', 'en_livraison')">Mettre en livraison</button>` : ''}
            ${p.status === 'en_livraison' ? `<button class="btn-delivered" onclick="updateStatus('${p.id}', 'livre')">Marquer livré</button>` : ''}
          </div>
          <label class="select-checkbox">
            <input type="checkbox" data-id="${p.id}" onchange="updateSelection()">
            Sélectionner
          </label>
        </div>
      `;
      
      return card;
    }

    // Gestion de l'historique
    function refreshHistory() {
      const searchTerm = document.getElementById('historySearch').value.toLowerCase();
      const statusFilter = document.getElementById('historyStatusFilter').value;
      
      const filtered = allHistory.filter(h => 
        (
          h.trackingNumber.toLowerCase().includes(searchTerm) || 
          h.recipientName.toLowerCase().includes(searchTerm)
        ) &&
        (statusFilter === '' || h.status === statusFilter)
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
            ${h.deliveredAt ? `<p><strong>Livré le:</strong> ${new Date(h.deliveredAt).toLocaleDateString('fr-FR')}</p>` : ''}
          </div>
          
          <div class="package-image">
            <img src="${h.imageUrl}" alt="Photo du colis" onclick="openModal('${h.imageUrl}')">
          </div>
        </div>
      `;
      
      return card;
    }

    // Gestion des statuts
    function updateStatus(id, newStatus) {
      const packageIndex = allPackages.findIndex(p => p.id === id);
      if (packageIndex === -1) return;

      const currentDate = new Date();
      allPackages[packageIndex].status = newStatus;
      allPackages[packageIndex].lastUpdated = currentDate;

      if (newStatus === 'en_livraison') {
        allPackages[packageIndex].deliveryStart = currentDate;
      } else if (newStatus === 'livre') {
        allPackages[packageIndex].deliveredAt = currentDate;
      }

      refreshPackages();
      updateStats();
      showMessage(`Statut mis à jour: ${getStatusLabel(newStatus)}`, 'success');
    }

    function batchUpdateStatus(newStatus) {
      if (selectedPackages.size === 0) return;

      const currentDate = new Date();
      selectedPackages.forEach(id => {
        const packageIndex = allPackages.findIndex(p => p.id === id);
        if (packageIndex !== -1) {
          allPackages[packageIndex].status = newStatus;
          allPackages[packageIndex].lastUpdated = currentDate;

          if (newStatus === 'en_livraison') {
            allPackages[packageIndex].deliveryStart = currentDate;
          } else if (newStatus === 'livre') {
            allPackages[packageIndex].deliveredAt = currentDate;
          }
        }
      });

      selectedPackages.clear();
      refreshPackages();
      updateStats();
      showMessage(`${selectedPackages.size} colis mis à jour: ${getStatusLabel(newStatus)}`, 'success');
    }

    function batchArchive() {
      if (selectedPackages.size === 0) return;

      const toArchive = [];
      selectedPackages.forEach(id => {
        const packageIndex = allPackages.findIndex(p => p.id === id);
        if (packageIndex !== -1) {
          const pkg = allPackages[packageIndex];
          toArchive.push({
            ...pkg,
            archivedAt: new Date()
          });
          allPackages.splice(packageIndex, 1);
        }
      });

      allHistory = [...toArchive, ...allHistory];
      selectedPackages.clear();
      refreshPackages();
      updateStats();
      showMessage(`${toArchive.length} colis archivés`, 'success');
    }

    // Sélection multiple
    function updateSelection() {
      selectedPackages.clear();
      document.querySelectorAll('#colisList input[type="checkbox"]:checked').forEach(cb => {
        selectedPackages.add(cb.dataset.id);
      });
      updateBatchActions();
    }

    function updateBatchActions() {
      const count = selectedPackages.size;
      document.querySelector('.selected-count').textContent = `${count} colis sélectionnés`;
      
      const buttons = document.querySelectorAll('.action-btn');
      buttons.forEach(btn => btn.disabled = count === 0);
    }

    // Formulaire d'ajout
    document.getElementById('colisForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const submitBtn = this.querySelector('.submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = '💾 Enregistrement...';

      try {
        const trackingNumber = document.getElementById('trackingNumber').value.trim();
        const recipientName = document.getElementById('recipientName').value.trim();
        const recipientPhone = document.getElementById('recipientPhone').value.trim();
        const transportType = document.getElementById('transportType').value;
        const notes = document.getElementById('packageNotes').value.trim() || null;
        const imageFile = document.getElementById('packageImage').files[0];

        // Validations
        if (!trackingNumber || !recipientName || !recipientPhone || !transportType || !imageFile) {
          throw new Error('Veuillez remplir tous les champs obligatoires');
        }

        // Vérifier si le numéro de suivi existe déjà
        if (allPackages.some(p => p.trackingNumber === trackingNumber)) {
          throw new Error('Ce numéro de suivi existe déjà');
        }

        // Simuler l'upload d'image
        const imageUrl = URL.createObjectURL(imageFile);

        const newPackage = {
          id: trackingNumber,
          trackingNumber,
          recipientName,
          recipientPhone,
          transportType,
          imageUrl,
          notes,
          status: 'en_attente',
          createdAt: new Date(),
          lastUpdated: new Date()
        };

        allPackages.unshift(newPackage);
        
        showMessage('✅ Colis enregistré avec succès!', 'success');
        this.reset();
        document.getElementById('packageImagePreview').innerHTML = '';
        updateStats();
        
        // Si on est sur la section gestion, rafraîchir
        if (document.getElementById('gestionColis').style.display !== 'none') {
          refreshPackages();
        }

      } catch (error) {
        showMessage(`❌ Erreur: ${error.message}`, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    // Preview d'image
    function handleImagePreview(e) {
      const file = e.target.files[0];
      const preview = document.getElementById('packageImagePreview');
      
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          preview.innerHTML = `<img src="${e.target.result}" alt="Aperçu">`;
        };
        reader.readAsDataURL(file);
      } else {
        preview.innerHTML = '';
      }
    }

    // Modal pour images
    function openModal(imageUrl) {
      const modal = document.getElementById('imageModal');
      const modalImage = document.getElementById('modalImage');
      modalImage.src = imageUrl;
      modal.classList.add('active');
    }

    function closeModal() {
      document.getElementById('imageModal').classList.remove('active');
    }

    // Utilitaires
    function getStatusLabel(status) {
      const statusMap = {
        'en_attente': '🕒 En attente',
        'en_livraison': '🚚 En livraison',
        'livre': '✅ Livré',
        'archive': '📁 Archivé'
      };
      return statusMap[status] || status;
    }

    function showMessage(text, type) {
      const msgDiv = document.getElementById('formMessage');
      msgDiv.textContent = text;
      msgDiv.className = `message ${type}`;
      setTimeout(() => {
        msgDiv.textContent = '';
        msgDiv.className = 'message';
      }, 4000);
    }

    // Auto-archivage (simulé - se déclenche après 7 jours)
    function setupAutoArchive() {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const toArchive = allPackages.filter(p => 
        p.status === 'livre' && p.deliveredAt && new Date(p.deliveredAt) < sevenDaysAgo
      );
      
      if (toArchive.length > 0) {
        toArchive.forEach(pkg => {
          const index = allPackages.findIndex(p => p.id === pkg.id);
          if (index !== -1) {
            allHistory.unshift({
              ...pkg,
              archivedAt: new Date()
            });
            allPackages.splice(index, 1);
          }
        });
        
        updateStats();
        showMessage(`${toArchive.length} colis automatiquement archivés`, 'success');
      }
    }

    // Lancer l'auto-archivage au chargement
    setTimeout(setupAutoArchive, 2000);

    // Raccourcis clavier
    document.addEventListener('keydown', function(e) {
      // Escape pour fermer le modal
      if (e.key === 'Escape') {
        closeModal();
      }
      
      // Ctrl+N pour nouveau colis
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        showSection('ajouterColis');
        document.querySelector('.nav-btn[data-section="ajouterColis"]').click();
      }
      
      // Ctrl+G pour gestion
      if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        showSection('gestionColis');
        document.querySelector('.nav-btn[data-section="gestionColis"]').click();
      }
    });