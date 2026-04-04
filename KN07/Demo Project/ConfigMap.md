# ConfigMap
Erstellen Sie zuerst in ihrem Verzeichnis einen Demo-Projektordner und legen sie ein config-file *mongo-config.yaml* an. Auf der online [Dokumentationsseite von K8s finden Sie Beispiele von config-files](https://kubernetes.io/docs/concepts/configuration/configmap/#configmaps-and-pods).

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mongo-config
data:
  mongo-url: mongo-service
```

Unter *data* wird das key/value Pair eingetragen. Für den [internen Service zu MongoDB](./Readme.md) tragen wir hier die *mongo-url* mit dem key *mongo-service* ein. 

---
Quellen:
- [configMap](../Tutorial/configmap%20and%20secret/Readme.md)
- https://kubernetes.io/docs/concepts/configuration/configmap/#configmaps-and-pods
