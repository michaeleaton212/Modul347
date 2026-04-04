# Secret
Legen Sie nun das secret-file *mongo-secret.yaml* an. Auf der online [Dokumentationsseite von K8s finden Sie Beispiele von secret-files](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-config-file/#create-the-config-file).

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mongo-secret
type: Opaque
data:
  mongo-user: bW9uZ291c2Vy
  mongo-password: bW9uZ29wYXNzd29yZA==
```

Unter *data* werden key/value Pairs codiert eingetragen. So z.B. mit [*base64*](base64encoder.io/learn/). In unserem Fall müssen wir nun den *mongodb-user* und *mongodb-password* für unsere MongoDB konfigurieren.

**Base64 Codierung in Linux**

```bash
echo -n mongouser | base64
echo -n mongopassword | base64
```

**Base64 Codierung in PowerShell**

```powershell
[convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("mongouser"))
[convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("mongopassword"))
```

---
Quellen: 
- [secret](../Tutorial/configmap%20and%20secret/Readme.md)
- https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-config-file/#create-the-config-file
- https://kubernetes.io/docs/concepts/configuration/secret/#uses-for-secrets
