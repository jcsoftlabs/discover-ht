# Service d'Email - Backend

## 📧 Vue d'ensemble

Le service d'email est complètement implémenté et fonctionnel. Il gère l'envoi automatique d'emails de bienvenue lors de l'inscription des utilisateurs et partenaires.

## 📂 Fichiers impliqués

- **`src/services/emailService.js`** - Service principal d'envoi d'emails
- **`src/controllers/authController.js`** - Intégration lors de l'inscription
- **`.env.example`** - Variables d'environnement pour la configuration

## ✅ Fonctionnalités

### Email de bienvenue
- ✅ Envoi automatique lors de l'inscription
- ✅ Template HTML responsive et professionnel
- ✅ Personnalisation avec le prénom de l'utilisateur
- ✅ Version texte alternative (fallback)
- ✅ Envoi asynchrone (non-bloquant)

### Email de réinitialisation de mot de passe
- ✅ Template HTML avec lien sécurisé
- ✅ Expiration du token (30 minutes)
- ✅ Instructions claires pour l'utilisateur

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` basé sur `.env.example` :

```bash
# En développement (optionnel - utilise Ethereal Email par défaut)
NODE_ENV=development

# En production (requis)
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
SMTP_FROM="Tourism Platform" <noreply@touris-app.com>

# URL du frontend pour les liens
FRONTEND_URL=http://localhost:3001
```

### Configuration Gmail

Pour utiliser Gmail en production :

1. Activer l'authentification à 2 facteurs
2. Créer un mot de passe d'application :
   - Google Account → Sécurité → Authentification à 2 facteurs
   - Mots de passe d'application
   - Générer un nouveau mot de passe
3. Utiliser ce mot de passe dans `SMTP_PASS`

## 🚀 Utilisation

### Initialisation du service

Le service est initialisé automatiquement au démarrage du serveur :

```javascript
// server.js
const { initEmailService } = require('./src/services/emailService');
initEmailService();
```

### Envoi d'email de bienvenue

```javascript
const { sendWelcomeEmail } = require('./src/services/emailService');

// Envoi automatique lors de l'inscription
await sendWelcomeEmail(userEmail, firstName);
```

### Envoi d'email de réinitialisation

```javascript
const { sendPasswordResetEmail } = require('./src/services/emailService');

// Lors d'une demande de réinitialisation
await sendPasswordResetEmail(userEmail, firstName, resetToken);
```

## 🧪 Testing

### Mode développement

En mode développement (sans configuration SMTP), le service utilise **Ethereal Email** :

1. Lancer le serveur : `npm start`
2. Créer un compte via l'API
3. Vérifier les logs :
   ```
   📧 Email de bienvenue envoyé à: user@example.com
   🔗 URL de prévisualisation: https://ethereal.email/message/...
   ```
4. Cliquer sur l'URL pour visualiser l'email

### Test avec curl

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "password": "Password123!",
    "country": "Haiti"
  }'
```

### Vérification des logs

**Succès :**
```
📧 Service email initialisé avec succès
📧 Email de bienvenue envoyé à: jean@example.com
🔗 URL de prévisualisation: https://ethereal.email/message/xyz
```

**Erreur (non-bloquante) :**
```
⚠️ Erreur envoi email de bienvenue: Connection refused
```

## 📝 Templates

### Structure du template de bienvenue

Le template `getWelcomeEmailTemplate` inclut :

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <!-- Styles inline pour compatibilité email -->
  </head>
  <body>
    <!-- Header gradient avec titre -->
    <div class="header">
      <h1>🎉 Bienvenue sur Tourism Platform !</h1>
    </div>
    
    <!-- Contenu personnalisé -->
    <div class="content">
      <div class="greeting">Bonjour {{firstName}},</div>
      <div class="message">...</div>
      
      <!-- Liste des fonctionnalités -->
      <div class="features">
        ✓ Découvrir des hôtels, restaurants et attractions
        ✓ Consulter les avis et évaluations
        ✓ Ajouter vos établissements favoris
        ✓ Partager vos expériences
        ✓ Profiter de promotions exclusives
      </div>
      
      <!-- Call-to-action -->
      <a href="{{FRONTEND_URL}}" class="button">
        Commencer à explorer
      </a>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p>Support: support@touris-app.com</p>
    </div>
  </body>
</html>
```

### Personnalisation

Pour modifier un template, éditer `src/services/emailService.js` :

```javascript
// Ligne 252-416 pour le template de bienvenue
const getWelcomeEmailTemplate = (firstName, userEmail) => {
  return `
    <!DOCTYPE html>
    <!-- Votre template personnalisé -->
  `;
};
```

## 🔍 API du service

### `initEmailService()`
Initialise le transporteur nodemailer.

**Retour :** `transporter` ou `null`

### `sendEmail(options)`
Fonction générique d'envoi d'email.

**Paramètres :**
```javascript
{
  to: 'user@example.com',
  subject: 'Sujet de l\'email',
  html: '<html>...</html>',
  text: 'Version texte'
}
```

**Retour :**
```javascript
{
  success: true/false,
  messageId: '...',
  previewUrl: '...' // En développement seulement
}
```

### `sendWelcomeEmail(userEmail, firstName)`
Envoie un email de bienvenue.

**Paramètres :**
- `userEmail` (string) - Email du destinataire
- `firstName` (string) - Prénom pour personnalisation

**Retour :** Promise<EmailResult>

### `sendPasswordResetEmail(userEmail, firstName, resetToken)`
Envoie un email de réinitialisation de mot de passe.

**Paramètres :**
- `userEmail` (string) - Email du destinataire
- `firstName` (string) - Prénom pour personnalisation
- `resetToken` (string) - Token de réinitialisation

**Retour :** Promise<EmailResult>

### `verifyEmailConfig()`
Vérifie la configuration SMTP.

**Retour :**
```javascript
{
  success: true/false,
  message/error: '...'
}
```

## 🐛 Gestion des erreurs

Le service gère les erreurs de manière non-bloquante :

1. **Inscription réussie** même si l'email échoue
2. **Logs d'erreur** pour le débogage
3. **Retry automatique** non implémenté (amélioration future)

```javascript
// authController.js - Ligne 124-138
sendWelcomeEmail(email, firstName)
  .then((emailResult) => {
    if (emailResult.success) {
      console.log('📧 Email envoyé');
    } else {
      console.error('⚠️ Erreur:', emailResult.error);
    }
  })
  .catch((error) => {
    // Erreur logguée, mais ne bloque pas l'inscription
    console.error('⚠️ Erreur email:', error);
  });
```

## 📊 Monitoring

### Logs à surveiller

- ✅ `📧 Service email initialisé avec succès`
- ✅ `📧 Email de bienvenue envoyé à: ...`
- ⚠️ `⚠️ Erreur envoi email de bienvenue: ...`

### Métriques importantes

- Taux d'envoi (succès vs échecs)
- Temps de réponse SMTP
- Taux de rebond (bounce rate)
- Taux d'ouverture (nécessite tracking)

## 🚀 Améliorations futures

- [ ] File d'attente d'emails (Bull/Bee-Queue)
- [ ] Retry automatique en cas d'échec
- [ ] Templates multilingues
- [ ] Tracking des ouvertures/clics
- [ ] Email de confirmation d'email (vérification)
- [ ] Emails transactionnels variés
- [ ] Dashboard admin pour les statistiques
- [ ] Rate limiting sur les envois
- [ ] Unsubscribe management

## 📚 Dépendances

```json
{
  "nodemailer": "^6.x.x"
}
```

## 🔗 Ressources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Ethereal Email](https://ethereal.email/) - Service de test
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Email HTML Best Practices](https://www.caniemail.com/)

## 💡 Conseils

### Pour le développement
- Utiliser Ethereal Email (pas de config requise)
- Vérifier les URLs de prévisualisation dans les logs
- Tester différents clients email (Gmail, Outlook, etc.)

### Pour la production
- Utiliser un service SMTP fiable (Gmail, SendGrid, etc.)
- Configurer SPF, DKIM et DMARC
- Surveiller les taux de délivrabilité
- Avoir un domaine dédié pour les emails
- Mettre en place des alertes pour les échecs

### Sécurité
- Ne jamais commit les credentials SMTP
- Utiliser des variables d'environnement
- Limiter les envois par utilisateur
- Valider les adresses email
- Protéger contre le spam
