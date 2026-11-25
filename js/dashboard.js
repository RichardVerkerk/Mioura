window.MiouraDashboard = {
  render() {
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
    </section>

    <div class="${
      d.settings.trackDailyMedicationIntake && d.dailyMedication.current
        ? `grid grid-dashboard-2`
        : ""
    }">
      <div class="card dashboard-stats-card" style="display: flex">
      <button class="btn coral hero-button" data-go="register" style="height:auto;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-lightning preview-icon"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>
      Migraine registreren</button>
      </div>

      ${
        d.settings.trackDailyMedicationIntake && d.dailyMedication.current
          ? (() => {
              const intakeToday = d.dailyMedicationLogs.find(
                (log) => log.date === today() && log.taken,
              );

              return `
                <div class="card dashboard-stats-card">
                  ${
                    intakeToday
                      ? `
                        <div class="medication-taken-message"  style="text-align: center;">
                          <div>
                            <strong>Medicijnen ingenomen</strong>
                            <div class="muted">
                              ${new Date(
                                `${intakeToday.date}T${intakeToday.time}`,
                              ).toLocaleDateString("nl-NL", {
                                day: "numeric",
                                month: "long",
                              })}
                              om ${esc(intakeToday.time)}
                            </div>
                          </div>
                        </div>
                      `
                      : `
                        <button class="btn lilac hero-button" id="open-daily-intake">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-pill preview-icon"
                          >
                            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                            <path d="m8.5 8.5 7 7" />
                          </svg>
                          <span id="daily-intake-label">Inname medicijnen</span>
                        </button>
                      `
                  }
                </div>
              `;
            })()
          : ""
      }

    </div>

    <div class="grid grid-dashboard-3">
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
      <button class="text-link" data-go="calendar">Bekijk kalender <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right preview-icon"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
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
    }<div class="section-head"><h2>Dagelijkse medicatie</h2><button class="text-link" data-go="medication">Beheren <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right preview-icon"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button></div>${d.dailyMedication.current ? `<div class="card row"><div><strong>${esc(d.dailyMedication.current.name)}</strong><div class="muted">${esc(d.dailyMedication.current.dose || "Dosering niet ingevuld")}</div></div><span class="pill">Actief</span></div>` : `<div class="card muted">Geen dagelijkse medicatie ingesteld.</div>`}`;
  },
  updateIntakeButton() {
    const d = MiouraStore.get();
    const button = document.getElementById("open-daily-intake");

    if (!button) return;

    const takenToday = d.dailyMedicationLogs.some(
      (log) => log.date === today() && log.taken,
    );

    if (takenToday) {
      button.outerHTML = `
        <div class="medication-taken-message">
          <span>✓</span> Medicijnen ingenomen
        </div>
      `;
    }
  },
  bind() {
    this.updateIntakeButton();
    document
      .querySelectorAll("[data-go]")
      .forEach((b) => (b.onclick = () => renderPage(b.dataset.go)));

    const intakeButton = document.getElementById("open-daily-intake");

    if (intakeButton) {
      intakeButton.onclick = () => {
        const d = MiouraStore.get();
        const medication = d.dailyMedication.current;

        if (!medication) {
          modal(`
            <h2>Dagelijkse medicatie</h2>
            <p class="muted">
              Je hebt nog geen dagelijkse medicatie ingesteld.
              Je kunt dit toevoegen via Medicijnen.
            </p>
          `);
          return;
        }

        modal(`
          <div class="eyebrow">Dagelijkse medicatie</div>
          <h2>${esc(medication.name)}</h2>
          ${
            medication.activeIngredient
              ? `<p class="muted">${esc(medication.activeIngredient)}</p>`
              : ""
          }
          ${
            medication.dose
              ? `<p class="muted">Dosering: ${esc(medication.dose)}</p>`
              : ""
          }
          <p>Wil je de inname van vandaag registreren?</p>
          <button class="btn coral full" id="confirm-daily-intake">
            Inname registreren
          </button>
        `);

        document.getElementById("confirm-daily-intake").onclick = () => {
          const saved = MiouraData.logDailyMedication();

          if (!saved) {
            closeModal();
            toast("Geen dagelijkse medicatie gevonden.");
            return;
          }

          closeModal();

          const button = document.getElementById("open-daily-intake");

          if (button) {
            button.outerHTML = `
              <div class="medication-taken-message">
                <span>✓</span>
                <div>
                  <strong>Medicijnen ingenomen</strong>
                  <div class="muted">
                    ${new Date().toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "long",
                    })} om ${nowTime()}
                  </div>
                </div>
              </div>
            `;
          }

          toast("Inname geregistreerd");
        };
      };
    }
  },
};
