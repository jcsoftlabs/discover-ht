# Détection Client Web/Mobile

## Vue d'ensemble

Le backend détecte automatiquement si les requêtes proviennent de l'application mobile ou du frontend web, et adapte les réponses en conséquence.

## Comment ça fonctionne

### 1. Détection automatique

Le middleware dans `server.js` analyse chaque requête et ajoute `req.clientInfo` :

```javascript
req.clientInfo = {
    isMobile: boolean,    // true si client mobile
    isWeb: boolean,       // true si client web
    type: string,         // 'mobile' ou 'web'
    userAgent: string     // User-Agent du client (tronqué)
}
```

### 2. Méthodes de détection

**Option A : Header personnalisé (recommandé)**
```javascript
// Depuis votre app mobile, ajoutez le header :
headers: {
    'X-Client-Type': 'mobile'
}

// Depuis votre frontend web :
headers: {
    'X-Client-Type': 'web'
}
```

**Option B : User-Agent automatique**
Le backend détecte automatiquement les User-Agents contenant :
- `mobile`
- `android`
- `ios`
- `flutter`
- `dart`

### 3. Utilisation dans les controllers

#### Vérifier le type de client
```javascript
const { isMobileRequest, isWebRequest } = require('../middleware/clientDetection');

// Dans votre controller
if (isMobileRequest(req)) {
    // Logique spécifique mobile
}

if (isWebRequest(req)) {
    // Logique spécifique web
}
```

#### Adapter les réponses
```javascript
const { adaptResponseForClient } = require('../middleware/clientDetection');

// Retourner une réponse adaptée
res.json(adaptResponseForClient(req, data));
```

#### Formatter les images
```javascript
const { formatImagesForClient } = require('../middleware/clientDetection');

// Optimiser les images selon le client
establishment.images = formatImagesForClient(req, establishment.images);
```

### 4. Restreindre l'accès par client

```javascript
const { requireClientType } = require('../middleware/clientDetection');

// Route réservée au mobile
router.get('/mobile-only', requireClientType('mobile'), controller.method);

// Route réservée au web
router.get('/web-only', requireClientType('web'), controller.method);

// Route pour les deux
router.get('/both', requireClientType(['mobile', 'web']), controller.method);
```

## Exemples de réponses adaptées

### Mobile (optimisé)
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Hôtel du Parc",
      "price": 150,
      "images": ["image1.jpg", "image2.jpg"],  // Max 2 images
      "reviewCount": 42
    }
  ],
  "client": "mobile"
}
```

### Web (complet)
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Hôtel du Parc",
      "description": "Description complète...",
      "price": 150,
      "images": ["image1.jpg", "image2.jpg", "image3.jpg"],  // Toutes les images
      "partner": { /* données complètes */ },
      "reviews": [ /* tous les avis */ ],
      "promotions": [ /* toutes les promos */ ]
    }
  ],
  "client": "web",
  "timestamp": "2025-10-28T01:40:00.000Z"
}
```

## Logging

Le middleware log automatiquement chaque requête avec le type de client :

```
2025-10-28T01:40:00.000Z 📱 [mobile] - GET /api/establishments
2025-10-28T01:40:05.000Z 🖥️  [web] - GET /api/establishments
```

## Configuration dans l'app mobile

### Flutter/Dart
```dart
import 'package:http/http.dart' as http;

final response = await http.get(
  Uri.parse('https://api.example.com/api/establishments'),
  headers: {
    'X-Client-Type': 'mobile',
    'Authorization': 'Bearer $token',
  },
);
```

### React Native
```javascript
fetch('https://api.example.com/api/establishments', {
  headers: {
    'X-Client-Type': 'mobile',
    'Authorization': `Bearer ${token}`,
  },
});
```

## Configuration dans le frontend web

### React/Next.js
```javascript
const response = await fetch('/api/establishments', {
  headers: {
    'X-Client-Type': 'web',
    'Authorization': `Bearer ${token}`,
  },
});
```

## Avantages

1. **Optimisation mobile** : Réponses plus légères, moins de données transférées
2. **Analytics** : Tracking des utilisateurs par plateforme
3. **Flexibilité** : Logique métier différente selon le client
4. **Performance** : Images optimisées pour mobile
5. **Sécurité** : Routes spécifiques par plateforme si nécessaire

## Controllers déjà adaptés

- ✅ `establishmentsController.js` : Réponses optimisées mobile
- [ ] `usersController.js` : À adapter si nécessaire
- [ ] `sitesController.js` : À adapter si nécessaire
- [ ] `reviewsController.js` : À adapter si nécessaire

## Pour ajouter la détection à d'autres controllers

1. Importer les helpers :
```javascript
const { isMobileRequest, formatImagesForClient } = require('../middleware/clientDetection');
```

2. Utiliser dans votre logique :
```javascript
const isMobile = isMobileRequest(req);
const responseData = isMobile ? /* version mobile */ : /* version web */;
```

3. Inclure le type de client dans la réponse :
```javascript
res.json({
    success: true,
    data,
    client: req.clientInfo?.type || 'unknown'
});
```
