// ─── Element references ────────────────────────────────────────────────────
const form               = document.getElementById("form");
const input              = document.getElementById("scribd_link");
const inputContainer     = document.getElementById("inputContainer");
const clearBtn           = document.getElementById("clearBtn");
const pasteBtn           = document.getElementById("pasteBtn");
const submitBtn          = document.getElementById("submit");
const errorBanner        = document.getElementById("errorBanner");
const errorMessage       = document.getElementById("errorMessage");

const result             = document.getElementById("result");
const output             = document.getElementById("output");
const outputLink         = document.getElementById("outputLink");
const copyButton         = document.getElementById("copyButton");
const copyButtonText     = document.getElementById("copyButtonText");

const themeToggle        = document.getElementById("themeToggle");

const viewerCard         = document.getElementById("viewerCard");
const documentViewer     = document.getElementById("documentViewer");
const viewerStatusPill   = document.getElementById("viewerStatusPill");
const viewerStatusText   = viewerStatusPill ? viewerStatusPill.querySelector(".viewer-status") : null;
const viewerLoadingBar   = document.getElementById("viewerLoadingBar");
const reloadViewerBtn    = document.getElementById("reloadViewerBtn");
const fullscreenViewerBtn= document.getElementById("fullscreenViewerBtn");

// ─── Scribd URL validation ─────────────────────────────────────────────────
const SCRIBD_PATTERN = /^https:\/\/www\.scribd\.com\/document\/(\d+)\/.+$/;

function validateScribdUrl(url) {
  return SCRIBD_PATTERN.test(url.trim());
}

function extractDocumentId(url) {
  return url.trim().split("/")[4];
}

// ─── Theme management ──────────────────────────────────────────────────────
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
}

const storedTheme = localStorage.getItem("theme");
setTheme(storedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

// Respond to OS-level preference changes when no manual override is stored.
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!localStorage.getItem("theme")) {
    setTheme(e.matches ? "dark" : "light");
  }
});

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  setTheme(next);
});

// ─── Input helpers ─────────────────────────────────────────────────────────
function updateClearVisibility() {
  clearBtn.classList.toggle("visible", input.value.length > 0);
}

/** Enable the submit button only when a structurally valid Scribd URL is typed. */
function updateSubmitState() {
  const isValid = validateScribdUrl(input.value);
  submitBtn.disabled = !isValid;
  submitBtn.setAttribute("aria-disabled", String(!isValid));
}

function clearError() {
  inputContainer.classList.remove("has-error");
  errorBanner.classList.remove("visible");
}

function showError(msg) {
  errorMessage.textContent = msg || "Please provide a valid Scribd document URL.";
  inputContainer.classList.add("has-error");
  errorBanner.classList.add("visible");
  // Re-enable so the user can try again after reading the error.
  submitBtn.disabled = false;
  submitBtn.setAttribute("aria-disabled", "false");
  input.focus();
}

input.addEventListener("input", () => {
  updateClearVisibility();
  updateSubmitState();
  if (inputContainer.classList.contains("has-error") && validateScribdUrl(input.value)) {
    clearError();
  }
});

input.addEventListener("focus", () => clearError());

clearBtn.addEventListener("click", () => {
  input.value = "";
  input.focus();
  updateClearVisibility();
  clearError();
});

// ─── Paste button ──────────────────────────────────────────────────────────
pasteBtn.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    input.value = text.trim();
    input.dispatchEvent(new Event("input"));
    input.focus();
  } catch {
    // Clipboard access denied — focus input so the user can paste manually.
    input.focus();
    pasteBtn.textContent = "Paste manually";
    setTimeout(() => { pasteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg><span>Paste</span>`; }, 2000);
  }
});

// ─── Form submission ───────────────────────────────────────────────────────
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const url = input.value.trim();

  // Guardrail: empty field
  if (!url) {
    showError("Please paste a Scribd document URL before generating a preview.");
    return;
  }

  // Guardrail: invalid URL format
  if (!validateScribdUrl(url)) {
    showError("That doesn't look like a valid Scribd document URL. It should look like: https://www.scribd.com/document/123456789/Title");
    return;
  }

  clearError();

  const documentId = extractDocumentId(url);
  const embedUrl = `https://www.scribd.com/embeds/${documentId}/content?start_page=1&view_mode=scroll`;

  // Populate result card.
  output.textContent = embedUrl;
  outputLink.href = embedUrl;
  result.hidden = false;

  // Show and load the viewer.
  setViewerLoading(true);
  viewerCard.hidden = false;
  documentViewer.src = embedUrl;

  // Smooth scroll to viewer.
  requestAnimationFrame(() => {
    viewerCard.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ─── Viewer state ──────────────────────────────────────────────────────────
function setViewerLoading(loading) {
  if (loading) {
    viewerLoadingBar.classList.add("active");
    viewerStatusPill.classList.remove("ready");
    viewerStatusPill.classList.add("loading");
    if (viewerStatusText) viewerStatusText.textContent = "Loading…";
  } else {
    viewerLoadingBar.classList.remove("active");
    viewerStatusPill.classList.remove("loading");
    viewerStatusPill.classList.add("ready");
    if (viewerStatusText) viewerStatusText.textContent = "Ready";
  }
}

documentViewer.addEventListener("load", () => {
  // Only signal "ready" when the viewer actually has a src set.
  if (documentViewer.src && documentViewer.src !== window.location.href) {
    setViewerLoading(false);
  }
});

// ─── Viewer toolbar actions ─────────────────────────────────────────────────
reloadViewerBtn && reloadViewerBtn.addEventListener("click", () => {
  if (documentViewer.src) {
    setViewerLoading(true);
    // Reload by briefly clearing and re-assigning src.
    const currentSrc = documentViewer.src;
    documentViewer.src = "";
    requestAnimationFrame(() => { documentViewer.src = currentSrc; });
  }
});

fullscreenViewerBtn && fullscreenViewerBtn.addEventListener("click", () => {
  const frame = document.getElementById("viewerFrameContainer") || documentViewer;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    frame.requestFullscreen().catch(() => {});
  }
});

// ─── Copy link ─────────────────────────────────────────────────────────────
copyButton.addEventListener("click", async () => {
  const url = outputLink.href;
  if (!url) return;

  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Fallback: create a temporary textarea.
    const ta = Object.assign(document.createElement("textarea"), {
      value: url,
      style: "position:fixed;opacity:0",
    });
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  // Visual confirmation — swap to checkmark for 2 s.
  copyButtonText.textContent = "Copied!";
  copyButton.querySelector("svg")?.setAttribute("style", "stroke: var(--apple-green)");
  setTimeout(() => {
    copyButtonText.textContent = "Copy link";
    copyButton.querySelector("svg")?.removeAttribute("style");
  }, 2000);
});

// ─── Footer dynamic year ───────────────────────────────────────────────────
const footerYear = document.getElementById("footerYear");
if (footerYear) footerYear.textContent = new Date().getFullYear();

// ─── Initialise guardrail + UI state on page load ─────────────────────────
updateSubmitState();
updateClearVisibility();

