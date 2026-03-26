# Dokumentation – KN04 A Teil b
## Verwendung eigener Images mit Docker Compose

---

## Ausgangslage

In Teil a wurde die Umgebung lokal mit Docker Compose aufgebaut. Dabei wurde der Webserver noch über ein Dockerfile gebaut und die Datenbank mit einem offiziellen MariaDB-Image gestartet.

In Teil b sollten statt lokaler Builds die bereits publizierten eigenen Images aus Docker Hub verwendet werden. Ausserdem musste die Docker-Compose-Datei bereinigt und ein anderer IP-Range verwendet werden.

---

## Ziel

Ziel war es, die Web- und Datenbankcontainer mit bereits publizierten Images zu starten und die Verbindung der beiden Container über Docker Compose zu testen.

---

## Verwendete Docker-Hub-Images

Für Teil b wurden folgende publizierte Images verwendet:

- `michaeleatontbz/kn02b-web:kn02b-web`
- `michaeleatontbz/kn02b-db:kn02b-db`

Diese Images wurden anstelle eines lokalen Build-Vorgangs eingesetzt.

---

## Anpassungen an der Docker-Compose-Datei

Die bestehende `docker-compose.yml` aus Teil a wurde angepasst.

### Durchgeführte Änderungen

- Der Eintrag `build:` wurde entfernt
- Das Dockerfile wird in Teil b nicht mehr verwendet
- Stattdessen wurden die publizierten Docker-Hub-Images mit `image:` eingebunden
- Die Containernamen wurden auf `m347-kn04b-web` und `m347-kn04b-db` angepasst
- Es wurde ein neues Docker-Netzwerk mit einem anderen IP-Range definiert
- Für die Datenbank wurden weiterhin die benötigten Umgebungsvariablen gesetzt

### Verwendete docker-compose.yml

```yaml
services:
  web:
    container_name: m347-kn04b-web
    image: michaeleatontbz/kn02b-web:kn02b-web
    ports:
      - "8080:80"
    depends_on:
      - db
    networks:
      kn04b-net:

  db:
    container_name: m347-kn04b-db
    image: michaeleatontbz/kn02b-db:kn02b-db
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: rootpwd
      MARIADB_DATABASE: kn04db
      MARIADB_USER: kn04user
      MARIADB_PASSWORD: kn04pass
    volumes:
      - db_data_b:/var/lib/mysql
    networks:
      kn04b-net:

networks:
  kn04b-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.31.0.0/16
          ip_range: 172.31.10.0/24
          gateway: 172.31.10.254

volumes:
  db_data_b:
```

---

## Verwendete db.php

```php
<?php
$host = "db";
$user = "kn04user";
$pass = "kn04pass";
$dbname = "kn04db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Verbindung fehlgeschlagen: " . $conn->connect_error);
}

echo "Verbindung zur Datenbank erfolgreich!";

$conn->close();
?>
```

---

## Starten der Umgebung

Zum Starten der Container wurden folgende Befehle ausgeführt:

```bash
docker compose down
docker compose pull
docker compose up -d
docker compose ps
```

### Erklärung der Befehle

| Befehl | Beschreibung |
|---|---|
| `docker compose down` | Stoppt und entfernt die bestehende Compose-Umgebung |
| `docker compose pull` | Lädt die Images aus Docker Hub herunter |
| `docker compose up -d` | Erstellt und startet die Container im Hintergrund |
| `docker compose ps` | Zeigt den Status der gestarteten Container an |

---

## Aufgetretene Probleme und Lösungen

### 1. Falscher Image-Tag

Zuerst wurde versucht, die Images mit dem Tag `latest` zu verwenden. Das führte zu einem Fehler, weil auf Docker Hub kein `latest`-Tag vorhanden war.

**Fehler:** Die Images `michaeleatontbz/kn02b-web:latest` und `michaeleatontbz/kn02b-db:latest` konnten nicht gefunden werden.

**Lösung:** Mit `docker images` wurde geprüft, welche Tags lokal vorhanden sind. Dabei wurde festgestellt, dass die korrekten Tags `kn02b-web` und `kn02b-db` lauten. Anschliessend wurde die `docker-compose.yml` mit den korrekten Tags angepasst.

### 2. Netzwerk-Konflikt

Beim ersten Startversuch konnte das Docker-Netzwerk nicht erstellt werden, weil der gewählte IP-Bereich mit einem bereits bestehenden Docker-Netzwerk überlappte.

**Fehler:** Docker meldete einen Konflikt wegen überlappender IPv4-Netzwerke.

**Lösung:** Der Netzwerkbereich wurde geändert auf:

```
subnet:    172.31.0.0/16
ip_range:  172.31.10.0/24
gateway:   172.31.10.254
```

Danach konnte das Netzwerk erfolgreich erstellt werden.

---

## Test der Anwendung

### 1. Test von info.php

Die Seite `info.php` wurde im Browser unter folgender Adresse aufgerufen:

```
http://localhost:8080/info.php
```

Dabei wurde überprüft, ob die PHP-Informationsseite korrekt geladen wird und die Werte `REMOTE_ADDR` sowie `SERVER_ADDR` sichtbar sind.

### 2. Test von db.php

Die Seite `db.php` wurde im Browser unter folgender Adresse aufgerufen:

```
http://localhost:8080/db.php
```

Diese Seite testet die Verbindung des Webcontainers zur MariaDB-Datenbank.

#### Erklärung zum erwarteten Fehler bei db.php

Gemäss Aufgabenstellung wurde erwartet, dass bei `db.php` ein Fehler auftritt. Ein solcher Fehler würde entstehen, wenn die in `db.php` definierten Werte nicht mit der Konfiguration des Datenbankcontainers übereinstimmen. Beispielsweise würde die Verbindung fehlschlagen bei:

- falschem Hostnamen
- falschem Benutzernamen
- falschem Passwort
- falschem Datenbanknamen

In Docker Compose muss ausserdem als Hostname der Name des Datenbank-Services verwendet werden. In diesem Fall ist das korrekt mit `db` umgesetzt.

#### Warum in diesem Fall kein Fehler auftreten muss

In der vorliegenden Lösung wurden die Zugangsdaten in `db.php` und in der `docker-compose.yml` identisch gesetzt:

| Parameter | Wert |
|---|---|
| Host | `db` |
| Benutzer | `kn04user` |
| Passwort | `kn04pass` |
| Datenbank | `kn04db` |

Dadurch kann die Verbindung erfolgreich hergestellt werden. Falls kein Fehler auftrat, ist das technisch korrekt und liegt daran, dass die Konfiguration konsistent war.

---

## Fazit

Die Umgebung aus Teil a wurde erfolgreich auf Teil b umgestellt. Statt eines lokalen Builds wurden publizierte Docker-Hub-Images verwendet. Die `docker-compose.yml` wurde entsprechend bereinigt und das Netzwerk angepasst. Nach Korrektur des Image-Tags und des Netzwerkbereichs konnten beide Container erfolgreich gestartet werden.

Die Webanwendung war anschliessend unter `http://localhost:8080` erreichbar und die Kommunikation zwischen Web- und Datenbankcontainer konnte getestet werden.

---

## Screenshots

### Screenshot 1 – info.php

![info.php](https://raw.githubusercontent.com/michaeleaton212/Modul347/main/KN04/A/info.png)

### Screenshot 2 – db.php

![db.php](https://raw.githubusercontent.com/michaeleaton212/Modul347/main/KN04/A/db.png)