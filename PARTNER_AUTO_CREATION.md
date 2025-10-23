# Gestion Automatique des Entrées Partner

## 📋 Vue d'ensemble

Cette fonctionnalité assure qu'un utilisateur avec le rôle `PARTNER` dispose automatiquement d'une entrée correspondante dans la table `Partner` de la base de données.

## 🎯 Problème résolu

Auparavant, il était possible de créer un utilisateur avec `role=PARTNER` sans avoir d'entrée `Partner` associée, ce qui causait des problèmes lors de l'accès au dashboard partenaire ou lors de la création d'établissements.

## ✅ Solution mise en place

### 1. **Création automatique lors de l'inscription/création**

Les controllers suivants ont été mis à jour pour créer automatiquement une entrée `Partner` lorsqu'un utilisateur avec `role=PARTNER` est créé :

- **`src/controllers/authController.js`** - Méthode `register()`
- **`src/controllers/usersController.js`** - Méthode `createUser()`

#### Comportement :
- Lorsqu'un utilisateur avec `role=PARTNER` est créé, une entrée `Partner` est automatiquement créée avec :
  - `name`: Prénom + Nom de l'utilisateur
  - `email`: Email de l'utilisateur
  - `description`: "Compte partenaire de [Prénom Nom]"
  - `status`: `PENDING` (nécessite une approbation admin)

- Si l'entrée `Partner` existe déjà (email unique), l'erreur est ignorée silencieusement

### 2. **Script de migration pour les données existantes**

Un script de migration a été créé pour traiter les utilisateurs `PARTNER` existants qui n'ont pas encore d'entrée `Partner` associée.

#### Fichier : `migrate-partners.js`

#### Utilisation :

```bash
# Via npm script (recommandé)
npm run migrate:partners

# Ou directement
node migrate-partners.js
```

#### Fonctionnalités du script :
- ✅ Identifie tous les utilisateurs avec `role=PARTNER`
- ✅ Vérifie si une entrée `Partner` existe déjà (par email)
- ✅ Crée les entrées `Partner` manquantes
- ✅ Affiche un rapport détaillé de la migration
- ✅ Gère les erreurs de manière sécurisée

## 🔧 Utilisation

### Pour migrer les données existantes :

```bash
npm run migrate:partners
```

### Pour créer un nouveau partenaire :

```bash
# Via l'API d'inscription
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@hotel.com",
    "password": "SecurePassword123!",
    "role": "PARTNER"
  }'
```

L'entrée `Partner` sera automatiquement créée en arrière-plan.

## 📊 Structure des données

### Table User (rôle PARTNER)
```javascript
{
  id: "cuid",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@hotel.com",
  role: "PARTNER",
  // ...
}
```

### Table Partner (créée automatiquement)
```javascript
{
  id: "cuid",
  name: "John Doe",
  email: "john.doe@hotel.com",
  description: "Compte partenaire de John Doe",
  status: "PENDING",  // Nécessite approbation admin
  // ...
}
```

## ⚠️ Important

1. **Statut PENDING** : Les nouveaux partners sont créés avec le statut `PENDING` par défaut. Un administrateur doit approuver le compte via le dashboard admin pour que le partenaire puisse créer des établissements.

2. **Email unique** : La table `Partner` a une contrainte d'unicité sur l'email. Si vous essayez de créer deux utilisateurs `PARTNER` avec le même email, le second échouera lors de la création de l'utilisateur (pas du Partner).

3. **Migration idempotente** : Le script de migration peut être exécuté plusieurs fois sans problème. Il ignore les entrées `Partner` qui existent déjà.

## 🧪 Tests

### Tester la création automatique :
```bash
# 1. Créer un nouvel utilisateur PARTNER
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Partner",
    "email": "test@partner.com",
    "password": "Test123!",
    "role": "PARTNER"
  }'

# 2. Vérifier que le Partner a été créé
curl http://localhost:3000/api/partners?email=test@partner.com
```

### Tester la migration :
```bash
# Exécuter la migration
npm run migrate:partners

# Vérifier les logs pour voir le résumé
# ✅ Partners créés: X
# ⏭️  Partners existants: Y
# 📊 Total traité: Z
```

## 🔍 Logs

Les logs suivants sont générés automatiquement :

**Création automatique réussie :**
```
✅ Entrée Partner créée automatiquement pour: john.doe@hotel.com
```

**Partner existe déjà :**
```
(Aucun log - erreur ignorée silencieusement)
```

**Erreur lors de la création :**
```
⚠️ Erreur lors de la création du Partner: [détails de l'erreur]
```

## 📝 Notes de développement

- La création du `Partner` se fait dans un bloc `try/catch` séparé pour ne pas bloquer la création de l'utilisateur en cas d'erreur
- Le code d'erreur Prisma `P2002` (violation de contrainte unique) est géré spécifiquement
- Les valeurs par défaut pour `phone`, `website`, et `address` sont `null`

## 🚀 Prochaines étapes suggérées

1. Ajouter une validation du numéro de téléphone lors de l'inscription PARTNER
2. Permettre aux partenaires de compléter leur profil après inscription
3. Envoyer un email de bienvenue spécifique aux partenaires avec instructions pour compléter leur profil
4. Créer un workflow d'approbation admin avec notifications
