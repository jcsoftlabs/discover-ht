# Configuration OAuth Google pour l'API Tourism

## 📋 Vue d'ensemble

L'API Tourism supporte maintenant l'authentification OAuth 2.0 avec Google. Les utilisateurs peuvent se connecter avec leur compte Google, et le système créera automatiquement un compte utilisateur ou liera le compte Google à un compte existant.

## 🔑 Endpoints OAuth disponibles

### POST `/api/auth/google`
Authentifie un utilisateur avec un token Google ID.

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
}
```

**Response (Nouvel utilisateur):**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "isNewUser": true,
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

**Response (Utilisateur existant):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "isNewUser": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### POST `/api/auth/unlink-google`
Dissocie un compte Google d'un utilisateur (nécessite authentification).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Compte Google dissocié avec succès"
}
```

**Note:** L'utilisateur doit avoir défini un mot de passe avant de pouvoir dissocier son compte Google.

## 🚀 Configuration Google Cloud Console

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API ou Google Identity Services

### 2. Configurer l'écran de consentement OAuth

1. Allez dans **APIs & Services** > **OAuth consent screen**
2. Choisissez **External** (ou Internal si vous avez un Google Workspace)
3. Remplissez les informations requises :
   - **App name:** Tourism Platform
   - **User support email:** Votre email
   - **Developer contact information:** Votre email
4. Ajoutez les scopes nécessaires :
   - `email`
   - `profile`
   - `openid`
5. Sauvegardez et continuez

### 3. Créer les identifiants OAuth 2.0

#### Pour l'application mobile (iOS/Android)

1. Allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth client ID**

**Pour Android:**
- Type: **Android**
- Package name: `com.votreapp.tourism` (ou votre package)
- SHA-1 certificate fingerprint: Obtenez-le avec:
  ```bash
  # Debug keystore
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  
  # Release keystore
  keytool -list -v -keystore /path/to/your/keystore.jks -alias your-alias
  ```

**Pour iOS:**
- Type: **iOS**
- Bundle ID: `com.votreapp.tourism` (ou votre bundle ID)
- App Store ID: (optionnel pour le développement)

**Pour Web (si nécessaire pour le développement):**
- Type: **Web application**
- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `https://localhost:3443`
- Authorized redirect URIs:
  - `http://localhost:3000/auth/callback`

3. Copiez le **Client ID** généré

### 4. Configurer le backend

**Le backend est déjà configuré avec les Client IDs suivants:**

```env
# Client ID Web
GOOGLE_CLIENT_ID_WEB=955108400371-uik3onuhrlibvaik5l6j0a28t8ajg0sd.apps.googleusercontent.com

# Client ID iOS
GOOGLE_CLIENT_ID_IOS=955108400371-ehi0ndlb0750m6rii0t4ep2sjuabnuo8.apps.googleusercontent.com

# Client ID Android
GOOGLE_CLIENT_ID_ANDROID=955108400371-7e0dtjedlu93a9kcpvm7qbrqalua5rai.apps.googleusercontent.com
```

**Le backend accepte automatiquement les tokens des trois plateformes (Web, iOS et Android).**

## 📱 Intégration côté client (React Native / Expo)

### Installation des dépendances

```bash
# Pour Expo
npx expo install @react-native-google-signin/google-signin

# OU pour React Native CLI
npm install @react-native-google-signin/google-signin
```

### Configuration React Native

**iOS (ios/YourApp/AppDelegate.m):**
```objc
#import <GoogleSignIn/GoogleSignIn.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  // ...
  [GIDSignIn sharedInstance].clientID = @"YOUR_CLIENT_ID.apps.googleusercontent.com";
  return YES;
}
```

**Android (android/app/src/main/AndroidManifest.xml):**
```xml
<!-- Pas de configuration spéciale nécessaire avec le nouveau SDK -->
```

### Exemple de code React Native

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';

// Configuration (à faire au démarrage de l'app)
GoogleSignin.configure({
  webClientId: '955108400371-uik3onuhrlibvaik5l6j0a28t8ajg0sd.apps.googleusercontent.com', // Client ID Web (REQUIS)
  iosClientId: '955108400371-ehi0ndlb0750m6rii0t4ep2sjuabnuo8.apps.googleusercontent.com', // Client ID iOS
  // Pour Android, le Client ID est automatiquement détecté depuis google-services.json
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

// Fonction de connexion Google
export const signInWithGoogle = async () => {
  try {
    // Étape 1: Authentification Google
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Étape 2: Récupérer l'ID token
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;
    
    // Étape 3: Envoyer le token à votre backend
    const response = await axios.post('http://localhost:3000/api/auth/google', {
      idToken: idToken
    });
    
    // Étape 4: Sauvegarder le JWT de votre backend
    const { token, user, isNewUser } = response.data;
    
    // Sauvegarder le token (AsyncStorage, SecureStore, etc.)
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    console.log('Authentification réussie:', user);
    
    if (isNewUser) {
      console.log('Nouveau compte créé!');
      // Rediriger vers l'onboarding si nécessaire
    } else {
      console.log('Connexion à un compte existant');
      // Rediriger vers la page principale
    }
    
    return { success: true, user, isNewUser };
    
  } catch (error) {
    console.error('Erreur lors de la connexion Google:', error);
    
    if (error.code === 'SIGN_IN_CANCELLED') {
      console.log('Connexion annulée par l\'utilisateur');
    } else if (error.code === 'IN_PROGRESS') {
      console.log('Connexion déjà en cours');
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      console.log('Google Play Services non disponible');
    }
    
    return { success: false, error };
  }
};

// Fonction de déconnexion
export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    console.log('Déconnexion réussie');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};
```

### Exemple de composant de connexion

```javascript
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { signInWithGoogle } from './auth';

const LoginScreen = ({ navigation }) => {
  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    
    if (result.success) {
      if (result.isNewUser) {
        navigation.navigate('Onboarding');
      } else {
        navigation.navigate('Home');
      }
    } else {
      Alert.alert('Erreur', 'Impossible de se connecter avec Google');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.googleButton} 
        onPress={handleGoogleSignIn}
      >
        <Image 
          source={require('./assets/google-icon.png')} 
          style={styles.googleIcon} 
        />
        <Text style={styles.googleButtonText}>
          Se connecter avec Google
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default LoginScreen;
```

## 🔐 Modifications du schéma de base de données

Le modèle User a été mis à jour avec les champs suivants:

```prisma
model User {
  // ... champs existants
  password         String?  // Maintenant optionnel pour OAuth
  googleId         String?  @unique @map("google_id")
  provider         String?  @default("local")
  profilePicture   String?  @map("profile_picture")
}
```

### Migration de la base de données

Pour appliquer ces changements à votre base de données:

```bash
# Pousser les changements au schéma
npm run prisma:push

# OU générer une migration
npx prisma migrate dev --name add_oauth_fields
```

## 🧪 Tests

### Tester avec cURL

```bash
# Remplacez <ID_TOKEN> par un vrai token Google
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"idToken":"<ID_TOKEN>"}'
```

### Obtenir un token de test

Pour obtenir un token ID Google pour les tests:

1. Utilisez le [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Sélectionnez "Google OAuth2 API v2" > "userinfo.email" et "userinfo.profile"
3. Cliquez sur "Authorize APIs"
4. Échangez le code d'autorisation contre un token
5. Utilisez l'`id_token` dans vos requêtes

## 📊 Flux d'authentification

```
┌─────────────┐                  ┌──────────────┐                 ┌─────────────┐
│   Mobile    │                  │    Google    │                 │   Backend   │
│     App     │                  │    OAuth     │                 │     API     │
└──────┬──────┘                  └──────┬───────┘                 └──────┬──────┘
       │                                │                                │
       │  1. Initier connexion Google  │                                │
       │──────────────────────────────>│                                │
       │                                │                                │
       │  2. Afficher écran de consent │                                │
       │<──────────────────────────────│                                │
       │                                │                                │
       │  3. Utilisateur consent        │                                │
       │──────────────────────────────>│                                │
       │                                │                                │
       │  4. Retourner ID Token         │                                │
       │<──────────────────────────────│                                │
       │                                                                 │
       │  5. POST /api/auth/google avec idToken                         │
       │─────────────────────────────────────────────────────────────>│
       │                                                                 │
       │                                  6. Vérifier token avec Google │
       │                                  <────────────────────────────>│
       │                                                                 │
       │                                  7. Créer/Maj utilisateur DB   │
       │                                  ─────────────────────────────>│
       │                                                                 │
       │  8. Retourner JWT + user data                                  │
       │<─────────────────────────────────────────────────────────────│
       │                                                                 │
       │  9. Stocker JWT localement                                     │
       │─────────────────────────────>                                  │
       │                                                                 │
```

## 🛡️ Sécurité

### Bonnes pratiques

1. **Validez toujours le token côté serveur** - Ne faites jamais confiance au client
2. **Vérifiez l'audience** - Le `aud` du token doit correspondre à votre Client ID
3. **Vérifiez l'émetteur** - Le `iss` doit être `accounts.google.com` ou `https://accounts.google.com`
4. **Vérifiez la signature** - Utilisez `google-auth-library` pour la validation
5. **Limitez les tentatives** - Le rate limiting est appliqué sur les endpoints d'auth
6. **HTTPS en production** - Utilisez toujours HTTPS pour l'API en production

### Variables d'environnement sensibles

Ne commitez **JAMAIS** ces valeurs dans Git:
- `GOOGLE_CLIENT_ID`
- `JWT_SECRET`

## ❓ Dépannage

### Erreur: "Token Google invalide"
- Vérifiez que le `GOOGLE_CLIENT_ID` dans `.env` correspond à celui de Google Cloud Console
- Assurez-vous que le token n'est pas expiré
- Vérifiez que l'`audience` du token correspond à votre Client ID

### Erreur: "Email non vérifié par Google"
- L'utilisateur doit avoir vérifié son email avec Google
- Demandez à l'utilisateur de vérifier son compte Google

### Erreur: "PLAY_SERVICES_NOT_AVAILABLE"
- Google Play Services n'est pas disponible sur l'appareil
- Testez sur un appareil avec Google Play Services ou un émulateur avec Google APIs

### Erreur de migration Prisma
- Exécutez `npm run prisma:generate` après avoir modifié le schéma
- Si vous avez des erreurs, essayez `npm run prisma:push` pour forcer la synchronisation

## 📚 Ressources

- [Documentation Google Sign-In pour React Native](https://github.com/react-native-google-signin/google-signin)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Auth Library Node.js](https://github.com/googleapis/google-auth-library-nodejs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
