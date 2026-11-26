window.MiouraSettings = {
  render() {
    const d = MiouraStore.get();

    return `<section class="hero">
    <div class="eyebrow">Jouw voorkeuren</div>
      <h1 class="page-title">Instellingen</h1>
      <p class="subtitle">Beheer je profiel en je gegevens.</p>
      </section>
      <div class="card">
        <div class="field">
          <label>Naam</label>
          <input id="setting-name" value="${esc(d.onboarding.userName)}" placeholder="Je naam">
        </div>
        <button class="btn full" id="save-name">Naam opslaan</button>
      </div>
      <div class="card">
        <h2 style="font:500 20px 'Playfair Display'">Back-up en gegevens</h2>
        <p class="muted">Exporteer regelmatig een kopie van je gegevens. Je gegevens blijven op dit apparaat.</p>
        <button class="btn full" id="export-data">Back-up downloaden</button>
        <div class="field">
          <label>Back-up importeren</label>
          <input id="import-file" type="file" accept="application/json">
        </div>
        <div class="notice">Mioura bewaart gegevens lokaal in deze browser. LocalStorage is niet versleuteld. Browsergegevens wissen kan je gegevens verwijderen. Er is geen automatische synchronisatie tussen apparaten.</div>
        <button class="btn coral full" id="delete-data" style="margin-top:9px;">Alle gegevens verwijderen</button>
      </div>
      <div class="card">
        <strong>Mioura</strong>
        <div class="muted">Persoonlijk migrainejournaal · versie 1.1.8</div>
      </div>`;
  },

  bind() {
    document.getElementById("save-name").onclick = () => {
      const d = MiouraStore.get();
      d.onboarding.userName = document
        .getElementById("setting-name")
        .value.trim();

      MiouraStore.save();
      toast("Naam opgeslagen");
      renderPage("settings");
    };

    document.getElementById("export-data").onclick = () =>
      MiouraBackup.export();

    document.getElementById("import-file").onchange = (e) => {
      if (e.target.files[0]) {
        MiouraBackup.import(e.target.files[0]);
      }
    };

    document.getElementById("delete-data").onclick = () => {
      modal(`
        <span class="eyebrow">Gegevensbeheer</span>
        <h2 class="page-title">Alle gegevens verwijderen?</h2>
        <p class="subtitle">
          Weet je zeker dat je alle Mioura-gegevens wilt verwijderen?
          Dit omvat je migraineaanvallen, medicatie, innames,
          instellingen en persoonlijke gegevens.
        </p>
        <div class="notice" style="margin:16px 0">
          <strong>Let op:</strong> Deze actie kan niet ongedaan worden gemaakt.
          Maak eerst een back-up als je je gegevens wilt bewaren.
        </div>
        <div class="onboarding-navigation">
          <button class="btn ghost" id="cancel-delete">Annuleren</button>
          <button class="btn full" id="confirm-delete"
            style="background:#a43e4d;color:white">
            Ja, verwijder alles
          </button>
        </div>
      `);

      document.getElementById("cancel-delete").onclick = () => {
        closeModal();
      };

      document.getElementById("confirm-delete").onclick = () => {
        closeModal();
        MiouraStore.reset();
        toast("Alle gegevens zijn verwijderd.");
        setTimeout(() => location.reload(), 1200);
      };
    };
  },
};
