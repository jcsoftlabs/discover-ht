# ✅ Configuration OAuth Google - Prêt pour Production

## 🎯 Statut: OPÉRATIONNEL

Le backend est **entièrement configuré** et prêt à accepter les authentifications Google OAuth depuis **toutes les plateformes**.

---

## 📱 Plateformes supportées

| Plateforme | Client ID | Statut |
|------------|-----------|--------|
| **Web** | `955108400371-uik3onuhrlibvaik5l6j0a28t8ajg0sd.apps.googleusercontent.com` | ✅ Actif |
| **iOS** | `955108400371-ehi0ndlb0750m6rii0t4ep2sjuabnuo8.apps.googleusercontent.com` | ✅ Actif |
| **Android** | `955108400371-7e0dtjedlu93a9kcpvm7qbrqalua5rai.apps.googleusercontent.com` | ✅ Actif |

---

## 🔑 Endpoints disponibles

### 1. Authentification Google
```http
POST /api/auth/google
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "isNewUser": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxx123456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "profilePicture": "https://lh3.googleusercontent.com/...",
    "provider": "google",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Dissocier le compte Google
```http
POST /api/auth/unlink-google
Authorization: Bearer <jwt_token>
```

---

## 🚀 Démarrage rapide

### 1. Vérifier la configuration
```bash
node test-oauth-multiplatform.js
```

### 2. Démarrer le serveur
```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:3000`

---

## 📱 Configuration côté mobile (React Native)

### Installation
```bash
npm install @react-native-google-signin/google-signin
```

### Configuration
```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '955108400371-uik3onuhrlibvaik5l6j0a28t8ajg0sd.apps.googleusercontent.com',
  iosClientId: '955108400371-ehi0ndlb0750m6rii0t4ep2sjuabnuo8.apps.googleusercontent.com',
  offlineAccess: true,
});
```

### Exemple de connexion
```javascript
import axios from 'axios';

const signInWithGoogle = async () => {
  try {
    // 1. Authentification Google
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // 2. Récupérer le token
    const { idToken } = await GoogleSignin.getTokens();
    
    // 3. Envoyer au backend
    const response = await axios.post('http://localhost:3000/api/auth/google', {
      idToken: idToken
    });
    
    // 4. Sauvegarder le JWT
    const { token, user, isNewUser } = response.data;
    await AsyncStorage.setItem('authToken', token);
    
    console.log('Connecté:', user);
    return { success: true, user, isNewUser };
    
  } catch (error) {
    console.error('Erreur:', error);
    return { success: false, error };
  }
};
```

---

## 🗄️ Base de données

### Structure User
```sql
CREATE TABLE users (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  first_name VARCHAR(191) NOT NULL,
  last_name VARCHAR(191) NOT NULL,
  password VARCHAR(255) NULL,           -- Nullable pour OAuth
  google_id VARCHAR(255) UNIQUE NULL,   -- ID Google unique
  provider VARCHAR(50) DEFAULT 'local', -- 'local' ou 'google'
  profile_picture VARCHAR(500) NULL,    -- URL photo de profil
  role ENUM('USER', 'ADMIN', 'PARTNER') DEFAULT 'USER',
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
```

---

## 🔐 Sécurité

### ✅ Implémenté
- Vérification des tokens Google côté serveur
- Validation de l'audience (Client IDs)
- Validation de l'émetteur (Google)
- Rate limiting sur les endpoints d'auth (5 tentatives / 15 min)
- JWT avec expiration (7 jours)
- CORS configuré pour mobile
- Support HTTPS

### Variables d'environnement
```env
# OAuth
GOOGLE_CLIENT_ID_WEB=955108400371-uik3onuhrlibvaik5l6j0a28t8ajg0sd.apps.googleusercontent.com
GOOGLE_CLIENT_ID_IOS=955108400371-ehi0ndlb0750m6rii0t4ep2sjuabnuo8.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=955108400371-7e0dtjedlu93a9kcpvm7qbrqalua5rai.apps.googleusercontent.com

# Sécurité
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_securisee
```

⚠️ **IMPORTANT**: Ne jamais committer ces valeurs dans Git

---

## 📊 Flux d'authentification

```
┌─────────────┐         ┌──────────┐         ┌─────────────┐
│   Mobile    │         │  Google  │         │   Backend   │
│     App     │         │   OAuth  │         │     API     │
└──────┬──────┘         └────┬─────┘         └──────┬──────┘
       │                     │                       │
       │ 1. Demande Google Sign-In                  │
       │────────────────────>│                       │
       │                     │                       │
       │ 2. Retourne idToken │                       │
       │<────────────────────│                       │
       │                                             │
       │ 3. POST /api/auth/google {idToken}         │
       │────────────────────────────────────────────>│
       │                                             │
       │                     4. Vérifie token Google │
       │                     <──────────────────────>│
       │                                             │
       │                     5. Crée/Trouve user     │
       │                                             │
       │ 6. Retourne JWT + user data                │
       │<────────────────────────────────────────────│
       │                                             │
```

---

## 🧪 Tests

### Test de configuration
```bash
# Vérifier que tout est configuré
node test-oauth-multiplatform.js
```

### Test de la base de données
```bash
# Vérifier les champs OAuth
node test-oauth.js
```

### Test de l'API
```bash
# Avec curl (remplacer <ID_TOKEN> par un vrai token)
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"<ID_TOKEN>"}'
```

---

## 📚 Documentation complète

Voir `docs/OAUTH_SETUP.md` pour:
- Guide complet d'intégration React Native
- Configuration Google Cloud Console
- Gestion des erreurs
- Exemples de code détaillés
- Dépannage

---

## 🆘 Dépannage

### Token invalide
- Vérifier que le Client ID correspond à la plateforme
- Vérifier que le token n'est pas expiré (< 1h)
- Vérifier que l'email Google est vérifié

### Email non vérifié
- L'utilisateur doit vérifier son email Google
- Impossible de se connecter avec un email non vérifié

### Erreur de base de données
- Vérifier que XAMPP/MySQL est démarré
- Vérifier que les champs OAuth existent: `node test-oauth.js`

---

## ✅ Checklist de production

- [x] Client IDs configurés (Web, iOS, Android)
- [x] Base de données mise à jour
- [x] Endpoints OAuth créés
- [x] Rate limiting activé
- [x] Validation des tokens côté serveur
- [x] JWT sécurisé (7 jours d'expiration)
- [x] CORS configuré
- [x] Documentation complète
- [x] Scripts de test

---

## 🎉 Prêt pour l'intégration mobile !

Le backend est **100% opérationnel** et attend les connexions depuis votre application mobile.

**Prochaine étape**: Intégrer le code React Native dans votre app mobile en suivant `docs/OAUTH_SETUP.md`
