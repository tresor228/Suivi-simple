import { auth, db } from '../firebase-config.js';
import { collection, query, orderBy, where, getDocs, doc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

let listeComplete = [];

async function chargerHistorique() {
  try {
    const q = query(
      collection(db, "historique_colis"),
      orderBy("archivedAt", "desc")
    );
    
    const snapshot = await getDocs(q);
    const container = document.getElementById("historiqueList");
    container.innerHTML = "";
    listeComplete = [];

    snapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      listeComplete.push({ id: docSnapshot.id, ...data });
    });

    afficherHistorique(listeComplete);
  } catch (error) {
    console.error('Erreur chargement historique:', error);
    document.getElementById("historiqueList").innerHTML = '<p>Erreur lors du chargement</p>';
  }
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
  onAuthStateChanged(auth, async function(user) {
    if (user) {
      try {
        const userId = user.uid;
        const q = query(
          collection(db, "historique_colis"),
          where("userUid", "==", userId),
          orderBy("archivedAt", "desc")
        );
        
        const snapshot = await getDocs(q);
        listeComplete = [];
        
        snapshot.forEach(docSnapshot => {
          const data = docSnapshot.data();
          listeComplete.push({ id: docSnapshot.id, ...data });
        });
        
        afficherHistorique(listeComplete);
      } catch (error) {
        console.error('Erreur:', error);
      }
    } else {
      window.location.href = "login.htm";
    }
  });
};

document.getElementById('logoutBtn')?.addEventListener('click', function() {
  signOut(auth).then(() => {
    window.location.href = 'login.htm';
  });
});

async function archiverColis(id, data) {
  const confirmation = confirm("Archiver ce colis ? Il sera déplacé dans l'historique.");
  if (!confirmation) return;

  try {
    await setDoc(doc(db, "historique_colis", id), {
      ...data,
      archivedAt: new Date().toISOString()
    });

    await deleteDoc(doc(db, "colis", id));
    alert("✅ Colis archivé !");
    afficherListeColis();
  } catch (error) {
    alert("Erreur lors de l'archivage : " + error.message);
  }
}

// Rendre les fonctions globales
window.filtrerHistorique = filtrerHistorique;
window.archiverColis = archiverColis;