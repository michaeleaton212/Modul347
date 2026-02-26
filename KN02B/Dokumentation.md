# KN02B – Dockerfile II (PHP + MariaDB)

## Ziel

Zwei getrennte Container:

- **DB-Container** (MariaDB)
- **Web-Container** (php:8.0-apache + mysqli)

Beide Container laufen im selben Docker-Netzwerk (`kn02b-net`) und kommunizieren über den Container-Namen `kn02b-db`.

---

## 1) DB – MariaDB Container

---

### 1.1 Dockerfile (DB)

**Datei:** `db/Dockerfile`

```dockerfile
# Basis-Image MariaDB
FROM mariadb:latest

# Root-Passwort im Image definieren
ENV MARIADB_ROOT_PASSWORD=CHANGE_ME_ROOTPW

# Port-Dokumentation
EXPOSE 3306
```

---

### 1.2 Docker Build (DB)

Im Ordner `KN02B/db`:

```bash
docker build -t kn02b-db:kn02b-db .
```

---

### 1.3 Docker Run (DB)

Netzwerk erstellen (einmalig):

```bash
docker network create kn02b-net
```

Container starten:

```bash
docker run --name kn02b-db -d --network kn02b-net -p 3306:3306 kn02b-db:kn02b-db
```

Prüfen:

```bash
docker ps
```

Erwartung:
* Status: `Up`
* Port: `0.0.0.0:3306->3306/tcp`

---

### 1.4 Telnet Test (DB Zugriff)

```bash
telnet localhost 3306
```

Erwartung:
* MariaDB-Version oder kryptische Zeichen sichtbar
* Verbindung wird nicht abgelehnt

---

### 📸 Screenshot (DB)

![Telnet DB Test](https://raw.githubusercontent.com/michaeleaton212/Modul347/main/KN02B/telnet.png)

---

## 2) Web – PHP + Apache Container

---

### 2.1 Dockerfile (Web)

**Datei:** `web/Dockerfile`

```dockerfile
FROM php:8.0-apache

# mysqli Erweiterung installieren
RUN docker-php-ext-install mysqli

# Apache Document Root
WORKDIR /var/www/html

# PHP-Dateien kopieren
COPY info.php .
COPY db.php .

EXPOSE 80
```

---

### 2.2 Angepasste PHP-Dateien

**info.php** (Standard phpinfo-Datei)

```php
<?php
phpinfo();
?>
```

**db.php** (angepasst)

```php
<html>
<head></head>
<body>
Diese Seite macht eine Abfrage auf die Datenbank. <br />
Das ausgeführte Query ist: <i>select Host, User from mysql.user;</i><br /><br />
Das Resultat: <br />

<?php
$servername = "kn02b-db";
$username   = "root";
$password   = "CHANGE_ME_ROOTPW";
$dbname     = "mysql";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "select Host, User from mysql.user;";
$result = $conn->query($sql);

while($row = $result->fetch_assoc()){
    echo("<li>" . $row["Host"] . " / " . $row["User"] . "</li>");
}
?>

</body>
</html>
```

---

### 2.3 Docker Build (Web)

Im Ordner `KN02B/web`:

```bash
docker build -t kn02b-web:kn02b-web .
```

---

### 2.4 Docker Run (Web)

Container starten (im gleichen Netzwerk):

```bash
docker run --name kn02b-web -d --network kn02b-net -p 8081:80 kn02b-web:kn02b-web
```

Prüfen:

```bash
docker ps
```

Erwartung:
* Status: `Up`
* Port: `0.0.0.0:8081->80/tcp`

---

### 2.5 Browser Tests

```
http://localhost:8081/info.php
```

```
http://localhost:8081/db.php
```

Erwartung:
* `info.php` zeigt phpinfo()
* `db.php` zeigt User-Liste aus mysql.user

---

### 📸 Screenshots (Web)

![info.php](https://raw.githubusercontent.com/michaeleaton212/Modul347/main/KN02B/infosite.png)

![db.php](https://raw.githubusercontent.com/michaeleaton212/Modul347/main/KN02B/dbsite.png)

---

## 3) Push in privates Docker Repository

**DB Image pushen:**

```bash
docker tag kn02b-db:kn02b-db michaeleatontbz/kn02b-db:kn02b-db
docker push michaeleatontbz/kn02b-db:kn02b-db
```

**Web Image pushen:**

```bash
docker tag kn02b-web:kn02b-web michaeleatontbz/kn02b-web:kn02b-web
docker push michaeleatontbz/kn02b-web:kn02b-web
```

---

## Technische Zusammenfassung

* Zwei getrennte Container
* Gemeinsames Docker-Netzwerk (`kn02b-net`)
* Container-Kommunikation über DNS-Name `kn02b-db`
* mysqli Extension korrekt installiert
* Root-Authentifizierung erfolgreich
* Images ins private Repository gepusht