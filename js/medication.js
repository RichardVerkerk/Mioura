window.MiouraMedication = {
  render() {
    const d = MiouraStore.get(),
      daily = d.dailyMedication.current;
    return `<div class="eyebrow">Jouw behandeling</div><h1 class="page-title">Medicatie</h1><p class="subtitle">Houd je dagelijkse en zo nodig gebruikte medicatie overzichtelijk bij.</p><div class="section-head"><h2>Dagelijkse medicatie</h2><button class="text-link" id="add-daily">＋ Toevoegen</button></div>${daily ? `<div class="card"><div class="row"><div><div class="item-title">${esc(daily.name)}</div><div class="muted">${esc(daily.dose || "Dosering niet ingevuld")}</div></div><span class="pill">Actief</span></div>${daily.activeIngredient ? `<p class="muted">Werkzame stof: ${esc(daily.activeIngredient)}</p>` : ""}<div class="row"><button class="text-link" id="edit-daily">Bewerken</button><button class="text-link" id="stop-daily">Stoppen</button></div></div>` : `<div class="empty"><strong>Nog geen dagelijkse medicatie</strong>Voeg je preventieve medicatie toe als je die gebruikt.</div>`}<div class="card"><div class="row"><div><strong>Dagelijkse inname bijhouden</strong><div class="muted">Registreer of je je medicatie hebt ingenomen.</div></div><input id="track-toggle" class="toggle" type="checkbox" ${d.settings.trackDailyMedicationIntake ? "checked" : ""}></div>${d.settings.trackDailyMedicationIntake ? `<button class="btn soft full" id="log-daily" style="margin-top:14px">Inname van vandaag registreren</button><div class="muted" style="margin-top:10px">${d.dailyMedicationLogs.length} geregistreerde innames</div>` : ""}</div><div class="section-head"><h2>Extra medicatie</h2><button class="text-link" id="add-extra-med">＋ Toevoegen</button></div>${d.extraMedications.length ? d.extraMedications.map((m) => `<div class="card row"><div><div class="item-title">${esc(m.name)} ${m.active === false ? '<span class="pill">Inactief</span>' : ""}</div><div class="muted">${esc(m.dose || m.activeIngredient || "Geen details")}</div></div><button class="text-link" data-logmed="${m.id}">Inname +</button></div>`).join("") : `<div class="empty"><strong>Nog geen extra medicatie</strong>Voeg medicatie toe die je zo nodig gebruikt.</div>`}<div class="section-head"><h2>Recente innames</h2></div>${
      d.extraMedicationLogs
        .slice()
        .reverse()
        .slice(0, 6)
        .map(
          (l) =>
            `<div class="card row"><div><strong>${esc(l.medicationName)}</strong><div class="muted">${l.date} · ${l.time || ""} · ${esc(l.dose || "")}</div></div><span class="pill">${esc(l.effect || "Niet beoordeeld")}</span></div>`,
        )
        .join("") ||
      `<div class="muted">Nog geen extra medicatie-innames geregistreerd.</div>`
    }`;
  },
  bind() {
    const d = MiouraStore.get();
    document.getElementById("add-daily").onclick = () => dailyModal();
    document
      .getElementById("edit-daily")
      ?.addEventListener("click", () => dailyModal(d.dailyMedication.current));
    document.getElementById("stop-daily")?.addEventListener("click", () => {
      if (confirm("Wil je deze dagelijkse medicatie stoppen?")) {
        MiouraData.stopDailyMedication();
        renderPage("medication");
      }
    });
    document.getElementById("track-toggle").onchange = (e) => {
      d.settings.trackDailyMedicationIntake = e.target.checked;
      MiouraStore.save();
      renderPage("medication");
    };
    document.getElementById("log-daily")?.addEventListener("click", () => {
      d.dailyMedicationLogs.push({
        id: MiouraStore.id(),
        date: today(),
        time: nowTime(),
        taken: true,
      });
      MiouraStore.save();
      toast("Inname geregistreerd");
      renderPage("medication");
    });
    document.getElementById("add-extra-med").onclick = () => extraModal();
    document
      .querySelectorAll("[data-logmed]")
      .forEach((b) => (b.onclick = () => logExtra(b.dataset.logmed)));
  },
};
function dailyModal(m = {}) {
  modal(
    `<h2>${m.id ? "Dagelijkse medicatie aanpassen" : "Dagelijkse medicatie toevoegen"}</h2><div class="field"><label>Naam</label><input id="md-name" value="${esc(m.name || "")}"></div><div class="field"><label>Werkzame stof</label><input id="md-active" value="${esc(m.activeIngredient || "")}"></div><div class="field"><label>Dosering</label><input id="md-dose" value="${esc(m.dose || "")}"></div><div class="field"><label>Startdatum</label><input id="md-date" type="date" value="${m.startDate || today()}"></div><button class="btn full" id="md-save">Opslaan</button>`,
  );
  document.getElementById("md-save").onclick = () => {
    let name = document.getElementById("md-name").value.trim();
    if (!name) return toast("Vul een naam in.");
    MiouraData.setDailyMedication({
      name,
      activeIngredient: document.getElementById("md-active").value,
      dose: document.getElementById("md-dose").value,
      startDate: document.getElementById("md-date").value,
    });
    closeModal();
    renderPage("medication");
  };
}
function extraModal() {
  modal(
    `<h2>Extra medicatie toevoegen</h2><div class="field"><label>Naam</label><input id="em-name" placeholder="Bijvoorbeeld paracetamol"></div><div class="field"><label>Werkzame stof (optioneel)</label><input id="em-active"></div><div class="field"><label>Standaarddosering (optioneel)</label><input id="em-dose"></div><button class="btn full" id="em-save">Toevoegen</button>`,
  );
  document.getElementById("em-save").onclick = () => {
    let name = document.getElementById("em-name").value.trim();
    if (!name) return toast("Vul een naam in.");
    MiouraData.addExtraMedication({
      name,
      activeIngredient: document.getElementById("em-active").value,
      dose: document.getElementById("em-dose").value,
    });
    closeModal();
    renderPage("medication");
  };
}
function logExtra(id) {
  const m = MiouraStore.get().extraMedications.find((x) => x.id === id);
  modal(
    `<h2>Inname registreren</h2><p>${esc(m.name)}</p><div class="field"><label>Dosis</label><input id="log-dose" value="${esc(m.dose || "")}" placeholder="Dosis"></div><div class="field"><label>Datum</label><input id="log-date" type="date" value="${today()}"></div><div class="field"><label>Tijd</label><input id="log-time" type="time" value="${nowTime()}"></div><div class="field"><label>Ervaren effect</label><select id="log-effect"><option>Niet beoordeeld</option><option>Geholpen</option><option>Gedeeltelijk geholpen</option><option>Niet geholpen</option></select></div><div class="field"><label>Bijwerkingen / notities</label><textarea id="log-notes"></textarea></div><button class="btn full" id="log-save">Inname opslaan</button>`,
  );
  document.getElementById("log-save").onclick = () => {
    MiouraData.logExtraMedication({
      medicationId: id,
      medicationName: m.name,
      dose: document.getElementById("log-dose").value,
      date: document.getElementById("log-date").value,
      time: document.getElementById("log-time").value,
      effect: document.getElementById("log-effect").value,
      notes: document.getElementById("log-notes").value,
    });
    closeModal();
    renderPage("medication");
  };
}
