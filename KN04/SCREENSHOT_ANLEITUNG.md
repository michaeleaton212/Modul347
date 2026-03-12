# Screenshots - Anleitung für KN04a

## Screenshot 1: info.php - REMOTE_ADDR und SERVER_ADDR

### Schritte:

1. **Docker Container muss laufen**
   - Stelle sicher, dass `docker compose up -d` erfolgreich war
   - Warte 10-15 Sekunden, bis Apache vollständig gestartet ist

2. **Browser öffnen und URL eingeben**
   - URL: `http://localhost:8080/info.php`
   - Drücke Enter

3. **Nach unten scrollen**
   - Suche nach den folgenden Feldern:
     - `$_SERVER['REMOTE_ADDR']`: Die IP-Adresse des Clients (sollte die Docker Host-IP sein)
     - `$_SERVER['SERVER_ADDR']`: Die IP-Adresse des Servers (sollte 172.10.5.10 sein)

4. **Screenshot machen**
   - Halte beide Felder im Screenshot fest
   - Speichern unter: `info-screenshot.png`

### Was wird gemessen:
- **REMOTE_ADDR**: Zeigt die Absender-IP (von deinem Computer / Docker Host)
- **SERVER_ADDR**: Zeigt die Server-IP im Docker-Netzwerk (172.10.5.10)
- Dies beweist, dass der Container im Netzwerk 172.10.5.0/24 läuft

---

## Screenshot 2: db.php - Datenbankverbindung

### Schritte:

1. **Browser öffnen und URL eingeben**
   - URL: `http://localhost:8080/db.php`
   - Drücke Enter

2. **Überprüfung der Nachricht**
   - Du solltest sehen: **"Verbindung zur Datenbank erfolgreich!"**
   - Falls Fehler erscheint: Container sind nicht vollständig gestartet (warte länger)

3. **Screenshot machen**
   - Zeige die Erfolgsmeldung
   - Speichern unter: `db-screenshot.png`

### Was wird gemessen:
- Der Web-Container (172.10.5.10) verbindet sich zum DB-Container (172.10.5.11)
- Die Verbindung funktioniert über den Hostnamen `db`
- Dies beweist, dass beide Container im gleichen Netzwerk sind und kommunizieren können

---

## Fehlerbehebung

### Problem: "Connection refused" auf db.php
**Lösung**:
- Warte 15-20 Sekunden nach `docker compose up -d`
- MariaDB braucht Zeit zum vollständigen Starten
- Prüfe mit: `docker compose logs db`

### Problem: "Could not connect to localhost:8080"
**Lösung**:
- Prüfe, ob Container läuft: `docker compose ps`
- Container sollten beide als `Up` angezeigt werden
- Falls nicht: `docker compose logs web`

### Problem: "Cannot find localhost"
**Lösung**:
- Verwende `http://127.0.0.1:8080/info.php` statt localhost
- Oder prüfe deine Internet-Verbindung

---

## Docker Befehle zur Überprüfung

```bash
# Zeige alle laufenden Container
docker compose ps

# Zeige Logs des Web-Containers
docker compose logs web

# Zeige Logs des DB-Containers
docker compose logs db

# Zeige beide Container-Netzwerk-Verbindungen
docker network inspect kn04a-net

# Stoppe alle Container
docker compose down

# Starte alle Container neu
docker compose restart
```

