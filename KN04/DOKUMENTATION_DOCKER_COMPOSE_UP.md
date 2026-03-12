# Docker Compose Up - Befehle und Erklärungen

## Was ist `docker compose up`?

Der Befehl `docker compose up` ist eine Zusammenfassung mehrerer Docker-Befehle. Er automatisiert den kompletten Prozess zum Starten einer Multi-Container-Anwendung.

---

## Befehle, die `docker compose up` automatisch ausführt

### 1. **docker compose validate / docker compose config**
```bash
docker compose config
```
**Erklärung**:
- Liest und validiert die `docker-compose.yml` Datei
- Prüft auf Syntaxfehler
- Zeigt die finale Konfiguration an

---

### 2. **docker network create (für kn04a-net)**
```bash
docker network create --driver bridge \
  --subnet 172.10.0.0/16 \
  --ip-range 172.10.5.0/24 \
  --gateway 172.10.5.254 \
  kn04a-net
```
**Erklärung**:
- Erstellt ein Bridge-Netzwerk mit dem Namen `kn04a-net`
- `--driver bridge`: Verwendet den Bridge-Treiber für lokale Netzwerkverbindung
- `--subnet 172.10.0.0/16`: Definiert das gesamte Subnetz
- `--ip-range 172.10.5.0/24`: Begrenzt die verfügbaren IPs in diesem Bereich
- `--gateway 172.10.5.254`: Setzt das Gateway für das Netzwerk
- Ermöglicht, dass Container sich gegenseitig unter Hostnamen erreichen

---

### 3. **docker build (für Web-Service)**
```bash
docker build -t kn04-web:latest -f Dockerfile .
```
**Erklärung**:
- Erstellt ein Docker Image aus dem Dockerfile
- `-t kn04-web:latest`: Tagged das Image mit Namen und Version
- `-f Dockerfile`: Verwendet die Dockerfile im aktuellen Verzeichnis (.)
- Folgende Schritte im Dockerfile werden ausgeführt:
  1. Startet mit `php:8.2-apache` als Basis-Image
  2. Installiert PHP-Extension `mysqli` für Datenbankverbindung
  3. Kopiert alle lokalen Dateien nach `/var/www/html/`

---

### 4. **docker run (für db - MariaDB)**
```bash
docker run -d \
  --name m347-kn04a-db \
  --network kn04a-net \
  --ip 172.10.5.11 \
  -p 3306:3306 \
  -e MARIADB_ROOT_PASSWORD=rootpw \
  -e MARIADB_DATABASE=kn04db \
  -e MARIADB_USER=kn04user \
  -e MARIADB_PASSWORD=kn04pass \
  mariadb:latest
```
**Erklärung**:
- Startet MariaDB Container
- `-d`: Detached Mode (läuft im Hintergrund)
- `--name m347-kn04a-db`: Container-Name
- `--network kn04a-net`: Verbindung zum Bridge-Netzwerk
- `--ip 172.10.5.11`: Statische IP im Netzwerk
- `-p 3306:3306`: Port-Mapping (Host:Container)
- `-e`: Setzt Umgebungsvariablen:
  - `MARIADB_ROOT_PASSWORD=rootpw`: Root-Passwort
  - `MARIADB_DATABASE=kn04db`: Erstellt automatisch Datenbank
  - `MARIADB_USER=kn04user`: Benutzer für DB-Zugriff
  - `MARIADB_PASSWORD=kn04pass`: Passwort des Benutzers
- `mariadb:latest`: Verwendet offizielles MariaDB Image

---

### 5. **docker run (für web - Apache/PHP)**
```bash
docker run -d \
  --name m347-kn04a-web \
  --network kn04a-net \
  --ip 172.10.5.10 \
  -p 8080:80 \
  --depends-on m347-kn04a-db \
  kn04-web:latest
```
**Erklärung**:
- Startet Web-Container (Apache + PHP)
- `-d`: Detached Mode
- `--name m347-kn04a-web`: Container-Name
- `--network kn04a-net`: Verbindung zum Netzwerk
- `--ip 172.10.5.10`: Statische IP im Netzwerk
- `-p 8080:80`: Port-Mapping (Host:Container) - Web auf Port 8080 erreichbar
- `--depends-on`: Startet nur nach dem DB-Container
- `kn04-web:latest`: Verwendet das gebaute Image

---

### 6. **Automatische Container-Verbindung**
- Alle Container im Netzwerk `kn04a-net` können sich gegenseitig erreichen
- Hostname-Auflösung funktioniert automatisch:
  - Web-Container kann sich zur DB verbinden via Hostname `db`
  - DB-Container ist unter dem Namen `db` erreichbar

---

## Zusammenfassung

**`docker compose up -d`** führt folgende Schritte aus:

| Schritt | Befehl | Zweck |
|---------|--------|--------|
| 1 | Validieren | docker-compose.yml prüfen |
| 2 | Netzwerk erstellen | Bridge-Netzwerk mit definierten Parametern |
| 3 | Image bauen | Web-Image aus Dockerfile erstellen |
| 4 | DB starten | MariaDB mit Umgebungsvariablen starten |
| 5 | Web starten | Apache/PHP mit abhängiger KN04db |
| 6 | Netzwerk verbinden | Alle Container im Netzwerk verbinden |

---

## Netzwerk-Konfiguration Details

```
Netzwerk Name: kn04a-net
Driver: bridge
Subnet: 172.10.0.0/16
IP Range: 172.10.5.0/24
Gateway: 172.10.5.254

Container IPs:
- Web (m347-kn04a-web): 172.10.5.10
- DB (m347-kn04a-db): 172.10.5.11
```

---

## Wie funktioniert die Kommunikation?

1. **Web → DB**: Der Web-Container verbindet sich zu `db` (Hostname)
   - Docker's interne DNS löst `db` zu `172.10.5.11` auf
   - Die db.php verwendet `$host = "db"`

2. **localhost → Web**: Von außen (localhost:8080)
   - Port 8080 (Host) leitet zu Port 80 (Container) weiter
   - Apache/PHP antwortet auf HTTP-Requests

3. **localhost → DB**: Von außen (localhost:3306)
   - Port 3306 (Host) leitet zu Port 3306 (Container) weiter
   - Optionale externe DB-Verbindung

