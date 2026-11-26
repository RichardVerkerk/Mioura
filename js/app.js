function today() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}
function esc(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function toggleArray(a, x) {
  return a.includes(x) ? a.filter((v) => v !== x) : [...a, x];
}
function toast(t) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = t;
  document.body.append(el);
  setTimeout(() => el.remove(), 2300);
}
function modal(html) {
  document.getElementById("modal-root").innerHTML =
    `<div class="modal-backdrop" id="modal-back"><div class="modal">${html}<button class="btn ghost full" style="margin-top:10px" onclick="closeModal()">Sluiten</button></div></div>`;
  document.getElementById("modal-back").onclick = (e) => {
    if (e.target.id === "modal-back") closeModal();
  };
}
function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
}
function renderPage(page = "dashboard", arg = null) {
  window.currentPage = page;
  document
    .querySelectorAll(".nav-item")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === page));
  const view = document.getElementById("view");
  if (page === "dashboard") {
    view.innerHTML = MiouraDashboard.render();
    MiouraDashboard.bind();
  }
  if (page === "register") {
    view.innerHTML = `
      <section class="hero">
        <div class="eyebrow">Jouw dagboek</div>
        <h1 class="page-title">${arg ? "Aanval aanpassen" : "Migraine registreren"}</h1>
        <p class="subtitle">Leg vast hoe je je voelt. Vul alleen in wat je wilt bijhouden.</p>
      </section>
      ${MiouraMigraineForm.form(arg || {})}
      `;
    MiouraMigraineForm.bind(arg || {});
  }
  if (page === "calendar") {
    view.innerHTML = MiouraCalendar.render();
    MiouraCalendar.bind();
  }
  if (page === "medication") {
    view.innerHTML = MiouraMedication.render();
    MiouraMedication.bind();
  }
  if (page === "insights") {
    view.innerHTML = MiouraAnalytics.render();
    MiouraAnalytics.bind();
  }
  if (page === "settings") {
    view.innerHTML = MiouraSettings.render();
    MiouraSettings.bind();
  }
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-page]");
  if (b) {
    e.preventDefault();
    renderPage(b.dataset.page);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  updateHeaderLock();
  document.getElementById("todayLabel").textContent =
    new Date().toLocaleDateString("nl-NL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  if ("serviceWorker" in navigator && location.protocol !== "file:")
    navigator.serviceWorker.register("service-worker.js").catch(console.warn);
  if (!MiouraStore.get().onboarding.completed) MiouraOnboarding.render();
  else renderPage("dashboard");
});

function updateHeaderLock() {
  const brand = document.querySelector(".topbar .brand");
  if (!brand) return;

  const onboardingIncomplete = !MiouraStore.get().onboarding.completed;

  brand.style.pointerEvents = onboardingIncomplete ? "none" : "auto";
  brand.style.cursor = onboardingIncomplete ? "default" : "pointer";
  brand.setAttribute("aria-disabled", onboardingIncomplete ? "true" : "false");

  if (onboardingIncomplete) {
    brand.removeAttribute("data-page");
  } else {
    brand.setAttribute("data-page", "dashboard");
  }
}
