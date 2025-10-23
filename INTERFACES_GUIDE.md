# Guide des Interfaces Partenaire et Administrateur

Ce guide documente les nouvelles interfaces développées pour les partenaires et les administrateurs du système de tourisme.

## Vue d'ensemble

Deux nouvelles interfaces ont été créées :

1. **Interface Partenaire** (`/api/partner/*`) - Pour les hôtels et restaurants
2. **Interface Administrateur** (`/api/admin/*`) - Pour le ministère du Tourisme

## Architecture Technique

### Modèles de données étendus

Le schéma Prisma a été étendu avec :

#### Table `partners` (nouvelles colonnes)
- `description` : Description du partenaire
- `website` : Site web du partenaire
- `address` : Adresse physique
- `status` : PENDING, APPROVED, REJECTED, SUSPENDED
- `validated_by` : ID de l'admin qui a validé
- `validated_at` : Date de validation

#### Table `establishments` (nouvelles colonnes)
- `phone` : Numéro de téléphone
- `email` : Email de contact
- `website` : Site web
- `amenities` : Équipements (JSON)
- `menu` : Menu/services (JSON)
- `availability` : Calendrier des disponibilités (JSON)
- `is_active` : Statut actif/inactif

#### Table `sites` (nouvelles colonnes)
- `category` : Catégorie du site touristique
- `opening_hours` : Horaires d'ouverture (JSON)
- `entry_fee` : Prix d'entrée
- `website` : Site web
- `phone` : Téléphone
- `is_active` : Statut actif/inactif
- `created_by` : ID de l'admin créateur

#### Table `reviews` (nouvelles colonnes)
- `status` : PENDING, APPROVED, REJECTED
- `moderated_by` : ID du modérateur
- `moderated_at` : Date de modération
- `moderation_note` : Note de modération

### Nouveaux contrôleurs

1. **PartnerDashboardController** : Gestion des établissements par les partenaires
2. **AdminDashboardController** : Administration du système

### Validations étendues

Nouvelles validations pour :
- Mise à jour des établissements
- Gestion des menus et disponibilités
- Création/modification des promotions
- Modération des avis
- Gestion des sites touristiques

## Interface Partenaire (`/api/partner`)

### Authentification
Toutes les routes nécessitent :
- Token JWT valide
- Rôle `PARTNER`
- Association avec un partenaire validé

### Endpoints disponibles

#### Dashboard
```http
GET /api/partner/dashboard
```
Retourne une vue d'ensemble avec statistiques :
- Nombre d'établissements
- Avis reçus et note moyenne
- Promotions actives
- Avis récents

#### Gestion des établissements
```http
GET /api/partner/establishments
GET /api/partner/establishments/:id
PUT /api/partner/establishments/:id
```

#### Gestion des menus
```http
PUT /api/partner/establishments/:id/menu
```
Body :
```json
{
  "menu": {
    "categories": [
      {
        "name": "Entrées",
        "items": [
          {"name": "Salade", "price": 12.50, "description": "..."}
        ]
      }
    ]
  }
}
```

#### Gestion des disponibilités
```http
PUT /api/partner/establishments/:id/availability
```
Body :
```json
{
  "availability": {
    "2024-01-15": {"available": true, "slots": ["09:00", "10:00"]},
    "2024-01-16": {"available": false, "reason": "Maintenance"}
  }
}
```

#### Gestion des images
```http
PUT /api/partner/establishments/:id/images
```
Body :
```json
{
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

#### Gestion des promotions
```http
GET /api/partner/establishments/:id/promotions
POST /api/partner/establishments/:id/promotions
PUT /api/partner/establishments/:id/promotions/:promotionId
DELETE /api/partner/establishments/:id/promotions/:promotionId
```

#### Consultation des avis
```http
GET /api/partner/reviews
GET /api/partner/establishments/:id/reviews
```

## Interface Administrateur (`/api/admin`)

### Authentification
Toutes les routes nécessitent :
- Token JWT valide
- Rôle `ADMIN`

### Endpoints disponibles

#### Dashboard administratif
```http
GET /api/admin/dashboard
```
Statistiques globales du système :
- Nombre total d'utilisateurs, partenaires, établissements, sites
- Partenaires en attente de validation
- Avis en attente de modération
- Activité récente

#### Statistiques avancées
```http
GET /api/admin/statistics?period=30
```
Analyses détaillées sur une période donnée.

#### Gestion des utilisateurs
```http
GET /api/admin/users?page=1&limit=20&role=USER&search=john
GET /api/admin/users/:userId
PUT /api/admin/users/:userId/role
```

#### Validation des partenaires
```http
GET /api/admin/partners?status=PENDING
GET /api/admin/partners/:partnerId
PUT /api/admin/partners/:partnerId/status
```
Body pour validation :
```json
{
  "status": "APPROVED",
  "reason": "Dossier complet et conforme"
}
```

#### Modération des avis
```http
GET /api/admin/reviews/moderate?status=PENDING
PUT /api/admin/reviews/:reviewId/moderate
```
Body pour modération :
```json
{
  "status": "APPROVED",
  "moderationNote": "Avis vérifié et conforme"
}
```

#### Gestion des sites touristiques
```http
GET /api/admin/sites?category=MONUMENT&isActive=true
POST /api/admin/sites
PUT /api/admin/sites/:siteId
DELETE /api/admin/sites/:siteId
```

## Déploiement et Configuration

### 1. Mise à jour de la base de données
```bash
# Générer le client Prisma
npm run prisma:generate

# Appliquer les changements (si Prisma fonctionne)
npm run prisma:push

# OU appliquer manuellement avec le script SQL fourni
mysql -u root -p listing_app < schema_update.sql
```

### 2. Démarrer le serveur
```bash
npm run dev
```

### 3. Tester les endpoints
```bash
# Test de l'interface partenaire (nécessite un token PARTNER)
curl -H "Authorization: Bearer YOUR_PARTNER_TOKEN" \
     http://localhost:3000/api/partner/dashboard

# Test de l'interface admin (nécessite un token ADMIN)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3000/api/admin/dashboard
```

## Prochaines étapes

### Développement Frontend
Les backends sont prêts pour :

1. **Interface Partenaire** :
   - Dashboard avec statistiques
   - Formulaires de mise à jour des établissements
   - Gestionnaire de menu interactif
   - Calendrier de disponibilités
   - Galerie d'images
   - Gestionnaire de promotions

2. **Interface Admin** :
   - Dashboard administratif avec graphiques
   - Tables de gestion des utilisateurs
   - Workflow de validation des partenaires
   - Queue de modération des avis
   - Formulaires de création/édition des sites

### Fonctionnalités à développer
- Notifications en temps réel
- Export de rapports
- Système de notifications par email
- Upload d'images sécurisé
- Intégration de cartes interactives
- Système de chat partenaire-admin

## Sécurité

- Toutes les routes sont protégées par authentification JWT
- Validation stricte des données d'entrée
- Contrôle d'accès basé sur les rôles
- Vérification de propriété des ressources
- Échappement des données pour prévenir les injections

## Exemples d'utilisation

Voir le fichier `API_TESTING_GUIDE.md` pour des exemples détaillés de requêtes et réponses.