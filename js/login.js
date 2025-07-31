// Fonctions pour afficher/masquer les formulaires
function afficherFormInscription() {
  document.getElementById('formInscription').style.display = 'block';
  document.getElementById('formReset').style.display = 'none';
  document.getElementById('loginMessage').style.display = 'none';
}

function afficherFormReset() {
  document.getElementById('formInscription').style.display = 'none';
  document.getElementById('formReset').style.display = 'block';
  document.getElementById('loginMessage').style.display = 'none';
}

function masquerForms() {
  document.getElementById('formInscription').style.display = 'none';
  document.getElementById('formReset').style.display = 'none';
  document.getElementById('loginMessage').style.display = 'none';
}

// Rendre les fonctions globales
window.afficherFormInscription = afficherFormInscription;
window.afficherFormReset = afficherFormReset;
window.masquerForms = masquerForms;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  // Redirection vers inscription.htm depuis le bouton "Inscription" sur login.htm
  const goToInscriptionBtn = document.getElementById('goToInscription');
  if (goToInscriptionBtn) {
    goToInscriptionBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'inscription.htm';
    });
  }
});