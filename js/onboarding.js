window.MiouraOnboarding = {
  render() {
    const d = MiouraStore.get();
    if (d.onboarding.completed) return false;
    const v = document.getElementById("view");
    v.innerHTML = `<section class="hero"><span class="eyebrow">Welkom bij Mioura</span><h1>Een beetje meer inzicht, op jouw tempo.</h1><p>Jouw persoonlijke plek om migraine, symptomen en medicatie bij te houden.</p></section><div class="card"><div class="eyebrow">Even instellen</div><h2 class="page-title">Hoe mogen we je noemen?</h2><p class="subtitle">Je naam gebruiken we alleen voor een persoonlijke begroeting.</p><div class="field"><label for="on-name">Naam (optioneel)</label><input id="on-name" placeholder="Bijvoorbeeld Sam" value="${esc(d.onboarding.userName)}"></div><div class="field"><label>Gebruik je dagelijkse medicatie om migraine te voorkomen?</label><div class="chips"><button class="chip" id="daily-yes">Ja</button><button class="chip" id="daily-no">Nee</button></div></div><div id="daily-fields" class="hidden"><div class="field"><label>Naam medicatie</label><input id="daily-name" placeholder="Naam"></div><div class="field"><label>Werkzame stof (optioneel)</label><input id="daily-active" placeholder="Werkzame stof"></div><div class="field"><label>Dosering</label><input id="daily-dose" placeholder="Bijvoorbeeld 1 tablet"></div><div class="field"><label>Startdatum</label><input id="daily-start" type="date" value="${today()}"></div><div class="field"><label>Wil je de dagelijkse inname bijhouden?</label><div class="chips"><button class="chip" id="track-yes">Ja</button><button class="chip" id="track-no">Nee</button></div></div></div><div class="divider"></div><div class="field"><label>Gebruik je ook medicatie die je zo nodig inneemt?</label><div class="chips"><button class="chip" id="extra-yes">Ja</button><button class="chip" id="extra-no">Nee</button></div></div><div id="extra-fields" class="hidden"><div class="field"><label>Medicijnnaam</label><input id="extra-name" placeholder="Bijvoorbeeld paracetamol"></div><div class="field"><label>Werkzame stof (optioneel)</label><input id="extra-active" placeholder="Werkzame stof"></div><div class="field"><label>Standaarddosering (optioneel)</label><input id="extra-dose" placeholder="Bijvoorbeeld 500 mg"></div><button class="btn soft" id="add-extra">Medicijn toevoegen</button><div id="extra-list" class="muted"></div></div><button class="btn full" id="finish-onboarding">Start met Mioura</button></div>`;
    let daily = null,
      track = false,
      extra = [],
      extraChosen = false;
    const $ = (id) => document.getElementById(id);
    const toggle = (yes, no, fn) => {
      $(yes).onclick = () => fn(true);
      $(no).onclick = () => fn(false);
    };
    toggle("daily-yes", "daily-no", (x) => {
      $("daily-fields").classList.toggle("hidden", !x);
      daily = x;
    });
    toggle("track-yes", "track-no", (x) => (track = x));
    toggle("extra-yes", "extra-no", (x) => {
      $("extra-fields").classList.toggle("hidden", !x);
      extraChosen = x;
    });
    $("add-extra").onclick = () => {
      let n = $("extra-name").value.trim();
      if (!n) return toast("Vul eerst een medicijnnaam in.");
      extra.push({
        name: n,
        activeIngredient: $("extra-active").value,
        dose: $("extra-dose").value,
      });
      $("extra-list").textContent = extra.map((x) => x.name).join(" · ");
      $("extra-name").value = "";
      $("extra-active").value = "";
      $("extra-dose").value = "";
    };
    $("finish-onboarding").onclick = () => {
      const data = MiouraStore.get();
      data.onboarding.userName = $("on-name").value.trim();
      if (daily) {
        const name = $("daily-name").value.trim();
        if (!name) return toast("Vul de naam van je dagelijkse medicatie in.");
        MiouraData.setDailyMedication({
          name,
          activeIngredient: $("daily-active").value,
          dose: $("daily-dose").value,
          startDate: $("daily-start").value,
        });
        data.settings.trackDailyMedicationIntake = track;
      }
      if (extraChosen) extra.forEach(MiouraData.addExtraMedication);
      data.onboarding.completed = true;
      data.onboarding.completedAt = new Date().toISOString();
      MiouraStore.save();
      renderPage("dashboard");
    };
    return true;
  },
};
