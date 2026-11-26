window.MiouraCalendar = {
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
  selected: (() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  })(),
  render() {
    const first = new Date(this.year, this.month, 1),
      start = (first.getDay() + 6) % 7,
      days = new Date(this.year, this.month + 1, 0).getDate(),
      prev = new Date(this.year, this.month, 0).getDate(),
      d = MiouraStore.get();
    let cells = "";
    for (let i = 0; i < 42; i++) {
      let day = i - start + 1,
        dt,
        cls = "";
      if (day < 1) {
        dt = new Date(this.year, this.month - 1, prev + day);
        cls = "out";
      } else if (day > days) {
        dt = new Date(this.year, this.month + 1, day - days);
        cls = "out";
      } else dt = new Date(this.year, this.month, day);
      let iso = dt.toISOString().slice(0, 10),
        att = d.attacks.filter((a) => a.date === iso);
      if (att.length) cls += " has-attack";
      if (att.some((a) => a.pain >= 8)) cls += " severe";
      if (this.selected === iso) cls += " selected";
      cells += `<button class="cal-day ${cls}" data-day="${iso}">${dt.getDate()}</button>`;
    }
    return `
    <section class="hero">
      <span class="eyebrow">Jouw geschiedenis</span>
      <h1>Kalender</h1>
      <p>Bekijk je migraineaanvallen per dag.</p>
    </section>
    <div class="card">
      <div class="row">
        <button class="text-link" id="prev-month"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left preview-icon"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg></button>
        <h2 style="font:500 21px 'Playfair Display'">${new Date(this.year, this.month, 1).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}</h2>
        <button class="text-link" id="next-month"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right preview-icon"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
    </div>
    <div class="calendar-grid">
      ${["ma", "di", "wo", "do", "vr", "za", "zo"].map((x) => `<div class="cal-head">${x}</div>`).join("")}${cells}
    </div>
    <div class="muted" style="margin-top:12px">
      Lila = aanval · Koraal = hoge pijnintensiteit
    </div>
    </div>
    <div id="day-detail">
    </div>`;
  },
  bind() {
    document.getElementById("prev-month").onclick = () => {
      this.month--;
      if (this.month < 0) {
        this.month = 11;
        this.year--;
      }
      renderPage("calendar");
    };
    document.getElementById("next-month").onclick = () => {
      this.month++;
      if (this.month > 11) {
        this.month = 0;
        this.year++;
      }
      renderPage("calendar");
    };
    document.querySelectorAll("[data-day]").forEach(
      (b) =>
        (b.onclick = () => {
          this.selected = b.dataset.day;
          renderPage("calendar");
        }),
    );
    const attacks = MiouraStore.get().attacks.filter(
      (a) => a.date === this.selected,
    );
    document.getElementById("day-detail").innerHTML = `
      <div class="section-head">
        <h2>${new Date(this.selected + "T12:00:00").toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</h2>
        </div>
        ${
          attacks.length
            ? attacks
                .map(
                  (a) => `
          <div class="card row attack-card" data-edit-attack="${a.id}" role="button" tabindex="0">
            <div class="row">
              <strong>${a.time} ${a.ongoing ? "· Lopend" : ""}</strong>
              <p class="muted">${(a.symptoms || []).join(" · ") || "Geen symptomen ingevuld"}</p>

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
            <strong>Geen aanvallen geregistreerd</strong>Er is voor deze dag nog niets bijgehouden.
        </div>
        `
        }`;
    document.querySelectorAll("[data-edit]").forEach(
      (b) =>
        (b.onclick = () => {
          const a = MiouraStore.get().attacks.find(
            (x) => x.id === b.dataset.edit,
          );
          renderPage("register", a);
        }),
    );
    document.querySelectorAll("[data-delete]").forEach(
      (b) =>
        (b.onclick = () => {
          if (confirm("Deze aanval verwijderen?")) {
            MiouraData.deleteAttack(b.dataset.delete);
            renderPage("calendar");
          }
        }),
    );
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
