window.MiouraBackup = {
  export() {
    const d = MiouraStore.get(),
      blob = new Blob(
        [
          JSON.stringify(
            { app: "Mioura", exportedAt: new Date().toISOString(), data: d },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mioura-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  import(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const obj = JSON.parse(r.result);
        if (
          obj.app !== "Mioura" ||
          !obj.data ||
          !Array.isArray(obj.data.attacks)
        )
          throw Error("Dit lijkt geen geldige Mioura-back-up.");
        if (
          !confirm(
            "De huidige gegevens vervangen door de back-up? Maak zo nodig eerst een export.",
          )
        )
          return;
        localStorage.setItem("miouraData", JSON.stringify(obj.data));
        location.reload();
      } catch (e) {
        alert("Importeren mislukt: " + e.message);
      }
    };
    r.readAsText(file);
  },
};
