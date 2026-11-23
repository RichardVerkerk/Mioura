window.MiouraData = {
  addAttack(a) {
    const d = MiouraStore.get();
    a.id = a.id || MiouraStore.id();
    d.attacks.push(a);
    MiouraStore.save();
    return a;
  },
  updateAttack(a) {
    const d = MiouraStore.get(),
      i = d.attacks.findIndex((x) => x.id === a.id);
    if (i >= 0) d.attacks[i] = a;
    MiouraStore.save();
  },
  deleteAttack(id) {
    const d = MiouraStore.get();
    d.attacks = d.attacks.filter((a) => a.id !== id);
    d.extraMedicationLogs.forEach((l) => {
      if (l.attackId === id) l.attackId = null;
    });
    MiouraStore.save();
  },
  addExtraMedication(m) {
    const d = MiouraStore.get();
    m.id = MiouraStore.id();
    m.active = true;
    d.extraMedications.push(m);
    MiouraStore.save();
  },
  logExtraMedication(l) {
    const d = MiouraStore.get();
    l.id = MiouraStore.id();
    d.extraMedicationLogs.push(l);
    MiouraStore.save();
  },
  setDailyMedication(m) {
    const d = MiouraStore.get();
    if (d.dailyMedication.current) {
      d.dailyMedication.history.push({
        ...d.dailyMedication.current,
        active: false,
        endDate: m.startDate || new Date().toISOString().slice(0, 10),
      });
    }
    d.dailyMedication.current = { ...m, id: MiouraStore.id(), active: true };
    MiouraStore.save();
  },
  stopDailyMedication() {
    const d = MiouraStore.get();
    if (d.dailyMedication.current) {
      d.dailyMedication.history.push({
        ...d.dailyMedication.current,
        active: false,
        endDate: new Date().toISOString().slice(0, 10),
      });
      d.dailyMedication.current = null;
    }
    MiouraStore.save();
  },
};
