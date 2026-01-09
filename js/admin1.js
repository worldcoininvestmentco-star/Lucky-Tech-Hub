// Sidebar navigation
document.querySelectorAll('.menu li').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.menu li').forEach(i=>i.classList.remove('active'));
    item.classList.add('active');

    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    document.getElementById(item.dataset.section).classList.add('active');

    document.getElementById('sectionTitle').textContent = item.textContent.trim();
    
    // 🔥 Load analytics ONLY when opened
    if (item.dataset.section === 'analysis') {
      setTimeout(loadAnalytics, 50);
    }
  });
});

// Dashboard stats
function updateStats() {
  document.getElementById('ideaCount').textContent =
    (JSON.parse(localStorage.getItem('techIdeas'))||[]).length;
  document.getElementById('projectCount').textContent =
    (JSON.parse(localStorage.getItem('projects'))||[]).length;
  document.getElementById('blogCount').textContent =
    (JSON.parse(localStorage.getItem('blogs'))||[]).length;
}
updateStats();

// Search filter
function filterCards(containerId, query) {
  document.querySelectorAll(`#${containerId} .card`).forEach(card=>{
    card.style.display = card.innerText.toLowerCase().includes(query.toLowerCase())
      ? 'block' : 'none';
  });
}



// admin-settings.js
import { db } from "./firebase.js";
import { doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const maintenanceEndInput = document.getElementById("maintenanceEnd");
  const maintenanceCheckbox = document.getElementById("maintenance");
  const siteNameInput = document.getElementById("siteName");
  const adminEmailInput = document.getElementById("adminEmail");
  const themeSelect = document.getElementById("theme");
  const notif = document.getElementById("notification");

  const settingsDocRef = doc(db, "adminSettings", "siteSettings");

  function showNotification(message, type = "info") {
    if (!notif) return;
    notif.textContent = message;
    notif.style.background = type === "success" ? "green" : type === "error" ? "red" : "#333";
    notif.style.display = "block";
    setTimeout(() => { notif.style.display = "none"; }, 3000);
  }

  // Load settings from Firebase
  async function loadSettings() {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();

      siteNameInput.value = data.siteName || "Lucky Tech Hub";
      adminEmailInput.value = data.adminEmail || "";
      themeSelect.value = data.theme || "light";
      maintenanceCheckbox.checked = data.maintenance || false;

      if (data.maintenanceEnd) {
        maintenanceEndInput.value = new Date(data.maintenanceEnd).toISOString().slice(0,16);
      } else {
        const defaultEnd = new Date(Date.now() + 0*60*1000);
        maintenanceEndInput.value = defaultEnd.toISOString().slice(0,16);
      }

      maintenanceEndInput.disabled = !maintenanceCheckbox.checked;
    }
  }

  // Auto-save to Firebase
  async function saveSettings() {
    const maintenanceEnabled = maintenanceCheckbox.checked;
    let endTime = null;
    if (maintenanceEnabled && maintenanceEndInput.value) {
      const ts = new Date(maintenanceEndInput.value).getTime();
      if (!isNaN(ts)) endTime = ts;
    }

    const settings = {
      siteName: siteNameInput.value || "Lucky Tech Hub",
      adminEmail: adminEmailInput.value || "",
      theme: themeSelect.value || "light",
      maintenance: maintenanceEnabled,
      maintenanceEnd: endTime
    };

    await setDoc(settingsDocRef, settings);
    showNotification(
      maintenanceEnabled
        ? `Maintenance mode enabled until ${endTime ? new Date(endTime).toLocaleString() : "N/A"}`
        : "Maintenance mode disabled",
      maintenanceEnabled ? "info" : "success"
    );
    console.log("Settings saved to Firebase:", settings);
  }

  // Event listeners
  maintenanceCheckbox.addEventListener("change", () => {
    maintenanceEndInput.disabled = !maintenanceCheckbox.checked;
    saveSettings();
  });
  maintenanceEndInput.addEventListener("change", saveSettings);
  siteNameInput.addEventListener("change", saveSettings);
  adminEmailInput.addEventListener("change", saveSettings);
  themeSelect.addEventListener("change", saveSettings);

  loadSettings();

  // Real-time updates
  onSnapshot(settingsDocRef, docSnap => {
    if (!docSnap.exists()) return;
    const data = docSnap.data();
    siteNameInput.value = data.siteName || "";
    adminEmailInput.value = data.adminEmail || "";
    themeSelect.value = data.theme || "light";
    maintenanceCheckbox.checked = data.maintenance || false;
    maintenanceEndInput.disabled = !maintenanceCheckbox.checked;
    if (data.maintenanceEnd) {
      maintenanceEndInput.value = new Date(data.maintenanceEnd).toISOString().slice(0,16);
    }
  });
});
