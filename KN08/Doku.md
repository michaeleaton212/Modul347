# KN08: Kubernetes III - Microservices

## Uebersicht

In diesem Auftrag wurde eine Microservice-Applikation fuer eine Crypto-Exchange-Plattform (tbzCoin) implementiert und in Kubernetes deployt. Die Applikation besteht aus 4 Microservices:

- **Frontend** (React App) - vorgegeben
- **Account** (.NET Service) - vorgegeben
- **BuySell** (Node.js) - selbst implementiert
- **SendReceive** (Node.js) - selbst implementiert

---

## Schritt 1: Datenbank erstellen (AWS RDS)

*Ziel: Zentrale Datenbank auf AWS bereitstellen, auf die der Account-Service zugreifen kann.*

Die Datenbank wurde als MariaDB-Instanz auf AWS RDS erstellt. AWS RDS ist ein verwalteter Datenbankdienst von Amazon, der es erlaubt Datenbanken ohne eigene Server zu betreiben.

In der AWS Console wurde unter RDS eine neue MariaDB-Instanz mit folgenden Einstellungen erstellt:
- DB Identifier: `kn08-db`
- Engine: MariaDB (DB Software)
- Template: Free tier (Alle Einstellungen auf Minimum setzen.)
- Public access: Yes

![RDS Available](KN08_RDS_Available.png)

Die Datenbank ist mit Status **Verfuegbar** bereit.

Der Endpoint der Datenbank lautet `kn08-db.c36osqe2crs9.us-east-1.rds.amazonaws.com`: (Adresse zum Verbinden mit der Datenbank.)

![RDS Endpoint](KN08_02_RDS_Endpoint.png)

### SQL-Script einspielen

Das initiale SQL-Script wurde auf Node 1 eingespielt. Der folgende Befehl verbindet sich mit der RDS-Datenbank und fuehrt das Script aus:

```bash
mysql -h kn08-db.c36osqe2crs9.us-east-1.rds.amazonaws.com -P 3306 -u admin -p < ~/m347kn08/database/m347_KN08_DB.sql
```
| Parameter | Bedeutung |
|-----------|-----------|
| `-h kn08-db.c36osqe2crs9...` | Hostname des AWS RDS Endpoints |
| `-P 3306` | Port (3306 = Standard MySQL/MariaDB) |
| `-u admin` | Datenbankbenutzer |
| `-p` | Passwort wird interaktiv abgefragt |
| `< m347_KN08_DB.sql` | SQL-Datei wird als Input weitergeleitet und automatisch ausgefuehrt |

Anschliessend wurde die Datenbank geprueft:

```sql
USE m347kn08;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM friends;
```

![DB Import](KN08_03_DB_Import.png)

Die Datenbank enthaelt die Tabellen `users` und `friends` mit Beispieldaten. User 1 (Rene) hat 30 tbzCoins.

---

## Schritt 2: Frontend builden und containerisieren

*Ziel: React-App als Docker-Image verpacken und auf Docker Hub pushen, damit Kubernetes es spaeter starten kann.*

Das Frontend ist eine React-App. Zuerst wurden die Environment-Variablen (Konfigurationswerte die dem Programm zur Laufzeit uebergeben werden) in `.env.production` gesetzt, damit das Frontend die korrekten Service-URLs verwendet:

> React liest diese Variablen beim Build und baut die URLs direkt als Literalstrings in den JavaScript-Code ein. Das Prefix `REACT_APP_` ist Pflicht – ohne es ignoriert Create React App die Variable. Die Ports (30080, 30002, 30003) sind NodePorts – Kubernetes verlangt den Bereich 30000–32767.

```
REACT_APP_ACCOUNT_HOLDINGS=http://192.168.25.132:30080/Account/Cryptos/?userid=<userId>
REACT_APP_ACCOUNT_FRIENDS=http://192.168.25.132:30080/Account/Friends/?userid=<userId>
REACT_APP_BUYSELL_BUY=http://192.168.25.132:30002/buy
REACT_APP_BUYSELL_SELL=http://192.168.25.132:30002/sell
REACT_APP_SENDRECEIVE_SEND=http://192.168.25.132:30003/send
REACT_APP_USER_LOGGED_IN=1
```

*`frontend/.env.production` – Service-URLs die React beim Build in den JS-Code einbaut*

Dann wurde die App gebaut und in einen Container gepackt:

```bash
npm install
npm run build
docker build -t michaeleatontbz/kn08-frontend:v1 .
docker push michaeleatontbz/kn08-frontend:v1
```

> `npm install` laedt alle Abhaengigkeiten. `npm run build` kompiliert React zu statischen HTML/CSS/JS-Dateien die kein Node.js mehr benoetigen. `docker build` packt diese Dateien in ein Image – das Tag `:v1` ist wichtig fuer spaetere Rolling Updates (schrittweiser Austausch alter Pods ohne Downtime) in Kubernetes. `docker push` laedt das Image auf Docker Hub, von wo Kubernetes es bei Pod-Start zieht.

![Frontend Push](KN08_04_Frontend_Push.png)

Das Image wurde erfolgreich auf Docker Hub gepusht.

---

## Schritt 3: Account-Komponente containerisieren

*Ziel: Den vorgegeben Account-Service als Docker-Image verpacken und auf Docker Hub pushen.*

Der Account Service ist in .NET geschrieben und bereits vorgegeben. Zuerst wurde die `appsettings.json` mit dem RDS-ConnectionString konfiguriert:

> `appsettings.json` ist die Konfigurationsdatei in .NET – aequivalent zu `.env` in Node.js. Der ConnectionString (alle DB-Verbindungsinfos in einer Zeichenkette) wird hier vorerst hardcodiert. Schlechte Praxis da das Passwort im Git-Repo landet – die saubere Loesung kommt in Schritt 7 mit einem Kubernetes Secret.

```json
{
  "ConnectionString": "Server=kn08-db.c36osqe2crs9.us-east-1.rds.amazonaws.com;Database=m347kn08;User ID=admin;Password=Admin1234!;"
}
```

*`account/appsettings.json` – Konfigurationsdatei des .NET Account-Service, enthaelt den DB-ConnectionString*

Dann wurde der Container gebaut und gepusht:

```bash
docker build -t michaeleatontbz/kn08-account:v1 .
docker push michaeleatontbz/kn08-account:v1
```

> `-t` setzt den Tag im Format `dockerhub-username/image-name:version`. Das `:v1` ist entscheidend fuer Rolling Updates – Kubernetes erkennt an einem neuen Tag wie `:v2` dass ein neues Image gepullt werden soll.  
> Der Punkt `.` am Ende von `docker build` gibt an, dass das Dockerfile im aktuellen Verzeichnis gesucht wird.

---

## Schritt 4: Test mit Docker Desktop (Frontend + Account)

*Ziel: Zusammenspiel von Frontend und Account-Service lokal pruefen bevor es in den komplexeren Kubernetes-Cluster kommt.*

Bevor alles in Kubernetes deployt wird, wurde das Zusammenspiel von Frontend und Account-Service zuerst lokal mit Docker Desktop getestet. So koennen Fehler frueh erkannt werden.

> **Warum lokal testen?** Fehler in Kubernetes schwieriger zu debuggen (Netzwerk, Configs, Secrets). Docker Desktop = schnelles Iterieren ohne Cluster-Overhead.

### Account-Service starten

```bash
docker run -d --name account \
  -p 8080:8080 \
  -e ConnectionString="Server=kn08-db.c36osqe2crs9.us-east-1.rds.amazonaws.com;Database=m347kn08;User ID=admin;Password=Admin1234!;" \
  michaeleatontbz/kn08-account:v1
```

| Flag | Bedeutung |
|------|-----------|
| `-d` | Detached – laeuft im Hintergrund |
| `--name account` | Fester Name statt zufaelliger Container-ID |
| `-p 8080:8080` | Port-Mapping `host:container` |
| `-e` | Umgebungsvariable zur Laufzeit setzen |
| `ConnectionString` | Alle DB-Verbindungsinfos in einer Zeichenkette: Host, DB-Name, User, Passwort. Der Hostname ist der von AWS automatisch generierte DNS-Name der RDS-Instanz. (Benoetigt damit der Service weiss wo und wie er sich zur externen RDS-Datenbank verbinden soll) |

### Frontend starten

```bash
docker run -d --name frontend \
  -p 3000:80 \
  michaeleatontbz/kn08-frontend:v1
```

| Flag | Bedeutung |
|------|-----------|
| `-d` | Detached – laeuft im Hintergrund |
| `--name frontend` | Fester Name statt zufaelliger Container-ID |
| `-p 3000:80` | nginx (leichtgewichtiger Webserver) im Container hoert auf Port 80, erreichbar via `localhost:3000` |
| `michaeleatontbz/kn08-frontend:v1` | Image das gestartet wird – wird lokal gesucht, sonst von Docker Hub gepullt |

> **nginx** – leichtgewichtiger Webserver der die statischen React-Dateien ausliefert. Kein Node.js noetig nach dem Build.

### Test

Im Browser unter `http://localhost:3000` wurde geprueft:
- Die App laedt korrekt
- Die Account-Daten (Holdings und Friends) werden vom Account-Service abgerufen
- Die API-Calls gehen an `localhost:8080` (wie in `.env` konfiguriert)

Das Zusammenspiel zwischen Frontend und Account funktioniert. Der Account-Service verbindet sich erfolgreich mit der AWS RDS Datenbank und gibt die Benutzerdaten zurueck.

---

## Schritt 5: Erster Kubernetes-Test (Frontend + Account)

*Ziel: Frontend und Account-Service in Kubernetes testen, bevor die eigenen Services (BuySell, SendReceive) implementiert werden – so weiss man ob das Grundgeruest funktioniert.*

Nach dem erfolgreichen Docker Desktop Test wurde der naechste Schritt gemacht: nur Frontend und Account in Kubernetes deployen, ohne BuySell und SendReceive.

> **Testlogik:** Frontend aufrufen – laden die Holdings und Friends korrekt, kommunizieren Frontend und Account-Service korrekt miteinander und der Account-Service verbindet sich erfolgreich zur Datenbank. Laden sie nicht, liegt der Fehler in einem dieser drei Teile und nicht in BuySell oder SendReceive.

> **Warum nur zwei Services zuerst?** Schrittweises Testen – so weiss man bei einem Fehler genau welcher Teil das Problem verursacht.

### Deployment

```bash
microk8s kubectl apply -f configmap.yaml
microk8s kubectl apply -f account.yaml
microk8s kubectl apply -f frontend.yaml
```

| Befehl | Bedeutung |
|--------|-----------|
| `microk8s kubectl` | kubectl-Client von MicroK8s (leichtgewichtige lokale Kubernetes-Distribution) – spricht mit dem Kubernetes Cluster |
| `apply -f` | Wendet eine YAML-Konfigurationsdatei (Konfigurationsformat fuer Kubernetes) an – erstellt oder aktualisiert die darin definierten Ressourcen |
| `configmap.yaml` | Zuerst deployt, da Account und Frontend die darin enthaltenen Werte benoetigen |

### Verifizierung

```bash
microk8s kubectl get pods
microk8s kubectl get services
```

| Befehl | Bedeutung |
|--------|-----------|
| `get pods` | Zeigt alle laufenden Pods mit Status (Running, Pending, Error) |
| `get services` | Zeigt alle Services mit ihren Ports und Cluster-IPs |

Die Pods laufen und die Services sind erreichbar:
- Frontend: `http://98.93.204.194:30100`
- Account API: `http://98.93.204.194:30080/Account/Cryptos/?userid=1`

> **NodePort** – Die Ports 30100 und 30080 sind NodePorts. Jeder NodePort im Cluster leitet Traffic an den entsprechenden Pod weiter, egal welche Node-IP man aufruft.

Im Browser wurde geprueft, dass das Frontend die Daten vom Account-Service in Kubernetes korrekt laedt. Die Holdings und Friends werden angezeigt. Die BuySell- und SendReceive-Buttons funktionieren noch nicht, da diese Services noch nicht deployt sind.

Erst nachdem dieser Test erfolgreich war, wurden im naechsten Schritt die restlichen Services (BuySell, SendReceive) implementiert und deployt.

---

## Schritt 6: BuySell und SendReceive implementieren

*Ziel: Die zwei eigenen Microservices entwickeln, containerisieren und auf Docker Hub pushen.*

> Beide Services kommunizieren **nie direkt mit der Datenbank** – sie rufen immer den Account-Service auf, der als einziger DB-Zugriff hat. So bleibt die Datenbanklogik an einem Ort.

---

### BuySell Service

Der BuySell Service wurde in Node.js implementiert (Node.js = JavaScript-Laufzeitumgebung die als Server laeuft, kein Browser). Er stellt zwei Endpoints zur Verfuegung (Endpoints = URLs die auf HTTP-Requests reagieren und Logik ausfuehren):
- `POST /buy` - Kauft tbzCoins fuer einen Benutzer
- `POST /sell` - Verkauft tbzCoins eines Benutzers

```javascript
// buysell/index.js – HTTP-Server mit zwei Endpoints, kommuniziert nur mit Account-Service

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// URL des Account-Service – kommt von Kubernetes, sonst localhost
const ACCOUNT_URL = process.env.ACCOUNT_URL || 'http://localhost:8080';

// /buy: Coins gutschreiben
app.post('/buy', async (req, res) => {
  const { id, amount } = req.body;
  const response = await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Add`, { userId: id, amount: amount });
  res.json(response.data);
});

// /sell: Kontostand pruefen, dann abziehen
app.post('/sell', async (req, res) => {
  const { id, amount } = req.body;
  const balanceRes = await axios.get(`${ACCOUNT_URL}/Account/Cryptos/?userid=${id}`);
  const currentBalance = balanceRes.data.amount;
  const actualAmount = currentBalance >= amount ? amount : currentBalance; // nie negativ
  const response = await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Subtract`, { userId: id, amount: actualAmount });
  res.json(response.data);
});

app.listen(8002, () => console.log('BuySell running on port 8002'));
```

| Element | Bedeutung |
|---------|-----------|
| `express` | Web-Framework (macht Endpoints definieren einfach) |
| `axios` | HTTP-Client (sendet Requests an den Account-Service) |
| `process.env.ACCOUNT_URL` | URL des Account-Service aus Umgebungsvariable – wird von Kubernetes gesetzt |
| `\|\| 'http://localhost:8080'` | Fallback fuer lokales Testen falls keine Umgebungsvariable gesetzt |
| `app.use(express.json())` | Parst eingehende JSON-Requests automatisch |
| `/buy` | Ruft `Account/Cryptos/Add` auf – schreibt Coins gut |
| `/sell` Logik | Prueft Kontostand zuerst – hat User weniger als `amount`, wird nur verfuegbares abgezogen (Kontostand geht nie negativ) |
| `app.listen(8002)` | Service hoert auf Port 8002 auf eingehende Requests |

---

### BuySell containerisieren

Das Dockerfile fuer den BuySell Service basiert auf `node:18-alpine` und kopiert nur die notwendigen Dateien:

```dockerfile
FROM node:18-alpine        # Basis-Image: Node.js 18 auf Alpine Linux (~50 MB)
WORKDIR /app               # Arbeitsverzeichnis im Container
COPY package.json .        # erst nur package.json – fuer Docker Cache
RUN npm install            # Abhaengigkeiten installieren
COPY . .                   # restlichen Code kopieren
EXPOSE 8002                # Port dokumentieren
CMD ["node", "index.js"]   # Service starten
``` – baut das BuySell-Image auf Basis von Node.js 18 Alpine*
|-------|-----------|
| `FROM node:18-alpine` | Basis-Image mit Node.js 18 auf Alpine Linux (klein, ca. 50 MB statt 1 GB) |
| `WORKDIR /app` | Arbeitsverzeichnis im Container |
| `COPY package.json .` | Erst nur package.json – so wird `npm install` von Docker gecacht solange sich Abhaengigkeiten nicht aendern |
| `RUN npm install` | Installiert Abhaengigkeiten (express, axios) |
| `COPY . .` | Kopiert den restlichen Code in den Container |
| `EXPOSE 8002` | Dokumentiert den Port (noetig damit Kubernetes den Port kennt) |
| `CMD` | Startet den Service beim Container-Start |

Der Container wird gebaut und auf Docker Hub gepusht, damit Kubernetes das Image spaeter von dort ziehen kann:

```bash
docker build -t michaeleatontbz/kn08-buysell:v1 .
docker push michaeleatontbz/kn08-buysell:v1
```

---

### SendReceive Service

Der SendReceive Service ermoeglicht das Senden von tbzCoins an Freunde. Vor dem Senden prueft er zwei Dinge: ist der Empfaenger ein Freund, und hat der Sender genug Coins.

- `POST /send` - Sendet tbzCoins an einen Freund

```javascript
// sendreceive/index.js – /send Endpoint, prueft Freundschaft + Guthaben vor Transfer

const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// URL des Account-Service – kommt von Kubernetes, sonst localhost
const ACCOUNT_URL = process.env.ACCOUNT_URL || 'http://localhost:8080';

app.post('/send', async (req, res) => {
  const { id, receiverId, amount } = req.body;

  // Freundschaft pruefen
  const friendsRes = await axios.get(`${ACCOUNT_URL}/Account/Friends/?userid=${id}`);
  const isFriend = friendsRes.data.some(f => f.id === receiverId);
  if (!isFriend) return res.status(400).json({ error: 'Not a friend' });

  // Guthaben pruefen
  const balanceRes = await axios.get(`${ACCOUNT_URL}/Account/Cryptos/?userid=${id}`);
  if (balanceRes.data.amount < amount) return res.status(400).json({ error: 'Not enough coins' });

  // Transfer: Sender abziehen, Empfaenger gutschreiben
  await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Subtract`, { userId: id, amount });
  await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Add`, { userId: receiverId, amount });

  res.json({ success: true });
});

app.listen(8003, () => console.log('SendReceive running on port 8003'));
```

| Element | Bedeutung |
|---------|-----------|
| `id` | Sender-ID |
| `receiverId` | Empfaenger-ID |
| `isFriend` Pruefung | Holt Freundesliste vom Account-Service – bricht ab wenn `receiverId` nicht drin ist |
| `res.status(400)` | HTTP-Fehlercode – Request abgelehnt mit Begruendung |
| Guthabenspruefung | Bricht ab wenn Sender nicht genug Coins hat |
| `Subtract` + `Add` | Zwei Account-Service Calls – zieht beim Sender ab, schreibt beim Empfaenger gut (kein direkter DB-Zugriff) |
| `app.listen(8003)` | Anderer Port als BuySell (8002) damit beide gleichzeitig laufen koennen |

---

### SendReceive containerisieren

Gleiche Struktur wie BuySell, nur anderer Port:

```dockerfile
FROM node:18-alpine        # Basis-Image: Node.js 18 auf Alpine Linux (~50 MB)
WORKDIR /app               # Arbeitsverzeichnis im Container
COPY package.json .        # erst nur package.json – fuer Docker Cache
RUN npm install            # Abhaengigkeiten installieren
COPY . .                   # restlichen Code kopieren
EXPOSE 8003                # anderer Port als BuySell (8002)
CMD ["node", "index.js"]   # Service starten
``` – gleiche Struktur wie BuySell, nur Port 8003*, damit Kubernetes das Image spaeter von dort ziehen kann:

```bash
cd sendreceive
docker build -t michaeleatontbz/kn08-sendreceive:v1 .
docker push michaeleatontbz/kn08-sendreceive:v1
```

| Flag/Teil | Bedeutung |
|-----------|-----------|
| `cd sendreceive` | Wechselt in den SendReceive-Ordner wo das Dockerfile liegt |
| `-t` | Setzt den Tag im Format `dockerhub-username/image-name:version` |
| `:v1` | Versionsnummer – wichtig fuer Rolling Updates in Kubernetes |
| `.` | Dockerfile im aktuellen Verzeichnis verwenden |
| `docker push` | Laedt das Image auf Docker Hub – von dort zieht Kubernetes es beim Pod-Start |

Beide Images sind jetzt auf Docker Hub verfuegbar und koennen in Kubernetes deployt werden.

---

## Schritt 7: Kubernetes Deployment

*Ziel: Alle vier Microservices in Kubernetes deployen – mit Secrets, ConfigMaps, Deployments und Services. Erster vollstaendiger Test der gesamten Applikation im Cluster.*

### Kubernetes Secret fuer Datenbank-Credentials

Sensible Daten wie Passwoerter werden in Kubernetes als Secret gespeichert - nicht in einer ConfigMap (Speichert Konfigurationswerte zentral und injiziert sie als Umgebungsvariablen in Container). Secrets werden Base64-encoded (Kodierungsformat das Daten in ASCII-Zeichen umwandelt – keine Verschluesselung, nur Kodierung) gespeichert und koennen ueber RBAC-Policies (rollenbasierte Zugriffskontrolle – definiert wer was lesen/aendern darf, z.B. nur Pod X darf Secret Y lesen) geschuetzt werden. Das Secret enthaelt die Zugangsdaten fuer die AWS RDS MariaDB:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret   # Name des Secrets – wird in Deployments referenziert
type: Opaque        # generischer Typ fuer beliebige Key-Value Paare
data:
  # ConnectionString Base64-kodiert – nicht im Klartext gespeichert
  db-connection-string: U2VydmVyPWtuMDgtZGIuYzM2b3NxZTJjcnM5LnVzLWVhc3QtMS5yZHMuYW1hem9uYXdzLmNvbTtEYXRhYmFzZT1tMzQ3a24wODtVc2VyIElEPWFkbWluO1Bhc3N3b3JkPUFkbWluMTIzNCE7
```

*`secret.yaml` – speichert den DB-ConnectionString Base64-kodiert in Kubernetes*

| Element | Bedeutung |
|---------|-----------|
| `kind: Secret` | Kubernetes-Objekt speziell fuer sensible Daten (sicherer als ConfigMap) |
| `type: Opaque` | Generischer Secret-Typ fuer beliebige Key-Value Paare |
| `Base64` | Kodierungsformat das Daten in ASCII-Zeichen umwandelt – kein Verschluesselung, nur Kodierung |
| `db-connection-string` | Key unter dem der Connection String gespeichert wird |

> **Warum nicht in der ConfigMap?** ConfigMaps sind im Cluster fuer alle lesbar. Secrets koennen ueber RBAC (rollenbasierte Zugriffskontrolle – wer was lesen darf) eingeschraenkt werden – nur berechtigte Pods koennen sie lesen.

Der Base64-encodierte Wert enthaelt den Connection String (alle Infos damit der Service weiss wie er sich zur Datenbank verbindet):
```
Server=kn08-db.c36osqe2crs9.us-east-1.rds.amazonaws.com;Database=m347kn08;User ID=admin;Password=Admin1234!;
```

Das Account-Deployment referenziert das Secret ueber `secretKeyRef`, damit die Credentials nicht hardcodiert im Image oder in der ConfigMap stehen:

```yaml
containers:
- name: account
  image: michaeleatontbz/kn08-account:v1
  ports:
  - containerPort: 8080
  env:
  - name: ConnectionString      # Umgebungsvariable im Container
    valueFrom:
      secretKeyRef:
        key: db-connection-string   # Key aus dem Secret
        name: db-secret             # welches Secret
```

| Element | Bedeutung |
|---------|-----------|
| `valueFrom` | Wert kommt nicht direkt im YAML, sondern aus einer anderen Quelle |
| `secretKeyRef` | Referenziert einen Key aus einem Secret |
| `key: db-connection-string` | Welcher Key aus dem Secret gelesen wird |
| `name: db-secret` | Welches Secret verwendet wird |

![Secret DB](KN08_23_Secret_MongoDB.png)

---

### ConfigMap

Die ConfigMap speichert die URL des Account-Services, damit BuySell und SendReceive ihn finden koennen. Kubernetes injiziert diese Werte als Umgebungsvariablen in die Container:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: crypto-config   # Name – wird in Deployments referenziert
data:
  ACCOUNT_URL: "http://account-service:8080"   # interner Kubernetes DNS-Name
```

*`configmap.yaml` – speichert die Account-Service URL zentral, wird von BuySell und SendReceive gelesen*

> `account-service` ist kein Hostname einer Maschine, sondern der Name des Kubernetes-Service-Objekts. Kubernetes loest diesen Namen intern auf die richtige Pod-IP auf (internes DNS – automatische Namensaufloesung im Cluster).

---

### Deployments und Services

Fuer jeden Microservice wurde ein Deployment und ein Service erstellt. Das Deployment definiert wie viele Replicas laufen sollen und welches Image verwendet wird. Der Service macht den Pod im Netzwerk erreichbar.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: account
spec:
  replicas: 1                    # Anzahl Pod-Instanzen
  selector:
    matchLabels:
      app: account               # verbindet Deployment mit Pods ueber dieses Label
  template:
    metadata:
      labels:
        app: account             # Label das dem Pod gegeben wird
    spec:
      containers:
      - name: account
        image: michaeleatontbz/kn08-account:v1
        ports:
        - containerPort: 8080   # Port auf dem der Container hoert
---
apiVersion: v1
kind: Service
metadata:
  name: account-service
spec:
  selector:
    app: account                 # leitet Traffic an Pods mit diesem Label
  ports:
  - port: 8080                   # Port im Cluster
    targetPort: 8080             # Port im Container
    nodePort: 30080              # externer Port – von aussen erreichbar
  type: NodePort
```

*`account.yaml` – Deployment (1 Replica) und NodePort-Service fuer den Account-Service auf Port 30080*
| `selector.matchLabels` | Verbindet Deployment mit seinen Pods ueber Labels (Schluessel-Wert-Paare zur Identifikation von Pods) |
| `labels: app: account` | Label das dem Pod gegeben wird – so findet der Service den Pod |
| `containerPort: 8080` | Port auf dem der Container hoert |
| `---` | Trenner zwischen zwei YAML-Ressourcen in derselben Datei |
| `selector: app: account` | Service leitet Traffic nur an Pods mit diesem Label weiter |
| `port` | Port auf dem der Service im Cluster erreichbar ist |
| `targetPort` | Port auf dem der Container wirklich hoert |
| `nodePort: 30080` | Externer Port – von aussen erreichbar via `<NodeIP>:30080` |
| `type: NodePort` | Service-Typ der den Port auf allen Nodes oeffnet |

---

### BuySell Deployment mit ConfigMap-Referenz

Das BuySell Deployment zeigt die Verknuepfung zwischen ConfigMap und Container - die Umgebungsvariable `ACCOUNT_URL` wird direkt aus der ConfigMap gelesen:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: buysell
spec:
  replicas: 3                    # 3 Instanzen fuer Hochverfuegbarkeit
  selector:
    matchLabels:
      app: buysell
  template:
    metadata:
      labels:
        app: buysell
    spec:
      containers:
      - name: buysell
        image: michaeleatontbz/kn08-buysell:v1
        ports:
        - containerPort: 8002
        env:
        - name: ACCOUNT_URL      # Umgebungsvariable im Container
          valueFrom:
            configMapKeyRef:
              key: ACCOUNT_URL       # Key aus der ConfigMap
              name: crypto-config    # welche ConfigMap
```

*`buysell.yaml` – Deployment mit 3 Replicas, liest Account-URL aus der ConfigMap* (System bleibt verfuegbar auch wenn eine Node ausfaellt) und Load Balancing (Lastverteilung) |
| `configMapKeyRef` | Liest Wert aus einer ConfigMap statt ihn hardzucodieren |
| `key: ACCOUNT_URL` | Welcher Key aus der ConfigMap gelesen wird |
| `name: crypto-config` | Welche ConfigMap verwendet wird |

![BuySell Deployment](KN08_24_BuySell_Deployment.png)

---

### SendReceive Deployment mit ConfigMap-Referenz

Gleiche Struktur wie BuySell - der SendReceive Service holt sich die Account-URL aus der ConfigMap:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sendreceive
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sendreceive
  template:
    metadata:
      labels:
        app: sendreceive
    spec:
      containers:
      - name: sendreceive
        image: michaeleatontbz/kn08-sendreceive:v1
        ports:
        - containerPort: 8003
        env:
        - name: ACCOUNT_URL      # Umgebungsvariable im Container
          valueFrom:
            configMapKeyRef:
              key: ACCOUNT_URL       # Key aus der ConfigMap
              name: crypto-config    # welche ConfigMap
```

*`sendreceive.yaml` – Deployment mit 3 Replicas, gleiche Struktur wie buysell.yaml*

![SendReceive Deployment](KN08_25_SendReceive_Deployment.png)

---

### Replicas und Hochverfuegbarkeit

Alle Microservices laufen mit 3 Replicas. Kubernetes verteilt die Pods automatisch auf die 3 Nodes im Cluster. Das bietet Hochverfuegbarkeit, Load Balancing und ermoeglicht Rolling Updates ohne Downtime (Ausfallzeit).

```bash
microk8s kubectl scale deployment account --replicas=3
microk8s kubectl scale deployment buysell --replicas=3
microk8s kubectl scale deployment sendreceive --replicas=3
microk8s kubectl scale deployment frontend --replicas=3
```

| Element | Bedeutung |
|---------|-----------|
| `scale deployment` | Aendert die Anzahl Replicas eines laufenden Deployments |
| `--replicas=3` | Zielanzahl – Kubernetes faehrt Pods hoch oder runter bis dieser Wert erreicht ist |

> **Warum 3 Replicas?** Faellt eine Node aus, laufen die anderen 2 weiter. Kubernetes startet automatisch neue Pods auf gesunden Nodes.

![Replicas 3](KN08_22_Replicas_3.png)

Alle Deployments laufen mit 3/3 Ready.

Alles wurde mit folgendem Befehl in Kubernetes deployt:

```bash
microk8s kubectl apply -f secret.yaml
microk8s kubectl apply -f configmap.yaml
microk8s kubectl apply -f account.yaml
microk8s kubectl apply -f buysell.yaml
microk8s kubectl apply -f sendreceive.yaml
microk8s kubectl apply -f frontend.yaml
```

> **Reihenfolge wichtig:** Secret und ConfigMap zuerst – die anderen Deployments referenzieren sie und wuerden ohne sie nicht starten.

---

### Pods laufen auf Node 1

```bash
microk8s kubectl get pods
microk8s kubectl get services
```

| Befehl | Bedeutung |
|--------|-----------|
| `get pods` | Zeigt alle Pods mit Status (Running, Pending, Error) |
| `get services` | Zeigt alle Services mit Ports und Cluster-IPs |

![Pods Node 1](KN08_09_Pods_Running_Node1.png)

Alle Pods sind im Status `Running`. Die Services sind korrekt konfiguriert mit den richtigen Ports.

---

### Pods laufen auf Node 2

Da Kubernetes ein verteiltes System ist, sind die Pods und Services auf allen Nodes sichtbar:

![Pods Node 2](KN08_10_Pods_Running_Node2.png)

---

## App im Browser aufrufen

*Ziel: Bestaetigen dass die App ueber jeden Node erreichbar ist und alle Daten korrekt geladen werden.*

Das Frontend ist ueber Port 30100 auf jeder Node erreichbar. Der NodePort-Service leitet den Traffic an den Frontend-Pod weiter.

> Egal welche Node-IP man aufruft – Kubernetes leitet den Request immer zum richtigen Pod weiter, auch wenn dieser auf einer anderen Node laeuft.

### Node 1 (98.93.204.194:30100)

![Frontend Node 1](KN08_11_Frontend_Node1.png)

### Node 2 (98.92.50.103:30100)

![Frontend Node 2](KN08_12_Frontend_Node2.png)

### App mit Daten

Nach dem Anpassen der Environment-Variablen werden die Daten korrekt geladen:

![Frontend Working](KN08_14_Frontend_Working.png)

User 1 (Rene) hat 30 tbzCoins und hat Sara, Yannis und Sabrina als Freunde.

---

## Schritt 8: App Update ohne Downtime

*Ziel: Zeigen dass ein Software-Update in Kubernetes ohne Ausfallzeit ausgerollt werden kann – eine der Hauptstaerken von Kubernetes.*

Kubernetes ermoeglicht Rolling Updates (schrittweiser Austausch alter Pods durch neue) - alte Pods laufen weiter waehrend neue hochgefahren werden. Der Titel der App wurde geaendert um ein Software-Update zu simulieren.

```bash
microk8s kubectl set image deployment/frontend frontend=michaeleatontbz/kn08-frontend:v3
```

| Element | Bedeutung |
|---------|-----------|
| `set image` | Aendert das Image eines laufenden Deployments |
| `deployment/frontend` | Welches Deployment aktualisiert wird |
| `frontend=...` | Containername im Pod = neues Image |
| `:v3` | Neues Image-Tag – Kubernetes erkennt die Aenderung und startet den Rollout |

> **Wie funktioniert Rolling Update?** Kubernetes startet einen neuen Pod mit `:v3`, wartet bis er `Running` ist, faehrt dann erst den alten Pod runter. So laeuft immer mindestens eine Instanz – keine Downtime.

### Rollout in Aktion

```bash
microk8s kubectl get pods
```

![Rolling Update](KN08_15_Update_Rollout.png)

Man sieht den neuen Pod wird gestartet. Kubernetes faehrt den alten Pod erst herunter wenn der neue bereit ist - das garantiert keine Downtime.

### Aktualisiertes Frontend

![Frontend v3](KN08_16_Frontend_v3.png)

Der neue Titel "TBZ Crypto Exchange v2" ist sichtbar. Die App laeuft weiterhin mit allen Daten.

---

## Schritt 9: Multistage Dockerfile und Dynamic Environment Variables

*Ziel: Zwei Probleme loesen – (1) Build-Prozess in den Container verlagern, (2) Environment-Variablen zur Laufzeit durch Kubernetes setzbar machen statt beim Build hardcodiert.*

### Problem mit dem alten Ansatz

Bisher musste `npm run build` manuell ausgefuehrt werden bevor der Container gebaut werden konnte. Ausserdem wurden die Environment-Variablen beim Build hardcodiert in die JavaScript-Dateien eingebaut. Das bedeutete, dass fuer jede Umgebung (Docker Desktop, Kubernetes) ein separater Build noetig war und eine Konfiguration durch Kubernetes nicht moeglich war.

---

### Multistage Dockerfile

*Schritt 9, Teil 1 – Build-Prozess ins Dockerfile verlagern damit kein manuelles `npm run build` mehr noetig ist.*

Das Dockerfile wurde auf einen Multistage-Build (mehrstufiger Build – haelt finales Image klein indem nur das noetige in die Produktion kommt) umgestellt. Die erste Stage baut die React-App, die zweite Stage kopiert nur das fertige Build-Resultat in einen schlanken nginx-Container:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS build      # Basis-Image mit Node.js, nur fuer den Build
WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm ci                         # strikt nach package-lock.json – reproduzierbar
COPY app/ .
RUN npm run build                  # React zu statischen Dateien kompilieren

# Stage 2: Production
FROM nginx:alpine                  # neues Basis-Image – ohne node_modules aus Stage 1
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*                     # Standard nginx-Seite loeschen
COPY --from=build /app/build .    # nur das Build-Resultat aus Stage 1 kopieren
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh        # Script ausfuehrbar machen
EXPOSE 80
ENTRYPOINT /entrypoint.sh          # Script vor nginx starten – ersetzt Platzhalter
```

*`frontend/Dockerfile` – Multistage-Build: Stage 1 baut React, Stage 2 packt nur das Ergebnis in nginx* Gibt der ersten Stage einen Namen damit Stage 2 darauf referenzieren kann |
| `npm ci` | Wie `npm install` aber strikt nach `package-lock.json` – reproduzierbar |
| `FROM nginx:alpine` | Zweite Stage startet frisch – ohne node_modules aus Stage 1 |
| `COPY --from=build` | Kopiert nur das fertige `/build` aus Stage 1 in das finale Image |
| `chmod +x entrypoint.sh` | Macht das Script ausfuehrbar |
| `ENTRYPOINT` | Script das beim Container-Start ausgefuehrt wird (statt CMD) |

**Vorteile:**
- Kein lokales `npm run build` mehr noetig – Build passiert im Container
- Finales Image nur ca. 25 MB (nur nginx + statische Dateien, keine node_modules)
- Reproduzierbar – egal auf welcher Maschine gebaut wird

![Multistage Dockerfile](KN08_18_Multistage_Dockerfile.png)

---

### Dynamic Environment Variables mit entrypoint.sh

*Schritt 9, Teil 2 – Environment-Variablen zur Laufzeit durch Kubernetes setzbar machen, da React sie sonst beim Build hardcodiert.*

> **Problem:** React ersetzt beim Build alle `process.env.REACT_APP_*` durch ihre Literalwerte (fest eingebaute Strings, keine Variablen mehr). Danach sind es keine Variablen mehr – nur hardcodierte Strings in den JS-Dateien. Kubernetes kann sie nach dem Build nicht mehr aendern.

**Loesung mit Platzhaltern:**
1. `.env.production` enthaelt Platzhalter-Strings statt echte Werte
2. React baut diese Platzhalter literal in die JS-Dateien ein
3. `entrypoint.sh` ersetzt die Platzhalter beim Container-Start per `sed` mit den echten Werten aus den Kubernetes-Umgebungsvariablen

Die `.env.production` Datei:

```
REACT_APP_ACCOUNT_HOLDINGS=__REACT_APP_ACCOUNT_HOLDINGS__
REACT_APP_ACCOUNT_FRIENDS=__REACT_APP_ACCOUNT_FRIENDS__
REACT_APP_BUYSELL_BUY=__REACT_APP_BUYSELL_BUY__
REACT_APP_BUYSELL_SELL=__REACT_APP_BUYSELL_SELL__
REACT_APP_SENDRECEIVE_SEND=__REACT_APP_SENDRECEIVE_SEND__
REACT_APP_USER_LOGGED_IN=__REACT_APP_USER_LOGGED_IN__
```

*`frontend/.env.production` – enthaelt Platzhalter statt echte URLs, werden beim Container-Start ersetzt*

```sh
#!/bin/sh
set -e
JS_DIR=/usr/share/nginx/html/static/js
replace_var() {
  varname=$1
  varvalue=$2
  if [ -n "$varvalue" ]; then
    for file in $JS_DIR/*.js; do
      sed -i "s|__${varname}__|${varvalue}|g" "$file"
    done
    echo "Replaced __${varname}__ with ${varvalue}"
  fi
}
replace_var REACT_APP_ACCOUNT_HOLDINGS "$REACT_APP_ACCOUNT_HOLDINGS"
replace_var REACT_APP_ACCOUNT_FRIENDS "$REACT_APP_ACCOUNT_FRIENDS"
replace_var REACT_APP_BUYSELL_BUY "$REACT_APP_BUYSELL_BUY"
replace_var REACT_APP_BUYSELL_SELL "$REACT_APP_BUYSELL_SELL"
replace_var REACT_APP_SENDRECEIVE_SEND "$REACT_APP_SENDRECEIVE_SEND"
replace_var REACT_APP_USER_LOGGED_IN "$REACT_APP_USER_LOGGED_IN"
exec nginx -g 'daemon off;'
```

*`frontend/entrypoint.sh` – laeuft beim Container-Start, ersetzt Platzhalter in den JS-Dateien mit echten Werten aus Kubernetes, startet dann nginx* Script bricht bei Fehler sofort ab |
| `sed -i` | Ersetzt Text direkt in der Datei (in-place) |
| `s\|__${varname}__\|${varvalue}\|g` | sed-Syntax: ersetze Platzhalter durch echten Wert, `g` = alle Vorkommen |
| `exec nginx -g 'daemon off;'` | Startet nginx im Vordergrund – noetig damit Docker den Prozess tracken kann |

---

### Environment in den Backend-Komponenten (BuySell & SendReceive)

*Schritt 9, Teil 3 – Sicherstellen dass auch BuySell, SendReceive und Account ihre Konfiguration von Kubernetes kriegen.*

Im Gegensatz zum Frontend haben BuySell und SendReceive keine Build-Phase die Variablen hardcodiert. Sie lesen `process.env.ACCOUNT_URL` zur Laufzeit direkt. Die Konfiguration kommt aus der ConfigMap via `configMapKeyRef`:

```yaml
env:
- name: ACCOUNT_URL
  valueFrom:
    configMapKeyRef:
      key: ACCOUNT_URL
      name: crypto-config
```

Der Account-Service erhaelt seinen ConnectionString aus dem Secret:

```yaml
env:
- name: ConnectionString
  valueFrom:
    secretKeyRef:
      key: db-connection-string
      name: db-secret
```

> So koennen alle Konfigurationswerte zentral in Kubernetes verwaltet werden, ohne Images neu bauen zu muessen.

---

### Erweiterte ConfigMap

*Schritt 9, Teil 4 – ConfigMap mit Frontend-URLs ergaenzen damit entrypoint.sh die echten Werte von Kubernetes erhaelt.*

Die ConfigMap wurde mit den Frontend-Variablen ergaenzt. Kubernetes injiziert diese Werte als Umgebungsvariablen in den Container, wo `entrypoint.sh` sie in die JS-Dateien eintraegt:

```yaml
apiVersion: v1
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: crypto-config
data:
  ACCOUNT_URL: http://account-service:8080             # fuer BuySell und SendReceive
  REACT_APP_ACCOUNT_HOLDINGS: http://98.93.204.194:30080/Account/Cryptos/?userid=<userId>
  REACT_APP_ACCOUNT_FRIENDS: http://98.93.204.194:30080/Account/Friends/?userid=<userId>
  REACT_APP_BUYSELL_BUY: http://98.92.50.103:30002/buy
  REACT_APP_BUYSELL_SELL: http://98.92.50.103:30002/sell
  REACT_APP_SENDRECEIVE_SEND: http://44.222.167.186:30003/send
  REACT_APP_USER_LOGGED_IN: '1'
```

*`crypto-config.yaml` – erweiterte ConfigMap mit allen Frontend-URLs und Account-Service URL*

Das Frontend-Deployment referenziert die ConfigMap via `envFrom`:

```yaml
containers:
- name: frontend
  image: michaeleatontbz/kn08-frontend:v5
  imagePullPolicy: Always    # immer neues Image pullen – kein altes gecachtes verwenden
  ports:
  - containerPort: 80
  envFrom:
  - configMapRef:
      name: crypto-config    # alle Keys der ConfigMap als Umgebungsvariablen laden
```

*`frontend-deployment.yaml` – Frontend-Deployment, laedt alle ConfigMap-Werte via `envFrom`*

| Element | Bedeutung |
|---------|-----------|
| `envFrom` | Laedt alle Keys der ConfigMap als Umgebungsvariablen – kein einzelnes `configMapKeyRef` noetig |
| `imagePullPolicy: Always` | Kubernetes zieht das Image immer neu – verhindert dass ein gecachtes altes Image verwendet wird |

![ConfigMap Extended](KN08_19_ConfigMap_Extended.png)

---

### Build und Deploy

*Schritt 9, Teil 5 – Neues Image bauen, pushen und in Kubernetes ausrollen damit die dynamischen Variablen aktiv werden.*

```bash
docker build -t michaeleatontbz/kn08-frontend:v5 ~/kn08-repo/frontend/
docker push michaeleatontbz/kn08-frontend:v5
microk8s kubectl apply -f crypto-config.yaml
microk8s kubectl apply -f frontend-deployment.yaml
microk8s kubectl rollout restart deployment frontend
```

| Befehl | Bedeutung |
|--------|-----------|
| `docker build ... ~/kn08-repo/frontend/` | Pfad zum Dockerfile statt `.` – noetig wenn man nicht im richtigen Verzeichnis ist |
| `rollout restart` | Startet alle Pods des Deployments neu – erzwingt das neue Image und entrypoint.sh |

![Pods Running v5](KN08_20_Pods_v5.png)

Die Pods laufen und `entrypoint.sh` ersetzt die Platzhalter korrekt zur Laufzeit, wie in den Pod-Logs bestaetigt:

```
Replaced __REACT_APP_SENDRECEIVE_SEND__ with http://44.222.167.186:30003/send
Replaced __REACT_APP_USER_LOGGED_IN__ with 1
```

---

## Schritt 10: LoadBalancer Service

*Ziel: Traffic nicht mehr ueber eine einzelne Node-IP leiten sondern ueber einen echten Load Balancer – fuer Produktion noetig.*
Ein Load Balancer ist ein System das eingehenden Traffic auf mehrere Server verteilt – sozusagen ein Manager der entscheidet wer die Arbeit bekommt und bei Ausfall eines Servers die Arbeit automatisch an einen anderen weitergibt.

| | Verhalten |
|--|-----------|
| **Ohne Load Balancer** | Du rufst direkt eine Node-IP auf z.B. `98.93.204.194:30100` – faellt genau diese Node aus, ist die App nicht mehr erreichbar |
| **Mit Load Balancer** | Du rufst eine einzige Adresse auf – der Load Balancer entscheidet automatisch welche Node den Request bearbeitet und schickt bei Ausfall den Traffic an eine andere |

### Aufgabe

Der Frontend-Service soll von `NodePort` auf `LoadBalancer` umgestellt werden. Ein LoadBalancer-Service provisioniert in einer Cloud-Umgebung automatisch einen externen Load Balancer (verteilt eingehenden Traffic auf mehrere Pods), der Traffic auf die Pods verteilt.

### Umstellung des Service-Typs

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30100      # externer Port – von aussen erreichbar
  type: LoadBalancer     # einzige Aenderung gegenueber NodePort
```

*`frontend-service.yaml` – Service-Typ von NodePort auf LoadBalancer umgestellt*

> Einzige Aenderung gegenueber NodePort: `type: LoadBalancer` – Kubernetes erkennt das und versucht automatisch einen externen Load Balancer zu provisionieren.

```bash
microk8s kubectl apply -f frontend-service.yaml
microk8s kubectl get services
```

![LoadBalancer Pending](KN08_21_LoadBalancer_Pending.png)

---

### Warum steht EXTERNAL-IP auf "pending"?

Unser Setup laeuft auf normalen AWS EC2-Instanzen (self-managed Kubernetes) – kein Cloud Controller Manager (Bruecke zwischen Kubernetes und Cloud-Provider) vorhanden. Deshalb bleibt `EXTERNAL-IP` dauerhaft auf `<pending>`.

> **Cloud Controller Manager** = Bruecke zwischen Kubernetes und dem Cloud-Provider. Nur in verwalteten Diensten wie EKS (Elastic Kubernetes Service – verwalteter Kubernetes-Dienst von AWS) eingebaut.

---

### Was in AWS EKS passieren wuerde

| Schritt | Was passiert |
|---------|--------------|
| 1 | Kubernetes erkennt `type: LoadBalancer` |
| 2 | AWS Cloud Controller Manager erhaelt den Request |
| 3 | AWS provisioniert automatisch einen NLB (Network Load Balancer) oder ALB (Application Load Balancer) |
| 4 | NLB bekommt eine oeffentliche DNS-Adresse |
| 5 | Traffic vom Internet laeuft ueber NLB zu den NodePorts |
| 6 | Health Checks (automatische Pruefung ob Node noch erreichbar) entfernen ungesunde Nodes automatisch |
| 7 | EXTERNAL-IP erscheint in `kubectl get services` |

Optional kann man mit Annotations den LoadBalancer-Typ steuern:

```yaml
metadata:
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
```

---

### Alternativen fuer microk8s (ohne Cloud-Provider)

- **MetalLB Addon** (LoadBalancer-Loesung fuer lokale Kubernetes-Cluster ohne Cloud-Provider) – Simuliert einen LoadBalancer auf Bare-Metal (physische Server, keine Cloud-VM), vergibt IPs aus einem konfigurierten Pool: `microk8s enable metallb:10.64.140.43-10.64.140.49`
- **NodePort weiternutzen** – App bleibt ueber `<NodeIP>:30100` auf allen 3 Nodes erreichbar

---

### Aktuelle Erreichbarkeit

Trotz `<pending>` ist die App ueber den NodePort 30100 auf allen Nodes zugaenglich:
- http://98.93.204.194:30100 (Node 1)
- http://98.92.50.103:30100 (Node 2)
- http://44.222.167.186:30100 (Node 3)

---

## Docker Hub Images

Alle Images wurden auf Docker Hub unter `michaeleatontbz` gepusht:

- `michaeleatontbz/kn08-frontend:v1` bis `v5`
- `michaeleatontbz/kn08-account:v1`
- `michaeleatontbz/kn08-buysell:v1`
- `michaeleatontbz/kn08-sendreceive:v1`

---

## Cluster Informationen

- 3 Nodes mit microk8s auf Ubuntu VMs (AWS EC2 t3.medium – Cloud-Servertyp von Amazon)
- Node 1: 98.93.204.194
- Node 2: 98.92.50.103
- Node 3: 44.222.167.186
