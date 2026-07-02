# IT-Systeme Trainer

Ein lokales, spielerisches Karteikarten-Lernsystem für die Klausur **„IT-Systeme und IT-Anwendungen in Unternehmen"** (Klausurseminar SS 2026, Prof. Dr. Sandbrink).

Läuft komplett offline im Browser als lokale Webanwendung – kein Server, keine Anmeldung, dein Fortschritt bleibt lokal auf deinem Rechner.

## Schnellstart

```bash
npm install      # einmalig, Abhängigkeiten installieren
npm run dev      # startet die App unter http://localhost:5173
```

Danach die angezeigte Adresse (http://localhost:5173) im Browser öffnen.

Weitere Befehle:

```bash
npm run build    # Produktions-Build nach dist/
npm run preview  # den Build lokal ausliefern
```

## Was es kann

- **Thema für Thema lernen:** Block A (Betriebliche Anwendungssysteme) und Block B (Elektronischer Handel), aufgeteilt in 19 Themen/Fragen.
- **Drei Kartentypen pro Frage** (aus den kompakten Antworten der Lernmappe):
  - **Offene Frage** – Frage → kompakte Antwort + das Original-Schaubild aus dem Skript.
  - **Multiple Choice** – eine richtige und drei plausible falsche Optionen, mit Erklärung.
  - **Schaubild erkennen** (Reverse) – aus der Beschreibung das Konzept/Modell benennen.
- **Spaced Repetition (FSRS):** Jede Karte wird zum optimalen Zeitpunkt wieder vorgelegt. Wer eine Karte nicht kann, sieht sie im selben Durchgang erneut.
- **Schaubilder:** Beim Auflösen erscheint immer die passende Original-Folie mit „So liest du das Schaubild"-Lesehilfe.
- **Klausur-Simulation:** 10 zufällige Fragen, 90-Minuten-Timer (Ziel: 9 Min pro Frage, 10 Punkte), Selbstbewertung und geschätzte Punktzahl.
- **Gamification:** Tages-Streak, XP/Level, Mastery-Fortschritt pro Thema und gesamt.
- **Persistenz:** Fortschritt wird in `localStorage` gespeichert; Reset-Knopf im Footer.

## Datenquelle

Die Karteninhalte stammen aus den verifizierten kompakten Antworten der Lernmappe und den (um durchgestrichene Folien) bereinigten Schaubildern:

- `src/data/cards.json` – 19 Fragen mit kompakter Antwort, Multiple-Choice, Reverse und Schaubild-Verweis.
- `public/schaubilder/` – die klausurrelevanten Original-Folien (nur nicht durchgestrichene).

## Technik

- **Vite 8** + **React 19** + **TypeScript**
- **Tailwind CSS 4** (Styling)
- **ts-fsrs** (Free Spaced Repetition Scheduler – moderner Spaced-Repetition-Algorithmus)

## Projektstruktur

```
src/
  data/cards.json        Kartendaten (19 Fragen)
  lib/
    deck.ts              Kartendaten -> Lern-Items + Themen
    srs.ts               FSRS-Scheduler-Wrapper + Mastery
    store.ts             Fortschritts-Store (localStorage)
  components/
    Home.tsx             Übersicht / Themen-Dashboard
    Study.tsx            Lern-Session-Engine
    Exam.tsx             Klausur-Simulation
    cards.tsx            Karten (offen / MC / reverse)
    ui.tsx               Schaubild, Bewertungsleiste, Fortschritt
  App.tsx                App-Shell + Kopfzeile (Streak/Level/Mastery)
public/schaubilder/      Original-Folien als PNG
```
