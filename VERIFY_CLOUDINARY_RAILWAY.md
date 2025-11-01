# ✅ Vérification Cloudinary sur Railway

## 🎯 Status Actuel

✅ **Variables Cloudinary configurées dans Railway**
- `CLOUDINARY_CLOUD_NAME` ✅
- `CLOUDINARY_API_KEY` ✅  
- `CLOUDINARY_API_SECRET` ✅

✅ **Application redéployée** (2025-11-01T23:02:23Z)

## 🧪 Test de vérification rapide

### Option 1 : Test via l'API directement (Recommandé)

```bash
# 1. Se connecter et obtenir le token
TOKEN=$(curl -s -X POST https://discover-ht-production.up.railway.app/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test456@example.com","password":"Test@123456"}' | \
  jq -r '.data.accessToken')

echo "Token: ${TOKEN:0:50}..."

# 2. Créer une image de test (1x1 pixel transparent)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | \
  base64 -D > /tmp/test-cloudinary.png 2>/dev/null || \
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | \
  base64 -d > /tmp/test-cloudinary.png

# 3. Upload avec Cloudinary
curl -X POST https://discover-ht-production.up.railway.app/api/establishments \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Test Cloudinary $(date +%s)" \
  -F "type=hotel" \
  -F "price=100" \
  -F "description=Test pour vérifier l'upload Cloudinary" \
  -F "images=@/tmp/test-cloudinary.png" | jq '.'
```

### Option 2 : Vérifier via un nouvel établissement

Utilisez Postman ou Insomnia avec ces paramètres :

**Endpoint** : `POST https://discover-ht-production.up.railway.app/api/establishments`

**Headers** :
```
Authorization: Bearer VOTRE_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data)** :
- `name` : "Hotel Test Cloudinary"
- `type` : "hotel"
- `price` : 150
- `description` : "Test Cloudinary"
- `images` : [Sélectionner un fichier image]

**Résultat attendu** :
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Hotel Test Cloudinary",
    "images": [
      "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v.../touris-listings/establishments/establishment-..."
    ]
  }
}
```

## 🔍 Vérification du résultat

### ✅ Success - Cloudinary fonctionne
L'URL de l'image doit contenir :
- ✅ `https://res.cloudinary.com`
- ✅ Votre `CLOUD_NAME`
- ✅ `/touris-listings/establishments/`
- ✅ Un nom de fichier généré automatiquement

### ❌ Échec - Cloudinary ne fonctionne pas
L'URL de l'image contient :
- ❌ `http://discover-ht-production.up.railway.app/uploads/`
- ❌ Un chemin local

**Si échec** :
1. Vérifier les logs Railway pour erreurs Cloudinary
2. Vérifier que les 3 variables sont bien définies
3. Redéployer si nécessaire

## 🎯 Test automatique complet

```bash
#!/bin/bash

echo "🧪 Test automatique Cloudinary sur Railway"
echo "=========================================="
echo ""

# 1. Login
echo "1️⃣ Connexion..."
TOKEN=$(curl -s -X POST https://discover-ht-production.up.railway.app/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test456@example.com","password":"Test@123456"}' | \
  jq -r '.data.accessToken // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Échec de connexion"
  exit 1
fi
echo "✅ Token obtenu"
echo ""

# 2. Créer image test
echo "2️⃣ Création image de test..."
cat > /tmp/test.png.b64 << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
EOF

base64 -D /tmp/test.png.b64 > /tmp/test-cloudinary.png 2>/dev/null || \
  base64 -d /tmp/test.png.b64 > /tmp/test-cloudinary.png

echo "✅ Image créée"
echo ""

# 3. Upload
echo "3️⃣ Upload vers Railway (avec Cloudinary)..."
RESPONSE=$(curl -s -X POST https://discover-ht-production.up.railway.app/api/establishments \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Cloudinary Test $(date +%s)" \
  -F "type=hotel" \
  -F "price=100" \
  -F "images=@/tmp/test-cloudinary.png")

echo "$RESPONSE" | jq '.'
echo ""

# 4. Vérifier l'URL
IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data.images[0] // empty')

if [ -z "$IMAGE_URL" ]; then
  echo "❌ Pas d'image dans la réponse"
  exit 1
fi

echo "4️⃣ Vérification de l'URL..."
echo "URL: $IMAGE_URL"
echo ""

if [[ $IMAGE_URL == *"cloudinary.com"* ]]; then
  echo "✅ ✅ ✅ SUCCÈS - Cloudinary fonctionne ! ✅ ✅ ✅"
  echo ""
  echo "Image uploadée sur Cloudinary:"
  echo "$IMAGE_URL"
else
  echo "❌ ÉCHEC - Image stockée localement (sera perdue au redéploiement)"
  echo ""
  echo "Action requise:"
  echo "1. Vérifier les logs Railway"
  echo "2. Confirmer les variables Cloudinary"
  echo "3. Redéployer si nécessaire"
fi
```

Sauvegardez ce script dans `test-cloudinary-railway.sh` et exécutez :
```bash
chmod +x test-cloudinary-railway.sh
./test-cloudinary-railway.sh
```

## 📊 État des images actuelles

**Avant configuration Cloudinary** :
```bash
# Images locales (à migrer)
curl -s https://discover-ht-production.up.railway.app/api/establishments | \
  jq '.data[].images[]' | grep -v cloudinary | grep -v unsplash
```

**Après configuration Cloudinary** :
```bash
# Images Cloudinary (persistantes)
curl -s https://discover-ht-production.up.railway.app/api/establishments | \
  jq '.data[].images[]' | grep cloudinary
```

## 🔄 Migration des images existantes

Si vous avez des images locales à migrer :

```bash
# Option 1: Depuis Railway CLI
railway run npm run migrate:images

# Option 2: Créer un endpoint admin dédié
# Contactez-moi si vous avez besoin d'aide pour cela
```

## ✅ Checklist finale

- [x] Variables Cloudinary configurées dans Railway
- [x] Application redéployée
- [ ] Test d'upload effectué
- [ ] URL Cloudinary confirmée
- [ ] Images existantes migrées (si applicable)
- [ ] Documentation mise à jour

---

**Note** : Une fois Cloudinary validé, toutes les nouvelles images seront automatiquement uploadées sur Cloudinary et resteront disponibles même après les redéploiements Railway. 🚀
