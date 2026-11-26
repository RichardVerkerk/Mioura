window.MiouraAnalytics = {
  render() {
    const d = MiouraStore.get(),
      att = d.attacks;
    const avg = att.length
      ? (att.reduce((s, a) => s + (+a.pain || 0), 0) / att.length).toFixed(1)
      : "—";
    const symptoms = {};
    att.forEach((a) =>
      (a.symptoms || []).forEach((s) => (symptoms[s] = (symptoms[s] || 0) + 1)),
    );
    const top = Object.entries(symptoms)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const meds = {};
    d.extraMedicationLogs.forEach(
      (l) => (meds[l.medicationName] = (meds[l.medicationName] || 0) + 1),
    );
    return `
    <section class="hero">
      <span class="eyebrow">Persoonlijke patronen</span>
      <h1>Inzichten</h1>
      <p>Een overzicht op basis van wat je zelf hebt bijgehouden.</p>
    </section>
    <div class="grid grid-analytics">
      <div class="card dashboard-stats-card">
        <div class="dashboard-card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap preview-icon"><path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/></svg>
        </div>
        <div class="stat-value">${att.length}</div>
        <div class="stat-label">Aanvallen totaal</div>
      </div>
      <div class="card dashboard-stats-card">
        <div class="dashboard-card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gauge preview-icon"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
        </div>
        <div class="stat-value">${avg}</div>
        <div class="stat-label">Gemiddelde pijn</div>
      </div>
    </div>
    <div class="section-head">
      <h2>Aanvallen per maand</h2>
    </div>
    <div class="card">
      ${att.length ? '<canvas id="att-chart" height="190"></canvas>' : '<div class="empty">Registreer een aanval om hier je verloop te zien.</div>'}
    </div>
    <div class="section-head">
      <h2>Veel voorkomende symptomen</h2>
    </div>

      ${
        top.length
          ? top
              .map(
                ([s, n]) => `
                <div class="card">
        <div style="margin:13px 0">
          <div class="row">
          <span>${esc(s)}</span>
          <strong>${n}</strong>
          </div>
        <div class="bar">
          <span style="width:${Math.max(8, (n / top[0][1]) * 100)}%"></span>
        </div>
      </div>
      </div>
      `,
              )
              .join("")
          : `<div class="empty">Nog geen medicatie-innames geregistreerd.</div>`
      }
    <div class="section-head">
      <h2>Extra medicatie inname</h2>
    </div>

      ${
        Object.keys(meds).length
          ? Object.entries(meds)
              .sort((a, b) => b[1] - a[1])
              .map(
                ([m, n]) =>
                  `<div class="card"><div class="row" style="padding:8px 0"><span>${esc(m)}</span><strong>${n}×</strong></div></div>`,
              )
              .join("")
          : '<div class="empty">Nog geen medicatie-innames geregistreerd.</div>'
      }
    `;
  },
  bind() {
    const att = MiouraStore.get().attacks;
    if (!att.length || !window.Chart) return;
    const by = {};
    att.forEach((a) => {
      const k = a.date.slice(0, 7);
      by[k] = (by[k] || 0) + 1;
    });
    const labels = Object.keys(by).sort();
    new Chart(document.getElementById("att-chart"), {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Aanvallen",
            data: labels.map((k) => by[k]),
            backgroundColor: "#F28D91",
            borderRadius: 8,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  },
};
