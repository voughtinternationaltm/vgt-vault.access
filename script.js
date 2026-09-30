const PORTALS = {
  "VGT-FNZ-4798": {
    name: "Fonzi",
    welcome: "Welcome, Fonzi",
  },
  "VGT-SHN-2108": {
    name: "Shu",
    welcome: "Welcome, Shu",
  },
};

const APP = {
  activeCode: null,
  portal: PORTALS["VGT-FNZ-4798"],
  currentView: "home",
  selectedDocument: null,
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

const allNavigationButtons = () => [
  ...document.querySelectorAll("[data-view]"),
];

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

    window.setTimeout(() => {
      beginSecurity();
    }, 1250);
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

  APP.welcomeTypingTimer = window.setInterval(() => {
    welcomeCopy.textContent = target.slice(0, index + 1);
    index += 1;

    if (index >= target.length) {
      window.clearInterval(APP.welcomeTypingTimer);

      APP.welcomeEraseDelay = window.setTimeout(() => {
        eraseWelcome(target);
      }, 5000);
    }
  }, 92);
}

function eraseWelcome(target) {
  window.clearInterval(APP.welcomeEraseTimer);
  let index = target.length;

  APP.welcomeEraseTimer = window.setInterval(() => {
    index -= 1;
    welcomeCopy.textContent = target.slice(0, index);

    if (index <= 0) {
      window.clearInterval(APP.welcomeEraseTimer);
      welcomeCursor.style.visibility = "hidden";

      window.setTimeout(() => {
        openMainScreen();
      }, 450);
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

function renderView(view) {
  APP.currentView = view;
  setActiveNavigation(view);

  const portalName = APP.portal.name;

  if (view === "home") {
    pageContent.innerHTML = `
      <section class="home-page fade-in">
        <h1 class="page-title">Recently</h1>

        <section class="recently" aria-label="Recently opened documents">
          <div class="empty-state">Open a file to start</div>
        </section>

        <section class="documents-section" aria-label="Documents">
          <h2 class="page-title">Document</h2>

          <div class="documents-grid">
            ${documentCard("welcome", `Welcome, ${portalName}`)}
            ${documentCard("subject", "Subject's Personnel Profile")}
            ${documentCard("personnel", "My Personnel Profile")}
          </div>
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

        <div class="document-view">
          <div class="document-preview-large" aria-hidden="true"></div>
          <button class="document-file-title" type="button" data-open-document="welcome">
            Welcome, ${portalName}
          </button>
        </div>
      </section>
    `;

    const openButton = pageContent.querySelector("[data-open-document='welcome']");

    openButton.addEventListener("click", () => {
      APP.selectedDocument = "welcome";
      openButton.classList.add("is-selected");
    });

    return;
  }

  pageContent.innerHTML = `
    <section class="mission-page fade-in">
      <h1 class="page-title">Mission</h1>
    </section>
  `;
}

function documentCard(id, title) {
  const selected = APP.selectedDocument === id ? "is-selected" : "";

  return `
    <button class="document-card ${selected}" type="button" data-document-id="${id}">
      <div class="document-preview" aria-hidden="true"></div>
      <span class="document-title">${title}</span>
    </button>
  `;
}

function bindDocumentCards() {
  document.querySelectorAll("[data-document-id]").forEach((card) => {
    card.addEventListener("click", () => {
      APP.selectedDocument = card.dataset.documentId;

      document.querySelectorAll(".document-card").forEach((item) => {
        item.classList.toggle("is-selected", item === card);
      });
    });
  });
}

function toggleSidebar(force) {
  const shouldOpen = typeof force === "boolean"
    ? force
    : !sidebar.classList.contains("is-open");

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
  const isValid = Boolean(portal);

  securityStatus.className = "security-status";

  if (!isValid) {
    securityStatus.textContent = "Error";
    securityStatus.classList.add("error");
    return;
  }

  APP.activeCode = code;
  APP.portal = portal;
  APP.selectedDocument = null;

  securityStatus.textContent = "Authorized";
  securityStatus.classList.add("success");

  window.setTimeout(() => {
    typeWelcome();
  }, 1100);
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

menuButton.addEventListener("click", () => {
  toggleSidebar();
});

sidebarBackdrop.addEventListener("click", () => {
  toggleSidebar(false);
});

logoutButton.addEventListener("click", () => {
  toggleSidebar(false);
  beginSecurity();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
    toggleSidebar(false);
  }
});

renderView(APP.currentView);
startBootSequence();
