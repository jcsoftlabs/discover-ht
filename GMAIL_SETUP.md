# Configuration Gmail pour l'envoi d'emails

## ⚠️ Problème actuel

Le serveur SMTP `discoverhaiti.ht` ne répond pas correctement. Les emails ne peuvent pas être envoyés.

**Solution recommandée** : Utiliser Gmail ou un autre service SMTP fiable.

---

## 🚀 Configuration rapide avec Gmail

### Étape 1 : Préparer votre compte Gmail

1. Connectez-vous à votre compte Gmail
2. Allez dans **Paramètres Google Account** → **Sécurité**
3. Activez **l'authentification à 2 facteurs** (obligatoire)

### Étape 2 : Créer un mot de passe d'application

1. Dans **Sécurité**, cliquez sur **Mots de passe d'application**
2. Sélectionnez **Autre (nom personnalisé)**
3. Entrez "Tourism Platform Backend"
4. Cliquez sur **Générer**
5. **Copiez le mot de passe** (16 caractères sans espaces)

### Étape 3 : Mettre à jour le fichier .env

Remplacez dans votre fichier `.env` :

```bash
# Configuration Email - Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Le mot de passe d'application (16 caractères)
SMTP_FROM="Discover Haiti" <votre-email@gmail.com>
```

### Étape 4 : Tester la configuration

```bash
node test-email.js
```

Vous devriez voir :
```
✅ Connexion SMTP réussie!
✅ Email envoyé avec succès!
```

---

## 📧 Alternatives à Gmail

### Option 1 : SendGrid (Gratuit jusqu'à 100 emails/jour)

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre_api_key_sendgrid
SMTP_FROM="Discover Haiti" <noreply@votre-domaine.com>
```

1. Créer un compte sur https://sendgrid.com
2. Générer une API Key
3. Utiliser "apikey" comme username et l'API key comme password

### Option 2 : Mailgun (Gratuit pour 5000 emails/mois)

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@votre-domaine.mailgun.org
SMTP_PASS=votre_password_mailgun
SMTP_FROM="Discover Haiti" <noreply@votre-domaine.com>
```

1. Créer un compte sur https://mailgun.com
2. Vérifier votre domaine
3. Obtenir les credentials SMTP

### Option 3 : Amazon SES (Économique, pay-as-you-go)

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_smtp_username
SMTP_PASS=votre_smtp_password
SMTP_FROM="Discover Haiti" <noreply@votre-domaine.com>
```

---

## 🔧 Réparer le serveur discoverhaiti.ht (optionnel)

Si vous voulez continuer à utiliser `discoverhaiti.ht`, contactez votre hébergeur pour :

1. Vérifier que le service SMTP est activé
2. Vérifier les credentials (username/password)
3. Obtenir le bon port SMTP
4. Vérifier la configuration TLS/SSL
5. S'assurer que le compte email existe

### Diagnostic

Les tests montrent que :
- ✅ Le serveur existe (ping réussit)
- ✅ Les ports 25, 587, 465 sont ouverts
- ❌ Le serveur SMTP ne répond pas correctement ("Greeting never received")

Cela indique probablement :
- Une mauvaise configuration du serveur SMTP
- Des credentials incorrects
- Un firewall qui bloque la connexion complète
- Le service SMTP n'est pas démarré

---

## 🧪 Script de test mis à jour

Le fichier `test-email.js` vous permet de tester rapidement n'importe quelle configuration SMTP.

**Modifier l'adresse de destination** :
```javascript
// Ligne 38 dans test-email.js
to: 'votre-email@gmail.com', // Remplacer par votre vrai email
```

Puis exécuter :
```bash
node test-email.js
```

---

## ⚡ Configuration recommandée (Gmail)

Pour un démarrage rapide, utilisez Gmail :

```bash
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM="Discover Haiti" <votre-email@gmail.com>
```

**Avantages** :
- ✅ Configuration rapide (5 minutes)
- ✅ Fiable et stable
- ✅ Gratuit (jusqu'à 500 emails/jour)
- ✅ Bon taux de délivrabilité

**Inconvénients** :
- ⚠️ Limite de 500 emails/jour
- ⚠️ Pas idéal pour la production à grande échelle
- ⚠️ Utilise votre email personnel

---

## 📝 Checklist

- [ ] Activer l'authentification à 2 facteurs sur Gmail
- [ ] Générer un mot de passe d'application
- [ ] Mettre à jour le fichier `.env`
- [ ] Tester avec `node test-email.js`
- [ ] Créer un compte test pour vérifier la réception
- [ ] Redémarrer le serveur backend

---

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifier que l'authentification 2FA est activée
2. Vérifier que le mot de passe d'application est correct (pas d'espaces)
3. Vérifier que l'email Gmail est correct
4. Vérifier les logs du serveur

**Erreur commune** : "Invalid login"
**Solution** : Regénérer le mot de passe d'application

**Erreur commune** : "Connection timeout"
**Solution** : Vérifier la connexion internet et les pare-feu
