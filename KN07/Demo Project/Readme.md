# Demo Project

[TOC]

> **Voraussetzung** ist, dass Sie 
>
> - einen [Kubernetes Cluster](../microk8s/Readme.md) installiert haben (verwenden Sie den Cluster aus KN06) und sich mit mit den [Begriffen aus dem Tutorial](../Tutorial/Readme.md) vertraut haben. 
> - Docker Desktop installiert haben.


## Einfaches Demo Beispiel

Anhand nachfolgendem Bild erstellen wir einen Cluster mit einer Mongo-DB Datenbank und eine Webapplikation. Innerhalb des Clusters kommuniziert die WebApp über den internen Service mit der Datenbank. Benötigt werden zudem noch [*secrets* sowie *configmap*](../Tutorial/configmap%20and%20secret/Readme.md). Die WebApp ist von ausserhalb erreichbar, weshalb ein external Service erstellt wird.

Wir benötigen für diese Umsetzung nachfolgende Source-Quellen:
- [Kubernetes Dokumentation](https://kubernetes.io/docs/home/)
- [Dockerhub](https://hub.docker.com/)

![](../../Ressourcen/Images/demo_project.png)

## K8s config files erstellen
Für das Demo Projekt müssen wir insgesamt vier K8s(Kubernetes) config files erstellen:

|Schritt|Komponente|Beschreibung|
|:----:|----------|------------|
|1|[ConfigMap](./ConfigMap.md)|MongoDB Endpoint|
|2|[Secret](./Secret.md)|MongoDB User und Passwort|
|3|[Deployment & Service: MongoDB](./DeploymentAndServiceMongoDB.md)|MongoDB Applikation mit Internal Service|
|4|[Deployment & Service: WebApp](./DeploymentAndServiceWebApp.md)|WebApp mit External Service|


## K8s config files installieren mit kubectl

Sie haben jetzt die K8s-YAML-files erstellt. Mit dem commandline-Tool [kubectl](https://kubernetes.io/docs/reference/kubectl/) haben Sie die Möglichkeit, in einem K8s-Cluster die config files zu installieren bzw. diverse Konfigurationen vorzunehmen.

Erklärungen zu den *kubectl commands* finden Sie hier: https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands

Dieser Befehl überprüft, ob Pod's im Mikrok8s-Cluster bereits installiert sind. 

![](../../Ressourcen/Images/kubectl%20get%20pods.png)

Bevor die Pod's und Container installiert werden, müssen zuerst das confiMap- und secret-File ins Cluster gebracht werden. 

![](../../Ressourcen/Images/kubectl%20apply%20mongo-config.png)

```shell
# -f steht für "file"
kubectl apply -f mongo-config.yaml
```

Darauffolgend das secret file installieren: 

![](../../Ressourcen/Images/kubectl%20apply%20mongo-secret.png)

Anschliessend installieren wir zuerst die MongoDB, da die WebApp davon abhängig ist. Wie man sieht, wurden die beiden Komponenten *deployment* und *service* erstellt. 

![](../../Ressourcen/Images/kubectl%20apply%20mongo.png)

Als letztes installieren wir noch die WebApp selbst. Auch hier wurden die beiden Komponenten *deplyoment* und *service* für die WebApp erstellt. 

![](../../Ressourcen/Images/kubectl%20apply%20webapp.png)

## K8s Installationen überprüfen

Überprüfen wir nun unsere Installationen. Hierbei kann man folgenden Befehl aufrufen: 
```shell
kubectl get all
kubectl get all -o wide # zeigt mehr Details an
```

Pod's und zugehörige Nodes anzeigen:
```shell
kubectl get pods
kubectl get pods -o wide # zeigt mehr Details an
```

Alle Services anzeigen:
```shell
kubectl get services
kubectl get services -o wide # zeigt mehr Details an
```

Die Deployments anzeigen, die wir erstellt haben:
```shell
kubectl get deployments
kubectl get deployments -o wide # zeigt mehr Details an
```

Alle Nodes anzeigen und Status überprüfen:
```shell
kubectl get nodes
kubectl get nodes -o wide # zeigt mehr Details an
```

Welcher Kubernetes-Service mit welchen Pods verbunden ist:
```shell
microk8s kubectl get endpoints
microk8s kubectl get endpoints -o wide # zeigt mehr Details an
```

Die ReplicaSets anzeigen, die erstellt wurden:
```shell
microk8s kubectl get replicaset
microk8s kubectl get replicaset -o wide # zeigt mehr Details an
```

Noch detaillierter kann mit "describe" ausgegeben werden<br/>
Komponententyp und Komponenten-Namen (z.B. service-name oder deployment-name) angeben: Beispiel für Service

```shell
# kubectl describe <service> <dein-service-name>
# Beispiel: Service
kubectl describe service mongo-service
kubectl describe service webapp-service
```

Oder für Deployment:
```shell    
# kubectl describe <deployment> <dein-deployment-name>
# Beispiel: Deployment
kubectl describe deployment mongo-deployment
kubectl describe deployment webapp-deployment
```


Nachfolgend sehen Sie nun alle erstellten Komponenten: <br/>
![](../../Ressourcen/Images/kubectl%20get%20all.png)

*secret* und *configMap* sind nicht aufgeführt. Diese können Sie mit nachfolgendem Befehl überprüfen: <br/>

```shell
# check secret
kubectl get secret

# check configMap
kubectl get configmap
```

Wenn Sie mit den Befehlen sind vertraut sind, können Sie jederzeit mit nachfolgendem Befehl die *commands* nachlesen: <br/>
```shell
# alle commands auflisten
kubectl --help
# command get: Mögliche Parameter nachlesen
kubectl get --help
# command apply: Mögliche Parameter nachlesen
kubectl apply --help
```

## WebApp validieren

MicroK8s wird die NodePort Services automatisch auf die Host-IPs mappen. Sie müssen nur noch den korrekten Port verwenden und möglicherweise die Firewall öffnen.

![](../../Ressourcen/Images/webapp-demo-project.png)



---
Quellen: 
- [kubectl commands](../kubectl%20commands/Readme.md)
- https://kubernetes.io/docs/reference/kubectl
- https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands







