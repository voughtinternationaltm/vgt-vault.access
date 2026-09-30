const APP = {
  validCode: "VGT-FNZ-4798",
  currentView: "home",
  selectedDocument: null,
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
const welcomeText = document.getElementById("welcome-text");
const pageContent = document.getElementById("page-content");
const menuButton = document.getElementById("menu-button");
const logoutButton = document.getElementById("logout-button");
const sidebar = document.getElementById("sidebar");

const allNavigationButtons = () => [
  ...document.querySelectorAll("[data-view]"),
];

function showScreen(screen) {
  Object.values(screens).forEach((item) => item.classList.add("is-hidden"));
  screen.classList.remove("is-hidden");
}

function beginSecurity() {
  securityStatus.textContent = "";
  securityStatus.className = "security-status";
  securityInput.value = "";
  showScreen(screens.security);
  window.setTimeout(() => securityInput.focus(), 80);
}

function typeWelcome() {
  showScreen(screens.welcome);

  const target = "Welcome, Fonzi_";
  let index = 0;

  welcomeText.textContent = "";

  const typeTimer = window.setInterval(() => {
    welcomeText.textContent = target.slice(0, index + 1);
    index += 1;

    if (index >= target.length) {
      window.clearInterval(typeTimer);
      window.setTimeout(() => eraseWelcome(target), 5000);
    }
  }, 70);
}

function eraseWelcome(target) {
  let index = target.length;

  const eraseTimer = window.setInterval(() => {
    index -= 1;
    welcomeText.textContent = target.slice(0, index);

    if (index <= 0) {
      window.clearInterval(eraseTimer);
      window.setTimeout(() => {
        openMainScreen();
      }, 220);
    }
  }, 45);
}

function openMainScreen() {
  showScreen(screens.main);
  sidebar.classList.remove("is-open");
  document.body.classList.remove("sidebar-open");
  menuButton.setAttribute("aria-expanded", "false");
  renderView(APP.currentView);
}

function setActiveNavigation(view) {
  allNavigationButtons().forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });

  document.querySelectorAll(".topnav-link").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });

  document.querySelectorAll(".sidebar-link").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
}

function renderView(view) {
  APP.currentView = view;
  setActiveNavigation(view);

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
            ${documentCard("welcome", "Welcome, Fonzi")}
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
            Welcome, Fonzi
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

securityForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const code = securityInput.value.trim().toUpperCase();
  const isValid = code === APP.validCode;

  securityStatus.className = "security-status";

  if (!isValid) {
    securityStatus.textContent = "Error";
    securityStatus.classList.add("error");
    return;
  }

  securityStatus.textContent = "Authorized";
  securityStatus.classList.add("success");

  window.setTimeout(() => {
    typeWelcome();
  }, 900);
});

securityInput.addEventListener("input", () => {
  securityStatus.textContent = "";
  securityStatus.className = "security-status";
});

allNavigationButtons().forEach((button) => {
  button.addEventListener("click", () => {
    renderView(button.dataset.view);

    if (sidebar.classList.contains("is-open")) {
      toggleSidebar(false);
    }
  });
});

function toggleSidebar(force) {
  const shouldOpen = typeof force === "boolean" ? force : !sidebar.classList.contains("is-open");
  sidebar.classList.toggle("is-open", shouldOpen);
  document.body.classList.toggle("sidebar-open", shouldOpen);
  menuButton.setAttribute("aria-expanded", String(shouldOpen));
}

menuButton.addEventListener("click", () => {
  toggleSidebar();
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

window.setTimeout(() => {
  beginSecurity();
}, 1400);
