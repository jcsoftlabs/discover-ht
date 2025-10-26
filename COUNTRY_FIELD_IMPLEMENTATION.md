# Implémentation du champ Country

## ✅ Modifications effectuées

### 1. Validation (middleware/validation.js)
- Ajout de la validation du champ `country` dans `validateCreateUser`
- Ajout de la validation du champ `country` dans `validateUpdateUser`
- Ajout de la validation du champ `country` dans `validateAdminCreateUser`

**Règles de validation :**
- Optionnel pour ADMIN et PARTNER
- Obligatoire pour USER (validation dans le controller)
- Longueur: 2-100 caractères
- Caractères autorisés: lettres, espaces, tirets, caractères accentués

### 2. Controller d'authentification (controllers/authController.js)
- Extraction du champ `country` depuis `req.body` dans la méthode `register`
- Stockage du `country` lors de la création de l'utilisateur
- Inclusion du `country` dans la réponse après inscription
- Inclusion du `country` dans la réponse du profil utilisateur (`getProfile`)

### 3. Controller utilisateurs (controllers/usersController.js)
**Déjà implémenté :**
- Validation du pays obligatoire pour les utilisateurs normaux (USER)
- Retour du country dans toutes les réponses utilisateur
- Support de mise à jour du country

### 4. Base de données
**État actuel :**
- ✅ Colonne `country` existe déjà dans la table `users`
- Type: `varchar(255)` nullable
- Aucune migration nécessaire

## 📋 Règles métier

1. **Pour les USER (utilisateurs normaux):**
   - Le champ `country` est **OBLIGATOIRE** lors de l'inscription
   - Erreur 400 si non fourni

2. **Pour les ADMIN et PARTNER:**
   - Le champ `country` est **OPTIONNEL**
   - Peut être null

3. **Format accepté:**
   - Minimum 2 caractères
   - Maximum 100 caractères
   - Lettres, espaces, tirets et caractères accentués uniquement
   - Exemples valides: "Haiti", "Haïti", "République Dominicaine", "États-Unis"

## 🧪 Tests

### Script de test fourni
```bash
cd /Users/christopherjerome/listing-backend
./test-country-registration.sh
```

### Tests manuels avec curl

**Test 1: Inscription USER avec country (devrait réussir)**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "password": "Test1234!",
    "country": "Haiti"
  }'
```

**Test 2: Inscription USER sans country (devrait échouer)**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont2@example.com",
    "password": "Test1234!"
  }'
```

**Test 3: Inscription ADMIN sans country (devrait réussir)**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "System",
    "email": "admin.system@example.com",
    "password": "Test1234!",
    "role": "ADMIN"
  }'
```

## 📊 Réponse API

### Exemple de réponse réussie:
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": "clxxxx...",
      "firstName": "Jean",
      "lastName": "Dupont",
      "email": "jean.dupont@example.com",
      "country": "Haiti",
      "role": "USER",
      "createdAt": "2025-10-25T04:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Exemple d'erreur (country manquant pour USER):
```json
{
  "success": false,
  "error": "Le pays est obligatoire pour l'inscription"
}
```

### Exemple d'erreur de validation:
```json
{
  "success": false,
  "error": "Erreurs de validation",
  "details": [
    {
      "field": "country",
      "message": "Le nom du pays doit contenir entre 2 et 100 caractères"
    }
  ]
}
```

## 🔄 Endpoints affectés

Tous ces endpoints incluent maintenant le champ `country`:

1. **POST /api/auth/register** - Inscription
2. **GET /api/auth/me** - Profil utilisateur connecté
3. **GET /api/users** - Liste des utilisateurs
4. **GET /api/users/:id** - Détails d'un utilisateur
5. **POST /api/users** - Créer un utilisateur (admin)
6. **PUT /api/users/:id** - Mettre à jour un utilisateur
7. **GET /api/users/role/:role** - Utilisateurs par rôle

## 🎯 Intégration mobile

Pour l'application mobile, lors de l'inscription:

```javascript
// Exemple de requête d'inscription
const registerUser = async (userData) => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      country: userData.country, // ⬅️ Nouveau champ obligatoire
    }),
  });
  
  return await response.json();
};
```

## ✅ Checklist de vérification

- [x] Validation du champ dans le middleware
- [x] Extraction du champ dans le controller
- [x] Stockage en base de données
- [x] Retour du champ dans les réponses API
- [x] Validation métier (obligatoire pour USER)
- [x] Documentation complète
- [x] Script de tests fourni

## 🚀 Déploiement

Aucune migration de base de données nécessaire car la colonne existe déjà.

Pour mettre en production:
1. Redémarrer le serveur backend
2. Mettre à jour l'application mobile pour inclure le sélecteur de pays
3. Tester l'inscription avec les nouveaux champs
