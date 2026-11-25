window.MiouraMedication = {
  render() {
    const d = MiouraStore.get(),
      daily = d.dailyMedication.current;
    return `
    <section class="hero">
    <span class="eyebrow">Jouw behandeling</span>
    <h1>Medicatie</h1>
    <p>Houd je dagelijkse en zo nodig gebruikte medicatie overzichtelijk bij.</p>
    </section>
    <div class="eyebrow"></div><h1 class="page-title"></h1><p class="subtitle"></p><div class="section-head"><h2>Dagelijkse medicatie</h2><button class="text-link" id="add-daily">＋ Toevoegen</button></div>${daily ? `<div class="card"><div class="row"><div><div class="item-title">${esc(daily.name)}</div><div class="muted">${esc(daily.dose || "Dosering niet ingevuld")}</div></div><span class="pill">Actief</span></div>${daily.activeIngredient ? `<p class="muted">Werkzame stof: ${esc(daily.activeIngredient)}</p>` : ""}<div class="row"><button class="text-link" id="edit-daily">Bewerken</button><button class="text-link" id="stop-daily">Stoppen</button></div></div>` : `<div class="empty"><strong>Nog geen dagelijkse medicatie</strong>Voeg je preventieve medicatie toe als je die gebruikt.</div>`}<div class="card">
      <div class="row">
        <div>
          <strong>Dagelijkse inname bijhouden</strong>
          <div class="muted">Registreer of je je medicatie hebt ingenomen.</div>
        </div>
        <input id="track-toggle" class="toggle" type="checkbox"
          ${d.settings.trackDailyMedicationIntake ? "checked" : ""}>
      </div>
    </div>

    ${(() => {
      const history = (d.dailyMedication.history || [])
        .slice()
        .sort((a, b) =>
          (b.endDate || b.startDate || "").localeCompare(
            a.endDate || a.startDate || "",
          ),
        );

      if (!history.length) return "";

      const formatDate = (date) => {
        if (!date) return "Onbekend";
        return new Date(date + "T12:00:00").toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      };

      return `
          <div class="section-head">
            <h2>Eerdere dagelijkse medicatie</h2>
          </div>

          ${history
            .slice(0, 5)
            .map(
              (m) => `
            <div class="card">
              <div class="row">
                <div>
                  <div class="item-title">${esc(m.name)}</div>
                  <div class="muted">${esc(m.dose || "Dosering niet ingevuld")}</div>
                  <div class="muted">
                    ${formatDate(m.startDate)} – ${formatDate(m.endDate)}
                  </div>
                </div>
                <span class="pill">Beëindigd</span>
              </div>
            </div>
          `,
            )
            .join("")}

          <button class="text-link" id="daily-history-full">
            Bekijk volledige historie <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right preview-icon"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        `;
    })()}
    <div class="section-head"><h2>Extra medicatie</h2><button class="text-link" id="add-extra-med">＋ Toevoegen</button></div>

    ${d.extraMedications.length ? d.extraMedications.map((m) => `<div class="card row"><div><div class="item-title">${esc(m.name)} ${m.active === false ? '<span class="pill">Inactief</span>' : ""}</div><div class="muted">${esc(m.dose || m.activeIngredient || "Geen details")}</div></div><button class="text-link" data-logmed="${m.id}">Inname +</button></div>`).join("") : `<div class="empty"><strong>Nog geen extra medicatie</strong>Voeg medicatie toe die je zo nodig gebruikt.</div>`}<div class="section-head">
      <h2>Recente innames</h2>
    </div>
    ${(() => {
      const dailyLogs = (d.dailyMedicationLogs || []).map((log) => ({
        ...log,
        medicationName:
          d.dailyMedication.current?.name || "Dagelijkse medicatie",
        type: "Dagelijks",
        effect: "Inname geregistreerd",
      }));

      const extraLogs = (d.extraMedicationLogs || []).map((log) => ({
        ...log,
        type: "Extra",
      }));

      const allLogs = [...dailyLogs, ...extraLogs].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
        const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
        return dateB - dateA;
      });

      return allLogs.length
        ? allLogs
            .slice(0, 10)
            .map(
              (log) => `
              <div class="card row">
                <div>
                  <strong>${esc(log.medicationName)}</strong>
                  <div class="muted">
                    ${esc(log.date)} · ${esc(log.time || "")}
                    ${log.dose ? ` · ${esc(log.dose)}` : ""}
                  </div>
                  <span class="pill">${log.type}</span>
                </div>
                <span class="pill">${esc(log.effect || "Inname geregistreerd")}</span>
                <button
                  class="text-link"
                  data-delete-log="${log.id}"
                  data-log-type="${log.type}"
                  aria-label="Inname verwijderen"
                >Verwijderen</button>
              </div>
            `,
            )
            .join("")
        : `<div class="muted">Nog geen medicatie-innames geregistreerd.</div>`;
    })()}`;
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
    document.querySelectorAll("[data-delete-log]").forEach((b) => {
      b.onclick = () => {
        const logId = b.dataset.deleteLog;
        const logType = b.dataset.logType;

        modal(`
          <h2>Inname verwijderen?</h2>
          <p class="muted">
            Weet je zeker dat je deze medicatie-inname wilt verwijderen?
            Dit kan niet ongedaan worden gemaakt.
          </p>
          <div class="row" style="margin-top:20px">
            <button class="btn" id="cancel-delete-log">Annuleren</button>
            <button class="btn full" id="confirm-delete-log">Verwijderen</button>
          </div>
        `);

        document.getElementById("cancel-delete-log").onclick = () => {
          closeModal();
        };

        document.getElementById("confirm-delete-log").onclick = () => {
          const data = MiouraStore.get();

          if (logType === "Dagelijks") {
            data.dailyMedicationLogs = data.dailyMedicationLogs.filter(
              (log) => log.id !== logId,
            );
          } else {
            data.extraMedicationLogs = data.extraMedicationLogs.filter(
              (log) => log.id !== logId,
            );
          }

          MiouraStore.save();
          closeModal();
          toast("Inname verwijderd");
          renderPage("medication");
        };
      };
    });
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
