# Deployment and Service MongoDB

[TOC]

Die beiden Komponenten *deployment* und *service* könnten jeweils in separate YAML-files erstellt werden. In der Praxis ist es jedoch üblich, diese beiden in einem gemeinsamen config-file zusamenzufassen.

## Deployment
Dieses YAML file vom Typ *deployment* sieht bisschen kompliziert aus, ist aber relativ einfach zu verstehen. Sie haben bereits [hier](../Tutorial/Kubernetes%20Configuration%20with%20yaml/Readme.md) kennengelernt, dass ein config-file drei Bestandteile hat. Hier noch eine ergänzende Erklärung zur *specification* beim Typ *deployment*:

|Attribut|Beschreibung|
|--------|------------|
|template|Hier wird der Pod defniert bzw. ein Blueprint (Schema) festgelegt, damit redundante Pods alle gleich konfiguriert sind.|
|template:metadata:labels|K8s vergibt interne Pod-Id's wenn diese erstellt werden. Mit dem Label wird jedoch eine zusätzliche Identifikation hinzugefügt, damit die Zuordung zu einem Deployment gemacht werden kann|
|template:spec|Innerhalb von Pod kann ein oder mehrerere Containers zugeordnet werden. U.a. müssen wir hier nun ein Image und containerPorts definieren. In [Dockerhub finden Sie das Image und die Portnummer](https://hub.docker.com/_/mongo).|
|spec:selector:matchlabels|Diese Property stellt sicher, dass das Deployment seine zugewiesenen Pod's wieder findet|
|spec:replicas|Hier wird eine Anzahl Pod's deklariert, welche redundant anhand des Blueprints erstellt werden (Skalierung). In unserem Fall erstellen wir für den Anfang nur eine Pod|


```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongo-deployment
  labels:
    app: mongo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      labels:
        app: mongo
    spec:
      containers:
      - name: mongodb
        image: mongo:6
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: mongo-user
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongo-secret
              key: mongo-password

---
apiVersion: v1
kind: Service
metadata:
  name: mongo-service
spec:
  selector:
    app: mongo
  ports:
    - protocol: TCP
      port: 27017
      targetPort: 27017
```

## Service
Beim obigen YAML-file wird eine Trennung der Komponenten (deployment/ service) mit '---' eingeführt. Hier noch eine kurze Beschreibung zum zweiten und unteren Teil vom Typ *service* des YAML-files:

|property|Beschreibung|
|--------|------------|
|metadata:name:|*mongo-service* ist die Namensdefinition und zugleich die URL-Adresse der Datenbank. In [*configmap*](./ConfigMap.md) haben wir bereits diese Adresse erfasst|
|spec:selector|Hier wird der Label des Pod's angegeben. Grund: Wie wir bereits wissen, [leitet der Service die Aufrufe weiter an seine Pod's](../Tutorial/service%20and%20ingress/Readme.md) weiter. Damit dies funktioniert, muss man unter *selector* den Pod-Namen eintragen.|
|spec:ports:port:|Das ist die eingehende Portnummer. Hier kann man beliebige Portnummer festlegen. Einfachhalber nehmen wir die gleiche Nummer wie bei der MongoDb |
|spec:ports:targetport:|Das ist die Ziel-Portnummer. Hier muss man die gleiche Portnummer wie beim MongoDb Container angeben.|


## Environment Variables
Umgebungsvariablen (Environment Variables) in Kubernetes sind eine Möglichkeit, Konfigurations- und Laufzeitinformationen an Container weiterzugeben, die in Pods ausgeführt werden. Kubernetes ermöglicht es, Umgebungsvariablen auf verschiedenen Ebenen zu definieren, einschließlich auf der Pod-Ebene und Container-Ebene.

In unserem Beispiel muss man der DB einen *root-Usernamen* sowie ein *root-Password* angeben, welche beim Starten des Containers übernommen wird.

|property|Beschreibung|
|--------|------------|
|env:|Deklaration, dass hier eine Environment Variable deklariert wird.|
|env:name|Name der env-Variable. Die Namen *MONGO_INITDB_ROOT_USERNAME* und *MONGO_INITDB_ROOT_PASSWORD* werden innerhalb des Containers bzw. DB verwendet.|
|env:valueFrom|In der Regel steht hier *value*. Da wir aber die Werte in einem *secret* gespeichert haben, wollen wir aber von dort auslesen.|
|env:valueFrom:secretKeyRef|Referenz zu einem *secret*. Hierbei muss man den *secret*-Namen (siehe metadata) sowie die Key, welche im *secret* definiert ist, angeben.|

---
Quellen:
- [deployment and service MongoDb](../Tutorial/deployment%20and%20statefulset/Readme.md)
- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#creating-a-deployment
- https://kubernetes.io/docs/concepts/services-networking/service/#defining-a-service
- https://kubernetes.io/docs/tasks/inject-data-application/define-environment-variable-container/
