# KN04 – Docker Compose – Abgabe-Dokumentation

Name: Micha Eaton  
Datum: 12.03.2026  
System: Docker Desktop auf Windows (CMD/PowerShell)

---

## 1. Ziel der Aufgabe

Mit Docker Compose wird eine Multi-Container-Umgebung in einer einzigen YAML-Datei definiert und mit einem Befehl gestartet. Die Umgebung besteht aus:

- **Webserver** (`m347-kn04a-web`) — Apache/PHP, basierend auf einem eigenen Dockerfile aus KN02
- **Datenbank** (`m347-kn04a-db`) — MariaDB, direkt über das Image `mariadb:latest` konfiguriert
- **Eigenes Netzwerk** mit Subnet `172.10.0.0/16`, IP-Range `172.10.5.0/24` und Gateway `172.10.5.254`

---

## 2. Docker Compose Datei (`docker-compose.yml`)

```yaml
version: "3.8"

services:
  web:
    build: .
    container_name: m347-kn04a-web
    ports:
      - "80:80"
    networks:
      - kn04-network
    depends_on:
      - db

  db:
    image: mariadb:latest
    container_name: m347-kn04a-db
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: m347db
      MYSQL_USER: m347user
      MYSQL_PASSWORD: m347password
    networks:
      - kn04-network

networks:
  kn04-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.10.0.0/16
          ip_range: 172.10.5.0/24
          gateway: 172.10.5.254
```

> 📖 **Erklärung:**
> - `services` → definiert die einzelnen Container der Umgebung
> - `build: .` → weist Docker Compose an, das Dockerfile im aktuellen Verzeichnis zu verwenden (für den Webserver)
> - `image: mariadb:latest` → verwendet direkt das offizielle MariaDB-Image ohne eigenes Dockerfile
> - `container_name` → setzt den Namen des Containers explizit (statt dem auto-generierten Namen)
> - `ports` → mapped Port 80 des Containers auf Port 80 des Hosts (`host:container`)
> - `environment` → setzt Umgebungsvariablen für die MariaDB-Konfiguration (Root-Passwort, DB-Name, User)
> - `depends_on` → stellt sicher, dass die Datenbank vor dem Webserver gestartet wird
> - `networks` → hängt den Container ins definierte Netzwerk ein
> - `ipam` → IP Address Management; hier werden Subnet, IP-Range und Gateway des Netzwerks manuell festgelegt

---

## 3. Dockerfile für den Webserver

```dockerfile
FROM php:8.0-apache

# PHP-Module für MySQL/MariaDB installieren
RUN docker-php-ext-install mysqli

# PHP-Dateien in den Apache Web-Root kopieren
COPY info.php /var/www/html/info.php
COPY db.php /var/www/html/db.php
```

> 📖 **Erklärung:**
> - `FROM php:8.0-apache` → Basis-Image mit PHP 8.0 und Apache vorinstalliert
> - `RUN docker-php-ext-install mysqli` → installiert die PHP-Erweiterung `mysqli`, damit db.php eine Verbindung zur MariaDB aufbauen kann
> - `COPY` → kopiert die PHP-Dateien aus dem lokalen Verzeichnis in den Apache Web-Root des Containers

---

## 4. PHP-Dateien

### info.php

```php
<?php
phpinfo();
?>
```

### db.php

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
?>
```

> ⚠️ **Hinweis:** Die Credentials in `db.php` (`kn04user`, `kn04pass`, `kn04db`) müssen mit den Umgebungsvariablen in der `docker-compose.yml` übereinstimmen.

---

## 5. Befehle, die `docker compose up` ausführt

`docker compose up` ist ein **Sammelbefehl**, der mehrere Arbeitsschritte auf einmal ausführt. Er baut Images bei Bedarf, erstellt Container, startet sie und zeigt deren Logs im Terminal an.

---

### Schritt 1 — Build

```bash
docker compose build
```

> 📖 **Erklärung:** Falls ein Service in der `docker-compose.yml` mit `build:` definiert ist, wird zuerst ein Image aus dem Dockerfile gebaut. Das ist beim Webserver der Fall. Docker baut das Image neu, wenn sich das Dockerfile oder die kopierten Dateien geändert haben. Services, die ein fertiges Image (`image:`) verwenden, werden übersprungen.

---

### Schritt 2 — Create / Recreate

```bash
# (kein direkter Einzelbefehl, Teil von docker compose up)
```

> 📖 **Erklärung:** Wenn Container noch nicht existieren, werden sie erstellt. Wenn sich Konfiguration oder Image geändert haben, werden bestehende Container gestoppt und neu erstellt. `docker compose up` entscheidet selbst, ob ein Container neu gebaut werden muss oder ob der bestehende weiterverwendet werden kann.

---

### Schritt 3 — Start

```bash
docker compose start
```

> 📖 **Erklärung:** Nach dem Erstellen werden die Container gestartet. Wichtiger Unterschied: `docker compose start` startet **nur bereits vorhandene** Container, während `docker compose up` bei Bedarf zusätzlich erstellt oder neu erstellt. `docker compose up` ist also mächtiger als ein reines `start`.

---

### Schritt 4 — Logs anzeigen (Attach)

```bash
docker compose logs --follow
```

> 📖 **Erklärung:** Standardmässig zeigt `docker compose up` die Ausgaben aller gestarteten Container direkt im Terminal an (zusammengefasst, farblich nach Container unterschieden). Mit dem Flag `-d` (detached) läuft alles im Hintergrund und es werden keine Logs angezeigt. Die Logs können dann separat mit `docker compose logs` abgerufen werden.

---

### Schritt 5 — Abhängige Services starten

```bash
# Teil des Verhaltens von docker compose up (via depends_on)
```

> 📖 **Erklärung:** Wenn ein Service von einem anderen abhängt (z.B. `depends_on: db`), startet `docker compose up` diese Services ebenfalls automatisch und in der richtigen Reihenfolge. So wird sichergestellt, dass die Datenbank läuft, bevor der Webserver versucht, sich zu verbinden.

---

### Gesamtzusammenfassung

| Schritt | Vergleichbarer Befehl       | Was passiert                                              |
|---------|-----------------------------|-----------------------------------------------------------|
| 1       | `docker compose build`      | Images werden aus Dockerfiles gebaut                      |
| 2       | *(intern)*                  | Container werden erstellt oder bei Änderung neu erstellt  |
| 3       | `docker compose start`      | Container werden gestartet                                |
| 4       | `docker compose logs -f`    | Logs aller Container werden im Terminal angezeigt         |
| 5       | *(via `depends_on`)*        | Abhängige Services werden automatisch mitgestartet        |

---

## 6. Screenshots

### 6.1 Screenshot — `info.php` (REMOTE_ADDR und SERVER_ADDR sichtbar)

![info.php Screenshot](https://raw.githubusercontent.com/michaeleaton212/Modul347/main/KN04/A/Aufgabe_a_PHP_site.png)

---

### 6.2 Screenshot — `db.php` (Datenbankverbindung im gleichen Netzwerk)

![db.php Screenshot](https://raw.githubusercontent.com/michaeleaton212/Modul347/main/KN04/A/Aufgabe_a_DB.png)