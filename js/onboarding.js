window.MiouraOnboarding = (() => {
  let step = 1;
  let draft = null;

  const $ = (id) => document.getElementById(id);

  const hideNav = () => {
    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "none";
  };

  const showNav = () => {
    const nav = document.querySelector(".bottom-nav");
    if (nav) nav.style.display = "flex";
  };

  const readDraft = () => {
    const d = MiouraStore.get();
    const current = d.dailyMedication.current;

    return {
      name: d.onboarding.userName || "",
      daily: !!current,
      dailyName: current?.name || "",
      dailyActive: current?.activeIngredient || "",
      dailyDose: current?.dose || "",
      dailyStart: current?.startDate || today(),
      dailyNotes: current?.notes || "",
      track: !!d.settings.trackDailyMedicationIntake,
      extraChoice: (d.extraMedications || []).some((m) => m.active !== false),
      extra: (d.extraMedications || [])
        .filter((m) => m.active !== false)
        .map((m) => ({
          id: m.id,
          name: m.name || "",
          activeIngredient: m.activeIngredient || "",
          dose: m.dose || "",
          notes: m.notes || "",
        })),
    };
  };

  const field = (label, id, value, placeholder = "", type = "text") => `
    <div class="field">
      <label for="${id}">${label}</label>
      <input id="${id}" type="${type}" value="${esc(value || "")}"
        placeholder="${esc(placeholder)}">
    </div>`;

  const choice = (label, id, selected) => `
    <button type="button"
      class="onboarding-choice ${selected ? "selected" : ""}"
      id="${id}" aria-pressed="${selected}">
      <span class="choice-check" aria-hidden="true">
        ${selected ? "✓" : ""}
      </span>
      ${label}
    </button>`;

  const choices = (question, yes, no, selected) => `
    <div class="field">
      <label>${question}</label>
      <div class="onboarding-choices">
        ${choice(yes, "choice-yes", selected === true)}
        ${choice(no, "choice-no", selected === false)}
      </div>
    </div>`;

  const progress = () => `
    <div class="onboarding-progress">
      <div class="row">
        <span class="eyebrow">Mioura instellen</span>
        <span class="muted">Stap ${step} van 5</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${step * 20}%"></div>
      </div>
    </div>`;

  const navigation = (nextLabel = "Verder") => `
    <div class="onboarding-navigation">
      <button type="button" class="btn ghost" id="on-back"
        ${step === 1 ? "disabled" : ""}>Terug</button>
      <button type="button" class="btn full" id="on-next">
        ${nextLabel}
      </button>
    </div>`;

  const page = (content, nextLabel) => {
    const view = $("view");
    view.innerHTML = `
      <main class="onboarding">
        ${progress()}
        ${content}
        ${navigation(nextLabel)}
      </main>`;
    bindNavigation();
    window.scrollTo(0, 0);
  };

  const bindNavigation = () => {
    $("on-back").onclick = () => {
      if (step > 1) {
        step--;
        if (step === 3 && !draft.daily) step = 2;
        renderStep();
      }
    };

    $("on-next").onclick = () => {
      if (!collectStep()) return;

      if (step === 2 && !draft.daily) {
        draft.track = false;
        step = 4;
      } else {
        step++;
      }

      renderStep();
    };
  };

  const bindChoice = (yesId, noId, key, onChange) => {
    $(yesId).onclick = () => {
      draft[key] = true;
      onChange?.();
      renderStep();
    };
    $(noId).onclick = () => {
      draft[key] = false;
      onChange?.();
      renderStep();
    };
  };

  const collectStep = () => {
    if (step === 1) {
      draft.name = $("on-name").value.trim();
      return true;
    }

    if (step === 2) {
      if (draft.daily) {
        draft.dailyName = $("daily-name").value.trim();
        draft.dailyActive = $("daily-active").value.trim();
        draft.dailyDose = $("daily-dose").value.trim();
        draft.dailyStart = $("daily-start").value || today();
        draft.dailyNotes = $("daily-notes").value.trim();

        if (!draft.dailyName) {
          toast("Vul de naam van je dagelijkse medicatie in.");
          return false;
        }
      }
      return true;
    }

    if (step === 3) return true;

    if (step === 4) return true;

    return true;
  };

  const renderStep = () => {
    if (!draft) draft = readDraft();
    hideNav();

    if (step === 1) {
      page(`
        <section class="hero onboarding-hero">
          <div class="mioura-mark">M</div>
          <span class="eyebrow">Welkom bij Mioura</span>
          <h1>Een beetje meer inzicht, op jouw tempo.</h1>
          <p>Welkom bij Mioura. Laten we jouw persoonlijke migrainedagboek instellen.</p>
          <p>Houd migraine, symptomen en medicatie bij en ontdek patronen in je eigen tempo.</p>
        </section>
        <section class="card">
          <h2 class="page-title">Hoe mogen we je noemen?</h2>
          <p class="subtitle">Je naam gebruiken we alleen voor een persoonlijke begroeting.</p>
          ${field("Naam (optioneel)", "on-name", draft.name, "Bijvoorbeeld Sam")}
        </section>
      `);
      $("on-name").oninput = (e) => (draft.name = e.target.value);
      return;
    }

    if (step === 2) {
      page(`
        <section class="card">
          <span class="eyebrow">Dagelijkse medicatie</span>
          <h1 class="page-title">Gebruik je op dit moment dagelijkse medicatie om migraine te voorkomen?</h1>
          <p class="subtitle">Je kunt dit later altijd aanpassen.</p>
          ${choices(
            "Gebruik je dagelijkse preventieve medicatie?",
            "Ja, ik gebruik dagelijkse medicatie",
            "Nee, momenteel niet",
            draft.daily,
          )}
          ${
            draft.daily
              ? `
            <div class="onboarding-fields">
              ${field("Naam medicatie", "daily-name", draft.dailyName, "Naam van je medicatie")}
              ${field("Werkzame stof (optioneel)", "daily-active", draft.dailyActive, "Werkzame stof")}
              ${field("Dosering", "daily-dose", draft.dailyDose, "Bijvoorbeeld 1 tablet")}
              ${field("Startdatum", "daily-start", draft.dailyStart, "", "date")}
              ${field("Opmerkingen (optioneel)", "daily-notes", draft.dailyNotes, "Aanvullende informatie")}
            </div>`
              : ""
          }
        </section>
      `);

      bindChoice("choice-yes", "choice-no", "daily");
      return;
    }

    if (step === 3) {
      page(`
        <section class="card">
          <span class="eyebrow">Inname bijhouden</span>
          <h1 class="page-title">Wil je bijhouden of je jouw dagelijkse medicatie hebt ingenomen?</h1>
          <p class="subtitle">Je kunt op het dashboard dagelijks aangeven of je de medicatie hebt ingenomen.</p>
          ${choices("Dagelijkse inname registreren?", "Ja", "Nee", draft.track)}
        </section>
      `);
      bindChoice("choice-yes", "choice-no", "track");
      return;
    }

    if (step === 4) {
      page(`
        <section class="card">
          <span class="eyebrow">Extra medicatie</span>
          <h1 class="page-title">Gebruik je ook medicatie die je zo nodig inneemt bij migraine?</h1>
          <p class="subtitle">Voeg alleen medicijnen toe die je zelf gebruikt. Je kunt dit ook later doen.</p>
          ${choices(
            "Gebruik je extra medicatie?",
            "Ja, ik gebruik extra medicatie",
            "Nee, nog niet",
            draft.extraChoice,
          )}
          ${
            draft.extraChoice
              ? `
            <div class="onboarding-fields">
              <h2>Jouw extra medicatie</h2>
              <div id="on-extra-list">
                ${draft.extra
                  .map(
                    (m, i) => `
                  <div class="onboarding-extra-item">
                    <div>
                      <strong>${esc(m.name)}</strong>
                      <div class="muted">${esc(m.activeIngredient || "Geen werkzame stof ingevuld")}</div>
                    </div>
                    <button type="button" class="text-link" data-remove-extra="${i}">Verwijderen</button>
                  </div>
                `,
                  )
                  .join("")}
              </div>
              <div class="divider"></div>
              <h3>Medicijn toevoegen</h3>
              ${field("Naam", "extra-name", "", "Bijvoorbeeld paracetamol")}
              ${field("Werkzame stof (optioneel)", "extra-active", "", "Werkzame stof")}
              ${field("Standaarddosering (optioneel)", "extra-dose", "", "Bijvoorbeeld 500 mg")}
              ${field("Opmerkingen (optioneel)", "extra-notes", "", "Aanvullende informatie")}
              <button type="button" class="btn soft full" id="add-extra">+ Medicatie toevoegen</button>
            </div>`
              : ""
          }
        </section>
      `);

      bindChoice("choice-yes", "choice-no", "extraChoice");

      if (draft.extraChoice) {
        $("add-extra").onclick = () => {
          const name = $("extra-name").value.trim();
          if (!name) return toast("Vul eerst een medicijnnaam in.");

          draft.extra.push({
            name,
            activeIngredient: $("extra-active").value.trim(),
            dose: $("extra-dose").value.trim(),
            notes: $("extra-notes").value.trim(),
          });

          renderStep();
        };

        document.querySelectorAll("[data-remove-extra]").forEach((button) => {
          button.onclick = () => {
            draft.extra.splice(Number(button.dataset.removeExtra), 1);
            renderStep();
          };
        });
      }
      return;
    }

    if (step === 5) {
      page(
        `
        <section class="hero onboarding-hero">
          <div class="mioura-mark">M</div>
          <span class="eyebrow">Klaar om te beginnen</span>
          <h1>Jouw Mioura is ingesteld.</h1>
          <p>Controleer hieronder je gegevens. Je kunt ze later altijd aanpassen.</p>
        </section>
        <section class="card onboarding-summary">
          <div class="summary-row">
            <span class="muted">Naam</span>
            <strong>${esc(draft.name || "Niet ingevuld")}</strong>
          </div>
          <div class="divider"></div>
          <div class="summary-row">
            <span class="muted">Dagelijkse medicatie</span>
            <strong>${draft.daily ? esc(draft.dailyName) : "Geen"}</strong>
          </div>
          ${
            draft.daily
              ? `
            <div class="summary-row">
              <span class="muted">Dosering</span>
              <strong>${esc(draft.dailyDose || "Niet ingevuld")}</strong>
            </div>
            <div class="summary-row">
              <span class="muted">Inname bijhouden</span>
              <strong>${draft.track ? "Ja" : "Nee"}</strong>
            </div>`
              : ""
          }
          <div class="divider"></div>
          <div class="summary-row">
            <span class="muted">Extra medicatie</span>
            <strong>${draft.extra.length ? draft.extra.map((m) => esc(m.name)).join(", ") : "Geen"}</strong>
          </div>
        </section>
      `,
        "Start met Mioura",
      );

      $("on-next").onclick = finish;
      return;
    }
  };

  const finish = () => {
    const d = MiouraStore.get();
    const current = d.dailyMedication.current;

    d.onboarding.userName = draft.name;

    if (draft.daily) {
      const sameMedication =
        current &&
        current.name === draft.dailyName &&
        (current.startDate || "") === draft.dailyStart;

      if (!sameMedication) {
        if (current) {
          const confirmed = confirm(
            "Je hebt al dagelijkse medicatie ingesteld. Wil je deze vervangen door de nieuwe medicatie? De bestaande medicatie wordt bewaard in je medicatiehistorie.",
          );
          if (!confirmed) return;
        }

        MiouraData.setDailyMedication({
          name: draft.dailyName,
          activeIngredient: draft.dailyActive,
          dose: draft.dailyDose,
          startDate: draft.dailyStart,
          notes: draft.dailyNotes,
        });
      } else {
        current.activeIngredient = draft.dailyActive;
        current.dose = draft.dailyDose;
        current.notes = draft.dailyNotes;
        current.startDate = draft.dailyStart;
      }

      d.settings.trackDailyMedicationIntake = !!draft.track;
    } else {
      if (current) {
        const confirmed = confirm(
          "Er staat nog dagelijkse medicatie ingesteld. Wil je deze beëindigen? De medicatie wordt bewaard in je medicatiehistorie.",
        );
        if (!confirmed) return;
        MiouraData.stopDailyMedication();
      }
      d.settings.trackDailyMedicationIntake = false;
    }

    const existingIds = new Set(
      (d.extraMedications || []).map((m) => m.id).filter(Boolean),
    );

    draft.extra.forEach((m) => {
      if (m.id && existingIds.has(m.id)) return;
      MiouraData.addExtraMedication({
        name: m.name,
        activeIngredient: m.activeIngredient,
        dose: m.dose,
        notes: m.notes,
      });
    });

    d.onboarding.completed = true;
    d.onboarding.completedAt = new Date().toISOString();

    if (!MiouraStore.save()) return;

    showNav();
    renderPage("dashboard");
    window.scrollTo(0, 0);
    toast("Welkom bij Mioura!");
  };

  return {
    render() {
      const d = MiouraStore.get();
      if (d.onboarding.completed) return false;

      if (!draft) {
        draft = readDraft();
        step = 1;
      }

      hideNav();
      renderStep();
      return true;
    },
    restart() {
      draft = readDraft();
      step = 1;
      hideNav();
      renderStep();
    },
  };
})();
