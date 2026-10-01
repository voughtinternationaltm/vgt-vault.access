const PORTALS = {
  "VGT-FNZ-4798": {
    name: "Fonzi",
    welcome: "Welcome, Fonzi",
    profileLabel: "My Personnel Profile",
  },
  "VGT-SHN-2108": {
    name: "Shu",
    welcome: "Welcome, Shu",
    profileLabel: "Subject's Personnel Profile",
  },
};

const APP = {
  activeCode: null,
  portal: PORTALS["VGT-FNZ-4798"],
  currentView: "home",
  selectedDocument: null,
  recentlyOpened: [],
  welcomeTypingTimer: null,
  welcomeEraseTimer: null,
  welcomeEraseDelay: null,
  bootExitTimer: null,
};

const screens = {
  boot: document.getElementById("boot-screen"),
  security: document.getElementById("security-screen"),
  welcome: document.getElementById("welcome-screen"),
  main: document.getElementById("main-screen"),
};

const securityForm = document.getElementById("security-form");
const securityInput = document.getElementById("security-code");
const securityStatus = document.getElementById("security-status");
const welcomeCopy = document.getElementById("welcome-copy");
const welcomeCursor = document.getElementById("welcome-cursor");
const pageContent = document.getElementById("page-content");
const menuButton = document.getElementById("menu-button");
const logoutButton = document.getElementById("logout-button");
const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const documentModal = document.getElementById("document-modal");
const documentClose = document.getElementById("document-close");

const allNavigationButtons = () => [...document.querySelectorAll("[data-view]")];

function showScreen(screen) {
  Object.values(screens).forEach((item) => item.classList.add("is-hidden"));
  screen.classList.remove("is-hidden");
}

function beginSecurity() {
  clearWelcomeTimers();
  clearTimeout(APP.bootExitTimer);
  screens.boot.classList.remove("is-leaving");
  securityStatus.textContent = "";
  securityStatus.className = "security-status";
  securityInput.value = "";
  showScreen(screens.security);
  window.setTimeout(() => securityInput.focus(), 100);
}

function startBootSequence() {
  clearTimeout(APP.bootExitTimer);
  APP.bootExitTimer = window.setTimeout(() => {
    screens.boot.classList.add("is-leaving");
    window.setTimeout(beginSecurity, 1250);
  }, 4600);
}

function clearWelcomeTimers() {
  window.clearInterval(APP.welcomeTypingTimer);
  window.clearInterval(APP.welcomeEraseTimer);
  window.clearTimeout(APP.welcomeEraseDelay);
}

function typeWelcome() {
  clearWelcomeTimers();
  showScreen(screens.welcome);

  const target = APP.portal.welcome;
  let index = 0;
  welcomeCopy.textContent = "";
  welcomeCursor.style.visibility = "visible";
  welcomeCursor.classList.add("is-blinking");

  APP.welcomeTypingTimer = window.setInterval(() => {
    welcomeCopy.textContent = target.slice(0, index + 1);
    index += 1;

    if (index >= target.length) {
      window.clearInterval(APP.welcomeTypingTimer);
      APP.welcomeEraseDelay = window.setTimeout(() => eraseWelcome(target), 5000);
    }
  }, 92);
}

function eraseWelcome(target) {
  window.clearInterval(APP.welcomeEraseTimer);
  welcomeCursor.classList.remove("is-blinking");
  let index = target.length;

  APP.welcomeEraseTimer = window.setInterval(() => {
    index -= 1;
    welcomeCopy.textContent = target.slice(0, index);

    if (index <= 0) {
      window.clearInterval(APP.welcomeEraseTimer);
      welcomeCursor.style.visibility = "hidden";
      window.setTimeout(openMainScreen, 450);
    }
  }, 120);
}

function openMainScreen() {
  showScreen(screens.main);
  toggleSidebar(false);
  renderView(APP.currentView);
}

function setActiveNavigation(view) {
  document.querySelectorAll(".topnav-link, .sidebar-link").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
}

function profileId() {
  return APP.portal.name === "Fonzi" ? "personnel" : "subject";
}

function profileTitle() {
  return APP.portal.profileLabel;
}

function previewMarkup(id, variant = "card") {
  if (id === "personnel" || id === "subject") {
    return `
      <div class="document-preview document-preview--pdf ${variant === "large" ? "document-preview--large" : ""}">
        <img src="assets/personnel-profile-preview.png" alt="First page preview of ${profileTitle()}" loading="lazy" />
      </div>
    `;
  }

  if (id === "welcome") {
    return `
      <div class="document-preview document-preview--pdf document-preview--welcome-note ${variant === "large" ? "document-preview--large" : ""}">
        <img src="assets/welcome-note-preview.png" alt="First page preview of Welcome, ${APP.portal.name}" loading="lazy" />
      </div>
    `;
  }

  return `
    <div class="document-preview document-preview--welcome ${variant === "large" ? "document-preview--large" : ""}">
      <div class="welcome-preview-copy">${APP.portal.welcome}<span>_</span></div>
      <div class="welcome-preview-line"></div>
    </div>
  `;
}

function documentCard(id, title, enabled = true) {
  const selected = APP.selectedDocument === id ? "is-selected" : "";
  const disabled = enabled ? "" : "is-disabled";
  const tag = enabled ? "button" : "div";
  const attrs = enabled
    ? `type="button" data-document-id="${id}"`
    : `aria-disabled="true"`;

  return `
    <${tag} class="document-card ${selected} ${disabled}" ${attrs}>
      ${previewMarkup(id)}
      <span class="document-title">${title}</span>
    </${tag}>
  `;
}

function renderRecently() {
  if (!APP.recentlyOpened.length) {
    return `<div class="empty-state">Open a file to start</div>`;
  }

  return `
    <div class="recently-grid">
      ${APP.recentlyOpened.map((item) => `
        <button class="recently-card" type="button" data-document-id="${item.id}">
          ${previewMarkup(item.id)}
          <span class="document-title">${item.title}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function documentsMarkup() {
  const profile = profileId();
  return `
    <div class="documents-grid">
      ${documentCard("welcome", `Welcome, ${APP.portal.name}`)}
      ${documentCard(profile, profileTitle())}
    </div>
  `;
}

function bindDocumentCards() {
  document.querySelectorAll("[data-document-id]").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.documentId;
      APP.selectedDocument = id;

      document.querySelectorAll(".document-card, .recently-card").forEach((item) => {
        item.classList.toggle("is-selected", item === card);
      });

      if (id === "welcome" || id === "personnel" || id === "subject") {
        openDocument(id);
      } else {
        recordRecentlyOpened(id);
        renderView(APP.currentView);
      }
    });
  });
}

function recordRecentlyOpened(id) {
  const title = id === "welcome" ? `Welcome, ${APP.portal.name}` : profileTitle();
  APP.recentlyOpened = [
    { id, title },
    ...APP.recentlyOpened.filter((item) => item.id !== id),
  ].slice(0, 4);
}

function renderView(view) {
  APP.currentView = view;
  setActiveNavigation(view);

  const profile = profileId();

  if (view === "home") {
    pageContent.innerHTML = `
      <section class="home-page fade-in">
        <h1 class="page-title">Recently</h1>
        <section class="recently" aria-label="Recently opened documents">
          ${renderRecently()}
        </section>

        <section class="documents-section" aria-label="Documents">
          <h2 class="page-title">Document</h2>
          ${documentsMarkup()}
        </section>
      </section>
    `;
    bindDocumentCards();
    return;
  }

  if (view === "document") {
    pageContent.innerHTML = `
      <section class="document-page fade-in">
        <h1 class="page-title">Document</h1>
        <div class="documents-grid documents-grid--document-page">
          ${documentCard("welcome", `Welcome, ${APP.portal.name}`)}
          ${documentCard(profile, profileTitle())}
        </div>
      </section>
    `;
    bindDocumentCards();
    return;
  }

  pageContent.innerHTML = `
    <section class="mission-page fade-in">
      <h1 class="page-title">Mission</h1>
      <div class="mission-document-area">
        ${documentsMarkup()}
      </div>
    </section>
  `;
  bindDocumentCards();
}

function openDocument(documentId) {
  let title = "";
  let source = "";
  let downloadName = "";
  let downloadHref = "";

  if (documentId === "welcome") {
    title = `Welcome, ${APP.portal.name}`;
    source = "welcome-note.pdf#page=1&zoom=page-fit";
    downloadName = `Welcome, ${APP.portal.name}.pdf`;
    downloadHref = "welcome-note.pdf";
  } else if (documentId === profileId()) {
    title = profileTitle();
    source = "personnel-profile.pdf#page=1&zoom=page-fit";
    downloadName = "Personnel Profile.pdf";
    downloadHref = "personnel-profile-download.pdf";
  } else {
    return;
  }

  recordRecentlyOpened(documentId);

  document.getElementById("document-modal-title").textContent = title;
  document.getElementById("document-frame").title = title;
  document.getElementById("document-frame").src = source;

  const download = document.getElementById("document-download");
  download.href = downloadHref;
  download.download = downloadName;

  documentModal.classList.add("is-open");
  documentModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("document-modal-open");
  window.setTimeout(() => documentClose.focus(), 80);
}

function closePersonnelProfile() {
  documentModal.classList.remove("is-open");
  documentModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("document-modal-open");
  renderView(APP.currentView);
}

function toggleSidebar(force) {
  const shouldOpen = typeof force === "boolean" ? force : !sidebar.classList.contains("is-open");
  sidebar.classList.toggle("is-open", shouldOpen);
  sidebarBackdrop.classList.toggle("is-visible", shouldOpen);
  document.body.classList.toggle("sidebar-open", shouldOpen);
  sidebar.setAttribute("aria-hidden", String(!shouldOpen));
  menuButton.setAttribute("aria-expanded", String(shouldOpen));
  menuButton.setAttribute("aria-label", shouldOpen ? "Close menu" : "Open menu");
}

securityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const code = securityInput.value.trim().toUpperCase();
  const portal = PORTALS[code];

  securityStatus.className = "security-status";

  if (!portal) {
    securityStatus.textContent = "Error";
    securityStatus.classList.add("error");
    return;
  }

  APP.activeCode = code;
  APP.portal = portal;
  APP.selectedDocument = null;
  APP.recentlyOpened = [];

  securityStatus.textContent = "Authorized";
  securityStatus.classList.add("success");

  window.setTimeout(typeWelcome, 1100);
});

securityInput.addEventListener("input", () => {
  securityStatus.textContent = "";
  securityStatus.className = "security-status";
});

allNavigationButtons().forEach((button) => {
  button.addEventListener("click", () => {
    renderView(button.dataset.view);
    toggleSidebar(false);
  });
});

menuButton.addEventListener("click", () => toggleSidebar());
sidebarBackdrop.addEventListener("click", () => toggleSidebar(false));
documentClose.addEventListener("click", closePersonnelProfile);
documentModal.querySelectorAll("[data-close-document]").forEach((element) => {
  element.addEventListener("click", closePersonnelProfile);
});

logoutButton.addEventListener("click", () => {
  toggleSidebar(false);
  beginSecurity();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (documentModal.classList.contains("is-open")) {
      closePersonnelProfile();
      return;
    }
    if (sidebar.classList.contains("is-open")) toggleSidebar(false);
  }
});

renderView(APP.currentView);
startBootSequence();
