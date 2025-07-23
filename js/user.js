// js/user.js
import { auth, db, storage } from '../firebase-config.js';

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const authError = document.getElementById('authError');
const authSection = document.getElementById('authSection');
const dashboard = document.getElementById('dashboard');
const colisList = document.getElementById('colisList');

btnLogin.addEventListener('click', async () => {
  authError.textContent = "";
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  if (!email || !password) {
    authError.textContent = "Merci de remplir tous les champs.";
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    authError.textContent = error.message;
  }
});

btnLogout.addEventListener('click', () => {
  signOut(auth);
});

onAuthStateChanged(auth, async user => {
  if (user) {
    authSection.style.display = "none";
    dashboard.style.display = "block";
    chargerColisUtilisateur(user);
  } else {
    authSection.style.display = "block";
    dashboard.style.display = "none";
    colisList.innerHTML = "";
  }
});

async function chargerColisUtilisateur(user) {
  colisList.innerHTML = "<p>Chargement...</p>";

  // Ici on suppose clientId = user.uid ou user.email selon ta logique
  const clientId = user.uid; // ou user.email

  const q = query(collection(db, "colis"), where("clientId", "==", clientId), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    colisList.innerHTML = "<p>Aucun colis trouvé.</p>";
    return;
  }

  colisList.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const card = document.createElement("div");
    card.classList.add("colis-card");

    card.innerHTML = `
      <p><strong>Suivi :</strong> ${data.trackingNumber}</p>
      <p><strong>Transport :</strong> ${data.transportType}</p>
      <p><strong>Statut :</strong> ${traduireStatut(data.status)}</p>
      <p><strong>Valeur du colis (FCFA) :</strong> <input type="number" min="0" class="valeur-input" value="${data.productValue || ''}" /></p>
      <p>Photo produit: <img src="${data.productImageUrl || '#'}" alt="Produit" width="100" onerror="this.style.display='none'" /></p>
      <input type="file" accept="image/*" class="upload-produit" />
      <p>Photo paiement: <img src="${data.paymentImageUrl || '#'}" alt="Paiement" width="100" onerror="this.style.display='none'" /></p>
      <input type="file" accept="image/*" class="upload-paiement" />
      <button class="btn-submit" data-id="${id}">Mettre à jour</button>
    `;

    const btnSubmit = card.querySelector(".btn-submit");
    btnSubmit.addEventListener("click", () => {
      uploadInfosColis(id, card);
    });

    colisList.appendChild(card);
  });
}

function traduireStatut(status) {
  if (status === "en_attente") return "⏳ En attente d'expédition";
  if (status === "en_livraison") return "🚚 En cours de livraison";
  if (status === "livre") return "✅ Livré";
  return status;
}

async function uploadInfosColis(docId, card) {
  const valeurInput = card.querySelector(".valeur-input");
  const produitFile = card.querySelector(".upload-produit").files[0];
  const paiementFile = card.querySelector(".upload-paiement").files[0];

  if (!valeurInput.value || valeurInput.value <= 0) {
    alert("Veuillez saisir une valeur valide pour le colis.");
    return;
  }

  const updates = {
    productValue: parseFloat(valeurInput.value)
  };

  if (produitFile) {
    const produitRef = ref(storage, `produits/${docId}`);
    const snap = await uploadBytes(produitRef, produitFile);
    updates.productImageUrl = await getDownloadURL(snap.ref);
  }

  if (paiementFile) {
    const paiementRef = ref(storage, `paiements/${docId}`);
    const snap = await uploadBytes(paiementRef, paiementFile);
    updates.paymentImageUrl = await getDownloadURL(snap.ref);
  }

  await updateDoc(doc(db, "colis", docId), updates);
  alert("Informations mises à jour !");
  // Recharge la liste après mise à jour
  const user = auth.currentUser;
  if (user) chargerColisUtilisateur(user);
}
