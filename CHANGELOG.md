# Changelog

## [Unreleased] - 2025-10-26

### Added
- **Champs géographiques** : Ajout des colonnes `ville` et `departement` aux tables `establishments` et `sites` pour une meilleure localisation
- **Déploiement Railway** : Script automatisé de déploiement (`deploy-railway.sh`)
- **Documentation Railway** : Guide complet de déploiement sur Railway (`RAILWAY_DEPLOY.md`)
- **Template environnement production** : Fichier `.env.production.example` pour faciliter la configuration
- **Documentation country field** : Guide d'implémentation du champ pays (`COUNTRY_FIELD_IMPLEMENTATION.md`)

### Changed
- **Prisma Schema** : Ajout des champs `ville` et `departement` aux models `Establishment` et `Site`
- **SQL Schema** : Mise à jour de `manual_schema.sql` avec les nouveaux champs géographiques
- **Validation** : Assouplissement de la validation des IDs partenaires (accepte 3-50 caractères au lieu de 25 exactement)
- **Script déploiement** : Sécurisation du script Railway pour utiliser des variables d'environnement au lieu de credentials hardcodés

### Fixed
- **Base de données MySQL** : Résolution du problème `mysql.proc` sur MariaDB 10.4.28
- **Compatibilité Railway** : Ajustement des colonnes pour compatibilité avec la base de données Railway

### Security
- **Gitignore** : Ajout de `.env.production` au `.gitignore` pour éviter de publier les secrets
- **Deploy script** : Suppression des credentials hardcodés du script de déploiement

### Database Schema
- `establishments` table:
  - Ajout colonne `ville VARCHAR(255)` (nullable)
  - Ajout colonne `departement VARCHAR(255)` (nullable)
  
- `sites` table:
  - Ajout colonne `ville VARCHAR(255)` (nullable)
  - Ajout colonne `departement VARCHAR(255)` (nullable)

### Documentation
- Guide complet de déploiement Railway
- Documentation du champ country pour l'inscription
- Changelog pour suivre les modifications du projet

## Notes de migration

### Pour les développeurs
```bash
# Mettre à jour la base de données locale
ALTER TABLE establishments ADD COLUMN ville VARCHAR(255) AFTER address;
ALTER TABLE establishments ADD COLUMN departement VARCHAR(255) AFTER ville;
ALTER TABLE sites ADD COLUMN ville VARCHAR(255) AFTER address;
ALTER TABLE sites ADD COLUMN departement VARCHAR(255) AFTER ville;
```

### Pour Railway/Production
```bash
# Utiliser le script de déploiement
source .env.production
./deploy-railway.sh test  # Vérifier la connexion
```
