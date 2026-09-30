const SECURITY_CODE = "VGT-FNZ-4798";
const screens = {
  boot: document.getElementById("boot-screen"),
  security: document.getElementById("security-screen"),
  welcome: document.getElementById("welcome-screen"),
  dashboard: document.getElementById("dashboard")
};
const securityForm = document.getElementById("security-form");
const securityInput = document.getElementById("security-code");
const securityStatus = document.getElementById("security-status");
const welcomeCopy = document.getElementById("welcome-copy");
const menuButton = document.getElementById("menu-button");
const dashboard = document.getElementById("dashboard");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const brandButton = document.getElementById("brand-button");
const logoutButton = document.getElementById("logout-button");
const selectedDocumentTitle = document.getElementById("selected-document-title");

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => {
    element.classList.toggle("is-hidden", key !== name);
  });
}

function openSecurity() {
  closeDrawer();
  securityInput.value = "";
  securityStatus.textContent = "";
  securityStatus.className = "security-status";
  showScreen("security");
  window.setTimeout(() => securityInput.focus(), 50);
}

function openDashboard() {
  showScreen("dashboard");
  dashboard.classList.remove("drawer-open");
}

function typeWelcome() {
  welcomeCopy.innerHTML = "";
  const text = "Welcome, Fonzi";
  let index = 0;
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  welcomeCopy.appendChild(cursor);

  const timer = window.setInterval(() => {
    if (index < text.length) {
      welcomeCopy.insertBefore(document.createTextNode(text[index]), cursor);
      index += 1;
    } else {
      window.clearInterval(timer);
      window.setTimeout(() => {
        showScreen("dashboard");
        setActiveSection("home");
      }, 5000);
    }
  }, 85);
}

function validateSecurityCode() {
  const value = securityInput.value.trim().toUpperCase();
  securityStatus.className = "security-status";

  if (value !== SECURITY_CODE) {
    securityStatus.textContent = "Error";
    securityStatus.classList.add("error");
    securityInput.select();
    return;
  }

  securityStatus.textContent = "Authorized";
  securityStatus.classList.add("success");
  window.setTimeout(() => {
    showScreen("welcome");
    typeWelcome();
  }, 900);
}

function setActiveSection(section) {
  document.querySelectorAll("[data-section]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.section === section);
  });
  document.querySelectorAll(".content-section").forEach((sectionElement) => {
    sectionElement.classList.toggle("is-visible", sectionElement.id === `section-${section}`);
  });
}

function setDocument(title) {
  selectedDocumentTitle.textContent = title;
  selectedDocumentTitle.classList.add("is-selected");
  setActiveSection("document");
}

function toggleDrawer(force) {
  const shouldOpen = typeof force === "boolean" ? force : !dashboard.classList.contains("drawer-open");
  dashboard.classList.toggle("drawer-open", shouldOpen);
  menuButton.setAttribute("aria-expanded", String(shouldOpen));
}

function closeDrawer() {
  dashboard.classList.remove("drawer-open");
  menuButton.setAttribute("aria-expanded", "false");
}

securityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  validateSecurityCode();
});

menuButton.addEventListener("click", () => toggleDrawer());
drawerBackdrop.addEventListener("click", closeDrawer);
brandButton.addEventListener("click", () => {
  closeDrawer();
  setActiveSection("home");
});
logoutButton.addEventListener("click", openSecurity);

document.querySelectorAll("[data-section]").forEach((button) => {
  button.addEventListener("click", () => {
    setActiveSection(button.dataset.section);
    closeDrawer();
  });
});

document.querySelectorAll("[data-document]").forEach((button) => {
  button.addEventListener("click", () => setDocument(button.dataset.document));
});

window.setTimeout(() => {
  screens.boot.classList.add("is-hidden");
  screens.security.classList.remove("is-hidden");
  securityInput.focus();
}, 2600);
