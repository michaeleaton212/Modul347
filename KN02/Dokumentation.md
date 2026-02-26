# KN02A – Dockerfile I (Nginx + helloworld.html)

## 1) Dokumentiertes Dockerfile (Zeile für Zeile erklärt)

```dockerfile
FROM nginx
```

* Basis-Image: offizielles `nginx` von Docker Hub
* Nimmt den Webserver als Grundlage (dein Image = Layer oben drauf)

```dockerfile
WORKDIR /usr/share/nginx/html
```

* Setzt das Arbeitsverzeichnis im Image auf den Standard-Ordner, aus dem nginx statische Dateien ausliefert
* Danach beziehen sich relative Pfade (z.B. `.`) auf diesen Ordner

```dockerfile
COPY helloworld.html .
```

* Kopiert die lokale Datei `helloworld.html` aus dem Build-Kontext (Projektordner) ins Image
* Ziel ist das aktuelle Arbeitsverzeichnis (`/usr/share/nginx/html`)

```dockerfile
EXPOSE 80
```

* Dokumentiert, dass der Container auf Port 80 "lauscht"
* Veröffentlicht den Port NICHT automatisch (dafür braucht es `-p` bei `docker run`)

---

## 2) Dockerfile (final, mit Kommentaren)

Dateiname: `Dockerfile` (ohne Endung)

```dockerfile
# Basis-Image: offizielles nginx von Docker Hub
FROM nginx

# Arbeitsverzeichnis: Standard-Ordner für nginx-HTML
WORKDIR /usr/share/nginx/html

# HTML-Datei aus dem Build-Kontext ins Image kopieren
COPY helloworld.html .

# Dokumentation: Container-Port 80 (kein automatisches Port-Mapping)
EXPOSE 80
```

Voraussetzung im Projektordner:
* `Dockerfile`
* `helloworld.html`

---

## 3) Notwendige Docker-Befehle – Build (lokal)

In den Projektordner wechseln:

```bash
cd C:\Users\micha\Desktop\TBZ\Modul347\KN02
```

Lokales Image bauen:

```bash
docker build -t kn02a:kn02a .
```

Prüfen, ob das Image existiert:

```bash
docker images
```

---

## 4) Notwendige Docker-Befehle – Tag für Docker Hub + Push

Lokales Image für Docker Hub taggen (ohne `< >` Zeichen!):

```bash
docker tag kn02a:kn02a michaeleatontbz/kn02a:kn02a
```

Login bei Docker Hub:

```bash
docker login
```

Push ins private Repository:

```bash
docker push michaeleatontbz/kn02a:kn02a
```

---

## 5) Notwendige Docker-Befehle – Container starten + Webseite aufrufen

Alten Container entfernen (falls vorhanden):

```bash
docker rm -f kn02a-web
```

Container starten (Port-Mapping Host 8080 → Container 80):

```bash
docker run --name kn02a-web -d -p 8080:80 michaeleatontbz/kn02a:kn02a
```

Prüfen, ob Container läuft und Port gemappt ist:

```bash
docker ps
```

Webseite im Browser aufrufen:
* `http://localhost:8080/helloworld.html`

Logs anzeigen (nur falls es Probleme gibt):

```bash
docker logs kn02a-web
```

---

## 6) Screenshots

### Docker Desktop – Image sichtbar
![Docker Desktop](https://raw.githubusercontent.com/michaeleaton212/Modul347/main/KN02/dockerdesktop.png)

### Browser – helloworld.html aufgerufen
![Hello World Site](https://raw.githubusercontent.com/michaeleaton212/Modul347/main/KN02/hello_world_site.png)