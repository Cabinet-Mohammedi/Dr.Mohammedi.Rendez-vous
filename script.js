// script.js (type=module)
import { db } from "./firebase-config.js";
import { ref, push, get, onValue, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

/* ---------- PATIENT ---------- */
const form = document.getElementById("rdvForm");
if (form) {
  const resultMessage = document.getElementById("resultMessage");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nom = document.getElementById("nom").value.trim();
    const tel = document.getElementById("tel").value.trim();
    if (!nom || !tel) return alert("Veuillez remplir tous les champs.");

    const rdvRef = ref(db, "rendezvous");
    try {
      const snap = await get(rdvRef);
      const count = snap.exists() ? Object.keys(snap.val()).length : 0;
      const numero = count + 1;
      const date = new Date().toLocaleDateString("fr-FR");

      await push(rdvRef, { numero, nom, tel, date });

      resultMessage.style.display = "block";
      resultMessage.textContent = `✅ Rendez-vous enregistré ! Votre numéro : N°${numero}. Il reste ${count} patients avant vous.`;
      form.reset();
    } catch (err) {
      alert("Erreur lors de l'envoi : " + err.message);
    }
  });
}

/* ---------- MEDECIN (login + affichage + suppression + ajout) ---------- */
const loginCard = document.getElementById("loginCard");
const medContent = document.getElementById("medContent");
const btnLogin = document.getElementById("btnLogin");
const loginError = document.getElementById("loginError");
const TABLE_BODY = document.querySelector("#rdvTable tbody");
const btnAdd = document.getElementById("btnAdd");

const DOCTEUR_PWD = "docteur123"; // mot de passe médecin

function showMedInterface() {
  loginCard.style.display = "none";
  medContent.style.display = "block";
}

if (btnLogin) {
  btnLogin.addEventListener("click", (e) => {
    e.preventDefault();
    const val = document.getElementById("mdpMedecin").value;
    if (val === DOCTEUR_PWD) {
      localStorage.setItem("md_pass", val); // garder متاح على الجهاز
      showMedInterface();
      startListening(); // commence à écouter la DB
    } else {
      loginError.textContent = "Mot de passe incorrect.";
    }
  });

  // auto-login si mot de passe محفوظ محلياً
  window.addEventListener("load", () => {
    if (localStorage.getItem("md_pass") === DOCTEUR_PWD) {
      showMedInterface();
      startListening();
    }
  });
}

/* Ajouter rendez-vous depuis l'interface médecin */
if (btnAdd) {
  btnAdd.addEventListener("click", async (e) => {
    e.preventDefault();
    const nomA = document.getElementById("nomAdd").value.trim();
    const telA = document.getElementById("telAdd").value.trim();
    if (!nomA || !telA) return alert("Veuillez remplir tous les champs.");
    const rdvRef = ref(db, "rendezvous");
    try {
      const snap = await get(rdvRef);
      const count = snap.exists() ? Object.keys(snap.val()).length : 0;
      const numero = count + 1;
      const date = new Date().toLocaleDateString("fr-FR");
      await push(rdvRef, { numero, nom: nomA, tel: telA, date });
      document.getElementById("nomAdd").value = "";
      document.getElementById("telAdd").value = "";
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  });
}

/* Écoute en temps réel et rendu tableau */
let started = false;
function startListening() {
  if (started) return;
  started = true;
  const rdvRef = ref(db, "rendezvous");
  onValue(rdvRef, (snapshot) => {
    TABLE_BODY.innerHTML = "";
    if (!snapshot.exists()) return;
    const entries = Object.entries(snapshot.val());
    // trier par numero si لازم
    entries.sort((a,b) => a[1].numero - b[1].numero);
    entries.forEach(([key, rdv], idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${rdv.numero}</td>
        <td>${rdv.nom}</td>
        <td>${rdv.tel}</td>
        <td>${rdv.date}</td>
        <td><button data-key="${key}" class="delBtn"><i class="fas fa-trash-alt"></i> Supprimer</button></td>
      `;
      TABLE_BODY.appendChild(tr);
    });
    // délégation d'événements suppression
    TABLE_BODY.querySelectorAll(".delBtn").forEach(btn => {
      btn.onclick = async () => {
        const k = btn.getAttribute("data-key");
        if (!confirm("Supprimer ce rendez-vous ?")) return;
        try {
          await remove(ref(db, "rendezvous/" + k));
        } catch (err) {
          alert("Erreur suppression: " + err.message);
        }
      };
    });
  });
}
