


/* ===============================
   MAINTENANCE MODE GUARD
   =============================== */
/*(function () {
  const settings = JSON.parse(localStorage.getItem("siteSettings"));
  const now = Date.now();

  // ❌ If no settings or maintenance not enabled, do nothing
  if (!settings || !settings.maintenance) return;

  // ❌ If maintenance period has ended, do nothing
  if (settings.maintenanceEnd && now >= settings.maintenanceEnd) return;

  // ✅ Admin bypass
  const isAdmin =
    localStorage.getItem("isLoggedIn") === "true" ||
    localStorage.getItem("adminLoggedIn") === "true";

  if (isAdmin) return;

  // ✅ Prevent redirect loop if already on maintenance page
  const isMaintenancePage = window.location.pathname.includes("maintenance.html");

  if (!isMaintenancePage) {
    // Use replace to prevent back button going to blocked page
    window.location.replace("maintenance.html");
  }
})(); */

import { db } from "./firebase.js";
console.log("🔥 Firebase connected:", db);







/* -----------------------------
   Hamburger Menu Toggle
------------------------------ */
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });
}

/* -----------------------------
   Admin Authentication
------------------------------ */
if (window.location.href.includes('admin1.html')) {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
  }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
}

/* -----------------------------
   Tabs Functionality (Admin)
------------------------------ */
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(tc => tc.style.display = 'none');
    const activeTab = document.getElementById(btn.dataset.tab);
    activeTab.style.display = 'block';

    if (btn.dataset.tab === 'analysis') {
      setTimeout(loadAnalytics, 150);
    }
  });
});


/* -----------------------------
   Helper: Image to Base64
------------------------------ */
function getBase64(file, callback) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => callback(reader.result);
}

/* -----------------------------
   Render Cards Helper
------------------------------ */
function renderCards(list, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  list.forEach((item, index) => {
    container.innerHTML += `
      <div class="card">
        ${item.img ? `<img src="${item.img}" alt="${item.title}">` : ''}
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        ${item.status ? `<p><strong>Status:</strong> ${item.status}</p>` : ''}

        <div class="card-actions">
          <button class="btn edit" onclick="editItem('${containerId}', ${index})">
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="btn delete" onclick="deleteItem('${containerId}', ${index})">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;
  });
}

/*edit logic*/

let editIndex = null;
let editStorageKey = null;

function editItem(containerId, index) {
  if (containerId === 'ideaList') editStorageKey = 'techIdeas';
  if (containerId === 'projectList') editStorageKey = 'projects';
  if (containerId === 'blogList') editStorageKey = 'blogs';

  const list = JSON.parse(localStorage.getItem(editStorageKey)) || [];
  const item = list[index];

  editIndex = index;

  if (editStorageKey === 'techIdeas') {
    ideaTitle.value = item.title;
    ideaVideo.value = item.video || '';
    ideaDesc.innerHTML = item.desc;
  }

  if (editStorageKey === 'projects') {
    projectTitle.value = item.title;
    projectDesc.value = item.desc;
    projectStatus.value = item.status;
  }

  if (editStorageKey === 'blogs') {
    blogTitle.value = item.title;
    blogDesc.innerHTML = item.desc;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}



/* -----------------------------
   Analysis 
------------------------------ */



let adminChartInstance = null;

function loadAnalytics() {
  const canvas = document.getElementById('adminChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (adminChartInstance) {
    adminChartInstance.destroy();
  }

  adminChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Tech Ideas', 'Projects', 'Blogs'],
      datasets: [{
        label: 'Total Content',
        data: [
          JSON.parse(localStorage.getItem('techIdeas') || '[]').length,
          JSON.parse(localStorage.getItem('projects') || '[]').length,
          JSON.parse(localStorage.getItem('blogs') || '[]').length
        ],
        backgroundColor: ['#38bdf8', '#22c55e', '#facc15']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}









/* -----------------------------
   Delete Item (Admin)
------------------------------ */
function deleteItem(containerId, index) {
  let key = '';
  if (containerId === 'ideaList') key = 'techIdeas';
  if (containerId === 'projectList') key = 'projects';
  if (containerId === 'blogList') key = 'blogs';
  const list = JSON.parse(localStorage.getItem(key)) || [];
  list.splice(index, 1);
  localStorage.setItem(key, JSON.stringify(list));
  renderAll();
}

/* -----------------------------
   Admin Form Submissions
------------------------------ */
function handleForm(formId, storageKey, extraFields = []) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const fileInput = form.querySelector('input[type="file"]');
    const file = fileInput ? fileInput.files[0] : null;

    const save = img => {
      const list = JSON.parse(localStorage.getItem(storageKey)) || [];
      const data = {};
      form.querySelectorAll('input, textarea, select, [contenteditable]').forEach(el => {
  if (!el.id || el.type === 'file') return;

  let key = el.id
    .replace(/^(idea|project|blog)/i, '')
    .toLowerCase(); // normalize keys

  let value = '';

  if (el.hasAttribute('contenteditable')) {
    value = el.innerHTML.trim();
  } else {
    value = el.value.trim();
  }

  // Prevent undefined
  data[key] = value || '';
});

      extraFields.forEach(field => {
        if (form[field]) data[field] = form[field].value;
      });
      data.img = img || 'images/default.jpg';
      list.push(data);
      localStorage.setItem(storageKey, JSON.stringify(list));
      form.reset();
      form.querySelectorAll('[contenteditable]').forEach(el => el.innerHTML = '');
      renderAll();
    };

    if (file) getBase64(file, save);
    else save('images/default.jpg');
  });
}

/* -----------------------------
   Initialize Admin Forms
------------------------------ */
handleForm('ideaForm', 'techIdeas');
handleForm('projectForm', 'projects', ['projectStatus']);
handleForm('blogForm', 'blogs');

/* -----------------------------
   Render All Admin Content
------------------------------ */
function renderAll() {
  renderCards(JSON.parse(localStorage.getItem('techIdeas')) || [], 'ideaList');
  renderCards(JSON.parse(localStorage.getItem('projects')) || [], 'projectList');
  renderCards(JSON.parse(localStorage.getItem('blogs')) || [], 'blogList');
}

/* Only render admin lists if admin page */
if (window.location.href.includes('admin1.html')) renderAll();

/* -----------------------------
   Public Pages Dynamic Content
------------------------------ */
function renderPublicCards(storageKey, containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const list = JSON.parse(localStorage.getItem(storageKey)) || [];
  const items = limit ? list.slice(0, limit) : list;
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
      ${item.img ? `<img src="${item.img}" alt="${item.title}">` : ''}
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      ${item.video ? `<iframe width="100%" height="200" src="${item.video}" frameborder="0" allowfullscreen></iframe>` : ''}
      ${item.status ? `<p><strong>Status:</strong> ${item.status}</p>` : ''}
    `;
    container.appendChild(card);
  });
}

/* -----------------------------
   Load Public Content
------------------------------ */
if (document.getElementById('featuredIdeas')) renderPublicCards('techIdeas','featuredIdeas',3);
if (document.getElementById('latestProjects')) renderPublicCards('projects','latestProjects',3);
if (document.getElementById('latestBlogs')) renderPublicCards('blogs','latestBlogs',3);

if (document.getElementById('ideasContainer')) renderPublicCards('techIdeas','ideasContainer');
if (document.getElementById('projectsContainer')) renderPublicCards('projects','projectsContainer');
if (document.getElementById('blogsContainer')) renderPublicCards('blogs','blogsContainer');

/* -----------------------------
   Contact Form Alert
------------------------------ */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    alert('Thank you! Your message has been sent.');
    e.target.reset();
  });
}




// =====================
// SITE SETTINGS SCRIPT
// =====================
document.addEventListener("DOMContentLoaded", () => {
  // Grab elements
  const siteNameInput = document.getElementById("siteName");
  const adminEmailInput = document.getElementById("adminEmail");
  const themeSelect = document.getElementById("theme");
  const maintenanceCheckbox = document.getElementById("maintenance");
  const saveBtn = document.querySelector("#settings .btn");


 // Load settings from localStorage
  const loadSettings = () => {
    const settings = JSON.parse(localStorage.getItem("siteSettings")) || {};
    
    siteNameInput.value = settings.siteName || "Lucky Tech Hub";
    adminEmailInput.value = settings.adminEmail || "";
    themeSelect.value = settings.theme || "light";
    maintenanceCheckbox.checked = settings.maintenance || false;

    applyTheme(settings.theme || "light");
  };


  // Apply theme dynamically
  const applyTheme = (theme) => {
    if(theme === "dark") {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
  };

  // Validate email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Save settings
  window.saveSettings = () => {
    const siteName = siteNameInput.value.trim();
    const adminEmail = adminEmailInput.value.trim();
    const theme = themeSelect.value;
    const maintenance = maintenanceCheckbox.checked;
    
    
    
    

    // Basic validation
    if(!siteName){
      showNotification("Site Name cannot be empty", "error");
      return;
    }
    if(adminEmail && !isValidEmail(adminEmail)){
      showNotification("Please enter a valid email address", "error");
      return;
    }

    const settings = { siteName, adminEmail, theme, maintenance };
    localStorage.setItem("siteSettings", JSON.stringify(settings));

    // Apply theme instantly
    applyTheme(theme);

    showNotification("Settings saved successfully", "success");
  };

  // Notification system
  const showNotification = (message, type="info") => {
    let notif = document.createElement("div");
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);

    // Animate in/out
    setTimeout(() => notif.classList.add("show"), 50);
    setTimeout(() => notif.classList.remove("show"), 3000);
    setTimeout(() => notif.remove(), 3500);
  };

  // Initialize
  loadSettings();
});




