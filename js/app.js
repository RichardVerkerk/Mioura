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
  if (page === "dashboard") view.innerHTML = dashboard();
  if (page === "register") {
    view.innerHTML = `<div class="eyebrow">Jouw dagboek</div><h1 class="page-title">${arg ? "Aanval aanpassen" : "Migraine registreren"}</h1><p class="subtitle">Leg vast hoe je je voelt. Vul alleen in wat je wilt bijhouden.</p>${MiouraMigraine.form(arg || {})}`;
    MiouraMigraine.bind(arg || {});
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
  if (page === "settings") view.innerHTML = settings();
  if (page === "dashboard") bindDashboard();
  if (page === "settings") bindSettings();
}
function dashboard() {
  const d = MiouraStore.get(),
    att = d.attacks,
    month = today().slice(0, 7),
    monthly = att.filter((a) => a.date?.startsWith(month)),
    days = new Set(monthly.map((a) => a.date)).size,
    avg = monthly.length
      ? (
          monthly.reduce((s, a) => s + (+a.pain || 0), 0) / monthly.length
        ).toFixed(1)
      : "—",
    name = d.onboarding.userName;
  return `<section class="hero">
  <span class="eyebrow">Jouw persoonlijke migrainejournaal</span>
  <h1>${name ? "Fijn je te zien, " + esc(name) : "Welkom bij Mioura"}.</h1>
  <p>Neem even de tijd om te noteren hoe het met je gaat. Kleine registraties geven later meer inzicht.</p>
  <button class="btn coral" data-go="register">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-lightning preview-icon"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>
  Migraine registreren</button>
  </section>
  <div class="grid grid-dashboard">
    <div class="card dashboard-stats-card">
      <div class="dashboard-card-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-1 preview-icon"><path d="M11 13h1v4"/><path d="M16 2v3"/><path d="M3 9h18"/><path d="M8 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
      </div>
      <div class="stat-value">${monthly.length}</div>
      <div class="stat-label">Aanvallen deze maand</div>
      </div>
    <div class="card dashboard-stats-card">
      <div class="dashboard-card-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap preview-icon"><path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/></svg>
      </div>
      <div class="stat-value">${days}</div>
      <div class="stat-label">Migrainedagen deze maand</div>
    </div>
    <div class="card dashboard-stats-card">
      <div class="dashboard-card-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gauge preview-icon"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
      </div>
      <div class="stat-value">${avg}</div>
      <div class="stat-label">Gemiddelde  pijnintensiteit</div>

    </div>
  </div>
  <div class="section-head">
    <h2>Recente aanvallen</h2>
    <button class="text-link" data-go="calendar">Bekijk kalender</button>
  </div>${
    att.length
      ? att
          .slice()
          .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
          .slice(0, 3)
          .map(
            (a) =>
              `<div class="card row"><div><div class="item-title">${new Date(a.date + "T12:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long" })} · ${a.time}</div><div class="muted">${(a.symptoms || []).slice(0, 3).join(" · ") || "Geen symptomen ingevuld"}</div></div><span class="pill ${
                a.pain <= 3
                  ? "pain-low"
                  : a.pain <= 7
                    ? "pain-medium"
                    : "pain-high"
              }">${a.pain}/10</span></div>`,
          )
          .join("")
      : `<div class="empty"><strong>Je dagboek is nog leeg</strong>Zodra je een aanval registreert, verschijnt deze hier.</div>`
  }<div class="section-head"><h2>Dagelijkse medicatie</h2><button class="text-link" data-go="medication">Beheren</button></div>${d.dailyMedication.current ? `<div class="card row"><div><strong>${esc(d.dailyMedication.current.name)}</strong><div class="muted">${esc(d.dailyMedication.current.dose || "Dosering niet ingevuld")}</div></div><span class="pill">Actief</span></div>` : `<div class="card muted">Geen dagelijkse medicatie ingesteld.</div>`}<div class="section-head"><h2>Een zachte herinnering</h2></div><div class="card">Je hoeft niet alles in te vullen. Noteer alleen wat op dit moment voor jou belangrijk is.</div>`;
}
function bindDashboard() {
  document
    .querySelectorAll("[data-go]")
    .forEach((b) => (b.onclick = () => renderPage(b.dataset.go)));
}
function settings() {
  const d = MiouraStore.get();
  return `<div class="eyebrow">Jouw voorkeuren</div><h1 class="page-title">Instellingen</h1><p class="subtitle">Beheer je profiel en je gegevens.</p><div class="card"><div class="field"><label>Naam</label><input id="setting-name" value="${esc(d.onboarding.userName)}" placeholder="Je naam"></div><button class="btn full" id="save-name">Naam opslaan</button></div><div class="card"><div class="row"><div><strong>Dagelijkse medicatie-inname bijhouden</strong><div class="muted">Schakel registratie van innames in of uit.</div></div><input id="setting-track" type="checkbox" class="toggle" ${d.settings.trackDailyMedicationIntake ? "checked" : ""}></div></div><div class="card"><h2 style="font:500 20px 'Playfair Display'">Back-up en gegevens</h2><p class="muted">Exporteer regelmatig een kopie van je gegevens. Je gegevens blijven op dit apparaat.</p><button class="btn full" id="export-data">Back-up downloaden</button><div class="field"><label>Back-up importeren</label><input id="import-file" type="file" accept="application/json"></div><div class="notice">Mioura bewaart gegevens lokaal in deze browser. LocalStorage is niet versleuteld. Browsergegevens wissen kan je gegevens verwijderen. Er is geen automatische synchronisatie tussen apparaten.</div><button class="btn ghost full" id="reset-onboarding">Onboarding opnieuw starten</button><button class="btn ghost full" id="delete-data" style="margin-top:9px;color:#a43e4d">Alle gegevens verwijderen</button></div><div class="card"><strong>Mioura</strong><div class="muted">Persoonlijk migrainejournaal · versie 1.1</div></div>`;
}
function bindSettings() {
  document.getElementById("save-name").onclick = () => {
    const d = MiouraStore.get();
    d.onboarding.userName = document
      .getElementById("setting-name")
      .value.trim();
    MiouraStore.save();
    toast("Naam opgeslagen");
    renderPage("settings");
  };
  document.getElementById("setting-track").onchange = (e) => {
    MiouraStore.get().settings.trackDailyMedicationIntake = e.target.checked;
    MiouraStore.save();
  };
  document.getElementById("export-data").onclick = () => MiouraBackup.export();
  document.getElementById("import-file").onchange = (e) => {
    if (e.target.files[0]) MiouraBackup.import(e.target.files[0]);
  };
  document.getElementById("reset-onboarding").onclick = () => {
    if (
      confirm(
        "De onboarding opnieuw starten? Je bestaande gegevens blijven behouden.",
      )
    ) {
      MiouraStore.get().onboarding.completed = false;
      MiouraStore.save();
      MiouraOnboarding.render();
    }
  };
  document.getElementById("delete-data").onclick = () => {
    if (
      confirm(
        "Weet je zeker dat je ALLE Mioura-gegevens wilt verwijderen? Maak eerst een back-up als je iets wilt bewaren.",
      )
    ) {
      MiouraStore.reset();
      location.reload();
    }
  };
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-page]");
  if (b) {
    e.preventDefault();
    renderPage(b.dataset.page);
  }
});
document.addEventListener("DOMContentLoaded", () => {
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
