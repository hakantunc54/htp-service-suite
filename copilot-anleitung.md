# HTP Service Suite - AI / Copilot Context

## Projektübersicht
Die **HTP Service Suite** ist ein maßgeschneidertes CRM- und Dispositionssystem für ein Telekommunikations-Außendienstunternehmen (Subunternehmer), das Glasfaseranschlüsse (FTTB), Breitband-Dienste (BDE), Endleitungsmontagen und DPU-Aufbauten beim Endkunden installiert. 

Das System dient der kompletten Auftragsabwicklung: Vom Import roher Kundendaten über die Disposition auf verschiedene Einsatzfahrzeuge, der Terminvereinbarung mit dem Endkunden, bis hin zur detaillierten Leistungsabrechnung und dem Export für die Rechnungsstellung.

## Technologie-Stack
- **Framework:** Next.js 16.3.1 (App Router, Server Actions)
- **Frontend:** React, Tailwind CSS, Lucide React (Icons), Sonner (Toasts)
- **Datenbank:** SQLite via Prisma ORM
- **Authentifizierung:** NextAuth.js
- **Deployment:** Docker & Docker Compose (gehostet auf einer Proxmox VM)

## Kernfunktionen & Architektur

### 1. Dashboard (`/`)
- Aggregierte Umsatzstatistik (Tag/Woche/Monat/Jahr).
- Übersicht über erfasste Aufträge, vereinbarte Termine, offene Rückrufe und offene Abrechnungen.
- **Wichtig:** Die Umsatzberechnung berücksichtigt dynamisch berechnete Anfahrtskosten (pro Auto/Tag), die nicht fest im `orderValue` der Datenbank stehen dürfen, um Doppelzählungen zu vermeiden.

### 2. Kunden & Aufträge (`/orders`)
- Zentrale Listenansicht aller Aufträge mit umfangreichen Filterfunktionen (Datum, Status, Suchtext).
- Inline-Statusänderungen (z.B. "Erfolgreich abgeschlossen", "Abbruch").
- Detail-Modal für jeden Auftrag (Kundeninfos, Historie, Bemerkungen).
- **Abrechnungs-Modal:** Ermöglicht das Hinzufügen von Leistungspositionen (Service Items). Anfahrten werden hier bewusst ausgeblendet, da diese beim Export/Dashboard automatisch berechnet werden.

### 3. Disposition & Planung (`/planning`)
- Tagesansicht zur Zuweisung von Aufträgen an Fahrzeuge (Auto 1, Auto 2, etc.) per Drag & Drop oder Dropdown.
- Tagesexport-Funktion: Generiert eine CSV-Datei für die Monteure/Routenplanung, wobei das Datum für den Export flexibel über ein Modal wählbar ist.

### 4. Terminabsprachen (`/terminabsprachen`)
- Übersicht aller Kunden, die noch keinen Termin haben.
- Telefon-Funktion: Loggt Anrufversuche (1. Versuch, 2. Versuch).
- Setzen von Terminen (Datum & Uhrzeit) oder Markieren als Rückruf.

### 5. Smart Import (`/import`)
- Importiert Aufträge aus unstrukturierten CSV/Excel-Daten des Auftraggebers.
- Erkennt Duplikate anhand der VOS-Nummer / Port-Nummer und aktualisiert diese entsprechend.

### 6. Abrechnung & Export (`/billing` & `/api/export-billing`)
- Übersicht aller abgerechneten Aufträge.
- Generierung des finalen Excel-Exports.
- **Logik des Exports:** Teilt Aufträge in "FTTB" und "BDE" auf. Berechnet automatisch 1x Anfahrt pro Auto pro Tag (unterschiedliche Preise, je nachdem ob >= 12 oder < 12 Aufträge pro Tag/Auto geschafft wurden).

## Besonderheiten & Fallstricke (Copilot Guidelines)

1. **Datei-Encoding unter Windows/PowerShell:**
   Reguläre Ausdrücke und Dateiänderungen via PowerShell (`Set-Content`) zerstören oft Umlaute (aus `für` wird `fr`). Änderungen an Dateien sollten immer UTF-8 sicher durchgeführt werden. Dateiendungen in Windows/Regex (`\r\n` vs `\n`) immer berücksichtigen.
   
2. **Datums-Handling & Zeitzonen (WICHTIG):**
   Prisma speichert Daten in UTC. Vergleiche niemals UI-Datums-Strings direkt mit `date.toISOString().split('T')[0]`, da dies um 22:00 Uhr deutscher Zeit bereits auf den nächsten Tag springt. 
   Nutze immer lokale Formatierungen (z.B. `d.getFullYear()`, `d.getMonth()`, `d.getDate()`), wenn nach Kalendertagen gefiltert wird.

3. **Umsatzberechnung (Anfahrt):**
   Die Leistung "Anfahrt" darf dem Nutzer nicht manuell im Abrechnungs-Modal angeboten werden. Anfahrten werden bei Auswertungen (Dashboard) und beim Export dynamisch anhand der `groupKey = dateStr_vehicle` berechnet. Das direkte Hinzufügen zum `orderValue` in der Datenbank führt zu Doppelzählungen.

4. **DPU-Aufbau:**
   Ist ein teurer Sondereinsatz (z.B. 350 €). Darf nicht in der regulären FTTB-Excel-Tabelle auftauchen, sondern erhält zukünftig einen eigenen Export-Reiter. Gehört aber zum Gesamtumsatz.

5. **Modals statt Browser-Popups:**
   Es dürfen **keine** nativen `window.confirm()` oder `window.prompt()` Aufrufe verwendet werden. Das Projekt nutzt durchgehend React-State-basierte Modal-Overlays mit Tailwind CSS.

## Zukünftige geplante Features (Roadmap)
- **DPU-Aufbau Export:** Ein dritter Reiter beim monatlichen Abrechnungsexport speziell für DPU-Aufbauten mit eigenen Spalten.
- **Erweiterte Statistiken:** Noch tiefere Auswertungen der Monteur-Leistungen pro Auto.

## Befehle für Entwicklung & Deployment
- Lokale Entwicklung: `npm run dev`
- Build testen: `npm run build`
- Live Update auf Proxmox Server: `git pull && docker compose build && docker compose up -d`
