import { getDatabase, ref, push, remove, onValue, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const db = getDatabase();

// --- Sélecteurs ---
const tableBody = document.querySelector("#rdvTable tbody");
const countRemaining = document.getElementById("countRemaining");
const btnAdd = document.getElementById("btnAdd");
const loginCard = document.getElementById("loginCard");
const medContent = document.getElementById("medContent");
const mdpInput = document.getElementById("mdpMedecin");
const btnLogin = document.getElementById("btnLogin");
const loginError = document.getElementById("loginError");

// --- Mot de passe médecin ---
const MOT_DE_PASSE = "docteur123";

// --- Vérification login ---
function checkLogin() {
  if (localStorage.getItem("medecinLogged") === "true") {
    loginCard.style.display = "none";
    medContent.style.display = "block";
  }
}
checkLogin();

btnLogin.addEventListener("click", () => {
  const mdp = mdpInput.value.trim();
  if (mdp === MOT_DE_PASSE) {
    localStorage.setItem("medecinLogged", "true");
    loginCard.style.display = "none";
    medContent.style.display = "block";
  } else {
    loginError.textContent = "Mot de passe incorrect.";
  }
});

// --- Ajouter un rendez-vous ---
btnAdd.addEventListener("click", () => {
  const nom = document.getElementById("nomAdd").value.trim();
  const tel = document.getElementById("telAdd").value.trim();
  if (!nom || !tel) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const rdvRef = ref(db, "rendezvous");
  onValue(rdvRef, (snapshot) => {
    const total = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    const numero = total + 1;
    const date = new Date().toLocaleDateString("fr-FR");
    push(rdvRef, { nom, tel, numero, date });
    updateRemaining();
  }, { onlyOnce: true });

  document.getElementById("nomAdd").value = "";
  document.getElementById("telAdd").value = "";
});

// --- Charger la liste des rendez-vous ---
function chargerRendezVous() {
  const rdvRef = ref(db, "rendezvous");
  onValue(rdvRef, (snapshot) => {
    const data = snapshot.val();
    tableBody.innerHTML = "";
    if (data) {
      Object.entries(data).forEach(([id, rdv], i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${rdv.numero}</td>
          <td>${rdv.nom || "-"}</td>
          <td>${rdv.tel || "-"}</td>
          <td>${rdv.date || "-"}</td>
          <td>
            <button class="btnDone"><i class="fas fa-check"></i></button>
            <button class="btnDelete"><i class="fas fa-trash"></i></button>
          </td>
        `;
        // Bouton "terminé"
        row.querySelector(".btnDone").addEventListener("click", () => {
          row.classList.toggle("done");
          updateRemaining();
        });
        // Bouton supprimer
        row.querySelector(".btnDelete").addEventListener("click", () => {
          remove(ref(db, "rendezvous/" + id));
        });
        tableBody.appendChild(row);
      });
    }
    updateRemaining();
  });
}

// --- Mettre à jour compteur patients restants ---
function updateRemaining() {
  const total = document.querySelectorAll("#rdvTable tbody tr").length;
  const done = document.querySelectorAll("#rdvTable tbody tr.done").length;
  countRemaining.textContent = `Patients restants: ${total - done}`;
}

// --- Initialisation ---
chargerRendezVous();
