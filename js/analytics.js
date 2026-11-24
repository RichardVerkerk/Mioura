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
    return `<div class="eyebrow">Persoonlijke patronen</div><h1 class="page-title">Inzichten</h1><p class="subtitle">Een overzicht op basis van wat je zelf hebt bijgehouden.</p><div class="grid grid-analytics"><div class="card"><div class="stat-label">Aanvallen totaal</div><div class="stat-value">${att.length}</div></div><div class="card"><div class="stat-label">Gemiddelde pijn</div><div class="stat-value">${avg}</div><div class="stat-foot">op een schaal van 0–10</div></div></div><div class="card"><h2 style="font:500 20px 'Playfair Display'">Aanvallen per maand</h2>${att.length ? '<canvas id="att-chart" height="190"></canvas>' : '<div class="empty">Registreer een aanval om hier je verloop te zien.</div>'}</div><div class="card"><h2 style="font:500 20px 'Playfair Display'">Veelvoorkomende symptomen</h2>${top.length ? top.map(([s, n]) => `<div style="margin:13px 0"><div class="row"><span>${esc(s)}</span><strong>${n}</strong></div><div class="bar"><span style="width:${Math.max(8, (n / top[0][1]) * 100)}%"></span></div></div>`).join("") : '<div class="muted">Nog onvoldoende gegevens.</div>'}</div><div class="card"><h2 style="font:500 20px 'Playfair Display'">Extra medicatie</h2>${
      Object.keys(meds).length
        ? Object.entries(meds)
            .sort((a, b) => b[1] - a[1])
            .map(
              ([m, n]) =>
                `<div class="row" style="padding:8px 0"><span>${esc(m)}</span><strong>${n}×</strong></div>`,
            )
            .join("")
        : '<div class="muted">Nog geen medicatie-innames geregistreerd.</div>'
    }</div>`;
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
