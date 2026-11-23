window.MiouraMigraine = {
  form(a = {}) {
    const editing = !!a.id;
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
    ];
    const selected = a.symptoms || [];
    return `<div class="card"><div class="field"><label>Startdatum</label><input id="a-date" type="date" value="${a.date || today()}"></div><div class="field"><label>Starttijd</label><input id="a-time" type="time" value="${a.time || nowTime()}"></div><div class="field"><label>Eindtijd (optioneel)</label><input id="a-end" type="time" value="${a.endTime || ""}"></div><label class="row">Is de aanval nog bezig? <input id="a-ongoing" class="toggle" type="checkbox" ${a.ongoing ? "checked" : ""}></label><div class="field"><label>Pijnintensiteit (0–10)</label><div class="range-row"><input id="a-pain" type="range" min="0" max="10" value="${a.pain ?? 5}"><span class="pain-number" id="pain-num">${a.pain ?? 5}</span></div></div><div class="field"><label>Pijnlocatie</label><div class="chips">${["Links", "Rechts", "Beide kanten", "Voorhoofd", "Achterhoofd", "Rond de ogen"].map((x) => `<button type="button" class="chip ${(a.locations || []).includes(x) ? "selected" : ""}" data-loc="${x}">${x}</button>`).join("")}</div></div><div class="field"><label>Type pijn (optioneel)</label><select id="a-type"><option value="">Niet ingevuld</option>${["Kloppend", "Stekend", "Drukkend", "Bonzend", "Anders"].map((x) => `<option ${a.type === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="field"><label>Symptomen</label><div class="chips">${symptoms.map((x) => `<button type="button" class="chip ${selected.includes(x) ? "selected" : ""}" data-sym="${x}">${x}</button>`).join("")}</div></div><div class="field"><label>Notities (optioneel)</label><textarea id="a-notes" placeholder="Hoe voelde het?">${a.notes || ""}</textarea></div><div class="field"><label>Extra medicatie ingenomen (optioneel)</label><select id="a-med"><option value="">Geen medicatie koppelen</option>${MiouraStore.get()
      .extraMedications.filter((m) => m.active !== false)
      .map((m) => `<option value="${m.id}">${esc(m.name)}</option>`)
      .join(
        "",
      )}</select></div><div class="field"><label>Dosis (optioneel)</label><input id="a-dose" placeholder="Bijvoorbeeld 1 tablet"></div><button class="btn full" id="save-attack">${editing ? "Wijzigingen opslaan" : "Aanval opslaan"}</button></div>`;
  },
  bind(a = {}) {
    const root = document.getElementById("view");
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
      if (a.id) MiouraData.updateAttack(val);
      else MiouraData.addAttack(val);
      const med = root.querySelector("#a-med").value,
        dose = root.querySelector("#a-dose").value;
      if (med) {
        const m = MiouraStore.get().extraMedications.find((x) => x.id === med);
        MiouraData.logExtraMedication({
          medicationId: med,
          medicationName: m?.name || "",
          dose,
          date: val.date,
          time: val.time,
          attackId: val.id || MiouraStore.get().attacks.at(-1)?.id,
          effect: "Niet beoordeeld",
        });
      }
      toast("Migraineaanval opgeslagen");
      renderPage("dashboard");
    };
  },
};
