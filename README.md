# LookUpAI
LookUpAI ist ein KI-basiertes Informationssystem, das automatisch faktenbasierte Kurzbiografien über Personen aus dem Geschäftsleben erstellt.
Man übergibt eine Liste mit Namen (z. B. per Eingabefeld oder Datei-Upload), und das System durchsucht automatisch öffentliche Quellen (z. B. Handelsregister, Firmenwebseiten, Google-Ergebnisse).

Die KI analysiert, prüft die Glaubwürdigkeit der Daten und generiert daraus strukturierte Fact Sheets als PDF-Ausgabe.

Kurz gesagt:
Input: Liste von Personen
Output: geprüfte Kurzbiografien als PDF

⸻

Team

Wir sind eine Gruppe von fünf Personen:
	•	Jeff Sammy Amevor
	•	Kehan Majeed (Teamsprecher)
	•	Ahmad Kalaf
	•	Afrane Kwame Berquin
	•	Mubarak Ahmad

# Projektanleitung

Dieses Projekt besteht aus einer Docker-Umgebung für **n8n**, einem oder mehreren **Workflow-JSONs** sowie einer einfachen **HTML-Oberfläche**.

Die folgenden Schritte beschreiben, wie das Projekt lokal gestartet und getestet werden kann.

---

## 1. Docker-Umgebung starten

1. Stellen Sie sicher, dass **Docker Desktop** installiert und gestartet ist.
2. Öffnen Sie ein Terminal (macOS/Linux) oder die PowerShell (Windows).
3. Navigieren Sie in das Projektverzeichnis:

```bash
cd /pfad/zum/projekt
```

4. Starten Sie die Docker-Compose-Umgebung:

```bash
docker-compose up -d
```

Docker startet nun die n8n-Instanz im Hintergrund.

---

## 2. n8n aufrufen

Sobald Docker läuft, ist n8n erreichbar unter:

```
http://localhost:5678
```

Dort kann der Workflow importiert werden.

---

## 3. Workflow importieren

1. In n8n oben rechts auf **Import** klicken.
2. Die Datei **workflow.json** auswählen und bestätigen.

### 3.1 Credentials einrichten

Damit der Workflow funktioniert, müssen die benutzten Credentials angelegt werden.

#### SerpAPI

- In n8n unter **Credentials → New → SerpAPI**
- Als API-Key den bereitgestellten Schlüssel eintragen:

```
a411225ee9daf95c81081e62cdb25ff8df2f741fd4ddddc1a5154fec7229a0dc
```

#### Postgres

- In n8n unter **Credentials → New → Postgres**
- Folgende Werte eintragen:

```
Host: postgres
Database: lookup
User: lookup
Password: lookup
Port: 5432
```

#### Ollama

- In n8n unter **Credentials → New → Postgres**
- Folgende Werte eintragen:

```
Base URL: http://host.docker.internal:11434
API Key: *leer*
```
---

## 4. Oberfläche öffnen

Die Datei **oberflaeche.html** kann einfach per Doppelklick geöffnet werden.

**Wichtig:**  
Sie muss im selben Ordner liegen wie:

- `oberflaeche.html`
- `logo.png`

Danach kann die Oberfläche sofort genutzt werden.

---

## 5. Dateistruktur (Empfehlung)

```
projekt/
│
├── docker-compose.yml
├── oberflaeche.html
└── logo.png
```


Verantwortlichkeiten

Product Owner:
 Afrane Kwame Berquin
 → Gesamtkoordination, Zieldefinition, Priorisierung der Anforderungen

Requirement Engineering:
 Kehan Majeed, Afrane Kwame Berquin
 → Sammlung und Analyse der Anforderungen, Spezifikation der Systemfunktionen

System Design & Architektur:
 Ahmad Kalaf, Jeff Sammy Amevor
 → Entwurf der Systemarchitektur, API-Struktur und Datenflussplanung

Frontend (UI & Graphical Visualization):
 Mubarak Ahmad, Kehan Majeed
 → Gestaltung und Umsetzung der Benutzeroberfläche, visuelle Darstellung der Ergebnisse

Backend (Datenanalyse & KI-Logik):
 Ahmad Kalaf, Mubarak Ahmad, Jeff Sammy Amevor
 → Implementierung der Backend-Logik, Datenverarbeitung, KI-Modelle und Schnittstellen

Continuous Integration & Testing:
 Jeff Sammy Amevor, Kehan Majeed
 → Versionskontrolle, Testautomatisierung, Deployment und Qualitätssicherung
