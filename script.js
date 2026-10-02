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

const SUPPORT_ADDRESS = "vought.international.tm@gmail.com";

const SESSION_KEY = "voughtVaultSession";
const PROGRESS_KEY_PREFIX = "voughtVaultProgress:";

const APP = {
  activeCode: null,
  portal: PORTALS["VGT-FNZ-4798"],
  currentView: "home",
  selectedDocument: null,
  recentlyOpened: [],
  supportView: "inbox",
  supportSent: [],
  supportReplies: [],
  supportSelectedSubject: null,
  supportRecipient: "",
  welcomeTypingTimer: null,
  welcomeEraseTimer: null,
  welcomeEraseDelay: null,
  bootExitTimer: null,
  missions: [],
  completedMissions: [],
  missionUnread: false,
  pendingReplies: [],
  pendingMissions: [],
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
const toastContainer = document.getElementById("toast-container");

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
  saveSession();
}

const SUPPORT_MESSAGES = {
  "First Contact": {
    body: `Hello,\n\nI’ve found the vault.\nI was instructed to reach out to you after familiarising myself with it, so I suppose this is where I’m meant to make first contact.\n\nI’ve had a look around and, so far, everything seems to be in order. I’m assuming there’s more to this than what’s immediately visible, so I’ll leave the rest for you to explain.\n\nLooking forward to hearing from you.\n\nFonzi\nEmployee ID: VGT-FNZ-4798`,
    reply: `Greetings, Fonzi\n\nThank you for your contact.\n\nYour first assignment has been issued.\n\nYou are hereby instructed to investigate an employee suspected of espionage: Subject: Shu.\n\nBegin by reviewing the Personnel Profile provided under DOCUMENT. Your objective is to identify a way to access Shu’s personal vault and locate the evidence stored within.\n\nThe evidence you are looking for is a secret note hidden somewhere inside the vault.\n\nProceed carefully. Not everything is where you expect it to be.\n\nGood luck, Fonzi.\n\n— Vault Administration`,
  },
  "Security Code Support": {
    body: `Hello,\n\nI’m currently unable to access the vault associated with Subject: Shu.\nI believe there is a security code required for access, but I have not yet been able to determine where it is located.\nCould you provide some guidance on where I should look?\n\nFonzi\nEmployee ID: VGT-FNZ-4798`,
    reply: `Hello Fonzi,\n\nThe security code follows a specific rule and uses a fixed format:\n\nVGT-ABC-1234\n\nThe pattern should be enough to narrow your search. The rest is for you to figure out.\n\nGood luck.\n— Vault Administration`,
  },
  "Open Downloaded File": {
    body: `Hello,\n\nI’ve downloaded a file from the vault, but it appears to be password-protected.\nCould you let me know what password is required to open it?\n\nThanks.\n\nFonzi\nEmployee ID: VGT-FNZ-4798`,
    reply: `Hello Fonzi,\n\nEncrypted documents downloaded from the vault are protected using the security code of the employee who owns the vault from which the document was downloaded.\n\nUse the corresponding employee’s security code to access the file.\n\nGood luck.\n— Vault Administration`,
  },
};

const SUPPORT_MESSAGE_ORDER = ["First Contact", "Security Code Support", "Open Downloaded File"];

function supportInboxItems() {
  return [...APP.supportReplies].sort((a, b) => b.createdAt - a.createdAt);
}

function supportInboxMarkup() {
  const replies = supportInboxItems();
  if (!replies.length) {
    return `<div class="support-empty">No reply yet. Send a message to start</div>`;
  }

  return `
    <div class="support-list">
      ${replies.map((item) => `
        <button class="support-list-item ${item.unread ? "is-unread" : ""}" type="button" data-support-reply="${item.id}">
          <span class="support-list-subject">${item.subject}</span>
          ${item.unread ? '<span class="support-unread-dot" aria-label="New reply"></span>' : ""}
        </button>
      `).join("")}
    </div>
  `;
}

function supportMessageMarkup(item) {
  return `
    <article class="support-message-card">
      <div class="support-message-meta">
        <span>To:</span>
        <strong>${item.to}</strong>
      </div>
      <div class="support-message-meta">
        <span>Subject:</span>
        <strong>${item.subject}</strong>
      </div>
      <div class="support-message-body">${item.body}</div>
    </article>
  `;
}

function supportReplyDetailMarkup(item) {
  return `
    <section class="support-reply-fullscreen fade-in">
      <div class="support-reply-head">
        <button class="support-back-button" type="button" data-support-action="inbox" aria-label="Back to inbox">←</button>
        <h2>REPLY</h2>
      </div>
      <div class="support-reply-panel">
        <div class="support-message-meta">
          <span>To:</span>
          <strong>${APP.activeCode}</strong>
        </div>
        <div class="support-message-meta">
          <span>Subject:</span>
          <strong>${item.subject}</strong>
        </div>
        <div class="support-message-body support-reply-body">${escapeHtml(item.body)}</div>
      </div>
    </section>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function supportComposeMarkup() {
  const selectedSubject = APP.supportSelectedSubject;
  const selected = selectedSubject ? SUPPORT_MESSAGES[selectedSubject] : null;

  return `
    <section class="support-compose fade-in">
      <div class="support-compose-head">
        <button class="support-back-button" type="button" data-support-action="inbox" aria-label="Back to inbox">←</button>
        <h2>SEND</h2>
      </div>
      <form id="support-form" class="support-form" novalidate>
        <div class="support-field support-field--to">
          <label for="support-to">To:</label>
          <input id="support-to" name="to" type="text" autocomplete="off" spellcheck="false" placeholder="" value="${APP.supportRecipient}" />
        </div>
        <div class="support-field support-field--subject">
          <span class="support-field-label">Subject:</span>
          <div class="support-selected-subject">${selectedSubject || ""}</div>
        </div>
        <div class="support-message-area">
          <div class="support-message-body-editor">${selected ? selected.body.replace(/\n/g, "<br>") : ""}</div>
        </div>
        <div class="support-compose-bottom">
          <div class="support-choice-list" role="listbox" aria-label="Choose message">
            ${SUPPORT_MESSAGE_ORDER.map((subject) => `
              <button
                class="support-choice ${selectedSubject === subject ? "is-selected" : ""}"
                type="button"
                data-support-choice="${subject}"
                role="option"
                aria-selected="${selectedSubject === subject}"
              >${subject}</button>
            `).join("")}
          </div>
          <div class="support-send-area">
            <div id="support-form-status" class="support-form-status" aria-live="polite"></div>
            <button class="support-send-button" type="submit">SEND</button>
          </div>
        </div>
      </form>
    </section>
  `;
}

function supportViewMarkup() {
  if (APP.supportView === "compose") return supportComposeMarkup();

  if (APP.supportView.startsWith("reply:")) {
    const id = APP.supportView.slice(6);
    const item = APP.supportReplies.find((reply) => reply.id === id);
    if (!item) {
      APP.supportView = "inbox";
      return supportInboxPageMarkup();
    }
    item.unread = false;
    return supportReplyDetailMarkup(item);
  }

  return supportInboxPageMarkup();
}

function supportInboxPageMarkup() {
  return `
    <section class="support-page fade-in">
      <div class="support-title-row">
        <h1 class="page-title">Inbox</h1>
        <button class="support-compose-button" type="button" data-support-action="compose" aria-label="Send a message">
          <span class="support-plus">+</span>
          <span class="support-compose-tooltip">Send a message</span>
        </button>
      </div>
      ${supportInboxMarkup()}
    </section>
  `;
}

function bindSupport() {
  document.querySelectorAll("[data-support-action]").forEach((button) => {
    button.addEventListener("click", () => {
      APP.supportView = button.dataset.supportAction;
      if (APP.supportView === "compose" && !APP.supportSelectedSubject) {
        APP.supportSelectedSubject = null;
      }
      renderView("support");
    });
  });

  document.querySelectorAll("[data-support-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      APP.supportSelectedSubject = button.dataset.supportChoice;
      renderView("support");
      window.setTimeout(() => document.getElementById("support-to")?.focus(), 0);
    });
  });

  document.querySelectorAll("[data-support-reply]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = APP.supportReplies.find((reply) => reply.id === button.dataset.supportReply);
      if (!item) return;
      item.unread = false;
      APP.supportView = `reply:${item.id}`;
      renderView("support");
    });
  });

  const form = document.getElementById("support-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const to = form.elements.to.value.trim();
    const subject = APP.supportSelectedSubject;
    const message = subject ? SUPPORT_MESSAGES[subject] : null;
    const status = document.getElementById("support-form-status");

    if (!to || to.toLowerCase() !== SUPPORT_ADDRESS) {
      status.textContent = "Invalid address!";
      status.className = "support-form-status is-error";
      return;
    }

    if (!message) {
      status.textContent = "Choose a message first.";
      status.className = "support-form-status is-error";
      return;
    }

    const sent = {
      id: `sent-${Date.now()}`,
      to,
      subject,
      body: message.body,
      createdAt: Date.now(),
    };
    APP.supportSent.unshift(sent);
    APP.supportRecipient = SUPPORT_ADDRESS;
    status.textContent = "Sent!";
    status.className = "support-form-status is-success";
    showToast("Message sent", "Your message has been sent to Vault Administration.");

    if (subject === "First Contact" && APP.portal.name === "Fonzi") {
      completeMission("mission-welcome");
    }

    // The reply arrives after 10 seconds. The due time is persisted for this browser tab.
    scheduleReply(sent, Date.now() + 10000);
  });
}

function scheduleReply(sent, dueAt) {
  const existing = APP.pendingReplies.find((item) => item.sentId === sent.id);
  if (!existing) {
    APP.pendingReplies.push({ sentId: sent.id, subject: sent.subject, dueAt });
    saveSession();
  }
  const delay = Math.max(0, dueAt - Date.now());
  window.setTimeout(() => {
    APP.pendingReplies = APP.pendingReplies.filter((item) => item.sentId !== sent.id);
    simulateReply(sent);
  }, delay);
}

function resumePendingReplies() {
  if (!APP.pendingReplies.length) return;
  const pending = [...APP.pendingReplies];
  pending.forEach((item) => {
    const sent = APP.supportSent.find((message) => message.id === item.sentId);
    if (sent) scheduleReply(sent, item.dueAt);
  });
}

function simulateReply(sent) {
  const message = SUPPORT_MESSAGES[sent.subject];
  if (!message) return;

  const reply = {
    id: `reply-${Date.now()}`,
    subject: `Re:${sent.subject}`,
    body: message.reply,
    createdAt: Date.now(),
    unread: true,
  };
  APP.supportReplies.unshift(reply);
  APP.supportView = "inbox";

  saveSession();
  if (APP.currentView === "support") renderView("support");
  showToast("New reply", reply.subject, () => openSupportReplyFromNotification(reply.id));

  if (sent.subject === "First Contact" && APP.portal.name === "Fonzi") {
    scheduleMission({
      id: "mission-first-contact-reply",
      title: "New Mission",
      body: "Mission details will be added here.",
    }, Date.now() + 5000);
  }
}

function showToast(title, message, action = null) {
  if (!toastContainer) return;
  const toast = document.createElement("button");
  toast.type = "button";
  toast.className = "toast-notification";
  toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  toast.addEventListener("click", () => {
    toast.remove();
    if (typeof action === "function") action();
  });
  toastContainer.appendChild(toast);
  window.setTimeout(() => toast.remove(), 6500);
}

function openSupportReplyFromNotification(replyId) {
  const reply = APP.supportReplies.find((item) => item.id === replyId);
  if (!reply) return;
  reply.unread = false;
  APP.currentView = "support";
  APP.supportView = `reply:${replyId}`;
  toggleSidebar(false);
  renderView("support");
}

function notifyMission(title = "New mission", message = "A new mission has been issued.", action = null) {
  showToast(title, message, action);
}

function missionPreviewMarkup(mission) {
  return `
    <div class="document-preview mission-preview">
      <div class="mission-preview-label">MISSION</div>
      <div class="mission-preview-title">${escapeHtml(mission.title)}</div>
      <div class="mission-preview-line"></div>
    </div>
  `;
}

function missionMarkup() {
  if (!APP.missions.length) {
    return `<div class="mission-empty">No mission has been issued.</div>`;
  }

  const missions = [...APP.missions].sort((a, b) => b.createdAt - a.createdAt);

  return `
    <div class="mission-list">
      ${missions.map((mission) => `
        <button class="mission-card ${mission.unread ? "is-unread" : ""}" type="button" data-mission-id="${mission.id}">
          ${missionPreviewMarkup(mission)}
          <span class="document-title">${escapeHtml(mission.title)}</span>
          ${mission.unread ? '<span class="mission-unread-dot" aria-label="New mission"></span>' : ""}
        </button>
      `).join("")}
    </div>
  `;
}

function completedMissionMarkup() {
  if (!APP.completedMissions.length) {
    return `<div class="mission-empty">No completed mission yet.</div>`;
  }

  const missions = [...APP.completedMissions].sort((a, b) => (b.completedAt || b.createdAt) - (a.completedAt || a.createdAt));

  return `
    <div class="mission-list completed-mission-list">
      ${missions.map((mission) => `
        <button class="mission-card mission-card--completed" type="button" data-completed-mission-id="${mission.id}">
          ${missionPreviewMarkup(mission)}
          <span class="document-title">${escapeHtml(mission.title)}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function missionDetailMarkup(mission, completed = false) {
  return `
    <section class="mission-detail fade-in">
      <div class="mission-detail-head">
        <button class="support-back-button" type="button" data-mission-action="back" aria-label="Back to missions">←</button>
        <h2>${escapeHtml(mission.title)}</h2>
      </div>
      <div class="mission-detail-status">${completed ? "COMPLETED" : "ACTIVE"}</div>
      <div class="mission-detail-body">${escapeHtml(mission.body)}</div>
    </section>
  `;
}

function updateMissionIndicators() {
  const hasUnread = APP.missions.some((mission) => mission.unread);
  APP.missionUnread = hasUnread;
  document.querySelectorAll(".mission-notification-dot").forEach((dot) => {
    dot.classList.toggle("is-visible", hasUnread);
  });
}

function addMission({ id, title, body }) {
  if (APP.missions.some((mission) => mission.id === id) || APP.completedMissions.some((mission) => mission.id === id)) return false;
  APP.missions.unshift({ id, title, body, unread: true, createdAt: Date.now() });
  APP.missionUnread = true;
  updateMissionIndicators();
  saveSession();
  return true;
}

function completeMission(id, { notify = true } = {}) {
  if (APP.completedMissions.some((mission) => mission.id === id)) return false;

  let mission = APP.missions.find((item) => item.id === id);
  if (mission) {
    APP.missions = APP.missions.filter((item) => item.id !== id);
  } else {
    const pending = APP.pendingMissions.find((item) => item.id === id);
    if (pending) {
      mission = pending;
      APP.pendingMissions = APP.pendingMissions.filter((item) => item.id !== id);
    }
  }

  if (!mission) return false;

  const completed = {
    ...mission,
    unread: false,
    completedAt: Date.now(),
  };
  APP.completedMissions.unshift(completed);
  APP.missionUnread = APP.missions.some((item) => item.unread);
  updateMissionIndicators();
  saveSession();

  if (notify) {
    showToast("Mission completed", `${completed.title} has been completed.`, () => openCompletedMissionFromNotification(completed.id));
  }

  if (APP.currentView === "mission") renderView("mission");
  return true;
}

function scheduleMission(mission, dueAt = Date.now() + 5000) {
  if (APP.missions.some((item) => item.id === mission.id)) return;
  const existing = APP.pendingMissions.find((item) => item.id === mission.id);
  if (!existing) {
    APP.pendingMissions.push({ ...mission, dueAt });
    saveSession();
  }
  const delay = Math.max(0, dueAt - Date.now());
  window.setTimeout(() => {
    APP.pendingMissions = APP.pendingMissions.filter((item) => item.id !== mission.id);
    const added = addMission(mission);
    if (added) {
      showToast("New mission", "A new mission has been issued.", () => openMissionFromNotification(mission.id));
    }
  }, delay);
}

function resumePendingMissions() {
  if (!APP.pendingMissions.length) return;
  [...APP.pendingMissions].forEach((mission) => scheduleMission(mission, mission.dueAt));
}

function openMissionFromNotification(id) {
  const mission = APP.missions.find((item) => item.id === id);
  if (!mission) return;
  mission.unread = false;
  APP.missionUnread = APP.missions.some((item) => item.unread);
  updateMissionIndicators();
  APP.currentView = "mission";
  toggleSidebar(false);
  renderView("mission", id);
  saveSession();
}

function openCompletedMissionFromNotification(id) {
  const mission = APP.completedMissions.find((item) => item.id === id);
  if (!mission) return;
  APP.currentView = "mission";
  toggleSidebar(false);
  renderView("mission", id);
  saveSession();
}

function bindMissions() {
  document.querySelectorAll("[data-mission-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const mission = APP.missions.find((item) => item.id === button.dataset.missionId);
      if (!mission) return;
      mission.unread = false;
      APP.missionUnread = APP.missions.some((item) => item.unread);
      updateMissionIndicators();
      renderView("mission", mission.id);
      saveSession();
    });
  });

  document.querySelectorAll("[data-completed-mission-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const mission = APP.completedMissions.find((item) => item.id === button.dataset.completedMissionId);
      if (!mission) return;
      renderView("mission", mission.id);
      saveSession();
    });
  });

  document.querySelectorAll('[data-mission-action="back"]').forEach((button) => {
    button.addEventListener("click", () => {
      renderView("mission");
    });
  });
}

function progressStorageKey(code = APP.activeCode) {
  return `${PROGRESS_KEY_PREFIX}${code || ""}`;
}

function buildState() {
  return {
    activeCode: APP.activeCode,
    currentView: APP.currentView,
    selectedDocument: APP.selectedDocument,
    recentlyOpened: APP.recentlyOpened,
    supportSent: APP.supportSent,
    supportReplies: APP.supportReplies,
    supportRecipient: APP.supportRecipient,
    supportSelectedSubject: APP.supportSelectedSubject,
    missions: APP.missions,
    completedMissions: APP.completedMissions,
    missionUnread: APP.missionUnread,
    pendingReplies: APP.pendingReplies,
    pendingMissions: APP.pendingMissions,
  };
}

function applyState(state, { restoreView = true } = {}) {
  APP.activeCode = state.activeCode;
  APP.portal = PORTALS[state.activeCode];
  APP.currentView = restoreView ? (state.currentView || "home") : "home";
  APP.selectedDocument = state.selectedDocument || null;
  APP.recentlyOpened = Array.isArray(state.recentlyOpened) ? state.recentlyOpened : [];
  APP.supportSent = Array.isArray(state.supportSent) ? state.supportSent : [];
  APP.supportReplies = Array.isArray(state.supportReplies) ? state.supportReplies : [];
  APP.supportRecipient = state.supportRecipient || "";
  APP.supportSelectedSubject = state.supportSelectedSubject || null;
  APP.missions = Array.isArray(state.missions) ? state.missions : [];
  APP.missionUnread = Boolean(state.missionUnread);
  APP.pendingReplies = Array.isArray(state.pendingReplies) ? state.pendingReplies : [];
  APP.pendingMissions = Array.isArray(state.pendingMissions) ? state.pendingMissions : [];
  APP.supportView = "inbox";
}

function saveSession() {
  if (!APP.activeCode) return;
  const state = buildState();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  localStorage.setItem(progressStorageKey(), JSON.stringify(state));
}

function loadProgress(code) {
  try {
    const raw = localStorage.getItem(progressStorageKey(code));
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!PORTALS[state.activeCode]) return null;
    return state;
  } catch (error) {
    return null;
  }
}

function restoreSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const state = JSON.parse(raw);
    if (!PORTALS[state.activeCode]) return false;
    const persisted = loadProgress(state.activeCode) || state;
    applyState(persisted);
    return true;
  } catch (error) {
    sessionStorage.removeItem(SESSION_KEY);
    return false;
  }
}

function renderView(view, missionId = null) {
  APP.currentView = view;
  setActiveNavigation(view);
  updateMissionIndicators();

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

  if (view === "support") {
    pageContent.innerHTML = supportViewMarkup();
    bindSupport();
    return;
  }

  if (view === "mission") {
    const selectedMission = missionId ? APP.missions.find((mission) => mission.id === missionId) : null;
    const selectedCompletedMission = missionId ? APP.completedMissions.find((mission) => mission.id === missionId) : null;

    if (selectedMission) {
      selectedMission.unread = false;
      APP.missionUnread = APP.missions.some((mission) => mission.unread);
      pageContent.innerHTML = missionDetailMarkup(selectedMission, false);
    } else if (selectedCompletedMission) {
      pageContent.innerHTML = missionDetailMarkup(selectedCompletedMission, true);
    } else {
      pageContent.innerHTML = `
        <section class="mission-page fade-in">
          <h1 class="page-title">Mission</h1>
          <section class="mission-section" aria-label="Active missions">
            ${missionMarkup()}
          </section>
          <section class="documents-section completed-mission-section" aria-label="Completed missions">
            <h2 class="page-title">Completed Mission</h2>
            ${completedMissionMarkup()}
          </section>
        </section>
      `;
    }
    bindMissions();
    saveSession();
    return;
  }

  pageContent.innerHTML = `
    <section class="mission-page fade-in">
      <h1 class="page-title">Mission</h1>
      <section class="mission-section" aria-label="Active missions">
        ${missionMarkup()}
      </section>
      <section class="documents-section completed-mission-section" aria-label="Completed missions">
        <h2 class="page-title">Completed Mission</h2>
        ${completedMissionMarkup()}
      </section>
    </section>
  `;
  bindMissions();
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

  if (documentId === "welcome" && APP.portal.name === "Fonzi") {
    scheduleMission({
      id: "mission-welcome",
      title: "New Mission",
      body: "Mission details will be added here.",
    }, Date.now() + 5000);
  }

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

  const persisted = loadProgress(code);
  if (persisted) {
    applyState(persisted, { restoreView: false });
  } else {
    APP.activeCode = code;
    APP.portal = portal;
    APP.currentView = "home";
    APP.selectedDocument = null;
    APP.recentlyOpened = [];
    APP.supportView = "inbox";
    APP.supportSent = [];
    APP.supportReplies = [];
    APP.supportSelectedSubject = null;
    APP.supportRecipient = "";
    APP.missions = [];
    APP.completedMissions = [];
    APP.missionUnread = false;
    APP.pendingReplies = [];
    APP.pendingMissions = [];
  }
  saveSession();

  securityStatus.textContent = "Authorized";
  securityStatus.classList.add("success");

  window.setTimeout(typeWelcome, 1100);
  resumePendingReplies();
  resumePendingMissions();
});

securityInput.addEventListener("input", () => {
  securityStatus.textContent = "";
  securityStatus.className = "security-status";
});

allNavigationButtons().forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "support") APP.supportView = "inbox";
    if (button.dataset.view === "mission") {
      APP.missionUnread = false;
      APP.missions.forEach((mission) => { mission.unread = false; });
    }
    renderView(button.dataset.view);
    toggleSidebar(false);
    saveSession();
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
  sessionStorage.removeItem(SESSION_KEY);
  APP.activeCode = null;
  APP.currentView = "home";
  APP.pendingReplies = [];
  beginSecurity();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (documentModal.classList.contains("is-open")) {
      closePersonnelProfile();
      return;
    }
    if (sidebar.classList.contains("is-open")) {
      toggleSidebar(false);
      return;
    }
    if (APP.currentView === "support" && APP.supportView !== "inbox") {
      APP.supportView = "inbox";
      renderView("support");
    }
  }
});

if (restoreSession()) {
  showScreen(screens.main);
  renderView(APP.currentView);
  updateMissionIndicators();
  resumePendingReplies();
  resumePendingMissions();
} else {
  renderView(APP.currentView);
  startBootSequence();
}
