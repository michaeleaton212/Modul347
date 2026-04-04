# 03 Deployment and Service WebApp

[TOC]

Wie bei der MongoDB müssen wir hier ebenfalls ein YAML-file mit *deployment* und *service* für die Webapplikation erstellen. In diesem Fall verwenden wir eine [bestehende Applikation vom Docker-Hub](https://hub.docker.com/r/nanajanashia/k8s-demo-app).

## Deployment

|property|Beschreibung|
|--------|------------|
|template|Hier wird der Pod defniert bzw. ein Blueprint (Schema) festgelegt, damit redundante Pods alle gleich konfiguriert sind.|
|template:metadata:labels|K8s vergibt interne Pod-Id's wenn diese erstellt werden. Mit dem Label wird jedoch eine zusätzliche Identifikation hinzugefügt, damit die Zuordung zu einem Deployment gemacht werden kann|
|template:spec|Innerhalb von Pod kann ein oder mehrerere Containers zugeordnet werden. U.a. müssen wir hier nun ein Image und containerPorts definieren. In unserem [Beispiel setzen wir eine nodejs-App ein](https://hub.docker.com/r/nanajanashia/k8s-demo-app). Für Nodejs WebApp muss man die Portnummer 3000 einsetzen.|
|spec:selector:matchlabels|Diese Property stellt sicher, dass das Deployment seine zugewiesenen Pod's wieder findet|
|spec:replicas|Hier wird eine Anzahl Pod's deklariert, welche redundant anhand des Blueprints erstellt werden (Skalierung). In unserem Fall erstellen wir für den Anfang nur eine Pod|


```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
  labels:
    app: webapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: nanajanashia/k8s-demo-app:v1.0
        ports:
        - containerPort: 3000
        env:
        - name: DB_URL
          valueFrom:
            configMapKeyRef:
              name: mongo-config
              key: mongo-url
        - name: USER_NAME
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: mongo-user
        - name: USER_PWD
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: mongo-password

---
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  type: NodePort
  selector:
    app: webapp
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
      nodePort: 30100
```

## Service
Beim obigen YAML-file wird eine Trennung der Komponenten (deployment/ service) mit '---' eingeführt. Hier noch eine kurze Beschreibung zum zweiten und unteren Teil vom Typ *service* des YAML-files:

|property|Beschreibung|
|--------|------------|
|metadata:name:|*webapp-service* ist die Namensdefinition und zugleich die URL-Adresse der Datenbank.|
|spec:type|[Diese Typ-Konfiguration](https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types) *NodePort* ist notwendig, um unsere WebApp nach *Aussen (ausserhalb K8s-Cluster)* verfügbar zu machen. Default ist *ClusterIP*, welche jedoch nur Zugriffe innerhalb des Clusters zulässt.|
|spec:selector|Hier wird der Label des Pod's angegeben. Grund: Wie wir bereits wissen, [leitet der Service die Aufrufe weiter an seine Pod's](../Tutorial/service%20and%20ingress/Readme.md) weiter. Damit dies funktioniert, muss man unter *selector* den Pod-Namen eintragen.|
|spec:ports:port:|Das ist die eingehende Portnummer. Hier kann man beliebige Portnummer festlegen. Einfachhalber nehmen wir die gleiche Nummer wie bei der WebApp |
|spec:ports:targetport:|Das ist die Ziel-Portnummer. Hier muss man die gleiche Portnummer wie bei der WebApp Container angeben.|
|spec:ports:nodePort:|Ausserhalb des Clusters ist über diese *nodePort* Nummer verfügbar. [Der Port-Range ist jedoch auf eine bestimmte Länge eingeschränkt](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport). Deshalb setzen wir hier z.B. 30100|

## Environment Variables
Umgebungsvariablen (Environment Variables) in Kubernetes sind eine Möglichkeit, Konfigurations- und Laufzeitinformationen an Container weiterzugeben, die in Pods ausgeführt werden. Kubernetes ermöglicht es, Umgebungsvariablen auf verschiedenen Ebenen zu definieren, einschließlich auf der Pod-Ebene und Container-Ebene.

Damit sich unsere WebApp mit der DB verbinden kann, muss man eine DB-Service URL angeben, welche in einer env-Variable bzw. configMap gespeichert ist. Desweiteren benötigt man env-Variablen für DB-User und DB-Passwort.

|property|Beschreibung|
|--------|------------|
|env:|Deklaration, dass hier eine Environment Variable deklariert wird.|
|env:name|Name der env-Variable. Die Namen *DB_URL*, *DB_USER* und *DB_PWD* werden innerhalb der WebApp verwendet.|
|env:valueFrom|In der Regel steht hier *value*. Da wir aber die Werte in einem *secret* gespeichert haben, wollen wir aber von dort auslesen.|
|env:valueFrom:secretKeyRef|Referenz zu einem *secret*. Hierbei muss man den *secret*-Namen (siehe metadata) sowie die Key, welche im *secret* definiert ist, angeben.|
|env:valueFrom:configMapKeyRef|Referenz zu einem *configMap*. Hierbei muss man den *configMap*-Namen (siehe metadata) sowie die Key, welche im *configMap* definiert ist, angeben.|


---
Quellen:
- [deployment and service Webapp](../Tutorial/deployment%20and%20statefulset/Readme.md)
- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#creating-a-deployment
- https://kubernetes.io/docs/concepts/services-networking/service/#defining-a-service
- https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/
- https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types
- https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport
