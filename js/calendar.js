window.MiouraCalendar = {
  month: new Date().getMonth(),
  year: new Date().getFullYear(),

  selected: (() => {
    const d = new Date();

    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  })(),

  render() {
    const first = new Date(this.year, this.month, 1);
    const start = (first.getDay() + 6) % 7;
    const days = new Date(this.year, this.month + 1, 0).getDate();
    const prev = new Date(this.year, this.month, 0).getDate();
    const d = MiouraStore.get();

    let cells = "";

    for (let i = 0; i < 42; i++) {
      let day = i - start + 1;
      let dt;
      let cls = "";

      if (day < 1) {
        dt = new Date(this.year, this.month - 1, prev + day);
        cls = "out";
      } else if (day > days) {
        dt = new Date(this.year, this.month + 1, day - days);
        cls = "out";
      } else {
        dt = new Date(this.year, this.month, day);
      }

      let iso = [
        dt.getFullYear(),
        String(dt.getMonth() + 1).padStart(2, "0"),
        String(dt.getDate()).padStart(2, "0"),
      ].join("-");

      const att = d.attacks.filter((a) => a.date === iso);

      const hasMedication = (d.dailyMedicationLogs || []).some(
        (m) => m.date === iso,
      );

      if (att.length) cls += " has-attack";
      if (att.some((a) => a.pain >= 8)) cls += " severe";
      if (hasMedication) cls += " has-medication";
      if (this.selected === iso) cls += " selected";

      cells += `
        <button class="cal-day ${cls}" data-day="${iso}">
          ${dt.getDate()}
        </button>
      `;
    }

    return `
      <section class="hero">
        <span class="eyebrow">Jouw geschiedenis</span>
        <h1>Kalender</h1>
        <p>Bekijk je migraineaanvallen per dag.</p>
      </section>

      <div class="card">
        <div class="row">
          <button class="text-link" id="prev-month">
            <svg xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <path d="m12 19-7-7 7-7"/>
              <path d="M19 12H5"/>
            </svg>
          </button>

          <h2 style="font:500 21px 'Playfair Display'">
            ${new Date(this.year, this.month, 1).toLocaleDateString("nl-NL", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button class="text-link" id="next-month">
            <svg xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </button>
        </div>

        <div class="calendar-grid">
          ${["ma", "di", "wo", "do", "vr", "za", "zo"]
            .map((x) => `<div class="cal-head">${x}</div>`)
            .join("")}
          ${cells}
        </div>

        <div class="muted" style="margin-top:12px">
          Lila = aanval · Koraal = hoge pijnintensiteit
        </div>
      </div>

      <div id="day-detail"></div>
    `;
  },

  bind() {
    // Vorige maand
    document.getElementById("prev-month").onclick = () => {
      this.month--;

      if (this.month < 0) {
        this.month = 11;
        this.year--;
      }

      renderPage("calendar");
    };

    // Volgende maand
    document.getElementById("next-month").onclick = () => {
      this.month++;

      if (this.month > 11) {
        this.month = 0;
        this.year++;
      }

      renderPage("calendar");
    };

    // Kalenderdagen aanklikken
    document.querySelectorAll("[data-day]").forEach((b) => {
      b.onclick = () => {
        const scrollPosition = window.scrollY;

        this.selected = b.dataset.day;

        renderPage("calendar");

        window.scrollTo({
          top: scrollPosition,
          left: 0,
          behavior: "instant",
        });
      };
    });

    // Gegevens ophalen
    const data = MiouraStore.get();

    // Migraineaanvallen van geselecteerde dag
    const attacks = data.attacks.filter((a) => a.date === this.selected);

    // Dagelijkse medicatie
    const dailyLogs = (data.dailyMedicationLogs || [])
      .filter((log) => log.date === this.selected)
      .map((log) => ({
        ...log,
        medicationName: log.medicationName || "Dagelijkse medicatie",
        type: "Dagelijks",
        effect: "Inname geregistreerd",
      }));

    // Extra medicatie
    const extraLogs = (data.extraMedicationLogs || [])
      .filter((log) => log.date === this.selected)
      .map((log) => ({
        ...log,
        type: "Extra",
      }));

    // Alle innames samenvoegen en op tijd sorteren
    const medicationLogs = [...dailyLogs, ...extraLogs].sort((a, b) =>
      (a.time || "").localeCompare(b.time || ""),
    );

    // Geselecteerde dag weergeven
    document.getElementById("day-detail").innerHTML = `
      <div class="section-head">
        <h2>Migraineaanvallen</h2>
      </div>

      ${
        attacks.length
          ? attacks
              .map(
                (a) => `
                  <div class="card row attack-card"
                    data-edit-attack="${a.id}"
                    role="button"
                    tabindex="0">

                    <div class="row">
                      <strong>
                        ${esc(a.time || "Tijd onbekend")}
                        ${a.ongoing ? "· Lopend" : ""}
                      </strong>

                      <p class="muted">
                        ${
                          (a.symptoms || []).map((s) => esc(s)).join(" · ") ||
                          "Geen symptomen ingevuld"
                        }
                      </p>

                      <span class="pill ${
                        a.pain <= 3
                          ? "pain-low"
                          : a.pain <= 7
                            ? "pain-medium"
                            : "pain-high"
                      }">
                        ${a.pain}/10
                      </span>
                    </div>
                  </div>
                `,
              )
              .join("")
          : `
            <div class="empty">
              <strong>Geen aanvallen geregistreerd</strong>
              Er is voor deze dag nog niets bijgehouden.
              ${
                attacks.length === 0
                  ? `
                    <button
                      class="btn coral full"
                      id="open-calendar-migraine"
                      style="margin-top:16px;"
                    >
                      Migraineaanval registreren
                    </button>
                  `
                  : ""
              }
            </div>
          `
      }

      <div class="section-head">
        <h2>Medicatie ingenomen</h2>
      </div>

      ${
        medicationLogs.length
          ? medicationLogs
              .map(
                (log) => `
                  <div class="card medication-log-card">
                    <div class="medication-log-header">
                      <div class="item-title">
                        ${esc(log.medicationName || "Medicatie")}
                      </div>

                      <button
                        class="text-link"
                        data-calendar-delete-log="${log.id}"
                        data-log-type="${log.type}"
                        aria-label="Inname verwijderen"
                      >
                        Verwijderen
                      </button>
                    </div>

                    <div class="medication-log-details">
                      <span>
                        ${esc(log.date || "")}
                        ${log.time ? ` · ${esc(log.time)}` : ""}
                      </span>

                      <span>
                        ${log.dose ? esc(log.dose) : "Dosering onbekend"}
                      </span>
                    </div>

                    <div class="medication-log-footer">
                      <span class="medication-log-type pill">
                        ${esc(log.type)}
                      </span>

                      <span class="medication-log-effect pill">
                        ${esc(log.effect || "Inname geregistreerd")}
                      </span>
                    </div>
                  </div>
                `,
              )
              .join("")
          : `
            <div class="empty">
              <strong>Geen innames geregistreerd</strong>
              Er zijn voor deze dag geen medicatie-innames bijgehouden.
              ${
                data.settings.trackDailyMedicationIntake &&
                data.dailyMedication.current &&
                !dailyLogs.some((log) => log.taken)
                  ? `
                    <button
                      class="btn lilac full"
                      id="open-calendar-daily-intake"
                      style="margin-top:16px"
                    >
                      Medicijn inname registreren
                    </button>
                  `
                  : ""
              }
            </div>
          `
      }
    `;
    // Migraineaanval registreren voor geselecteerde datum
    const migraineButton = document.getElementById("open-calendar-migraine");

    if (migraineButton) {
      migraineButton.onclick = () => {
        const selectedDate = this.selected;

        modal(`
          <div class="migraine-modal">
            ${MiouraMigraineForm.form({
              date: selectedDate,
            })}
          </div>
        `);

        const root = document.querySelector(".migraine-modal");

        MiouraMigraineForm.bind({ date: selectedDate }, root, true);
      };
    }
    // Dagelijkse medicatie registreren voor geselecteerde datum
    const intakeButton = document.getElementById("open-calendar-daily-intake");

    if (intakeButton) {
      intakeButton.onclick = () => {
        const selectedDate = this.selected;
        const d = MiouraStore.get();
        const medication = d.dailyMedication.current;

        if (!medication) return;

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

          <p>
            Wil je de inname van
            ${new Date(selectedDate + "T12:00:00").toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            registreren?
          </p>

          <button class="btn coral full" id="confirm-calendar-daily-intake">
            Inname registreren
          </button>
        `);

        document.getElementById("confirm-calendar-daily-intake").onclick =
          () => {
            const saved = MiouraData.logDailyMedication(
              selectedDate,
              nowTime(),
            );

            closeModal();

            if (!saved) {
              toast("Inname voor deze datum is al geregistreerd.");
              return;
            }

            toast("Inname geregistreerd");
            renderPage("calendar");
          };
      };
    }

    // Medicatie-innames verwijderen
    document
      .querySelectorAll("[data-calendar-delete-log]")
      .forEach((button) => {
        button.onclick = (e) => {
          e.stopPropagation();

          const logId = button.dataset.calendarDeleteLog;
          const logType = button.dataset.logType;

          modal(`
            <h2>Inname verwijderen?</h2>

            <p class="muted">
              Weet je zeker dat je deze medicatie-inname wilt verwijderen?
              Dit kan niet ongedaan worden gemaakt.
            </p>

            <div class="row" style="margin-top:20px">
              <button class="btn" id="cancel-calendar-delete-log">
                Annuleren
              </button>

              <button class="btn full coral"
                id="confirm-calendar-delete-log">
                Verwijderen
              </button>
            </div>
          `);

          document.getElementById("cancel-calendar-delete-log").onclick =
            () => {
              closeModal();
            };

          document.getElementById("confirm-calendar-delete-log").onclick =
            () => {
              const data = MiouraStore.get();

              if (logType === "Dagelijks") {
                data.dailyMedicationLogs = (
                  data.dailyMedicationLogs || []
                ).filter((log) => log.id !== logId);
              } else {
                data.extraMedicationLogs = (
                  data.extraMedicationLogs || []
                ).filter((log) => log.id !== logId);
              }

              MiouraStore.save();
              closeModal();
              toast("Inname verwijderd");
              renderPage("calendar");
            };
        };
      });

    // Oude aanval-bewerkknoppen, indien aanwezig
    document.querySelectorAll("[data-edit]").forEach((b) => {
      b.onclick = () => {
        const a = MiouraStore.get().attacks.find(
          (x) => x.id === b.dataset.edit,
        );

        if (a) renderPage("register", a);
      };
    });

    // Oude aanval-verwijderknoppen, indien aanwezig
    document.querySelectorAll("[data-delete]").forEach((b) => {
      b.onclick = () => {
        if (confirm("Deze aanval verwijderen?")) {
          MiouraData.deleteAttack(b.dataset.delete);
          renderPage("calendar");
        }
      };
    });

    // Aanvalkaarten bewerken
    document.querySelectorAll(".attack-card").forEach((card) => {
      const editAttack = () => {
        const id = card.dataset.editAttack;

        const attack = MiouraStore.get().attacks.find((a) => a.id === id);

        if (attack) renderPage("register", attack);
      };

      card.onclick = editAttack;

      card.onkeydown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          editAttack();
        }
      };
    });
  },
};
