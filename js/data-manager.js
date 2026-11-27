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
  updateExtraMedicationLog(id, updatedLog) {
    const d = MiouraStore.get();
    const index = d.extraMedicationLogs.findIndex((x) => x.id === id);

    if (index === -1) return false;

    d.extraMedicationLogs[index] = {
      ...d.extraMedicationLogs[index],
      ...updatedLog,
      id,
    };

    MiouraStore.save();
    return true;
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
  logDailyMedication(date = today(), time = nowTime()) {
    const d = MiouraStore.get();
    const medication = d.dailyMedication.current;

    if (!medication) return false;

    const alreadyTaken = d.dailyMedicationLogs.some(
      (log) => log.date === date && log.taken,
    );

    if (alreadyTaken) return false;

    d.dailyMedicationLogs.push({
      id: MiouraStore.id(),
      medicationId: medication.id,
      medicationName: medication.name,
      activeIngredient: medication.activeIngredient || "",
      dose: medication.dose || "",
      date,
      time,
      taken: true,
    });

    MiouraStore.save();
    return true;
  },
};
