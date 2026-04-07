# KN08: Kubernetes III - Microservices

## Uebersicht

In diesem Auftrag wurde eine Microservice-Applikation fuer eine Crypto-Exchange-Plattform (tbzCoin) implementiert und in Kubernetes deployt. Die Applikation besteht aus 4 Microservices:

- **Frontend** (React App) - vorgegeben
- **Account** (.NET Service) - vorgegeben
- **BuySell** (Node.js) - selbst implementiert
- **SendReceive** (Node.js) - selbst implementiert

---

## Cluster Informationen

Der Kubernetes Cluster besteht aus 3 AWS EC2 Instanzen mit Ubuntu Server und MicroK8s.

| Node | Private IP | Oeffentliche IP |
|------|------------|-----------------|
| node1 | 172.31.76.72 | 44.200.165.119 |
| node2 | 172.31.73.162 | 3.235.40.227 |
| node3 | 172.31.71.83 | 3.238.182.134 |

---

## Schritt 1: Datenbank erstellen (AWS RDS)

Die Datenbank wurde als MariaDB-Instanz auf AWS RDS erstellt. AWS RDS ist ein verwalteter Datenbankdienst von Amazon, der es erlaubt Datenbanken ohne eigene Server zu betreiben.

In der AWS Console wurde unter RDS eine neue MariaDB-Instanz mit folgenden Einstellungen erstellt:
- DB Identifier: `kn08-db`
- Engine: MariaDB
- Template: Free tier
- Public access: Yes

![RDS Available](KN08_RDS_Available.png)

Die Datenbank ist mit Status **Verfuegbar** bereit.

Der Endpoint der Datenbank lautet `kn08-db.c36osqe2crs9.us-east-1.rds.amazonaws.com`:

![RDS Endpoint](KN08_02_RDS_Endpoint.png)

### SQL-Script einspielen

Das initiale SQL-Script wurde auf Node 1 eingespielt:

```bash
mysql -h kn08-db.c36osqe2crs9.us-east-1.rds.amazonaws.com -P 3306 -u admin -p < ~/m347kn08/database/m347_KN08_DB.sql
```

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

Das Frontend ist eine React-App. Die Environment-Variablen in `.env.production` wurden mit den AWS Node IPs gesetzt:

```
REACT_APP_ACCOUNT_HOLDINGS=http://44.200.165.119:30080/Account/Cryptos/?userid=<userId>
REACT_APP_ACCOUNT_FRIENDS=http://44.200.165.119:30080/Account/Friends/?userid=<userId>
REACT_APP_BUYSELL_BUY=http://44.200.165.119:30002/buy
REACT_APP_BUYSELL_SELL=http://44.200.165.119:30002/sell
REACT_APP_SENDRECEIVE_SEND=http://44.200.165.119:30003/send
REACT_APP_USER_LOGGED_IN=1
```

Dann wurde die App gebaut und in einen Container gepackt:

```bash
npm install
npm run build
docker build -t michaeleatontbz/kn08-frontend:v1 .
docker push michaeleatontbz/kn08-frontend:v1
```

![Frontend Push](KN08_04_Frontend_Push.png)

---

## Schritt 3: Account-Komponente containerisieren

Der Account Service ist in .NET geschrieben und bereits vorgegeben. Die `appsettings.json` wurde mit dem RDS-ConnectionString konfiguriert:

```json
{
  "ConnectionString": "Server=kn08-db.c36osqe2crs9.us-east-1.rds.amazonaws.com;Database=m347kn08;User ID=admin;Password=Admin1234!;"
}
```

Dann wurde der Container gebaut und gepusht:

```bash
docker build -t michaeleatontbz/kn08-account:v1 .
docker push michaeleatontbz/kn08-account:v1
```

![Account Push](KN08_06_Account_Push.png)

---

## Schritt 6: BuySell und SendReceive implementieren

### BuySell Service

Der BuySell Service wurde in Node.js implementiert mit zwei Endpoints:

- `POST /buy` - Kauft tbzCoins fuer einen Benutzer
- `POST /sell` - Verkauft tbzCoins eines Benutzers

```javascript
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ACCOUNT_URL = process.env.ACCOUNT_URL || 'http://localhost:8080';

app.post('/buy', async (req, res) => {
  const { id, amount } = req.body;
  const response = await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Add`, { userId: id, amount: amount });
  res.json(response.data);
});

app.post('/sell', async (req, res) => {
  const { id, amount } = req.body;
  const balanceRes = await axios.get(`${ACCOUNT_URL}/Account/Cryptos/?userid=${id}`);
  const currentBalance = balanceRes.data.amount;
  const actualAmount = currentBalance >= amount ? amount : currentBalance;
  const response = await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Subtract`, { userId: id, amount: actualAmount });
  res.json(response.data);
});

app.listen(8002, () => console.log('BuySell running on port 8002'));
```

### SendReceive Service

Der SendReceive Service ermoeglicht das Senden von tbzCoins an Freunde:

- `POST /send` - Sendet tbzCoins an einen Freund

```javascript
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const ACCOUNT_URL = process.env.ACCOUNT_URL || 'http://localhost:8080';

app.post('/send', async (req, res) => {
  const { id, receiverId, amount } = req.body;

  const friendsRes = await axios.get(`${ACCOUNT_URL}/Account/Friends/?userid=${id}`);
  const isFriend = friendsRes.data.some(f => f.id === receiverId);
  if (!isFriend) return res.status(400).json({ error: 'Not a friend' });

  const balanceRes = await axios.get(`${ACCOUNT_URL}/Account/Cryptos/?userid=${id}`);
  if (balanceRes.data.amount < amount) return res.status(400).json({ error: 'Not enough coins' });

  await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Subtract`, { userId: id, amount });
  await axios.post(`${ACCOUNT_URL}/Account/Cryptos/Add`, { userId: receiverId, amount });

  res.json({ success: true });
});

app.listen(8003, () => console.log('SendReceive running on port 8003'));
```

---

## Schritt 7: Kubernetes Deployment

### ConfigMap

Die ConfigMap speichert die URL des Account-Services damit BuySell und SendReceive ihn finden koennen:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: crypto-config
data:
  ACCOUNT_URL: "http://account-service:8080"
```

### Deployments und Services

Fuer jeden Microservice wurde ein Deployment und ein Service erstellt. Beispiel fuer den Account Service:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: account
spec:
  replicas: 1
  selector:
    matchLabels:
      app: account
  template:
    metadata:
      labels:
        app: account
    spec:
      containers:
      - name: account
        image: michaeleatontbz/kn08-account:v1
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: account-service
spec:
  selector:
    app: account
  ports:
  - port: 8080
    targetPort: 8080
    nodePort: 30080
  type: NodePort
```

Alles wurde deployt mit:

```bash
sudo microk8s kubectl apply -f configmap.yaml
sudo microk8s kubectl apply -f account.yaml
sudo microk8s kubectl apply -f buysell.yaml
sudo microk8s kubectl apply -f sendreceive.yaml
sudo microk8s kubectl apply -f frontend.yaml
```

### Pods laufen auf Node 1

```bash
sudo microk8s kubectl get pods
sudo microk8s kubectl get services
```

![Pods Node 1](KN08_09_Pods_Running_Node1.png)

### Pods laufen auf Node 2

![Pods Node 2](KN08_10_Pods_Running_Node2.png)

---

## App im Browser aufrufen

Das Frontend lauft auf Port 30100. Da der Frontend Pod auf Node 3 (3.238.182.134) laeuft ist die App dort erreichbar.

### Node 3 (3.238.182.134:30100)

![Frontend Node 1](KN08_11_Frontend_Node1.png)

### Node 1 (44.200.165.119:30100)

Nach dem Skalieren auf 2 Replicas lauft ein weiterer Pod auf Node 1:

![Frontend Node 2](KN08_12_Frontend_Node2.png)

### App mit Daten

![Frontend Working](KN08_14_Frontend_Working.png)

User 1 (Rene) hat 30 tbzCoins und hat Sara, Yannis und Sabrina als Freunde.

---

## Schritt 8: App Update ohne Downtime

Kubernetes ermoeglicht Rolling Updates - alte Pods laufen weiter waehrend neue hochgefahren werden. Der Titel wurde von "TBZ Crypto Exchange v2" auf "TBZ Crypto Exchange v3" geaendert.

```bash
sudo microk8s kubectl set image deployment/frontend frontend=michaeleatontbz/kn08-frontend:v5
```

### Rollout in Aktion

```bash
sudo microk8s kubectl rollout status deployment/frontend
sudo microk8s kubectl get pods
```

![Rolling Update](KN08_13_Rolling_Update.png)

Die neuen Pods `frontend-84bd66fcc4` werden gestartet waehrend die alten noch laufen - keine Downtime.

### Aktualisiertes Frontend

![Frontend v5](KN08_14_Frontend_v5.png)

Der neue Titel "TBZ Crypto Exchange v3" ist sichtbar.

---

## Schritt 9: Multistage Dockerfile

Das Dockerfile wurde optimiert:

```dockerfile
FROM nginx:alpine
COPY app/build/ /usr/share/nginx/html
EXPOSE 80
```

Das Image wurde gebaut und gepusht:

```bash
docker build -t michaeleatontbz/kn08-frontend:v5 .
docker push michaeleatontbz/kn08-frontend:v5
```

![Frontend v5 Push](KN08_17_Frontend_v4_Push.png)

Dann in Kubernetes aktualisiert:

```bash
sudo microk8s kubectl set image deployment/frontend frontend=michaeleatontbz/kn08-frontend:v5
```

---

## Schritt 10: LoadBalancer

Der Frontend-Service wurde von `NodePort` auf `LoadBalancer` umgestellt:

```bash
sudo microk8s kubectl patch service frontend-service -p '{"spec":{"type":"LoadBalancer"}}'
sudo microk8s kubectl get services
```

![LoadBalancer](KN08_15_LoadBalancer.png)

Der Service ist jetzt vom Typ `LoadBalancer`. Die `EXTERNAL-IP` bleibt auf `pending` da der Cluster auf AWS EC2 mit MicroK8s laeuft und kein nativer AWS LoadBalancer integriert ist. In AWS EKS wuerde hier automatisch eine oeffentliche IP vergeben werden.

---

## Docker Hub Images

Alle Images wurden auf Docker Hub unter `michaeleatontbz` gepusht:

- `michaeleatontbz/kn08-frontend:v1` bis `v5`
- `michaeleatontbz/kn08-account:v1`
- `michaeleatontbz/kn08-buysell:v1`
- `michaeleatontbz/kn08-sendreceive:v1`