# Système d'Authentification JWT

## Vue d'ensemble

Le système d'authentification utilise **JWT (JSON Web Tokens)** avec deux types de tokens :
- **Access Token** : Durée de vie courte (15 minutes), utilisé pour les requêtes API
- **Refresh Token** : Durée de vie longue (7 jours), utilisé pour renouveler l'access token

Les tokens sont stockés de manière sécurisée dans des **cookies HTTP-only** pour éviter les attaques XSS.

## Types d'utilisateurs

### 1. Administrateur (ADMIN)
- Connexion via compte utilisateur avec rôle `ADMIN`
- Accès complet à toutes les fonctionnalités
- Gère la validation des partenaires

### 2. Partenaire (PARTNER)
- Connexion via compte partenaire
- Doit être validé (`status: APPROVED`) par un administrateur
- Gère ses propres établissements

### 3. Utilisateur normal (USER)
- Connexion standard pour l'application mobile
- Accès aux fonctionnalités publiques

## Endpoints d'authentification

### Connexion Administrateur
```http
POST /api/auth/login/admin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Connexion réussie.",
  "data": {
    "user": {
      "id": "cuid123",
      "email": "admin@example.com",
      "role": "ADMIN",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Réponse erreur - Non admin (403):**
```json
{
  "success": false,
  "error": "Accès refusé. Droits administrateur requis."
}
```

---

### Connexion Partenaire
```http
POST /api/auth/login/partner
Content-Type: application/json

{
  "email": "partner@example.com",
  "password": "password123"
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Connexion réussie.",
  "data": {
    "partner": {
      "id": "cuid456",
      "email": "partner@example.com",
      "name": "Partner Business",
      "status": "APPROVED"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Réponse erreur - Non validé (403):**
```json
{
  "success": false,
  "error": "Votre compte est en attente de validation par le ministère.",
  "status": "PENDING"
}
```

---

### Rafraîchir le token
```http
POST /api/auth/refresh
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...

OU

Content-Type: application/json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Token renouvelé avec succès.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Déconnexion
```http
POST /api/auth/logout
Cookie: accessToken=...; refreshToken=...
```

**Réponse succès (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

## Protection des routes

### Middleware disponibles

#### 1. `authenticateToken`
Vérifie la présence et la validité du token JWT (cookie ou header).

```javascript
const { authenticateToken } = require('./middleware/auth');

router.get('/protected', authenticateToken, (req, res) => {
  // req.user contient les infos de l'utilisateur/partenaire
  res.json({ user: req.user });
});
```

#### 2. `isAdmin`
Vérifie que l'utilisateur est un administrateur.

```javascript
const { authenticateToken, isAdmin } = require('./middleware/auth');

router.post('/admin-only', authenticateToken, isAdmin, (req, res) => {
  // Uniquement accessible aux ADMIN
});
```

#### 3. `isPartner`
Vérifie que c'est un partenaire (même non validé).

```javascript
const { authenticateToken, isPartner } = require('./middleware/auth');

router.get('/partner-profile', authenticateToken, isPartner, (req, res) => {
  // Accessible à tous les partenaires
});
```

#### 4. `isValidatedPartner`
Vérifie que le partenaire est validé (status: APPROVED).

```javascript
const { authenticateToken, isValidatedPartner } = require('./middleware/auth');

router.post('/establishments', authenticateToken, isValidatedPartner, (req, res) => {
  // Uniquement accessible aux partenaires validés
});
```

---

## Stockage des tokens

### Cookies sécurisés (Recommandé)
Les tokens sont automatiquement stockés dans des cookies HTTP-only :

```javascript
// Configuration des cookies
{
  httpOnly: true,           // Inaccessible par JavaScript
  secure: true,             // HTTPS uniquement en production
  sameSite: 'strict',       // Protection CSRF
  path: '/'
}
```

### Headers Authorization (Alternative)
Pour les applications qui ne peuvent pas utiliser les cookies :

```http
GET /api/protected
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Gestion des mots de passe

### Hashing avec bcrypt
Tous les mots de passe sont hashés avec **bcrypt** (12 rounds) :

```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 12);
```

### Migration des mots de passe existants
Pour hasher les mots de passe en clair dans la base de données :

```bash
node scripts/hashPasswords.js
```

Ce script :
- ✅ Hash tous les mots de passe en clair
- ⚠️ Ignore les mots de passe déjà hashés
- 🔒 Utilise bcrypt avec 12 rounds
- ⚠️ **À exécuter une seule fois**

---

## Variables d'environnement

Ajouter dans `.env` :

```env
# JWT Configuration
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_securisee_changez_moi_en_production
JWT_REFRESH_SECRET=votre_cle_secrete_refresh_token_differente_tres_longue_changez_moi_en_production

# Environment
NODE_ENV=production
```

⚠️ **IMPORTANT** : Changer les secrets en production avec des valeurs aléatoires sécurisées !

---

## Flux d'authentification

### 1. Connexion initiale
```
Client → POST /api/auth/login/admin (email, password)
     ← Cookies: accessToken (15min), refreshToken (7j)
```

### 2. Requêtes authentifiées
```
Client → GET /api/protected
         Cookie: accessToken
     ← Données protégées
```

### 3. Token expiré
```
Client → GET /api/protected
         Cookie: accessToken (expiré)
     ← 401 "Token expiré"

Client → POST /api/auth/refresh
         Cookie: refreshToken
     ← Nouveau accessToken (15min)
```

### 4. Déconnexion
```
Client → POST /api/auth/logout
     ← Suppression des cookies
     ← Refresh token invalidé en BDD
```

---

## Sécurité

### ✅ Bonnes pratiques implémentées
- Tokens JWT signés avec HS256
- Cookies HTTP-only (protection XSS)
- SameSite=strict (protection CSRF)
- Mots de passe hashés avec bcrypt (12 rounds)
- Refresh tokens stockés en base de données
- Rate limiting sur les endpoints d'authentification
- Validation stricte des entrées

### ⚠️ Recommandations production
- Utiliser HTTPS obligatoirement
- Changer les secrets JWT
- Activer les logs d'authentification
- Monitorer les tentatives de connexion échouées
- Implémenter une rotation des secrets
- Considérer l'authentification 2FA pour les admins

---

## Exemple d'utilisation côté client

### JavaScript/Fetch
```javascript
// Connexion admin
const login = async () => {
  const response = await fetch('http://localhost:3000/api/auth/login/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important pour les cookies
    body: JSON.stringify({
      email: 'admin@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  // Les cookies sont automatiquement stockés
  localStorage.setItem('user', JSON.stringify(data.data.user));
};

// Requête authentifiée
const fetchProtected = async () => {
  const response = await fetch('http://localhost:3000/api/protected', {
    credentials: 'include' // Envoie automatiquement les cookies
  });
  
  if (response.status === 401) {
    // Token expiré, essayer de refresh
    await refreshToken();
    // Réessayer la requête
    return fetchProtected();
  }
  
  return response.json();
};

// Refresh automatique
const refreshToken = async () => {
  const response = await fetch('http://localhost:3000/api/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });
  
  if (!response.ok) {
    // Refresh échoué, rediriger vers login
    window.location.href = '/login';
  }
};

// Déconnexion
const logout = async () => {
  await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  localStorage.removeItem('user');
  window.location.href = '/login';
};
```

---

## Dépannage

### Erreur: "Token expiré"
➡️ Utiliser `/api/auth/refresh` pour obtenir un nouveau token

### Erreur: "Refresh token invalide"
➡️ L'utilisateur doit se reconnecter

### Erreur: "Compte en attente de validation"
➡️ Un admin doit approuver le partenaire via `/api/admin/partners/:id/approve`

### Cookies non envoyés
➡️ Vérifier `credentials: 'include'` dans les requêtes fetch
➡️ Vérifier la configuration CORS (credentials: true)

---

## Tests

### Créer un admin de test
```bash
/Applications/XAMPP/bin/mysql -u root listing_app -e "
  INSERT INTO users (id, first_name, last_name, email, password, role, created_at, updated_at)
  VALUES ('admin001', 'Super', 'Admin', 'admin@test.com', 
    '\$2b\$12\$hash_du_mot_de_passe', 'ADMIN', NOW(), NOW());
"
```

### Créer un partenaire de test
```bash
node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('password123', 12).then(hash => console.log(hash));
"
```

Puis insérer dans la base :
```sql
INSERT INTO partners (id, name, email, password, status, created_at, updated_at)
VALUES ('partner001', 'Test Partner', 'partner@test.com', 
  'hash_généré', 'APPROVED', NOW(), NOW());
```

---

## Support

Pour toute question sur l'authentification, consulter :
- Ce document
- `/src/middleware/auth.js` - Middleware d'authentification
- `/src/controllers/authController.js` - Logique d'authentification
- `/src/routes/auth.js` - Routes d'authentification
