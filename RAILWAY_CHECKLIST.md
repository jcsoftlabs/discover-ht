# ✅ Checklist de vérification Railway

Ce document vous aide à vérifier que votre déploiement Railway est correctement configuré, notamment avec Cloudinary.

## 📋 Variables d'environnement obligatoires

Connectez-vous à votre projet Railway et vérifiez que **toutes** ces variables sont configurées :

### 🔧 Configuration de base
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `DATABASE_URL` (fourni automatiquement par Railway MySQL)

### 🔒 Sécurité & JWT
- [ ] `JWT_SECRET` (secret unique et long)
- [ ] `JWT_REFRESH_SECRET` (différent de JWT_SECRET)
- [ ] `JWT_EXPIRES_IN=24h`

### 🌐 CORS & Frontend
- [ ] `CORS_ORIGIN` (ex: `*` pour tous, ou URL spécifique de votre app mobile)
- [ ] `FRONTEND_URL` (URL de votre app web/mobile)

### 🔑 Google OAuth
- [ ] `GOOGLE_CLIENT_ID_WEB`
- [ ] `GOOGLE_CLIENT_ID_IOS`
- [ ] `GOOGLE_CLIENT_ID_ANDROID`
- [ ] `GOOGLE_CLIENT_ID` (par défaut, même valeur que WEB)

### 📧 Email (SMTP)
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_SECURE=true`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `SMTP_FROM`

### ☁️ Cloudinary (OBLIGATOIRE)
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

⚠️ **ATTENTION** : Sans les variables Cloudinary, les uploads d'images pour les établissements et sites **ne fonctionneront pas**.

## 🧪 Tests de vérification

### 1. Vérifier que l'API répond

```bash
curl https://listing-backend-production.up.railway.app/
```

Réponse attendue :
```json
{
  "message": "Touris API est en ligne",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### 2. Vérifier la connexion à la base de données

```bash
curl https://listing-backend-production.up.railway.app/api/users
```

Devrait retourner la liste des utilisateurs (ou un tableau vide si aucun utilisateur).

### 3. Vérifier Cloudinary - Upload d'image

Utilisez Postman ou curl pour tester l'upload d'une image d'établissement :

```bash
curl -X POST https://listing-backend-production.up.railway.app/api/establishments \
  -H "Content-Type: multipart/form-data" \
  -F "name=Test Hotel" \
  -F "type=hotel" \
  -F "price=100" \
  -F "partnerId=VOTRE_PARTNER_ID" \
  -F "images=@/path/to/image.jpg"
```

Vérifications :
- [ ] L'upload réussit (status 201)
- [ ] L'URL de l'image contient `cloudinary.com`
- [ ] L'URL de l'image contient `touris-listings/establishments`

### 4. Vérifier les logs Railway

Dans le dashboard Railway, onglet "Deployments" > "View Logs" :

- [ ] Aucune erreur critique
- [ ] Pas d'erreur "Cloudinary configuration missing"
- [ ] Pas d'erreur de connexion MySQL
- [ ] Le serveur démarre correctement

Recherchez ces messages :
```
✅ Connexion Prisma établie avec succès
🚀 Serveur HTTP démarré sur le port 3000
```

## 🔍 Diagnostic des problèmes courants

### Problème : Images ne s'uploadent pas

**Symptômes** :
- Erreur 500 lors de l'upload
- Message "Cloudinary configuration missing"

**Solution** :
1. Vérifiez que les 3 variables Cloudinary sont configurées dans Railway
2. Redéployez l'application après avoir ajouté les variables
3. Vérifiez les logs pour confirmer

**Commande de test locale** :
```bash
# Testez avec les variables Cloudinary de production
export CLOUDINARY_CLOUD_NAME="votre_cloud_name"
export CLOUDINARY_API_KEY="votre_api_key"
export CLOUDINARY_API_SECRET="votre_api_secret"
npm start
```

### Problème : Database connection failed

**Symptômes** :
- Erreur P1001 de Prisma
- "Can't connect to database"

**Solution** :
1. Vérifiez que le service MySQL Railway est actif
2. Vérifiez que `DATABASE_URL` est correctement configuré
3. Format attendu : `mysql://user:password@host:port/database`

### Problème : CORS errors depuis l'app mobile

**Symptômes** :
- L'app ne peut pas accéder à l'API
- Erreurs CORS dans les logs du navigateur/app

**Solution** :
1. Définissez `CORS_ORIGIN=*` dans Railway (pour accepter toutes les origines)
2. Ou spécifiez l'origine exacte de votre app
3. Redéployez

### Problème : OAuth Google ne fonctionne pas

**Symptômes** :
- Erreur "Invalid client ID"
- Authentification Google échoue

**Solution** :
1. Vérifiez que les 3 Client IDs Google sont configurés
2. Vérifiez que les URLs sont autorisées dans Google Cloud Console
3. Ajoutez l'URL Railway dans les "Authorized redirect URIs"

## 📊 Monitoring

### Vérifications régulières à faire

**Quotidien** :
- [ ] API accessible (status 200 sur `/`)
- [ ] Pas d'erreurs critiques dans les logs

**Hebdomadaire** :
- [ ] Vérifier l'espace disque du volume (si utilisé)
- [ ] Vérifier le quota Cloudinary (images stockées)
- [ ] Vérifier les performances de la base de données

**Mensuel** :
- [ ] Exporter un backup de la base de données
- [ ] Vérifier les coûts Railway
- [ ] Mettre à jour les dépendances (`npm update`)

## 🔗 Liens utiles

- **Railway Dashboard** : https://railway.app/dashboard
- **Cloudinary Console** : https://console.cloudinary.com/
- **Google Cloud Console** : https://console.cloud.google.com/
- **Documentation Railway** : https://docs.railway.app/

## ✅ Checklist finale

Avant de considérer le déploiement comme complet :

- [ ] Toutes les variables d'environnement sont configurées
- [ ] L'API répond correctement (`/` et `/api/users`)
- [ ] Les uploads d'images fonctionnent (Cloudinary)
- [ ] L'authentification Google fonctionne
- [ ] Les emails SMTP sont envoyés correctement
- [ ] La base de données contient les tables nécessaires
- [ ] Les logs ne montrent pas d'erreurs critiques
- [ ] L'app mobile peut se connecter à l'API
- [ ] Un backup de la base de données a été fait

---

**Dernière mise à jour** : Pour synchroniser avec l'ajout de Cloudinary et des tests unitaires.
