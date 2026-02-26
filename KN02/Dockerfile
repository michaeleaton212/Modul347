# Basis-Image: offizielles nginx von Docker Hub
FROM nginx

# Arbeitsverzeichnis: Standard-Ordner für nginx-HTML
WORKDIR /usr/share/nginx/html

# HTML-Datei aus dem Build-Kontext ins Image kopieren
COPY helloworld.html .

# Dokumentation: Container-Port 80 (kein automatisches Port-Mapping)
EXPOSE 80