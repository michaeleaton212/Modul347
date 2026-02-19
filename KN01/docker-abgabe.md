# Docker CLI Abgabe

---

## Befehle

### 1. Docker Version prüfen
```bash
docker version
```

### 2. Images suchen
```bash
docker search ubuntu
docker search nginx
```

### 3. nginx – pull, create, start

Image laden:
```bash
docker pull nginx
```

Container erstellen:
```bash
docker create --name nginx8081 -p 8081:80 nginx
```

Container starten:
```bash
docker start nginx8081
```

### 4. Ubuntu – detached Mode
```bash
docker run -d --name ubuntu_detached ubuntu
docker ps -a
```

### 5. Ubuntu – interaktiv
```bash
docker run -it --name ubuntu_interactive ubuntu
ls
exit
```

### 6. In laufenden nginx Container rein (docker exec)
```bash
docker start nginx8081
docker exec -it nginx8081 /bin/bash
service nginx status
exit
```

### 7. Container Status anzeigen
```bash
docker ps -a
```

### 8. nginx stoppen
```bash
docker stop nginx8081
```

### 9. Alle Container löschen
```bash
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
```

### 10. Images löschen
```bash
docker rmi nginx ubuntu
```

---

## Erklärungen

### Erklärung: `docker run -d -p 80:80 docker/getting-started`

| Parameter | Bedeutung |
|---|---|
| `docker run` | Kombiniert `pull` + `create` + `start` in einem Schritt. Das Image wird automatisch heruntergeladen (falls nicht vorhanden), ein neuer Container erstellt und sofort gestartet. |
| `-d` | Detached Mode – der Container läuft im Hintergrund. Das Terminal bleibt frei, der Prozess läuft weiter ohne die Konsole zu blockieren. |
| `-p 80:80` | Port-Mapping – der Port 80 des Host-Systems wird auf den Port 80 des Containers weitergeleitet. Format: `Host-Port:Container-Port`. |
| `docker/getting-started` | Der Name des Images, das verwendet werden soll. Docker sucht es zuerst lokal, dann auf Docker Hub. |

### Erklärung: Ubuntu im detached Mode (`-d`)

```bash
docker run -d --name ubuntu_detached ubuntu
```

Beim Ausführen dieses Befehls wird das Ubuntu-Image automatisch von Docker Hub gepullt, falls es lokal noch nicht vorhanden ist. Der Container startet daraufhin kurz, beendet sich jedoch sofort wieder von selbst. Der Grund dafür ist, dass Ubuntu kein eigenes laufendes Programm im Vordergrund hat – es gibt also keinen aktiven Prozess, der den Container am Leben hält. Im Gegensatz zu nginx, das einen Webserver-Prozess dauerhaft ausführt, braucht Ubuntu einen expliziten Befehl oder eine interaktive Shell, um aktiv zu bleiben. Mit `docker ps -a` sieht man den Container mit dem Status `Exited`.

### Erklärung: Ubuntu interaktiv (`-it`)

```bash
docker run -it --name ubuntu_interactive ubuntu
```

| Parameter | Bedeutung |
|---|---|
| `-i` | Interaktiv – hält den Standard-Input (STDIN) offen, damit Eingaben möglich sind. |
| `-t` | TTY – stellt ein pseudo-Terminal bereit, damit die Shell korrekt dargestellt wird. |
| `-it` | Zusammen ermöglichen sie eine vollständig interaktive Shell-Sitzung im Container. |

Die Shell wird als Hauptprozess des Containers gestartet. Solange diese Shell aktiv ist, läuft auch der Container. Sobald man `exit` eingibt, wird die Shell beendet – und damit auch der Container, da der Hauptprozess nicht mehr läuft.

### Erklärung: `docker exec`

```bash
docker exec -it nginx8081 /bin/bash
```

`docker exec` führt einen Befehl in einem bereits laufenden Container aus – im Gegensatz zu `docker run`, das einen neuen Container startet. Mit `-it` wird eine interaktive Shell-Sitzung geöffnet. Dies ist nützlich, um in einen Container hineinzuschauen, Logs zu prüfen, Dienste zu testen oder Konfigurationen zu überprüfen, ohne den Container neu starten zu müssen. Mit `exit` verlässt man die Sitzung, der Container läuft danach weiter.

---

## Screenshots

| Datei | Inhalt |
|---|---|
| `welcome_nginx.png` | Browser auf `http://localhost:8081` – nginx Welcome Page mit sichtbarer URL |
| `02_nginx_status_exec.png` | Terminal mit `service nginx status` innerhalb des Containers |
| `03_docker_ps.png` | Terminal mit Ausgabe von `docker ps -a` |
