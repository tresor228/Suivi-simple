const colisList = document.getElementById('colisList');

function afficherColis(doc, id) {
  const data = doc.data();
  const div = document.createElement('div');
  div.classList.add('colis-card');

  let daysText = "";
  if (data.status === 'en_livraison' && data.deliveryStart) {
    const days = Math.floor((Date.now() - new Date(data.deliveryStart)) / (1000 * 60 * 60 * 24));
    daysText = `<p>⏱️ En livraison depuis : <strong>${days} jours</strong></p>`;
  }

  div.innerHTML = `
    <p><strong>Client :</strong> ${data.clientId}</p>
    <p><strong>Suivi :</strong> ${data.trackingNumber}</p>
    <p><strong>Transport :</strong> ${data.transportType}</p>
    <p><strong>Statut :</strong> ${traduireStatut(data.status)}</p>
    ${daysText}
    <img src="${data.imageUrl}" alt="photo" width="100" />

    <div class="actions">
      ${data.status === 'en_attente' ? `<button onclick="changerStatut('${id}', 'en_livraison')">📦 Envoyer</button>` : ''}
      ${data.status === 'en_livraison' ? `<button onclick="changerStatut('${id}', 'livré')">✅ Marquer comme livré</button>` : ''}
    </div>
    <hr/>
  `;

  colisList.appendChild(div);
}

function traduireStatut(status) {
  return status === 'en_attente' ? '🕒 En attente d\'expédition'
       : status === 'en_livraison' ? '🚚 En cours de livraison'
       : '📦 Livré';
}

async function changerStatut(id, nouveauStatut) {
  const colisRef = firebase.firestore().collection("colis").doc(id);
  const updates = { status: nouveauStatut };

  if (nouveauStatut === 'en_livraison') {
    updates.deliveryStart = new Date().toISOString();
  }

  await colisRef.update(updates);
  afficherListeColis(); // Refresh
}

async function afficherListeColis() {
  colisList.innerHTML = '';
  const snapshot = await firebase.firestore().collection("colis").orderBy("timestamp", "desc").get();
  snapshot.forEach(doc => {
    afficherColis(doc, doc.id);
  });
}

// Charger la liste au chargement de la page
window.onload = afficherListeColis;
let colisSelectionnes = [];

async function filtrerColisParDate() {
  const filterDate = document.getElementById("filterDate").value;
  if (!filterDate) {
    alert("Sélectionne une date");
    return;
  }

  const dateLimite = new Date(filterDate + "T23:59:59Z");
  const snapshot = await firebase.firestore().collection("colis").get();

  colisSelectionnes = []; // reset
  const div = document.getElementById("colisFiltres");
  div.innerHTML = "<h3>Colis trouvés :</h3>";

  snapshot.forEach(doc => {
    const data = doc.data();
    const arrival = new Date(data.arrivalDate);
    if (arrival <= dateLimite && data.status !== "livré") {
      const checkboxId = `colis_${doc.id}`;
      colisSelectionnes.push(doc.id);
      div.innerHTML += `
        <div>
          <input type="checkbox" id="${checkboxId}" value="${doc.id}" checked />
          <label for="${checkboxId}">${data.trackingNumber} - ${data.status}</label>
        </div>
      `;
    }
  });

  if (colisSelectionnes.length === 0) {
    div.innerHTML += "<p>Aucun colis trouvé.</p>";
  }
}
async function changerStatutsGroupes() {
    const nouveauxIds = [];
  
    colisSelectionnes.forEach(id => {
      const checkbox = document.getElementById(`colis_${id}`);
      if (checkbox && checkbox.checked) {
        nouveauxIds.push(id);
      }
    });
  
    if (nouveauxIds.length === 0) {
      alert("Aucun colis sélectionné !");
      return;
    }
  
    const confirmation = confirm(`Tu vas changer le statut de ${nouveauxIds.length} colis. Continuer ?`);
    if (!confirmation) return;
  
    const choix = prompt("Tape '1' pour lancer livraison, '2' pour marquer comme livré :");
    let nouveauStatut = "";
    let addDeliveryStart = false;
  
    if (choix === "1") {
      nouveauStatut = "en_livraison";
      addDeliveryStart = true;
    } else if (choix === "2") {
      nouveauStatut = "livré";
    } else {
      alert("Choix invalide.");
      return;
    }
  
    for (const id of nouveauxIds) {
      const ref = firebase.firestore().collection("colis").doc(id);
      const updates = { status: nouveauStatut };
      if (addDeliveryStart) {
        updates.deliveryStartDate = new Date().toISOString();
      }
      await ref.update(updates);
    }
  
    alert("✅ Statuts mis à jour !");
    document.getElementById("colisFiltres").innerHTML = "";
  }
  function peutEtreArchive(data) {
    if (!data.deliveryStart) return false;
    const jours = Math.floor((Date.now() - new Date(data.deliveryStart)) / (1000 * 60 * 60 * 24));
    return jours >= 3;
  }
  div.innerHTML = `
  <p><strong>Client :</strong> ${data.clientId}</p>
  <p><strong>Suivi :</strong> ${data.trackingNumber}</p>
  <p><strong>Transport :</strong> ${data.transportType}</p>
  <p><strong>Statut :</strong> ${traduireStatut(data.status)}</p>
  ${daysText}
  <img src="${data.imageUrl}" alt="photo" width="100" />

  <div class="actions">
    ${data.status === 'en_attente' ? `<button onclick="changerStatut('${id}', 'en_livraison')">📦 Envoyer</button>` : ''}
    ${data.status === 'en_livraison' ? `<button onclick="changerStatut('${id}', 'livré')">✅ Marquer comme livré</button>` : ''}
    ${data.status === 'livré' && peutEtreArchive(data) ? `<button onclick="archiverColis('${id}', ${JSON.stringify(data)})">🗃️ Archiver</button>` : ''}
  </div>
  <hr/>
`;
