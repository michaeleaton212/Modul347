# Modul 347 – Dienste mit Containern anwenden: Zusammenfassung

> **Prüfungshilfsmittel** | Vollständigkeit hat Priorität | Stand: April 2026

---

## Inhaltsverzeichnis

1. [Docker – Grundlagen](#1-docker--grundlagen)
   - [Container vs. VM](#11-container-vs-vm)
   - [Images](#12-images)
   - [Docker-Architektur: Daemon, Client, Registry](#13-docker-architektur-daemon-client-registry)
2. [Docker CLI – Befehle](#2-docker-cli--befehle)
3. [Dockerfile](#3-dockerfile)
   - [Build-Prozess & Layers](#31-build-prozess--layers)
   - [Alle Dockerfile-Anweisungen](#32-alle-dockerfile-anweisungen)
   - [Beispiel-Dockerfiles](#33-beispiel-dockerfiles)
4. [Docker Compose – Multicontainer](#4-docker-compose--multicontainer)
5. [Docker Volumes – Datenpersistenz](#5-docker-volumes--datenpersistenz)
   - [Typen im Überblick](#51-typen-im-überblick)
   - [Volume-Befehle CLI](#52-volume-befehle-cli)
   - [Volume-Konfiguration YAML](#53-volume-konfiguration-yaml)
6. [Docker Netzwerk](#6-docker-netzwerk)
   - [Bridge-Netzwerke](#61-bridge-netzwerke)
   - [Netzwerk-Befehle](#62-netzwerk-befehle)
7. [Container Registry](#7-container-registry)
   - [Versionierung & Tags](#71-versionierung--tags)
   - [Public vs. Private Registry](#72-public-vs-private-registry)
   - [Docker Hub – Workflow](#73-docker-hub--workflow)
8. [Container Sicherheit](#8-container-sicherheit)
   - [Problemzonen](#81-problemzonen)
   - [Massnahmen](#82-massnahmen)
9. [Kubernetes – Grundlagen & Architektur](#9-kubernetes--grundlagen--architektur)
   - [Warum Kubernetes?](#91-warum-kubernetes)
   - [Architektur-Übersicht](#92-architektur-übersicht)
   - [Control Plane Komponenten](#93-control-plane-komponenten)
   - [Node-Komponenten](#94-node-komponenten)
10. [Kubernetes – Kernkonzepte](#10-kubernetes--kernkonzepte)
    - [Node & Pod](#101-node--pod)
    - [Service & Ingress](#102-service--ingress)
    - [ConfigMap & Secret](#103-configmap--secret)
    - [Deployment & StatefulSet](#104-deployment--statefulset)
    - [Volume in K8s](#105-volume-in-k8s)
11. [Kubernetes YAML-Konfiguration](#11-kubernetes-yaml-konfiguration)
12. [kubectl – Befehle](#12-kubectl--befehle)
13. [Kubernetes Netzwerk](#13-kubernetes-netzwerk)
14. [Kubernetes Sicherheit](#14-kubernetes-sicherheit)
15. [Demo-Projekt: MongoDB + WebApp](#15-demo-projekt-mongodb--webapp)
    - [Reihenfolge der Installation](#151-reihenfolge-der-installation)
    - [ConfigMap YAML](#152-configmap-yaml)
    - [Secret YAML](#153-secret-yaml)
    - [MongoDB Deployment + Service YAML](#154-mongodb-deployment--service-yaml)
    - [WebApp Deployment + Service YAML](#155-webapp-deployment--service-yaml)
16. [Minikube](#16-minikube)
17. [MicroK8s](#17-microk8s)
18. [Microservices – KN08 (CryptoApp)](#18-microservices--kn08-cryptoapp)
19. [Prüfungsrelevante Lernziele (KN00)](#19-prüfungsrelevante-lernziele-kn00)
20. [Diagramme & Bilder](#20-diagramme--bilder)

---

## 1 Docker – Grundlagen

### 1.1 Container vs. VM

| Merkmal | VM (Hypervisor) | Docker Container |
|---------|-----------------|-----------------|
| Virtualisiert | Hardware (CPU, RAM, Disk) | Betriebssystem |
| Kernel | Eigener Kernel pro VM | Geteilter Host-Kernel |
| Grösse | Mehrere GB | Wenige MB (z.B. Alpine Linux) |
| Startzeit | Minuten | Sekunden |
| Isolation | Vollständig | Prozess-Ebene |
| Typ | Hypervisor-Virtualisierung | Containervirtualisierung |

> **Containervirtualisierung** = Basierend auf dem Host-OS (z.B. Ubuntu) können weitere Linux-Distributionen parallel betrieben werden. Der **Kernel** des Host-OS wird mit den Containern **geteilt**.

![Docker vs VM](Ressourcen/Images/docker_vs_vm.webp)

**Vorteile Container:**
- Deutlich weniger Speicher als VMs
- Viel schneller startbar
- Einfach portierbar (lokal & Cloud)
- Docker Hub bietet tausende fertige Images
- Können innerhalb von Sekunden gestartet, gestoppt und gelöscht werden

### 1.2 Images

- Ein **Image** ist eine Vorlage (Snapshot) für einen Container – ähnlich wie ein VM-Image, aber leichtgewichtiger
- Enthält in der Regel nur **eine Anwendung** (kein volles OS)
- Aus einem Image können **beliebig viele Container** erzeugt werden
- Aus einem laufenden Container kann auch wieder ein neues Image erstellt werden
- Images sind aus **Layern (Schichten)** aufgebaut – jede Dockerfile-Anweisung erzeugt einen neuen Layer

### 1.3 Docker-Architektur: Daemon, Client, Registry

| Komponente | Beschreibung |
|-----------|-------------|
| **Docker Daemon** | Dauerhafter Hintergrundprozess, verwaltet Images, Container, Netzwerke und Volumes; verarbeitet Docker-API-Anfragen |
| **Docker Client** | CLI-Schnittstelle (`docker`-Befehl); schickt Befehle an den Daemon (lokal oder remote) |
| **Docker Registry** | Zentrales Speichersystem für Images (Standard: **Docker Hub**); Organisationen nutzen oft eigene private Registries |

![Docker Architektur](Ressourcen/Images/docker%20architecture.svg)

---

## 2 Docker CLI – Befehle

> Hilfe jederzeit: `docker --help` oder `docker COMMAND --help` (z.B. `docker run --help`)

### Container starten

```bash
# Standard-Test
docker run hello-world

# Interaktive Shell (interactive + tty)
docker run -it ubuntu /bin/bash

# Im Hintergrund (detached)
docker run -d ubuntu sleep 20

# Im Hintergrund + automatisch löschen nach Beendigung
docker run -d --rm ubuntu sleep 20

# Port-Mapping: Host-Port:Container-Port
docker run -d -p 8080:80 nginx

# Mit Namen
docker run --name mein-container nginx

# Mit Volume
docker run -v myVolume:/data nginx

# Mit Netzwerk
docker run --network my-network nginx
```

### Container anzeigen

```bash
# Aktive Container
docker ps

# Alle Container (auch beendete)
docker ps -a

# Nur IDs ausgeben
docker ps -a -q
```

### Images verwalten

```bash
# Lokale Images auflisten
docker images
docker image ls

# Image herunterladen
docker pull ubuntu

# Image löschen
docker rmi ubuntu

# Nicht mehr verwendete (dangling) Images löschen
docker rmi $(docker images -q -f dangling=true)
```

### Container verwalten

```bash
# Container löschen
docker rm [name_oder_id]

# Alle beendeten Container löschen
docker rm $(docker ps --filter status=exited -q)

# Alle Container (auch aktive) löschen
docker rm -f $(docker ps -a -q)

# Container starten (gestoppter Container, Daten bleiben erhalten)
docker start [id]

# Container stoppen (in Status "exited")
docker stop [name]

# Container sofort beenden (SIGKILL)
docker kill [name]
```

### Container inspizieren

```bash
# Logs ausgeben (STDOUT/STDERR des Containers)
docker logs [name]

# Detaillierte Infos (Netzwerk, Volumes, Konfiguration)
docker inspect [name]

# Dateisystemänderungen gegenüber dem Basis-Image
docker diff [name]

# Laufende Prozesse im Container
docker top [name]

# Befehl im laufenden Container ausführen
docker exec -it [name] bash
```

### Image bauen & pushen

```bash
# Image bauen (. = Build Context = aktuelles Verzeichnis)
docker build -t mein-image:1.0 .

# Mit spezifischem Dockerfile
docker build -t mein-image -f Dockerfile .

# Image taggen für Registry
docker tag mein-image:1.0 username/mein-image:1.0

# In Registry pushen
docker push username/mein-image:1.0

# Bei Registry einloggen
docker login
```

### Netzwerk

```bash
docker network create my-network
docker network ls
docker network inspect my-network
docker network rm my-network
docker network connect my-network my-container
```

### Volumes

```bash
docker volume create myVolume
docker volume ls
docker volume inspect myVolume
docker volume rm myVolume
```

---

## 3 Dockerfile

### 3.1 Build-Prozess & Layers

![Dockerfile Prozess](Ressourcen/Images/dockerfile%20prozess.webp)

- `docker build` liest das Dockerfile und erzeugt ein Image
- **Build Context**: Alle lokalen Dateien/Verzeichnisse, auf die `ADD`/`COPY` zugreifen können (meistens `.` = aktuelles Verzeichnis)
- **Layer/Image-Schichten**: Jede Dockerfile-Anweisung erzeugt einen neuen Layer
  - Wird aus dem Image der vorherigen Schicht ein temporärer Container gestartet
  - Die Anweisung wird ausgeführt
  - Ein neues Image (Layer) wird gespeichert
  - Der temporäre Container wird gelöscht
- Layer werden gecacht → nur geänderte Layer werden neu gebaut

### 3.2 Alle Dockerfile-Anweisungen

| Anweisung | Beschreibung |
|-----------|-------------|
| `FROM` | Basis-Image definieren, z.B. `FROM ubuntu:22.04` |
| `RUN` | Befehl im Container ausführen und Ergebnis committen (z.B. Pakete installieren) |
| `COPY` | Dateien aus dem Build Context in das Image kopieren |
| `ADD` | Wie COPY, aber zusätzlich URLs und automatisches Entpacken von Archiven |
| `CMD` | Standardbefehl beim Container-Start; wird durch `docker run`-Argumente überschrieben |
| `ENTRYPOINT` | Ausführbare Datei die beim Start läuft; CMD-Argumente werden als Parameter übergeben |
| `ENV` | Umgebungsvariablen im Image setzen |
| `EXPOSE` | Dokumentiert welcher Port gelauscht wird (öffnet Port nicht wirklich!) |
| `WORKDIR` | Arbeitsverzeichnis für folgende RUN/CMD/COPY/ADD-Anweisungen setzen |
| `VOLUME` | Verzeichnis als Volume deklarieren |
| `USER` | Benutzer für folgende RUN/CMD/ENTRYPOINT setzen |
| `HEALTHCHECK` | Regelmässige Überprüfung des Container-Zustands |
| `SHELL` | Standard-Shell für RUN-Befehle ändern |
| `MAINTAINER` | Autor-Metadaten setzen (veraltet, besser `LABEL`) |

**HEALTHCHECK Beispiel:**
```dockerfile
HEALTHCHECK --interval=5m --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

### 3.3 Beispiel-Dockerfiles

**Einfache HTML-Seite mit nginx:**
```dockerfile
FROM nginx:alpine
COPY helloworld.html /usr/share/nginx/html/index.html
EXPOSE 80
```

**PHP + Apache:**
```dockerfile
FROM php:8.0-apache
COPY src/ /var/www/html/
EXPOSE 80
```

**Build-Befehle:**
```bash
# Image bauen
docker build -t mysql .

# Container starten
docker run --rm -d --name mysql mysql

# Im Container prüfen
docker exec -it mysql bash
# Im Container:
ps -ef
netstat -tulpen
```

---

## 4 Docker Compose – Multicontainer

Docker Compose ermöglicht die Definition und den Betrieb mehrerer Container als Teil einer Anwendung über eine YAML-Datei.

**Struktur einer `compose.yaml`:**
```yaml
version: '3.9'
name: web_app

services:
  web:
    build: .                    # Image aus lokalem Dockerfile bauen
    ports:
      - "5000:5000"             # Host:Container Port-Mapping
    volumes:
      - .:/code                 # Bind Mount
    environment:
      - DEBUG=1
    depends_on:
      - redis                   # Startet erst nach redis (aber nicht auf Healthcheck!)

  redis:
    image: "redis:alpine"       # Fertiges Image von Docker Hub
    ports:
      - "6379:6379"
```

**Wichtige docker-compose Befehle:**
```bash
# Starten (Datei heisst compose.yaml)
docker-compose up

# Im Hintergrund starten
docker-compose up -d

# Mit spezifischer Datei
docker-compose -f meine-datei.yaml up

# Stoppen und Container entfernen
docker-compose down

# Logs verfolgen
docker-compose logs -f

# Nur bestimmten Service starten
docker-compose up web

# Skalieren
docker-compose up --scale web=3
```

**Hinweis zu `depends_on`:**
- `depends_on` stellt sicher, dass Container in der richtigen Reihenfolge **gestartet** werden
- Es wartet aber **NICHT** darauf, dass der Service wirklich **bereit** ist (z.B. Datenbank akzeptiert Verbindungen)
- Für echtes Warten: Health-Checks oder Skripte wie `wait-for-it.sh` nötig

---

## 5 Docker Volumes – Datenpersistenz

> **Wichtig:** Daten, die persistent gespeichert werden sollen, müssen **ausserhalb des Containers** abgelegt werden – denn beim Beenden eines Containers gehen alle Daten im Container verloren!

### 5.1 Typen im Überblick

![Typen von Mounts](Ressourcen/Images/types-of-mounts.png)

| Typ | Wo gespeichert | Wann geeignet | Persistent? |
|-----|---------------|---------------|-------------|
| **bind mount** | Auf der Festplatte des Host-Systems (beliebiger Pfad) | Entwicklung: Code-Sharing zwischen Host und Container | Ja (solange Hostdatei existiert) |
| **volume** (named/anonymous) | Von Docker verwalteter Bereich auf dem Host | Produktion: Datenbankdaten, persistente Applikationsdaten | Ja |
| **tmpfs mount** | Im RAM (Arbeitsspeicher) des Host | Temporäre Daten, sensible Daten die nicht auf Disk sollen | Nein (Daten weg beim Container-Stop) |

**bind mount**: Optimal wenn man den Ordner mit dem Code mit dem Container sharen will (→ Änderungen sofort sichtbar ohne Rebuild)

**named volume**: Docker verwaltet Speicherort selbst; leicht von anderen Containern über den Namen wiederverwendbar

**tmpfs**: Dateien existieren nur solange der Container läuft; RAM-Speicher des Hosts

### 5.2 Volume-Befehle CLI

```bash
# bind mount (--mount empfohlen)
docker run --mount type=bind,source=/host/pfad,target=/container/pfad nginx

# Named Volume mit -v Flag
docker run -v myVolume:/mount/pfad/in/container -d nginx

# Named Volume anlegen
docker volume create myVolume

# Volumes anzeigen
docker volume ls

# Volume details
docker volume inspect myVolume

# Volume löschen
docker volume rm myVolume

# tmpfs mount
docker run --tmpfs /tmp nginx
```

### 5.3 Volume-Konfiguration YAML

```yaml
version: "3.9"
services:
  web:
    image: nginx:alpine
    volumes:
      # Named Volume
      - type: volume
        source: mydata
        target: /data
        volume:
          nocopy: true
      # Bind Mount
      - type: bind
        source: ./static
        target: /opt/app/static
      # Read-Only Bind Mount
      - type: bind
        source: ./config
        target: /etc/config
        read_only: true

volumes:
  mydata:    # Volume muss hier deklariert werden
```

---

## 6 Docker Netzwerk

### 6.1 Bridge-Netzwerke

Im Unterricht wird das **bridge network** behandelt. Es gibt zwei Arten:

| | Default Bridge | User-defined Bridge |
|-|---------------|---------------------|
| Namensauflösung | Nur per IP | **Per Containername** möglich (`ping my_container`) |
| Isolation | Alle Container im gleichen Netz | Beliebig viele Netze, Container nur erreichbar wenn im selben Netz |
| Flexibilität | Docker-Neustart bei Änderungen | Änderungen **im laufenden Betrieb** möglich |
| Empfehlung | Nicht empfohlen | **Von Docker empfohlen** |

**Wie es funktioniert:** Den Containern werden via DHCP automatisch IP-Adressen zugewiesen. Durch einen "virtuellen Router" werden sie mit dem Host-Netzwerk verbunden.

### 6.2 Netzwerk-Befehle

```bash
# User-defined Bridge erstellen
docker network create my-network

# Alle Netzwerke anzeigen
docker network ls

# Netzwerk-Details (IP-Range, verbundene Container)
docker network inspect my-network

# Netzwerk löschen
docker network rm my-network

# Container beim Start einem Netzwerk zuweisen
docker create --name my-nginx --network my-network nginx:latest

# Netzwerk zu laufendem Container hinzufügen
docker network connect my-network-2 my_container

# Container aus Netzwerk entfernen
docker network disconnect my-network my_container
```

**Container per Namen ansprechen (nur user-defined):**
```bash
# Im Container A kann Container B so angesprochen werden:
ping my_funny_name
curl http://my_funny_name:8080
```

---

## 7 Container Registry

Eine **Container Registry** ist ein zentraler Speicherplatz für Docker-Images.

![Container Registry](Ressourcen/Images/containerRegistry.png)

**Funktionen:**
- Images **speichern und verwalten** (zentral)
- Images **herunterladen** (`pull`) und **hochladen** (`push`)
- **Versionierung** via Tags
- Public (öffentlich zugänglich) oder Private (nur autorisierte Benutzer)

### 7.1 Versionierung & Tags

![Container Registry Tags](Ressourcen/Images/containerRegistryTag.png)

- Tags sind Kennzeichnungen die einem Image angehängt werden, z.B. `myapp:1.0.0`
- `latest`: Zeigt immer auf die neueste Version
- **Semantic Versioning**: `MAJOR.MINOR.PATCH` (z.B. `1.0.4`)
  - **MAJOR**: Inkompatible API-Änderungen
  - **MINOR**: Neue Features, rückwärtskompatibel
  - **PATCH**: Bugfixes
- Beispiel: `myapp:1.0.0` → Update → `myapp:1.0.0-update1` oder `myapp:1.0.1`

### 7.2 Public vs. Private Registry

| Public Registry | Private Registry |
|----------------|-----------------|
| Docker Hub | Docker Trusted Registry (DTR) |
| Quay.io | Harbor |
| Google Container Registry (GCR) | AWS ECR Private |
| Amazon ECR (public) | Google GCR (private) |
| GitLab Container Registry | Azure Container Registry |

**Vorteile Private Registry:**
- Zugriffsschutz (Authentication)
- Sicherheits-Scanning der Images auf Vulnerabilities
- Kein Internet-Traffic für interne Images
- Kontrolle über welche Images verwendet werden dürfen

### 7.3 Docker Hub – Workflow

```bash
# 1. Bei Docker Hub einloggen
docker login

# 2. Image lokal bauen
docker build -t mein-image .

# 3. Image taggen (Format: username/repo:tag)
docker tag mein-image username/mein-image:1.0

# 4. Image pushen
docker push username/mein-image:1.0

# 5. Image pullen (anderer Rechner)
docker pull username/mein-image:1.0
```

**Vertrauenswürdige Images auf Docker Hub filtern:**

![Docker Hub Filter](Ressourcen/Images/filter_docker_hub.png)

Filteroptionen: Official Images, Verified Publisher, Docker-Sponsored Open Source

---

## 8 Container Sicherheit

### 8.1 Problemzonen

| Problem | Beschreibung |
|---------|-------------|
| **Fehler in der Konfiguration** | Mehr Konfigurationsmöglichkeiten = mehr potenzielle Fehlerquellen und Sicherheitslücken |
| **Security-Updates bei Containern** | Base-Images können veraltet sein; regelmässiges Rebuild nötig aber aufwendig |
| **Vertrauenswürdige Quelle für Base-Image** | Jeder kann Images auf Docker Hub laden – möglicherweise mit Backdoors! |
| **Berechtigungen auf Volumes** | Principle of Least Privilege beachten: Container nur so viele Rechte geben wie nötig |
| **Kontrolle des Netzwerk-Verkehrs** | Nur nötige Ports freigeben; Container-Netzwerk ist kein vollständiger Schutz; Verschlüsselung nötig |

### 8.2 Massnahmen

**Update-Prozess mit Tools:**

| Tool | Beschreibung |
|------|-------------|
| ![Portainer](Ressourcen/Images/portainer_logo.png) **Portainer** | Web-UI für Docker-Management; CE (Open Source) und BE (Business). Vereinfacht Updates per Klick. BE: zusätzliche Security & Compliance Features |
| ![Watchtower](Ressourcen/Images/watchtower_logo.png) **Watchtower** | Überwacht Base-Image-Versionen; führt automatisch Updates durch (alter Container runter, neuer Container mit gleichen Parametern hoch). **Risiko:** Veränderte Base-Images können App-Funktionalität brechen! |

**Weitere Massnahmen:**
- **Base-Images prüfen**: Nur "Official", "Verified Publisher" oder selbst geprüfte Images verwenden
- **Private Registry**: Nur vorab geprüfte Images in interne Registry aufnehmen
- **Volumes read-only einbinden**: `--mount type=bind,source=./data,target=/data,readonly`
  - Wichtig: `chmod` allein reicht nicht, da Container-Root die Rechte zurücksetzen kann!
- **Principle of Least Privilege**: Nur notwendige Ports freigeben; DB-Container nicht nach aussen exponieren
- **Netzwerkverkehr verschlüsseln**: Bei Bedarf TLS/HTTPS zwischen Containern einsetzen
- **Netzwerkverkehr überwachen**: Monitoring-Container für verdächtige Aktivitäten

---

## 9 Kubernetes – Grundlagen & Architektur

### 9.1 Warum Kubernetes?

Kubernetes (K8s) ist der De-facto-Standard für den Betrieb moderner Microservice-Applikationen.

| Bedürfnis | Kubernetes-Lösung |
|-----------|------------------|
| **Verfügbarkeit** | Ausgefallene Ressourcen werden automatisch ersetzt und neu verteilt |
| **Skalierbarkeit** | Einfache Skalierung über YAML-Konfiguration der Services |
| **Wartbarkeit** | CI/CD-Automatisierung über yml-Dateien; Rolling Updates ohne Downtime |

**Unterschied zu Docker Compose:**
- Docker Compose: Mehrere Container auf **einem** Host
- Kubernetes: Container auf **mehreren** Host-Systemen (Nodes) → echter Cluster

### 9.2 Architektur-Übersicht

![Kubernetes Architektur](Ressourcen/Images/kubernetes_architecture.png)

Ein Kubernetes-Cluster besteht aus:
- Mindestens einer **Control Plane** (auch: master node)
- Mehreren **Worker Nodes**

**Zugriffsmöglichkeiten auf die Control Plane:**
- **UI** (Kubernetes Dashboard)
- **API** (HTTP/HTTPS REST-Aufrufe)
- **CLI** (`kubectl`-Befehle)

![Master Node / Worker Node](Ressourcen/Images/masternode%20workernode.jpg)

### 9.3 Control Plane Komponenten

| Komponente | Beschreibung |
|-----------|-------------|
| **API Server** | Zentraler Kommunikationsknoten; alle Cluster-Interaktionen laufen über Kubernetes-API (via HTTPS, kubectl oder Dashboard) |
| **Controller Manager** | Stellt sicher, dass Cluster-Zustand mit deklarativen Zielen übereinstimmt; enthält viele Controller (ReplicaSet, Deployment, StatefulSet, Job, CronJob etc.) |
| **Etcd** | Verteilte Key-Value-Datenbank; persistiert Cluster-Konfiguration und -Zustand |
| **Kube Scheduler** | Weist neu erstellte Pods einem verfügbaren Node zu |

### 9.4 Node-Komponenten

| Komponente | Beschreibung |
|-----------|-------------|
| **Kubelet** | Prozess auf jedem Node; startet Pods mit der Container-Engine; meldet Pod-Status |
| **Kube Proxy** | Pflegt Netzwerkregeln und führt Verbindungsweiterleitungen an Service-Endpunkten aus |
| **Container-Runtime** | Laufzeitumgebung für Container (Docker, containerd, cri-o, rktlet) |
| **Pod** | Kleinste bereitstellbare Einheit in Kubernetes; enthält einen oder mehrere Container |

---

## 10 Kubernetes – Kernkonzepte

### 10.1 Node & Pod

![Nodes und Pods](Ressourcen/Images/nodesandpods.png)

**Node:**
- Physische oder virtuelle Maschine auf der Container laufen
- Kubernetes verwaltet eine Gruppe von Nodes = **Cluster**
- Stellt Ressourcen bereit: CPU, Speicher, Netzwerk

**Pod:**
- **Kleinste bereitstellbare Einheit** in Kubernetes
- Gruppe von einem oder mehreren Containern auf demselben Node
- Teilen: Netzwerk-Namespace, Speicher, IP-Adresse, Ports
- Container im Pod kommunizieren über `localhost`
- **Ephemeral**: Pods sind kurzlebig; werden bei Bedarf erstellt, gestoppt, neu gestartet oder verschoben

> **Pods sind ephemeral** = Daten die nur im Pod gespeichert sind, gehen beim Neustart verloren! → Volumes nötig

### 10.2 Service & Ingress

![Kubernetes Service](Ressourcen/Images/kubernetesservice.png)

**Problem:** Pods haben dynamische IP-Adressen (ändern sich bei Neustart)

**Lösung: Service** = Abstraktion mit statischer virtueller IP (ClusterIP)
- Leitet Anfragen an zugehörige Pods weiter
- Lifecycle von Pod & Service getrennt: Pod crasht → Service bleibt → Pod bekommt neue IP → verbindet sich wieder

**Service-Typen:**

| Typ | Zugriff | Beschreibung |
|-----|---------|-------------|
| **ClusterIP** (default) | Nur innerhalb des Clusters | Interne Services (z.B. Datenbank) |
| **NodePort** | Von ausserhalb via `NodeIP:NodePort` | Für Tests; Port-Range 30000–32767 |
| **LoadBalancer** | Via externen Load Balancer | Produktiver Einsatz in Cloud |

**Ingress:**

![Ingress](Ressourcen/Images/ingress.png)
![Ingress Final](Ressourcen/Images/ingressfinal.png)

- Problem mit NodePort: Zugriff via `http://IP:Port` → nicht produktionstauglich
- **Ingress** ermöglicht FQDN (Fully Qualified Domain Name): `https://my-app.com`
- Definiert Routing-Regeln für eingehenden HTTP/HTTPS-Traffic
- Leitet an korrekte Services im Cluster weiter

### 10.3 ConfigMap & Secret

![ConfigMap](Ressourcen/Images/configmap.png)
![Secret](Ressourcen/Images/secret.png)

**Problem ohne ConfigMap/Secret:** Ändert sich z.B. ein Datenbank-Endpoint, müsste man:
1. App neu builden
2. Neues Image erstellen
3. In Registry pushen
4. Auf Pod pullen

**ConfigMap:**
- Key/Value-Store für **nicht-sensible** Konfigurationsdaten
- Beispiel: Datenbank-URL, Anwendungs-Einstellungen
- Wird in `/etcd` gespeichert

**Secret:**
- Key/Value-Store für **sensible** Daten (Passwörter, Tokens, Zertifikate)
- Werte werden **base64-kodiert** (≠ verschlüsselt!)
- **Achtung:** Base64 ist keine Verschlüsselung! Leicht decodierbar

**Base64-Encoding:**
```bash
# Linux
echo -n mongouser | base64        # → bW9uZ291c2Vy
echo -n mongopassword | base64    # → bW9uZ29wYXNzd29yZA==

# PowerShell
[convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("mongouser"))
```

**Security Best Practices für Secrets:**
1. Verschlüsselung auf Anwendungsebene vor dem Speichern
2. Kubernetes RBAC (Role-Based Access Control) einsetzen
3. Secret-Management-Tools: HashiCorp Vault, Sealed Secrets
4. Zugriff auf Secrets auf das Nötigste beschränken

### 10.4 Deployment & StatefulSet

![Deployment](Ressourcen/Images/deployment.png)

**Deployment:**
- Abstraktion von Pods für **stateless** Anwendungen
- Definiert einen **Blueprint (Schema)** für Pods
- Ermöglicht **Replicas**: Mehrere identische Pod-Kopien (Hochverfügbarkeit)
- Bei Ausfall einer Pod → Service leitet an andere Replicas weiter
- **Rolling Updates**: Neue Version ohne Downtime ausrollen

**StatefulSet:**
- Für **stateful** Anwendungen (Datenbanken)
- Koordiniert Datenzugriff zwischen Replicas → verhindert Dateninkonsistenz
- Komplexer zu verwalten

![StatefulSet vs Deployment](Ressourcen/Images/statfulset_deplyoment.png)
![StatefulSet Data Inconsistencies](Ressourcen/Images/statefulset%20datainconsistences.png)

> **In der Praxis:** Datenbanken oft **ausserhalb** des Kubernetes-Clusters betrieben wegen der Komplexität von StatefulSets

**Zusammenfassung:**
- Stateless App → **Deployment**
- Stateful App / Datenbank → **StatefulSet**

### 10.5 Volume in K8s

![K8s Volume](Ressourcen/Images/volume.png)

- Pods sind **ephemeral** → Datenverlust bei Neustart
- Kubernetes bietet **keine** eigenen Speicher-Komponenten
- Externe Speicherlösung nötig:
  - **On-Premise**: Fileserver, NFS
  - **Cloud**: AWS EBS, Azure Disk, Google Persistent Disk
- Administrator muss Datenverwaltung selbst konfigurieren

---

## 11 Kubernetes YAML-Konfiguration

![Kubernetes Interfaces](Ressourcen/Images/kubernetes%20Interfaces.png)

YAML-Files werden via `kubectl apply -f datei.yaml` in den Cluster geladen.

**3 Bestandteile eines YAML-Files:**

![Deployment vs Service YAML](Ressourcen/Images/deployment_vs_service.png)

| Teil | Beschreibung | Beispiel |
|------|-------------|---------|
| **1. API Version / Kind** | API-Version der Control Plane + Typ des Objekts | `apiVersion: apps/v1` / `kind: Deployment` |
| **2. Metadata** | Name und Labels | `name: mongo-deployment` |
| **3. Specification** | Spezifizierung des Typs (Replicas, Container, Ports, ...) | `replicas: 2` |
| **Status** | Automatisch von K8s generiert und in etcd gespeichert; nicht im YAML sichtbar | Aktueller Zustand |

**Mehrere Objekte in einem File trennen:** `---`

---

## 12 kubectl – Befehle

> Für MicroK8s: `microk8s kubectl` statt `kubectl` (oder Alias setzen: `alias kubectl='microk8s kubectl'`)

### Basis-Informationen

```bash
# Alle Ressourcen anzeigen
kubectl get all
kubectl get all -o wide      # mehr Details

# Spezifische Ressourcen
kubectl get node
kubectl get pod
kubectl get svc              # Services
kubectl get deployment
kubectl get configmap
kubectl get secret
kubectl get replicaset
```

### Erweiterte Informationen

```bash
# Mit mehr Details (IP, Node, etc.)
kubectl get pod -o wide
kubectl get node -o wide
kubectl get services -o wide
kubectl get deployments -o wide
kubectl get nodes -o wide
```

### Detaillierte Beschreibung

```bash
kubectl describe pod {pod-name}
kubectl describe svc {svc-name}
kubectl describe deployment {deployment-name}

# Beispiele:
kubectl describe service mongo-service
kubectl describe service webapp-service
kubectl describe deployment mongo-deployment
kubectl describe deployment webapp-deployment
```

### Logs

```bash
kubectl logs {pod-name}
kubectl logs {pod-name} -f    # Follow (live)
```

### Ressourcen anwenden / löschen

```bash
# Ressource erstellen oder aktualisieren
kubectl apply -f datei.yaml

# Ressource löschen
kubectl delete -f datei.yaml
kubectl delete pod {pod-name}
kubectl delete service {service-name}
```

### Endpoints & ReplicaSets

```bash
microk8s kubectl get endpoints
microk8s kubectl get endpoints -o wide

microk8s kubectl get replicaset
microk8s kubectl get replicaset -o wide
```

### Hilfe

```bash
kubectl --help
kubectl get --help
kubectl apply --help
```

---

## 13 Kubernetes Netzwerk

Kubernetes führt weitere Abstraktionsebenen ein:
- Docker: Jeder **Container** hat seine eigene IP
- Kubernetes: Jeder **Pod** hat seine eigene IP; Container im Pod teilen sich IP

**Zugriff innerhalb eines Pods:**
Container sprechen sich via `localhost:port` an

**NodePort-Bereich:** Standardmässig 30000–32767

### IP-Pfad eines Requests (NodePort-Beispiel)

```
Client (10.3.32.71)
  → Node (10.3.32.10:31012)          [nodePort]
    → Service (10.152.183.198:1234)   [port]
      → Pod (10.1.65.81:80)           [targetPort]
        → Container (Port 80)
```

**Service-YAML Ports-Konfiguration:**
```yaml
spec:
  ports:
  - name: http
    nodePort: 31012      # Externer Port am Node (30000-32767)
    port: 1234           # Service-interner Port
    protocol: TCP
    targetPort: 80       # Port am Pod/Container
```

**Zugriffsmöglichkeiten je nach Position:**

| Von | Auf | Adresse |
|----|-----|---------|
| Container A im Pod | Container B im gleichen Pod | `localhost:3306` |
| Pod A | Pod B (anderer Pod, gleicher Node) | `10.1.65.82:3306` |
| Node | Pod | `10.1.65.81:80` |
| Node | Service | `10.152.183.198:1234` |
| Client (extern) | Service via Node | `10.3.32.10:31012` |

**Netzwerk-Plugin:** MicroK8s verwendet standardmässig **Calico**

---

## 14 Kubernetes Sicherheit

![Istio Service Mesh](Ressourcen/Images/service-mesh-istio.svg)

**Zusätzliche Sicherheitsaspekte gegenüber Docker:**

| Aspekt | Details |
|--------|---------|
| **Konfigurationsfehler** | Kubernetes ist viel komplexer → höhere Fehlerwahrscheinlichkeit |
| **Netzwerk-Verschlüsselung** | Cluster über mehrere Nodes mit öffentlichen IPs → Man-in-the-Middle einfacher wenn unverschlüsselt |

**Vorteil gegenüber Docker:** Rolling Updates ermöglichen Sicherheits-Updates **ohne Downtime**

### Rolling Updates

```bash
# Deployment mit neuem Image aktualisieren
kubectl set image deployment/webapp-deployment webapp=username/webapp:2.0

# Status prüfen
kubectl rollout status deployment/webapp-deployment

# Rückgängig machen
kubectl rollout undo deployment/webapp-deployment
```

### Istio & Kiali

![Kiali Topology](Ressourcen/Images/kiali-topology-graph-node-animation.gif)

**Istio:**
- OpenSource Service Mesh zur Überwachung und Sicherung des Netzverkehrs zwischen Pods
- **Envoy Proxy** wird als Sidecar-Container in jeden Pod injiziert
- Kontrolliert ein- und ausgehenden Traffic

**Kiali:**
- Web-Interface auf Basis von Istio
- Visualisiert Netzwerk-Topologie
- Zeigt Traffic-Metriken und Service-Health

**CI/CD + Rolling Updates:**
- Neue Container-Tags/Commits → CI/CD-Pipeline → automatisiertes Testen → automatisches Deployment

---

## 15 Demo-Projekt: MongoDB + WebApp

![Demo Projekt](Ressourcen/Images/demo_project.png)

**Aufbau:**
- **MongoDB**: Datenbank mit internem Service (ClusterIP)
- **WebApp**: Node.js App mit externem Service (NodePort)
- **ConfigMap**: MongoDB URL
- **Secret**: MongoDB Credentials

### 15.1 Reihenfolge der Installation

```bash
# 1. ConfigMap installieren
kubectl apply -f mongo-config.yaml

# 2. Secret installieren
kubectl apply -f mongo-secret.yaml

# 3. MongoDB Deployment + Service
kubectl apply -f mongo.yaml

# 4. WebApp Deployment + Service
kubectl apply -f webapp.yaml

# Alles überprüfen
kubectl get all
kubectl get configmap
kubectl get secret
```

### 15.2 ConfigMap YAML

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongo-config
data:
  mongo-url: mongo-service    # Key: mongo-url, Value: mongo-service (= Service-Name)
```

### 15.3 Secret YAML

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongo-secret
type: Opaque
data:
  mongo-user: bW9uZ291c2Vy           # base64("mongouser")
  mongo-password: bW9uZ29wYXNzd29yZA==  # base64("mongopassword")
```

### 15.4 MongoDB Deployment + Service YAML

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
            secretKeyRef:           # Wert aus Secret lesen
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
  name: mongo-service             # Dieser Name = URL für andere Pods
spec:
  selector:
    app: mongo                    # Verbindet Service mit Pods (label: app=mongo)
  ports:
    - protocol: TCP
      port: 27017                 # Eingehender Port am Service
      targetPort: 27017           # Port am Pod/Container
  # type: ClusterIP (default) = nur intern erreichbar
```

**YAML-Attribute Erklärung:**

| Attribut | Bedeutung |
|----------|-----------|
| `template` | Pod-Blueprint für redundante Pods |
| `template:metadata:labels` | Zusätzliche Identifikation für Deployment-Zuordnung |
| `template:spec` | Container-Konfiguration (Image, Ports) |
| `spec:selector:matchLabels` | Stellt sicher dass Deployment seine Pods findet |
| `spec:replicas` | Anzahl redundanter Pod-Kopien |
| `spec:selector` | Welche Pods der Service bedient |
| `spec:ports:port` | Eingehender Port am Service |
| `spec:ports:targetPort` | Ziel-Port am Pod/Container |

### 15.5 WebApp Deployment + Service YAML

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
            configMapKeyRef:        # Wert aus ConfigMap lesen
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
  type: NodePort                   # Externer Zugriff!
  selector:
    app: webapp
  ports:
    - protocol: TCP
      port: 3000                   # Service-Port
      targetPort: 3000             # Container-Port
      nodePort: 30100              # Externer Port (30000-32767)
```

**Zugriff auf WebApp:**
```
http://[Node-IP]:30100
```

---

## 16 Minikube

Minikube ist ein Tool für einen **Kubernetes-Cluster mit einem einzigen Node** auf dem lokalen Rechner.

```
Host-Rechner
└── Hypervisor (VirtualBox, Hyper-V, KVM, Docker)
    └── VM
        └── Minikube (Single-Node K8s Cluster)
```

![Minikube VirtualBox](Ressourcen/Images/virtualbox%20minikube.jpg)

**Verwendung:**
- Lokale Entwicklung und Tests
- Kein Internet / kein Cloud-Account nötig
- Unterstützt mehrere Hypervisoren: VirtualBox, Hyper-V, KVM, Docker

**Wichtige Minikube-Befehle:**
```bash
# Cluster starten
minikube start

# Dashboard öffnen
minikube dashboard

# Cluster stoppen
minikube stop

# Status
minikube status

# Service-URL anzeigen
minikube service webapp-service --url
```

---

## 17 MicroK8s

MicroK8s ist eine vereinfachte Kubernetes-Distribution:
- Kann als **Single-Node** (wie Minikube) oder als **Cluster** betrieben werden
- Wird als Snap-Paket installiert (auf Ubuntu)
- Beinhaltet `kubectl` eingebettet: `microk8s kubectl`

**Anforderungen pro Node:**
- OS: Ubuntu
- Mindestens **2 Cores, 4 GB RAM, 30 GB Disk**
- Statische private IP und statische öffentliche IP (für AWS)

**Wichtige Befehle:**
```bash
# MicroK8s Status
microk8s status

# Cluster-Informationen
microk8s kubectl get nodes

# Alias für kubectl setzen
alias kubectl='microk8s kubectl'

# Add-ons aktivieren
microk8s enable dns
microk8s enable dashboard
microk8s enable ingress

# Cluster beitreten (auf Worker-Node ausführen)
microk8s join [master-ip]:25000/[token]
```

**Cluster-Setup auf AWS:**
1. Subnetz konfigurieren
2. Sicherheitsgruppen einrichten (alle Ports zwischen Nodes erlauben)
3. Netzwerkschnittstellen mit statischen IPs erstellen
4. Instanzen (Ubuntu, 2 Cores, 4 GB RAM, 30 GB) erstellen
5. Cloud-Init mit MicroK8s-Installation verwenden

**Cloud-Init für MicroK8s (Ausschnitt):**
```yaml
#cloud-config
users:
  - name: ubuntu
    ssh_authorized_keys:
      - [SSH-Public-Key]
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash

package_update: true
packages:
  - snapd

runcmd:
  - snap install microk8s --classic
  - usermod -a -G microk8s ubuntu
  - microk8s enable dns
```

---

## 18 Microservices – KN08 (CryptoApp)

![CryptoMicroservices](Kompetenznachweise/_res/CryptoMicroservices.png)

**Architektur (4 Microservices):**

| Service | Farbe | Beschreibung |
|---------|-------|-------------|
| **Frontend** | Grün (vorgegeben) | React App; ruft die verschiedenen Services auf |
| **Account** | Grün (vorgegeben) | Verwaltet Holdings und Freunde; **einziger Service mit DB-Verbindung** |
| **BuySell** | Gelb (selbst implementieren) | Kauf/Verkauf von tbzCoins; nutzt Account Service |
| **SendReceive** | Gelb (selbst implementieren) | Transfer von tbzCoins zwischen Freunden; nutzt Account Service |

**tbzCoin:** Hypothetische Kryptowährung; Wert = 15 CHF; keine Dezimalstellen

**API-Endpoints BuySell:**
```
POST /buy
  Body: {"id": 1, "amount": 21}
  Response: true|false

POST /sell
  Body: {"id": 1, "amount": 21}
  Response: true|false
```

**API-Endpoints SendReceive:**
```
POST /send
  Body: {"id": 1, "receiverId": 2, "amount": 21}
  Response: -
```

**Update-Prozess in Kubernetes (Rolling Update):**
```bash
# 1. Applikation ändern
# 2. Image bauen und pushen
docker build -t username/webapp:2.0 .
docker push username/webapp:2.0

# 3. Deployment aktualisieren
kubectl set image deployment/webapp-deployment webapp=username/webapp:2.0

# 4. Kubernetes rollt Update ohne Downtime aus
kubectl rollout status deployment/webapp-deployment
```

**Oder via YAML-Update:**
```bash
# YAML-Datei anpassen (image-Tag ändern), dann:
kubectl apply -f webapp.yaml
```

> **"Sie haben gerade ein Software-Update ausgeliefert *ohne* Downtime!"**

**Multistage Dockerfile (Optimierung):**
```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
```

---

## 19 Prüfungsrelevante Lernziele (KN00)

### Docker

- [ ] Unterschied VM ↔ Container erklären + Vorteile der Container-Isolierung
- [ ] Unterschied Docker Image ↔ Docker Container erklären
- [ ] CLI-Befehle: `build`, `tag`, `push`, `run`, `stop`, `rm`
- [ ] Dockerfile-Anweisungen anwenden/erklären: `FROM`, `COPY`, `WORKDIR`, `RUN`, `EXPOSE`, `ENV`, `CMD`
- [ ] Was ist ein Layer? Wie werden Layers erstellt?
- [ ] Volumes und Netzwerkkonfiguration anwenden
- [ ] Unterschiede der Volume-Typen (bind mount, volume, tmpfs)
- [ ] Unterschied Default-Bridge ↔ User-defined Bridge

### Container Registry

- [ ] Was ist eine Container Registry? Sinnvoller Einsatz?
- [ ] Semantic Versioning bei Image-Tags (`:latest` vs `:1.0.4`)
- [ ] Sicherheitsaspekte: Zugriffsschutz (Authentication), Vulnerability-Scanning

### Docker Compose

- [ ] `docker-compose.yml` lesen, interpretieren, erklären
- [ ] Vor- und Nachteile von Environment Variables
- [ ] `depends_on` und seine Einschränkungen erklären
- [ ] Lifecycle-Befehle: `up -d`, `down`, `logs -f`

### Kubernetes

- [ ] Architektur: Control Plane, Worker Nodes, Kubelet
- [ ] API-Objekte: Pods, Deployments, Services, ConfigMaps, Secrets
- [ ] YAML-Manifeste interpretieren und erklären
- [ ] Service-Typen: ClusterIP, NodePort, LoadBalancer
  - Wann welchen Typ verwenden?

---

## 20 Diagramme & Bilder

Alle Bilder befinden sich unter `Ressourcen/Images/`:

| Bild | Inhalt |
|------|--------|
| `docker_vs_vm.webp` | Docker Container vs. Virtuelle Maschine |
| `docker architecture.svg` | Docker Architektur (Daemon, Client, Registry) |
| `dockerfile prozess.webp` | Dockerfile Build-Prozess |
| `types-of-mounts.png` | Übersicht der Volume-Typen |
| `types-of-mounts-volume.png` | Detail: Named Volumes |
| `containerRegistry.png` | Container Registry Konzept |
| `containerRegistryTag.png` | Image-Versionierung mit Tags |
| `filter_docker_hub.png` | Vertrauenswürdige Images auf Docker Hub filtern |
| `portainer_logo.png` | Portainer Tool für Container-Management |
| `watchtower_logo.png` | Watchtower Tool für automatische Updates |
| `kubernetes_architecture.png` | Kubernetes Cluster-Architektur |
| `masternode workernode.jpg` | Master Node / Worker Node |
| `nodesandpods.png` | Nodes und Pods Visualisierung |
| `kubernetesservice.png` | Kubernetes Service Konzept |
| `ingress.png` | Ingress Konzept |
| `ingressfinal.png` | Ingress mit FQDN |
| `configmap.png` | ConfigMap Key/Value Store |
| `secret.png` | Secret Key/Value Store |
| `deployment.png` | Deployment mit Replicas |
| `statfulset_deplyoment.png` | StatefulSet vs. Deployment |
| `statefulset datainconsistences.png` | StatefulSet Dateninkonsistenz-Problem |
| `volume.png` | Kubernetes Volume Konzept |
| `deployment_vs_service.png` | YAML-Vergleich Deployment vs. Service |
| `kubernetes Interfaces.png` | K8s Zugriffs-Interfaces (UI, API, CLI) |
| `demo_project.png` | Demo-Projekt Architektur (MongoDB + WebApp) |
| `service-mesh-istio.svg` | Istio Service Mesh mit Envoy-Proxy |
| `kiali-topology-graph-node-animation.gif` | Kiali Netzwerk-Topologie (animiert) |
| `virtualbox minikube.jpg` | Minikube in VirtualBox |
| `CryptoMicroservices.png` | KN08 Microservices Architektur |

---

## Schnellreferenz: Wichtigste Befehle

### Docker

```bash
docker run -d -p 8080:80 --name myapp nginx
docker ps -a
docker logs myapp
docker exec -it myapp bash
docker build -t myimage:1.0 .
docker push username/myimage:1.0
docker-compose up -d
docker-compose down
```

### kubectl

```bash
kubectl apply -f datei.yaml
kubectl get all
kubectl get pods -o wide
kubectl describe pod podname
kubectl logs podname
kubectl delete -f datei.yaml
kubectl rollout status deployment/name
kubectl set image deployment/name container=image:tag
```

### MicroK8s

```bash
microk8s status
microk8s kubectl get all
microk8s enable dns dashboard ingress
alias kubectl='microk8s kubectl'
```

---

*Ende der Zusammenfassung – Modul 347 TBZ*
