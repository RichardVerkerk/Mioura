# Mioura – Persoonlijk migrainejournaal

Mioura is een Nederlandstalige, mobile-first PWA voor persoonlijke registratie van migraineaanvallen en medicatie.

## Starten

De eenvoudigste manier om te testen is de map `mioura` te hosten via een lokale of online HTTPS-webserver. Open `index.html` via een server; PWA-installatie en service workers werken niet betrouwbaar via `file://`.

Voor lokaal testen met Python:

```bash
python -m http.server 8000
```

Open daarna `http://localhost:8000`.

## Online zetten

Upload de volledige map naar een hostingdienst die HTTPS aanbiedt. HTTPS is vereist voor service workers en installatie als PWA (localhost is een uitzondering voor lokaal testen).

## Installeren

- iPhone: open de HTTPS-site in Safari, tik op Deel en kies 'Zet op beginscherm'.
- Android: open de HTTPS-site in Chrome en kies 'Installeren' of 'Toevoegen aan startscherm'.

## Gegevens en back-ups

Gegevens worden lokaal opgeslagen in LocalStorage onder `miouraData`. Gebruik Instellingen → Back-up downloaden om een JSON-back-up te maken. Een back-up kan via Instellingen weer worden geïmporteerd.

## Privacybeperkingen

LocalStorage is niet versleuteld en gegevens worden niet automatisch tussen apparaten gesynchroniseerd. Browsergegevens wissen kan gegevens verwijderen. Maak regelmatig een back-up. De app verstuurt geen zelf ingevoerde gegevens naar een Mioura-server.

## Opmerking

Dit is een persoonlijke registratie-app, geen medisch hulpmiddel. De app geeft geen diagnose of doseeradvies.
