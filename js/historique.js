let listeComplete = [];

async function chargerHistorique() {
  const snapshot = await firebase.firestore()
    .collection("historique_colis")
    .orderBy("archivedAt", "desc")
    .get();

  const container = document.getElementById("historiqueList");
  container.innerHTML = "";
  listeComplete = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    listeComplete.push({ id: doc.id, ...data });
  });

  afficherHistorique(listeComplete);
}

function afficherHistorique(colisList) {
  const container = document.getElementById("historiqueList");
  container.innerHTML = "";

  colisList.forEach(data => {
    container.innerHTML += `
      <div class="colis-card">
        <p><strong>Suivi :</strong> ${data.trackingNumber}</p>
        <p><strong>Client :</strong> ${data.clientId}</p>
        <p><strong>Transport :</strong> ${data.transportType}</p>
        <p><strong>Livré le :</strong> ${new Date(data.deliveryStart).toLocaleDateString()}</p>
        <img src="${data.imageUrl}" alt="photo" width="100" />
      </div>
    `;
  });
}

function filtrerHistorique() {
  const recherche = document.getElementById("recherche").value.toLowerCase();
  const filtré = listeComplete.filter(c =>
    c.trackingNumber.toLowerCase().includes(recherche)
  );
  afficherHistorique(filtré);
}

window.onload = async function() {
  firebase.auth().onAuthStateChanged(async function(user) {
    if (user) {
      // Utilisateur connecté, on charge ses colis historiques
      const userId = user.uid;
      const snapshot = await firebase.firestore()
        .collection("historique_colis")
        .where("userUid", "==", userId)
        .orderBy("archivedAt", "desc")
        .get();
      listeComplete = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        listeComplete.push({ id: doc.id, ...data });
      });
      afficherHistorique(listeComplete);
    } else {
      // Redirige vers la page de connexion si non connecté
      window.location.href = "login.htm";
    }
  });
};

document.getElementById('logoutBtn')?.addEventListener('click', function() {
  firebase.auth().signOut().then(() => {
    window.location.href = 'login.htm';
  });
});

async function archiverColis(id, data) {
    const confirmation = confirm("Archiver ce colis ? Il sera déplacé dans l'historique.");
    if (!confirmation) return;
  
    try {
      await firebase.firestore().collection("historique_colis").doc(id).set({
        ...data,
        archivedAt: new Date().toISOString()
      });
  
      await firebase.firestore().collection("colis").doc(id).delete();
      alert("✅ Colis archivé !");
      afficherListeColis();
    } catch (error) {
      alert("Erreur lors de l'archivage : " + error.message);
    }
  }
