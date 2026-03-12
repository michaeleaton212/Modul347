# KN04a - Abgabe Übersicht

## ✅ Alle erforderlichen Abgaben

### 1. **docker-compose.yml**
- **Status**: ✅ Bereits vorhanden
- **Speicherort**: `/c/Users/micha/Desktop/TBZ/Modul347/KN04/docker-compose.yml`
- **Inhalt**:
  - Web-Service mit Dockerfile
  - DB-Service mit mariadb:latest Image
  - Container-Namen: `m347-kn04a-web` und `m347-kn04a-db`
  - Netzwerk-Konfiguration mit Subnet, IP-Range, Gateway

### 2. **Dockerfile**
- **Status**: ✅ Bereits vorhanden
- **Speicherort**: `/c/Users/micha/Desktop/TBZ/Modul347/KN04/Dockerfile`
- **Inhalt**:
  - Basis Image: `php:8.2-apache`
  - Installiert `mysqli` Extension
  - Kopiert lokale Dateien nach `/var/www/html/`

### 3. **DOKUMENTATION_DOCKER_COMPOSE_UP.md**
- **Status**: ✅ Neu erstellt
- **Speicherort**: `/c/Users/micha/Desktop/TBZ/Modul347/KN04/DOKUMENTATION_DOCKER_COMPOSE_UP.md`
- **Inhalt**:
  - Erklärung aller Befehle, die `docker compose up` ausführt
  - Detaillierte Erklärungen für jeden Schritt
  - Netzwerk-Konfiguration Details
  - Kommunikations-Ablauf zwischen Containern

### 4. **SCREENSHOT_ANLEITUNG.md**
- **Status**: ✅ Neu erstellt
- **Speicherort**: `/c/Users/micha/Desktop/TBZ/Modul347/KN04/SCREENSHOT_ANLEITUNG.md`
- **Inhalt**:
  - Schritt-für-Schritt Anleitung für Screenshot 1 (info.php)
  - Schritt-für-Schritt Anleitung für Screenshot 2 (db.php)
  - Fehlerbehebung
  - Docker Befehle zur Überprüfung

### 5. **Screenshot 1: info-screenshot.png**
- **Status**: ⏳ Noch zu erstellen
- **Speicherort**: `/c/Users/micha/Desktop/TBZ/Modul347/KN04/info-screenshot.png`
- **Anforderung**:
  - URL: `http://localhost:8080/info.php`
  - Sichtbar: `REMOTE_ADDR` und `SERVER_ADDR` Felder
  - Zeigt, dass Server im Netzwerk läuft

### 6. **Screenshot 2: db-screenshot.png**
- **Status**: ⏳ Noch zu erstellen
- **Speicherort**: `/c/Users/micha/Desktop/TBZ/Modul347/KN04/db-screenshot.png`
- **Anforderung**:
  - URL: `http://localhost:8080/db.php`
  - Sichtbar: "Verbindung zur Datenbank erfolgreich!"
  - Zeigt, dass Web- und DB-Container kommunizieren

---

## 📋 Abgabe Checkliste

- [x] docker-compose.yml mit allen Anforderungen
- [x] Dockerfile für Web-Service
- [x] Container-Namen korrekt: `m347-kn04a-web` und `m347-kn04a-db`
- [x] Netzwerk-Konfiguration: Subnet 172.10.0.0/16, IP-Range 172.10.5.0/24, Gateway 172.10.5.254
- [x] Dokumentation: `docker compose up` Befehle und Erklärungen
- [ ] Screenshot 1: info.php mit REMOTE_ADDR und SERVER_ADDR
- [ ] Screenshot 2: db.php mit Erfolgsmeldung

---

## 🚀 Nächste Schritte

### 1. Docker Desktop starten
- Sollte automatisch beim Hochfahren geladen werden
- Oder: Suche nach "Docker Desktop" im Windows-Menü

### 2. Docker Compose starten
```bash
cd "/c/Users/micha/Desktop/TBZ/Modul347/KN04"
docker compose up -d
```

### 3. Warten
- Warte 15-20 Sekunden, bis der DB-Container vollständig initialisiert ist

### 4. Screenshots machen
- Folge der SCREENSHOT_ANLEITUNG.md
- Screenshot 1: http://localhost:8080/info.php → Speichern als `info-screenshot.png`
- Screenshot 2: http://localhost:8080/db.php → Speichern als `db-screenshot.png`

### 5. Alle Dateien abgeben
- docker-compose.yml
- Dockerfile
- DOKUMENTATION_DOCKER_COMPOSE_UP.md
- info-screenshot.png
- db-screenshot.png

---

## 📚 Zusätzliche Informationen

### Netzwerk-Architektur
```
┌─────────────────────────────────────────┐
│        Docker Bridge Network            │
│     (kn04a-net: 172.10.5.0/24)         │
│                                         │
│  ┌────────────────────────────────┐   │
│  │ Web Container (Apache/PHP)     │   │
│  │ IP: 172.10.5.10                │   │
│  │ Port: 8080 (Host) → 80         │   │
│  │ Hostname: m347-kn04a-web       │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │ DB Container (MariaDB)         │   │
│  │ IP: 172.10.5.11                │   │
│  │ Port: 3306 (Host) → 3306       │   │
│  │ Hostname: m347-kn04a-db        │   │
│  └────────────────────────────────┘   │
│                                         │
│  Gateway: 172.10.5.254                │
└─────────────────────────────────────────┘
```

### Files im Container
```
Web-Container: /var/www/html/
├── info.php (phpinfo())
├── db.php (Datenbank-Verbindung testen)
└── Dockerfile (Konfiguration)
```

