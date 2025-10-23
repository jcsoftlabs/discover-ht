# Diagramme ERD - Base de données Touris

## Vue d'ensemble de la base de données

Ce diagramme ERD représente la structure complète de la base de données de l'application Touris, générée à partir du schéma Prisma.

```mermaid
erDiagram
    %% Entités principales
    User {
        string id PK "CUID"
        string firstName
        string lastName
        string email UK "Unique"
        string password
        UserRole role "DEFAULT: USER"
        datetime createdAt
        datetime updatedAt
    }

    Partner {
        string id PK "CUID"
        string name
        string email UK "Unique"
        string phone "Nullable"
        text description "Nullable"
        string website "Nullable"
        string address "Nullable"
        PartnerStatus status "DEFAULT: PENDING"
        string validatedBy FK "Nullable"
        datetime validatedAt "Nullable"
        datetime createdAt
        datetime updatedAt
    }

    Establishment {
        string id PK "CUID"
        string name
        text description "Nullable"
        EstablishmentType type
        decimal price "10,2"
        json images "Nullable"
        string address "Nullable"
        string phone "Nullable"
        string email "Nullable"
        string website "Nullable"
        decimal latitude "10,8 Nullable"
        decimal longitude "11,8 Nullable"
        json amenities "Nullable"
        json menu "Nullable"
        json availability "Nullable"
        boolean isActive "DEFAULT: true"
        string partnerId FK
        datetime createdAt
        datetime updatedAt
    }

    Site {
        string id PK "CUID"
        string name
        text description "Nullable"
        string address
        decimal latitude "10,8"
        decimal longitude "11,8"
        json images "Nullable"
        SiteCategory category
        json openingHours "Nullable"
        decimal entryFee "10,2 Nullable"
        string website "Nullable"
        string phone "Nullable"
        boolean isActive "DEFAULT: true"
        string createdBy FK "Nullable"
        datetime createdAt
        datetime updatedAt
    }

    Review {
        string id PK "CUID"
        int rating "1-5"
        text comment "Nullable"
        ReviewStatus status "DEFAULT: PENDING"
        string moderatedBy FK "Nullable"
        datetime moderatedAt "Nullable"
        text moderationNote "Nullable"
        string userId FK
        string establishmentId FK
        datetime createdAt
        datetime updatedAt
    }

    Promotion {
        string id PK "CUID"
        string title
        text description "Nullable"
        decimal discount "5,2 Percentage"
        datetime validFrom
        datetime validUntil
        boolean isActive "DEFAULT: true"
        string establishmentId FK
        datetime createdAt
        datetime updatedAt
    }

    %% Relations
    User ||--o{ Partner : "validates (validator)"
    User ||--o{ Review : "writes"
    User ||--o{ Review : "moderates (moderator)"
    User ||--o{ Site : "creates (creator)"

    Partner ||--o{ Establishment : "owns"
    Partner }o--|| User : "validated by"

    Establishment }o--|| Partner : "belongs to"
    Establishment ||--o{ Review : "receives"
    Establishment ||--o{ Promotion : "offers"

    Review }o--|| User : "written by"
    Review }o--|| Establishment : "reviews"
    Review }o--o| User : "moderated by"

    Promotion }o--|| Establishment : "belongs to"

    Site }o--o| User : "created by"
```

## Énumérations (Enums)

### UserRole
- `USER` : Utilisateur standard
- `ADMIN` : Administrateur système
- `PARTNER` : Partenaire commercial

### EstablishmentType
- `HOTEL` : Hôtel
- `RESTAURANT` : Restaurant
- `BAR` : Bar
- `CAFE` : Café
- `ATTRACTION` : Attraction touristique
- `SHOP` : Boutique
- `SERVICE` : Service

### PartnerStatus
- `PENDING` : En attente de validation
- `APPROVED` : Approuvé
- `REJECTED` : Rejeté
- `SUSPENDED` : Suspendu

### ReviewStatus
- `PENDING` : En attente de modération
- `APPROVED` : Approuvé
- `REJECTED` : Rejeté

### SiteCategory
- `MONUMENT` : Monument
- `MUSEUM` : Musée
- `PARK` : Parc
- `BEACH` : Plage
- `MOUNTAIN` : Montagne
- `CULTURAL` : Site culturel
- `RELIGIOUS` : Site religieux
- `NATURAL` : Site naturel
- `HISTORICAL` : Site historique
- `ENTERTAINMENT` : Divertissement

## Description des relations

1. **User ↔ Partner** : Un utilisateur admin peut valider plusieurs partenaires
2. **User ↔ Review** : Un utilisateur peut écrire plusieurs avis et un admin peut modérer plusieurs avis
3. **User ↔ Site** : Un utilisateur admin peut créer plusieurs sites touristiques
4. **Partner ↔ Establishment** : Un partenaire peut gérer plusieurs établissements
5. **Establishment ↔ Review** : Un établissement peut recevoir plusieurs avis
6. **Establishment ↔ Promotion** : Un établissement peut proposer plusieurs promotions

## Contraintes importantes

- **Cascade Delete** : La suppression d'un partenaire supprime tous ses établissements
- **Cascade Delete** : La suppression d'un établissement supprime tous ses avis et promotions
- **Cascade Delete** : La suppression d'un utilisateur supprime tous ses avis
- **Unicité** : Email unique pour User et Partner
- **Validation** : Les notes (rating) sont limitées entre 1 et 5
- **Géolocalisation** : Latitude/longitude avec précision décimale appropriée

## Types de données spéciaux

- **JSON** : Utilisé pour stocker des tableaux (images, amenities, menu, etc.)
- **DECIMAL** : Utilisé pour les prix et coordonnées géographiques
- **TEXT** : Utilisé pour les descriptions et commentaires longs
- **CUID** : Identifiants uniques cryptographiquement sécurisés