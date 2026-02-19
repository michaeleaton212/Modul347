# Teil D – Privates Repository

---

## Befehle

### 1. nginx herunterladen
```bash
docker pull nginx:latest
```

### 2. nginx taggen
```bash
docker tag nginx:latest BENUTZERNAME/m347:nginx
```

### 3. nginx pushen
```bash
docker push michaeleatontbz/m347:nginx
```

### 4. mariadb herunterladen
```bash
docker pull mariadb:latest
```

### 5. mariadb taggen
```bash
docker tag mariadb:latest BENUTZERNAME/m347:mariadb
```

### 6. mariadb pushen
```bash
docker push BENUTZERNAME/m347:mariadb
```

---

## Erklärungen

### docker tag

`docker tag` erstellt keinen neuen Image-Inhalt. Es wird lediglich ein zusätzlicher Name (Repository + Tag) auf dasselbe Image gelegt. `nginx:latest` und `BENUTZERNAME/m347:nginx` zeigen danach auf dieselbe Image-ID. Ein Tag ist ein Label zur Identifikation oder Versionierung eines Images.

### docker push

`docker push` lädt das lokal getaggte Image in das Docker-Hub-Repository hoch. Dafür ist ein aktiver Login via `docker login` erforderlich. Danach ist das Image online im privaten Repository verfügbar und kann von autorisierten Nutzern gepullt werden.

---

## Screenshot

| Datei | Inhalt |
|---|---|
| `05_repo_tags.png` | Docker Hub – Repository `michaeleatontbz/m347` mit beiden Tags `nginx` und `mariadb` sichtbar |
