# KN05 – Speicher in Docker

---

# A) Bind Mounts

## Ziel

Zeigen dass ein Bash-Skript auf dem Host direkt im Container ausgefuehrt werden kann und Aenderungen sofort sichtbar sind.

---

## Befehle zum Starten des Containers mit Bind Mount

```bash
docker run -d --name bindtest -v C:\Users\micha\Desktop\TBZ\Modul347\KN05:/mounted nginx
```

`docker run` startet einen neuen Container. `-d` laesst ihn im Hintergrund laufen. `--name bindtest` gibt dem Container den Namen "bindtest". `-v C:\Users\micha\Desktop\TBZ\Modul347\KN05:/mounted` bindet den Ordner auf dem Host direkt in den Container unter dem Pfad `/mounted` ein. `nginx` ist das Image das verwendet wird.

```bash
docker ps
```

Zeigt alle aktuell laufenden Container an. So kann man pruefen ob der Container erfolgreich gestartet wurde.

```bash
docker exec -it bindtest bash
```

Oeffnet eine interaktive Bash-Shell im laufenden Container "bindtest". `-it` steht fuer interaktiv und Terminal, damit man Befehle eingeben kann.

---

## Bash-Skript (myscript.sh)

```bash
#!/bin/bash
echo "==========================="
echo "Skript von: Michael Eaton"
echo "==========================="
echo "Aktuelle Zeit: $(date)"
echo "Version 1 - Erste Ausgabe"
echo "==========================="
```

---

## Ablauf

### Skript ausfuehren (Version 1)

```bash
bash /mounted/myscript.sh
```

Fuehrt das Skript `myscript.sh` aus, das im eingebundenen Ordner `/mounted` liegt. `bash` gibt an, dass es sich um ein Bash-Skript handelt.

Ausgabe:
```
===========================
Skript von: Michael Eaton
===========================
Aktuelle Zeit: Thu Mar 26 08:12:18 UTC 2026
Version 1 - Erste Ausgabe
===========================
```

### Skript auf dem Host aendern

Die Zeile `Version 1 - Erste Ausgabe` wird zu `Version 2 - Geaenderte Ausgabe` geaendert und gespeichert. Da es ein Bind Mount ist, sieht der Container die Aenderung sofort ohne Neustart.

### Skript nochmals ausfuehren (Version 2)

```bash
bash /mounted/myscript.sh
```

Derselbe Befehl wie zuvor. Da die Datei auf dem Host geaendert wurde, zeigt der Container nun die neue Version.

Ausgabe:
```
===========================
Skript von: Michael Eaton
===========================
Aktuelle Zeit: Thu Mar 26 08:15:42 UTC 2026
Version 2 - Geaenderte Ausgabe
===========================
```

---

## Ergebnis

Die Aenderung am Skript auf dem Host ist sofort im Container sichtbar, da der Ordner direkt eingebunden ist.

---

## Screencast

https://github.com/michaeleaton212/Modul347/blob/main/KN05/AufgabeA.mp4

---
---

# B) Volumes

## Ziel

Zwei Container verwenden dasselbe Named Volume und koennen gegenseitig Daten lesen und schreiben.

---

## Befehle zum Starten der Container mit Volume

```bash
docker volume create meinvolume
```

Erstellt ein neues Named Volume mit dem Namen "meinvolume". Dieses Volume wird von Docker verwaltet und bleibt auch nach dem Stoppen der Container erhalten.

```bash
docker run -d --name container1 -v meinvolume:/data nginx
```

Startet einen Container namens "container1" mit nginx. `-v meinvolume:/data` haengt das Named Volume "meinvolume" unter dem Pfad `/data` im Container ein.

```bash
docker run -d --name container2 -v meinvolume:/data nginx
```

Startet einen zweiten Container namens "container2" mit demselben Volume. Beide Container teilen sich nun denselben Speicher unter `/data`.

```bash
docker ps
```

Zeigt alle laufenden Container an. Beide Container muessen sichtbar sein.

---

## Ablauf

### Container 1 – Schreiben

```bash
docker exec -it container1 bash
```

Oeffnet eine Shell in Container 1.

```bash
echo "Hallo von Container 1" >> /data/shared.txt
```

Schreibt den Text "Hallo von Container 1" in die Datei `shared.txt` im Volume. `>>` haengt den Text an, ohne die Datei zu ueberschreiben.

```bash
cat /data/shared.txt
```

Liest den Inhalt der Datei `shared.txt` und gibt ihn aus. `cat` zeigt den gesamten Dateiinhalt im Terminal an.

Ausgabe:
```
Hallo von Container 1
```

### Container 2 – Lesen und Schreiben

```bash
docker exec -it container2 bash
```

Oeffnet eine Shell in Container 2.

```bash
cat /data/shared.txt
```

Liest dieselbe Datei wie in Container 1. Da beide dasselbe Volume verwenden, ist der Eintrag von Container 1 bereits sichtbar.

Ausgabe von `cat`:
```
Hallo von Container 1
```

```bash
echo "Antwort von Container 2" >> /data/shared.txt
```

Fuegt einen neuen Eintrag von Container 2 in die Datei ein.

### Container 1 – Nochmals lesen

```bash
cat /data/shared.txt
```

Liest die Datei erneut in Container 1. Der Eintrag von Container 2 ist nun ebenfalls sichtbar.

Ausgabe:
```
Hallo von Container 1
Antwort von Container 2
```

---

## Ergebnis

Beide Container koennen auf dieselbe Datei `/data/shared.txt` zugreifen, da sie das gleiche Named Volume `meinvolume` verwenden. Aenderungen eines Containers sind sofort im anderen sichtbar.

---

## Screencast

https://github.com/michaeleaton212/Modul347/blob/main/KN05/AufgabeB.mp4

---
---

# C) Speicher mit Docker Compose

## Ziel

Einen Container mit allen drei Speichertypen (Named Volume, Bind Mount, tmpfs) erstellen und einen zweiten Container mit demselben Named Volume verbinden.

---

## docker-compose.yml

```yaml
services: # Container definieren
  container1: # Erster Container
    image: nginx # nginx verwenden
    volumes: # Speicher anhaengen
      - type: volume # Persistenter Speicher
        source: meinvolume # Volume auswaehlen
        target: /data # Einhaengepunkt setzen
      - type: bind # Hostordner einbinden
        source: C:\Users\micha\Desktop\TBZ\Modul347\KN05 # Hostpfad angeben
        target: /mounted # Einhaengepunkt setzen
      - type: tmpfs # RAM-Speicher einbinden
        target: /tmpdata # Einhaengepunkt setzen

  container2: # Zweiter Container
    image: nginx # nginx verwenden
    volumes: # Speicher anhaengen
      - meinvolume:/data # Volume kurz einbinden

volumes: # Volumes deklarieren
  meinvolume: # Volume erstellen
```

---

## Befehle zum Starten

```bash
docker compose up -d
```

Startet alle in der `docker-compose.yml` definierten Container im Hintergrund. `-d` steht fuer "detached", also ohne blockierendes Terminal.

```bash
docker compose exec container1 bash
```

Oeffnet eine interaktive Shell im laufenden Container "container1". So kann man Befehle direkt im Container ausfuehren.

```bash
docker compose exec container2 bash
```

Dasselbe wie oben, jedoch fuer "container2".

---

## Nachweis Container 1

```bash
mount
```

Zeigt alle aktuell eingebundenen Dateisysteme im Container an. Damit kann man pruefen, ob alle drei Speichertypen korrekt eingebunden wurden.

Relevante Eintraege in der Ausgabe:

| Speichertyp | Eintrag in mount-Ausgabe |
|---|---|
| Named Volume | `/dev/sde on /data type ext4` |
| Bind Mount | `C:\ on /mounted type 9p` |
| tmpfs | `tmpfs on /tmpdata type tmpfs` |

Screenshot: `mount_container1.png`

![mount_container1](https://github.com/michaeleaton212/Modul347/blob/main/KN05/mount_container1.png)

---

## Nachweis Container 2

```bash
mount
```

Zeigt die eingebundenen Dateisysteme in Container 2. Hier muss nur das Named Volume unter `/data` sichtbar sein.

Relevanter Eintrag in der Ausgabe:

| Speichertyp | Eintrag in mount-Ausgabe |
|---|---|
| Named Volume | `/dev/sde on /data type ext4` |

Screenshot: `mount_container2.png`

![mount_container2](https://github.com/michaeleaton212/Modul347/blob/main/KN05/mount_container2.png)