# Configuration Cloudinary - Guide Complet

## Pourquoi Cloudinary ?

Railway utilise un **filesystem éphémère** - les fichiers uploadés localement sont **effacés à chaque redéploiement**. Cloudinary résout ce problème en stockant les images dans le cloud de manière permanente.

## Avantages de Cloudinary

✅ **Stockage persistant** - Les images survivent aux redéploiements  
✅ **CDN global** - Images rapides partout dans le monde  
✅ **Optimisation automatique** - Compression, WebP, responsive images  
✅ **Gratuit jusqu'à 25GB** et 25k transformations/mois  
✅ **URLs directes** - Pas besoin de servir les fichiers depuis Node.js  

---

## 📋 Étape 1 : Créer un Compte Cloudinary

1. Allez sur **https://cloudinary.com/users/register/free**
2. Inscrivez-vous (gratuit, pas de carte bancaire requise)
3. Confirmez votre email
4. Connectez-vous sur **https://console.cloudinary.com/**

---

## 🔑 Étape 2 : Récupérer vos Credentials

Une fois connecté sur le Dashboard Cloudinary :

1. Vous verrez une section **"Product Environment Credentials"**
2. Notez ces 3 valeurs :
   - **Cloud Name** : `dxxxxxx` (exemple)
   - **API Key** : `123456789012345` (exemple)
   - **API Secret** : `abcdefghijklmnop_QRSTUVWXYZ` (exemple - cliquez sur l'œil pour révéler)

---

## ⚙️ Étape 3 : Configurer le Backend

### A. Ajouter les variables d'environnement

**Développement Local** - Créez/modifiez `.env` :

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

**Production Railway** :

1. Allez sur **railway.app** → Votre projet `listing-backend`
2. Cliquez sur votre service → Onglet **Variables**
3. Ajoutez les 3 variables :
   ```
   CLOUDINARY_CLOUD_NAME = votre_cloud_name
   CLOUDINARY_API_KEY = votre_api_key
   CLOUDINARY_API_SECRET = votre_api_secret
   ```
4. Railway redémarrera automatiquement le service

---

## 🧪 Étape 4 : Tester l'Upload

### Test avec cURL (Établissement)

```bash
curl -X POST http://localhost:3000/api/establishments \
  -H "Content-Type: multipart/form-data" \
  -F "name=Test Hotel" \
  -F "type=hotel" \
  -F "price=150" \
  -F "description=Test upload Cloudinary" \
  -F "images=@/chemin/vers/image.jpg"
```

### Test avec cURL (Site Touristique)

```bash
curl -X POST http://localhost:3000/api/sites \
  -H "Content-Type: multipart/form-data" \
  -F "name=Test Site" \
  -F "address=Port-au-Prince" \
  -F "latitude=18.5944" \
  -F "longitude=-72.3074" \
  -F "images=@/chemin/vers/image.jpg"
```

**Résultat attendu** :
```json
{
  "success": true,
  "data": {
    "images": [
      "https://res.cloudinary.com/votre_cloud/image/upload/v1234567890/touris-listings/establishments/establishment-1234567890.jpg"
    ]
  }
}
```

✅ L'URL commence par `https://res.cloudinary.com` (pas `/uploads`)

---

## 🔍 Vérifier les Images sur Cloudinary

1. Allez sur **https://console.cloudinary.com/console/media_library**
2. Vous devriez voir un dossier `touris-listings/`
3. À l'intérieur : `establishments/` et `sites/`
4. Les images uploadées y sont stockées

---

## 🚀 Étape 5 : Déployer sur Railway

Une fois vos variables ajoutées sur Railway :

```bash
cd /Users/christopherjerome/listing-backend
git add .
git commit -m "Intégration Cloudinary pour stockage persistant des images"
git push
```

Railway détectera automatiquement les changements et redéploiera.

---

## 📊 Organisation des Images

### Structure dans Cloudinary

```
touris-listings/
├── establishments/
│   ├── establishment-1699999999999-123456789.jpg
│   ├── establishment-1699999999998-987654321.jpg
│   └── ...
└── sites/
    ├── site-1699999999997-111111111.jpg
    ├── site-1699999999996-222222222.jpg
    └── ...
```

### Optimisations Automatiques Appliquées

- **Limite de taille** : 1200x800px (crop: limit)
- **Qualité** : auto:good (équilibre qualité/taille)
- **Formats supportés** : JPG, PNG, WebP
- **Compression automatique** : Oui

---

## 🛠️ Modifications Apportées au Code

### Fichiers Modifiés

1. **`src/config/cloudinary.js`** (nouveau)
   - Configuration Cloudinary
   - Storage pour établissements et sites
   - Fonction de suppression d'images

2. **`src/middleware/upload.js`**
   - Remplace `multer.diskStorage` par `CloudinaryStorage`
   - Conserve les mêmes middlewares (`uploadMultiple`, etc.)

3. **`src/controllers/establishmentsController.js`**
   - `createEstablishment` : Utilise `file.path` (URL Cloudinary)
   - `updateEstablishment` : Suppression via `deleteImage()`

4. **`src/controllers/sitesController.js`**
   - `createSite` : Utilise `file.path` (URL Cloudinary)
   - `updateSite` : Utilise `file.path` (URL Cloudinary)

### Frontend - Aucun Changement

Votre application mobile/web **continue de fonctionner** tel quel :

```typescript
// Avant (stockage local)
image_url: "http://localhost:3000/uploads/establishments/image.jpg"

// Après (Cloudinary)
image_url: "https://res.cloudinary.com/.../touris-listings/establishments/image.jpg"

// Le composant <Image> fonctionne identiquement
<img src={establishment.images[0]} alt="..." />
```

---

## 📈 Limites du Plan Gratuit

| Ressource | Limite Gratuite |
|-----------|----------------|
| Stockage | 25 GB |
| Bande passante | 25 GB/mois |
| Transformations | 25,000/mois |
| Requêtes API | Illimitées |

**Pour un projet touristique** :
- ~25,000 images haute résolution (1MB chacune)
- Largement suffisant pour commencer

---

## ❓ Dépannage

### Erreur : "Must supply cloud_name"

➡️ Vérifiez que les variables `CLOUDINARY_*` sont bien définies dans `.env` (local) ou Railway (production).

### Les images ne s'affichent pas

1. Vérifiez l'URL dans la réponse API (doit commencer par `https://res.cloudinary.com`)
2. Ouvrez l'URL dans un navigateur - l'image doit s'afficher
3. Si 404 : vérifiez le Media Library sur Cloudinary

### Erreur 401 Unauthorized

➡️ Vérifiez que `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET` sont corrects.

### Les anciennes images (locales) ne s'affichent plus

C'est normal ! Les images locales dans `public/uploads/` n'existent plus après redéploiement.  
**Solution** : Utilisez le script de migration (voir ci-dessous).

---

## 🔄 Migration des Images Existantes (Optionnel)

Si vous avez déjà des images stockées localement et souhaitez les migrer vers Cloudinary :

```bash
# Dans listing-backend
npm run migrate:images
```

Le script `migrate-images.js` :
1. Récupère tous les établissements/sites avec des images locales
2. Upload chaque image vers Cloudinary
3. Met à jour la base de données avec les nouvelles URLs

---

## 🎯 Prochaines Étapes

Une fois Cloudinary configuré :

1. ✅ Testez l'upload local (`npm run dev`)
2. ✅ Vérifiez les images sur Cloudinary Console
3. ✅ Poussez sur Railway et ajoutez les variables
4. ✅ Testez l'upload en production
5. ✅ Migrez les anciennes images (si nécessaire)

---

## 📞 Support

- **Documentation Cloudinary** : https://cloudinary.com/documentation
- **Node.js SDK** : https://cloudinary.com/documentation/node_integration
- **Support Cloudinary** : https://support.cloudinary.com

---

**Félicitations ! 🎉** Vos images sont maintenant stockées de manière persistante et optimisées automatiquement.
