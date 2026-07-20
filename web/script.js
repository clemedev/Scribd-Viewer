const form = document.getElementById("form");
const output = document.getElementById("output");
const outputLink = document.getElementById("outputLink");
const result = document.getElementById("result");
const copyButton = document.getElementById("copyButton");
const themeToggle = document.getElementById("themeToggle");
const viewerCard = document.getElementById("viewerCard");
const documentViewer = document.getElementById("documentViewer");
const viewerStatus = document.querySelector(".viewer-status");

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", theme === "dark");
  themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
}

const storedTheme = localStorage.getItem("theme");
setTheme(storedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", nextTheme);
  setTheme(nextTheme);
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const scribdLink = document.getElementById("scribd_link").value.trim();
  const documentId = scribdLink.split("/")[4];
  const linkReady = `https://www.scribd.com/embeds/${documentId}/content?start_page=1&view_mode=scroll`;
  output.textContent = linkReady;
  outputLink.href = linkReady;
  result.hidden = false;
  viewerStatus.textContent = "Loading…";
  viewerCard.hidden = false;
  documentViewer.src = linkReady;
  viewerCard.scrollIntoView({ behavior: "smooth", block: "start" });
});

documentViewer.addEventListener("load", () => {
  viewerStatus.textContent = "Ready";
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(outputLink.href);
  copyButton.textContent = "Copied!";
  window.setTimeout(() => { copyButton.textContent = "Copy link"; }, 1800);
});
