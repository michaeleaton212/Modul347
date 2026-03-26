# KN05 – Speicher in Docker

---

# A) Bind Mounts

## Ziel

Zeigen dass ein Bash-Skript auf dem Host direkt im Container ausgefuehrt werden kann und Aenderungen sofort sichtbar sind.

---

## Befehle zum Starten des Containers mit Bind Mount

```bash
docker run -d --name bindtest -v C:\Users\micha\Desktop\TBZ\Modul347\KN05:/mounted nginx
docker ps
docker exec -it bindtest bash
```

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

Die Zeile `Version 1 - Erste Ausgabe` wird zu `Version 2 - Geaenderte Ausgabe` geaendert und gespeichert.

### Skript nochmals ausfuehren (Version 2)

```bash
bash /mounted/myscript.sh
```

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
docker run -d --name container1 -v meinvolume:/data nginx
docker run -d --name container2 -v meinvolume:/data nginx
docker ps
```

---

## Ablauf

### Container 1 – Schreiben

```bash
docker exec -it container1 bash
echo "Hallo von Container 1" >> /data/shared.txt
cat /data/shared.txt
```

Ausgabe:
```
Hallo von Container 1
```

### Container 2 – Lesen und Schreiben

```bash
docker exec -it container2 bash
cat /data/shared.txt
echo "Antwort von Container 2" >> /data/shared.txt
```

Ausgabe von `cat`:
```
Hallo von Container 1
```

### Container 1 – Nochmals lesen

```bash
cat /data/shared.txt
```

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
docker compose exec container1 bash
docker compose exec container2 bash
```

---

## Nachweis Container 1

Befehl:
```bash
mount
```

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

Befehl:
```bash
mount
```

Relevanter Eintrag in der Ausgabe:

| Speichertyp | Eintrag in mount-Ausgabe |
|---|---|
| Named Volume | `/dev/sde on /data type ext4` |

Screenshot: `mount_container2.png`

![mount_container2](https://github.com/michaeleaton212/Modul347/blob/main/KN05/mount_container2.png)