-- Script SQL pour ajouter les champs OAuth au modèle User
-- Exécutez ce script manuellement si Prisma ne peut pas pousser les changements

USE listing_app;

-- Modifier le champ password pour le rendre optionnel (nullable)
ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL;

-- Ajouter le champ googleId (unique)
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER reset_token_expires;

-- Ajouter le champ provider avec valeur par défaut 'local'
ALTER TABLE users 
ADD COLUMN provider VARCHAR(50) NULL DEFAULT 'local' AFTER google_id;

-- Ajouter le champ profilePicture
ALTER TABLE users 
ADD COLUMN profile_picture VARCHAR(500) NULL AFTER provider;

-- Vérifier les colonnes ajoutées
DESCRIBE users;
