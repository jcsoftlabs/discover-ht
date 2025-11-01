#!/bin/bash

echo "🧪 Test automatique Cloudinary sur Railway"
echo "=========================================="
echo ""

# 1. Login
echo "1️⃣ Connexion..."
TOKEN=$(curl -s -X POST https://discover-ht-production.up.railway.app/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test456@example.com","password":"Test@123456"}' | \
  jq -r '.data.token // empty')

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
  echo ""
  echo "🎉 Toutes les futures images seront stockées sur Cloudinary de manière permanente !"
else
  echo "❌ ÉCHEC - Image stockée localement (sera perdue au redéploiement)"
  echo ""
  echo "Action requise:"
  echo "1. Vérifier les logs Railway pour erreurs Cloudinary"
  echo "2. Confirmer les 3 variables Cloudinary dans Railway"
  echo "3. Redéployer si nécessaire"
fi
