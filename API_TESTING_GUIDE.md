# Guide de Test - Touris API

## 🚀 Démarrer l'API

```bash
# Démarrer le serveur en mode développement
npm run dev

# Ou en mode production
npm start
```

L'API sera accessible sur `http://localhost:3000`

## 📋 Endpoints disponibles

### 🏠 Endpoint racine
```bash
curl http://localhost:3000
```

## 👥 Users API

### Récupérer tous les utilisateurs
```bash
curl http://localhost:3000/api/users
```

### Créer un nouvel utilisateur
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@email.com",
    "password": "motdepasse123",
    "role": "USER"
  }'
```

### Récupérer un utilisateur par ID
```bash
curl http://localhost:3000/api/users/{USER_ID}
```

### Récupérer les utilisateurs par rôle
```bash
curl http://localhost:3000/api/users/role/ADMIN
curl http://localhost:3000/api/users/role/USER
curl http://localhost:3000/api/users/role/PARTNER
```

### Mettre à jour un utilisateur
```bash
curl -X PUT http://localhost:3000/api/users/{USER_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean-Michel",
    "role": "ADMIN"
  }'
```

## 🏨 Establishments API

### Récupérer tous les établissements
```bash
curl http://localhost:3000/api/establishments
```

### Créer un nouvel établissement
```bash
curl -X POST http://localhost:3000/api/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hôtel des Jardins",
    "description": "Magnifique hôtel au cœur de la ville",
    "type": "HOTEL",
    "price": 120.50,
    "address": "123 Avenue des Fleurs, Paris",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "partnerId": "partner1"
  }'
```

### Récupérer un établissement par ID
```bash
curl http://localhost:3000/api/establishments/{ESTABLISHMENT_ID}
```

## 🏛️ Sites API

### Récupérer tous les sites touristiques
```bash
curl http://localhost:3000/api/sites
```

### Rechercher des sites
```bash
# Recherche par mot-clé
curl "http://localhost:3000/api/sites?search=Tour+Eiffel"

# Limiter le nombre de résultats
curl "http://localhost:3000/api/sites?limit=5"
```

### Créer un nouveau site
```bash
curl -X POST http://localhost:3000/api/sites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arc de Triomphe",
    "description": "Monument historique emblématique de Paris",
    "address": "Place Charles de Gaulle, 75008 Paris",
    "latitude": 48.8738,
    "longitude": 2.2950
  }'
```

### Rechercher des sites à proximité
```bash
curl "http://localhost:3000/api/sites/nearby?latitude=48.8566&longitude=2.3522&radius=5"
```

### Statistiques des sites
```bash
curl http://localhost:3000/api/sites/stats
```

## ⭐ Reviews API

### Récupérer tous les avis
```bash
curl http://localhost:3000/api/reviews
```

### Créer un nouvel avis
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent séjour, service impeccable !",
    "userId": "user1",
    "establishmentId": "estab1"
  }'
```

### Récupérer les avis par établissement
```bash
curl "http://localhost:3000/api/reviews?establishmentId=estab1"
```

### Récupérer les avis par utilisateur
```bash
curl http://localhost:3000/api/reviews/user/{USER_ID}
```

### Statistiques d'avis pour un établissement
```bash
curl http://localhost:3000/api/reviews/establishment/{ESTABLISHMENT_ID}/stats
```

### Filtrer les avis par note
```bash
curl "http://localhost:3000/api/reviews?rating=5"
```

## 🎉 Promotions API

### Récupérer toutes les promotions
```bash
curl http://localhost:3000/api/promotions
```

### Récupérer les promotions actuellement valides
```bash
curl http://localhost:3000/api/promotions/current
```

### Créer une nouvelle promotion
```bash
curl -X POST http://localhost:3000/api/promotions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Offre Spéciale Été",
    "description": "Profitez de 30% de réduction pour vos vacances d'été",
    "discount": 30.0,
    "validFrom": "2024-06-01T00:00:00Z",
    "validUntil": "2024-08-31T23:59:59Z",
    "establishmentId": "estab1"
  }'
```

### Récupérer les promotions qui expirent bientôt
```bash
curl "http://localhost:3000/api/promotions/expiring?days=7"
```

### Statistiques des promotions
```bash
curl http://localhost:3000/api/promotions/stats
```

### Filtrer les promotions par établissement
```bash
curl "http://localhost:3000/api/promotions?establishmentId=estab1"
```

## 🔍 Exemples de réponses

### Réponse succès standard
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### Réponse de création
```json
{
  "success": true,
  "message": "Ressource créée avec succès",
  "data": {...}
}
```

### Réponse d'erreur
```json
{
  "success": false,
  "error": "Message d'erreur descriptif"
}
```

## 🧪 Tests avec filtres avancés

### Establishments avec promotions et avis
```bash
# Récupérer un établissement avec toutes ses relations
curl http://localhost:3000/api/establishments/{ESTABLISHMENT_ID}
```

### Recherche complexe de promotions
```bash
# Promotions actives pour les hôtels seulement
curl "http://localhost:3000/api/promotions/current?establishmentType=HOTEL&limit=10"
```

### Avis avec relations complètes
```bash
# Tous les avis avec informations utilisateur et établissement
curl http://localhost:3000/api/reviews
```

## 📊 Endpoints de statistiques

```bash
# Statistiques des sites
curl http://localhost:3000/api/sites/stats

# Statistiques des promotions
curl http://localhost:3000/api/promotions/stats

# Statistiques d'avis pour un établissement
curl http://localhost:3000/api/reviews/establishment/{ESTABLISHMENT_ID}/stats
```

## 💡 Conseils de test

### 1. Utiliser des variables d'environnement
```bash
export API_URL=http://localhost:3000
export USER_ID=user1
export ESTABLISHMENT_ID=estab1

curl $API_URL/api/users/$USER_ID
```

### 2. Sauvegarder les IDs pour les tests
```bash
# Créer un utilisateur et sauvegarder l'ID
USER_ID=$(curl -s -X POST $API_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@email.com","password":"123456"}' \
  | jq -r '.data.id')

echo "Created user ID: $USER_ID"
```

### 3. Tests de validation
```bash
# Tester les validations (devrait retourner une erreur)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "",
    "email": "invalid-email"
  }'
```

### 4. Tests de mise à jour partielle
```bash
# Mettre à jour seulement un champ
curl -X PUT http://localhost:3000/api/establishments/{ESTABLISHMENT_ID} \
  -H "Content-Type: application/json" \
  -d '{"price": 150.00}'
```

## 🔗 Workflow de test complet

1. **Créer un utilisateur**
2. **Créer un partenaire** (via la DB directement pour l'instant)
3. **Créer un établissement**
4. **Créer un avis**
5. **Créer une promotion**
6. **Tester les relations et filtres**

Cette API est entièrement fonctionnelle avec Prisma ORM et prête pour être utilisée avec n'importe quel frontend!