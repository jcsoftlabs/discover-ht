# Guide de Sécurité - Touris API

## 🔒 Mesures de Sécurité Implémentées

### 1. Communication HTTPS ✅

**Implémentation :**
- Certificats SSL auto-signés pour le développement
- Configuration HTTPS dans server.js avec ports dédiés
- Redirection automatique HTTP vers HTTPS

**Commandes :**
```bash
# Générer des certificats SSL
npm run generate-certs

# Démarrer avec HTTPS
npm run dev  # Démarrera HTTP (3000) + HTTPS (3443)
```

**Fichiers :**
- `server.key` et `server.crt` (certificats SSL)
- Configuration dans `server.js` lignes 185-197

### 2. Hachage Sécurisé des Mots de Passe ✅

**Implémentation :**
- Utilisation de bcrypt avec 12 rounds de salage
- Hachage automatique lors de la création/modification d'utilisateurs
- Comparaison sécurisée lors de l'authentification

**Fichiers concernés :**
- `src/controllers/authController.js` (lignes 25-26, 128-129)
- `src/controllers/usersController.js` (lignes 127-129)

**Exemple :**
```javascript
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### 3. Authentification JWT ✅

**Implémentation :**
- Tokens JWT sécurisés avec expiration
- Middleware d'authentification pour les routes protégées
- Gestion des rôles (USER, ADMIN, PARTNER)
- Cookies HttpOnly pour stocker les tokens

**Fichiers :**
- `src/middleware/auth.js` - Middleware d'authentification
- `src/controllers/authController.js` - Gestion des tokens
- `src/routes/auth.js` - Routes d'authentification

**Configuration JWT :**
```env
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_securisee
JWT_EXPIRES_IN=24h
```

### 4. Conformité RGPD ✅

**Endpoints RGPD disponibles :**

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/gdpr/data-export` | GET | Exporter toutes les données utilisateur |
| `/api/gdpr/delete-account` | DELETE | Suppression complète du compte |
| `/api/gdpr/update-consent` | PUT | Gestion des consentements |
| `/api/gdpr/data-usage` | GET | Information sur l'utilisation des données |
| `/api/gdpr/data-rectification` | POST | Demande de rectification |

**Fonctionnalités RGPD :**
- Export complet des données personnelles
- Suppression en cascade des données
- Gestion des consentements
- Audit trail des suppressions
- Politique de rétention des données

### 5. Validation des Entrées ✅

**Protection contre :**
- Injections SQL (prévenues par Prisma ORM)
- Attaques XSS (échappement HTML avec `escape()`)
- Validation stricte des types de données
- Sanitisation des entrées utilisateur

**Validations implémentées :**
- **Utilisateurs :** Noms (regex), emails (format), mots de passe (force)
- **Établissements :** Noms, descriptions, coordonnées GPS
- **Avis :** Notes (1-5), commentaires (longueur)
- **Promotions :** Dates, pourcentages de remise

**Exemple de validation :**
```javascript
body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
    .escape()
```

## 🛡️ Mesures de Sécurité Additionnelles

### Headers de Sécurité (Helmet.js)
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: same-origin

### Rate Limiting
- **Global :** 100 requêtes/15min par IP
- **Authentification :** 5 tentatives/15min par IP
- Protection contre le brute force

### CORS Sécurisé
- Origines autorisées spécifiquement
- Credentials activés pour les cookies
- Headers autorisés contrôlés

## 🔐 Routes Protégées par Authentification

### Routes Publiques (Aucune auth requise)
- `GET /` - Page d'accueil
- `GET /api/establishments` - Liste des établissements
- `GET /api/establishments/:id` - Détail établissement
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Routes Protégées (Token JWT requis)
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/change-password` - Changement mot de passe
- `GET /api/users/*` - Gestion des utilisateurs (ADMIN)
- `POST /api/establishments` - Création établissement (PARTNER/ADMIN)
- Tous les endpoints `/api/gdpr/*` - Conformité RGPD

### Gestion des Rôles
- **USER :** Consultation, création d'avis
- **PARTNER :** Gestion des établissements
- **ADMIN :** Administration complète

## 🧪 Tests de Sécurité

### Commandes de Test
```bash
# Test complet de sécurité
npm run test-security

# Audit des vulnérabilités
npm audit

# Audit complet avec test
npm run security-audit
```

### Vérifications Automatiques
- Hachage bcrypt fonctionnel
- Génération/vérification JWT
- Variables d'environnement présentes
- Fichiers de sécurité créés
- Certificats SSL disponibles
- Patterns de validation testés

## 📋 Check-list de Sécurité

### ✅ Implémenté
- [x] HTTPS avec certificats SSL
- [x] Hachage bcrypt des mots de passe (12 rounds)
- [x] Authentification JWT avec expiration
- [x] Middleware de protection des routes
- [x] Validation stricte des entrées
- [x] Protection XSS avec échappement
- [x] Rate limiting global et auth
- [x] Headers de sécurité (Helmet)
- [x] CORS configuré
- [x] Gestion des rôles et permissions
- [x] Endpoints RGPD complets
- [x] Cookies sécurisés HttpOnly
- [x] Tests de sécurité automatisés

### 🎯 Recommandations Production

1. **Certificats SSL :**
   - Remplacer les certificats auto-signés par des certificats valides (Let's Encrypt)

2. **Clés Secrètes :**
   - Générer une clé JWT cryptographiquement sécurisée
   - Utiliser un gestionnaire de secrets (AWS Secrets Manager, Azure Key Vault)

3. **Monitoring :**
   - Logs d'audit complets
   - Surveillance des tentatives d'intrusion
   - Alertes en temps réel

4. **Infrastructure :**
   - Reverse proxy (nginx/Apache)
   - Firewall configuré
   - Isolation des environnements

5. **Maintenance :**
   - Mise à jour régulière des dépendances
   - Scans de sécurité automatisés
   - Tests de pénétration périodiques

## 🚨 En Cas d'Incident

### Procédure d'Urgence
1. Isoler le système compromis
2. Analyser les logs d'accès
3. Révoquer tous les tokens JWT actifs
4. Notifier les utilisateurs si nécessaire
5. Appliquer les correctifs de sécurité
6. Audit post-incident complet

### Contacts
- **Responsable Sécurité :** security@touris-api.com
- **RGPD/DPO :** privacy@touris-api.com
- **Support Technique :** support@touris-api.com

---

**Dernière mise à jour :** Version sécurisée implémentée - Toutes les mesures sont opérationnelles ✅