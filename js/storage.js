(() => {
  const KEY = "miouraData";
  const fresh = () => ({
    version: 1,
    onboarding: { completed: false, userName: "", completedAt: null },
    settings: {
      theme: "light",
      dateFormat: "DD-MM-YYYY",
      timeFormat: "24h",
      trackDailyMedicationIntake: false,
    },
    attacks: [],
    dailyMedication: { current: null, history: [] },
    dailyMedicationLogs: [],
    extraMedications: [],
    extraMedicationLogs: [],
  });
  const load = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      const d = JSON.parse(raw);
      return {
        ...fresh(),
        ...d,
        onboarding: { ...fresh().onboarding, ...d.onboarding },
        settings: { ...fresh().settings, ...d.settings },
        dailyMedication: { ...fresh().dailyMedication, ...d.dailyMedication },
      };
    } catch (e) {
      console.error("Mioura-data kon niet worden gelezen", e);
      return fresh();
    }
  };
  let data = load();
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      alert(
        "Opslaan is niet gelukt. Maak ruimte vrij in je browser of exporteer eerst je gegevens.",
      );
      return false;
    }
  };
  const id = () =>
    crypto?.randomUUID
      ? crypto.randomUUID()
      : "m-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  window.MiouraStore = {
    get: () => data,
    save,
    reset: () => {
      data = fresh();
      save();
    },
    id,
    fresh,
  };
})();
