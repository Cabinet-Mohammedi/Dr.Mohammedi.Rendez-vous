import { getDatabase, ref, push, remove, onValue, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const db = getDatabase();

// --- Sélecteurs ---
const tableBody = document.querySelector("#rdvTable tbody");
const countRemaining = document.getElementById("countRemaining");
const btnAdd = document.getElementById("btnAdd");

// --- Ajouter un rendez-vous ---
btnAdd.addEventListener("click", () => {
  const nom = document.getElementById("nomAdd").value.trim();
  const tel = document.getElementById("telAdd").value.trim();
  const date = document.getElementById("dateAdd").value.trim();
  if (!nom || !tel || !date) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const newRef = ref(db, "rendezvous");
  push(newRef, {
    nom,
    tel,
    date,
    numero: Date.now() // numéro unique
  });

  document.getElementById("nomAdd").value = "";
  document.getElementById("telAdd").value = "";
  document.getElementById("dateAdd").value = "";
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
          <td>${i + 1}</td>
          <td>${rdv.nom || "-"}</td>
          <td>${rdv.tel || "-"}</td>
          <td>${rdv.date || "-"}</td>
          <td>
            <button class="btnDone"><i class="fas fa-check"></i></button>
            <button class="btnDelete" style="background:#dc3545;"><i class="fas fa-trash"></i></button>
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
  countRemaining.textContent = total - done;
}

// --- Initialisation ---
chargerRendezVous();


