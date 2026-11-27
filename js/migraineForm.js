window.MiouraMigraineForm = {
  form(a = {}) {
    const editing = !!a.id;
    const existingMedication = MiouraStore.get().extraMedicationLogs.find(
      (log) => log.attackId === a.id,
    );
    const symptoms = [
      "Misselijkheid",
      "Braken",
      "Lichtgevoeligheid",
      "Geluidsgevoeligheid",
      "Geurgevoeligheid",
      "Aura",
      "Wazig zien",
      "Tintelingen",
      "Duizeligheid",
      "Vermoeidheid",
      "Concentratieproblemen",
      "Traan ogen",
    ];
    const selected = a.symptoms || [];
    return `
    <div class="card">
      <div class="field">
        <label>Startdatum</label>
        <input id="a-date" type="date" value="${a.date || today()}">
      </div>
      <div class="field">
        <label>Starttijd</label>
        <input id="a-time" type="time" value="${a.time || nowTime()}">
      </div>
      <div class="field">
        <label>Eindtijd (optioneel)</label>
        <input id="a-end" type="time" value="${a.endTime || ""}">
      </div>
      <label class="row">Is de aanval nog bezig? <input id="a-ongoing" class="toggle" type="checkbox" ${a.ongoing ? "checked" : ""}></label>
    </div>
    <div class="card">
      <div class="field">
        <label>Pijnintensiteit (0–10)</label>
        <div class="range-row">
          <input id="a-pain" type="range" min="0" max="10" value="${a.pain ?? 5}">
          <span class="pain-number" id="pain-num">${a.pain ?? 5}</span>
        </div>
      </div>
      <div class="field">
        <label>Pijnlocatie</label>
        <div class="chips">
          ${["Links", "Rechts", "Beide kanten", "Voorhoofd", "Achterhoofd", "Rond de ogen"].map((x) => `<button type="button" class="chip ${(a.locations || []).includes(x) ? "selected" : ""}" data-loc="${x}">${x}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>Type pijn (optioneel)</label>
        <select id="a-type">
        <option value="">Niet ingevuld</option>${["Kloppend", "Stekend", "Drukkend", "Bonzend", "Anders"].map((x) => `<option ${a.type === x ? "selected" : ""}>${x}</option>`).join("")}</select>
      </div>
    </div>
    <div class="card">
      <div class="field">
        <label>Symptomen</label>
        <div class="chips">
          ${symptoms.map((x) => `<button type="button" class="chip ${selected.includes(x) ? "selected" : ""}" data-sym="${x}">${x}</button>`).join("")}
        </div>
      </div>
    </div>
    <div class="card">
      <div class="field">
        <label>Notities (optioneel)</label>
        <textarea id="a-notes" placeholder="Hoe voelde het?">${a.notes || ""}</textarea>
      </div>
    </div>
    <div class="card">
      <div class="field">
        <label>Extra medicatie ingenomen (optioneel)</label>
        <select id="a-med">
        <option value="">Geen medicatie koppelen</option>
        ${MiouraStore.get()
          .extraMedications.filter((m) => m.active !== false)
          .map(
            (m) => `
              <option value="${m.id}" ${
                existingMedication?.medicationId === m.id ? "selected" : ""
              }>
                ${esc(m.name)}
              </option>
            `,
          )
          .join("")}
        </select>
        </div>
      <div class="field">
        <label>Dosis (optioneel)</label>
        <input
          id="a-dose"
          placeholder="Bijvoorbeeld 1 tablet"
          value="${esc(existingMedication?.dose || "")}"
        >
      </div>
    </div>
    <div class="row" style="gap:10px">
      <button class="btn full" id="save-attack">
        ${editing ? "Opslaan" : "Aanval opslaan"}
      </button>

      ${
        editing
          ? `<button
              class="btn full"
              id="delete-attack"
              type="button"
              style="background:var(--coral); color:var(--lilac7)"
            >Verwijderen</button>`
          : ""
      }
    </div>
  `;
  },
  quickForm() {
    return `
      <div class="migraine-quick-form">
        <div class="field">
          <label>Pijnintensiteit (0–10)</label>
          <div class="range-row">
            <input id="quick-pain" type="range" min="0" max="10" value="5">
            <span class="pain-number" id="quick-pain-num">5</span>
          </div>
        </div>

        <button class="btn full" id="save-quick-attack">
          Aanval opslaan
        </button>
      </div>
    `;
  },
  bindQuick(root) {
    const pain = root.querySelector("#quick-pain");
    const painNumber = root.querySelector("#quick-pain-num");

    pain.oninput = () => {
      painNumber.textContent = pain.value;
    };

    root.querySelector("#save-quick-attack").onclick = () => {
      const date = today();
      const time = nowTime();

      const attack = MiouraData.addAttack({
        date,
        time,
        endTime: "",
        ongoing: true,
        pain: Number(pain.value),
        locations: [],
        symptoms: [],
        type: "",
        notes: "",
        updatedAt: new Date().toISOString(),
      });

      closeModal();
      toast("Migraineaanval opgeslagen");
      renderPage("dashboard");
    };
  },
  bind(a = {}, root = document.getElementById("view"), inModal = false) {
    let loc = [...(a.locations || [])],
      sym = [...(a.symptoms || [])];
    root.querySelectorAll("[data-loc]").forEach(
      (b) =>
        (b.onclick = () => {
          b.classList.toggle("selected");
          loc = toggleArray(loc, b.dataset.loc);
        }),
    );
    root.querySelectorAll("[data-sym]").forEach(
      (b) =>
        (b.onclick = () => {
          b.classList.toggle("selected");
          sym = toggleArray(sym, b.dataset.sym);
        }),
    );
    const pain = root.querySelector("#a-pain");
    pain.oninput = () =>
      (root.querySelector("#pain-num").textContent = pain.value);
    const deleteButton = root.querySelector("#delete-attack");

    if (deleteButton) {
      deleteButton.onclick = () => {
        modal(`
          <h2>Migraineaanval verwijderen?</h2>
          <p class="muted">
            Weet je zeker dat je deze migraineaanval wilt verwijderen?
            Dit kan niet ongedaan worden gemaakt.
          </p>
          <div class="row" style="margin-top:20px">
            <button class="btn" id="cancel-delete-attack">
              Annuleren
            </button>
            <button
              class="btn full"
              id="confirm-delete-attack"
              style="background:var(--coral); color:var(--lilac7)"
            >
              Verwijderen
            </button>
          </div>
        `);

        document.getElementById("cancel-delete-attack").onclick = () => {
          closeModal();
        };

        document.getElementById("confirm-delete-attack").onclick = () => {
          MiouraData.deleteAttack(a.id);
          closeModal();
          toast("Migraineaanval verwijderd");
          renderPage("dashboard");
        };
      };
    }
    root.querySelector("#save-attack").onclick = () => {
      const val = {
        id: a.id,
        date: root.querySelector("#a-date").value,
        time: root.querySelector("#a-time").value,
        endTime: root.querySelector("#a-end").value,
        ongoing: root.querySelector("#a-ongoing").checked,
        pain: +pain.value,
        locations: loc,
        symptoms: sym,
        type: root.querySelector("#a-type").value,
        notes: root.querySelector("#a-notes").value,
        updatedAt: new Date().toISOString(),
      };
      if (!val.date || !val.time) return toast("Vul datum en starttijd in.");
      let savedAttack;

      if (a.id) {
        MiouraData.updateAttack(val);
        savedAttack = val;
      } else {
        savedAttack = MiouraData.addAttack(val);
      }

      const med = root.querySelector("#a-med").value;
      const dose = root.querySelector("#a-dose").value;

      const data = MiouraStore.get();

      // Verwijder de bestaande medicatiekoppeling van deze aanval
      data.extraMedicationLogs = data.extraMedicationLogs.filter(
        (log) => log.attackId !== savedAttack.id,
      );

      // Sla de nieuwe medicatiekoppeling op als er medicatie gekozen is
      if (med) {
        const m = data.extraMedications.find((x) => x.id === med);

        if (m) {
          MiouraData.logExtraMedication({
            medicationId: med,
            medicationName: m.name,
            dose,
            date: val.date,
            time: val.time,
            attackId: savedAttack.id,
            effect: "Inname geregistreerd",
          });
        }
      } else {
        MiouraStore.save();
      }

      toast("Migraineaanval opgeslagen");

      if (inModal) closeModal();

      renderPage("dashboard");
    };
  },
};
