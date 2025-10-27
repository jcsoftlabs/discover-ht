-- Script pour synchroniser la table users sur Railway avec la structure locale
-- Exécutez ce script sur Railway via la console MySQL

-- Étape 1: Modifier le champ password pour le rendre optionnel (nullable)
ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL;

-- Étape 2: Ajouter le champ google_id (unique)
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE;

-- Étape 3: Ajouter le champ provider avec valeur par défaut 'local'
ALTER TABLE users 
ADD COLUMN provider VARCHAR(50) NULL DEFAULT 'local';

-- Étape 4: Ajouter le champ profile_picture
ALTER TABLE users 
ADD COLUMN profile_picture VARCHAR(500) NULL;

-- Étape 5: Ajouter le champ country (selon les règles WARP)
ALTER TABLE users 
ADD COLUMN country VARCHAR(255) NULL;

-- Étape 6: Ajouter le champ refresh_token (pour JWT refresh)
ALTER TABLE users 
ADD COLUMN refresh_token TEXT NULL;

-- Étape 7: Ajouter le champ reset_token (pour réinitialisation mot de passe)
ALTER TABLE users 
ADD COLUMN reset_token VARCHAR(255) NULL;

-- Étape 8: Ajouter le champ reset_token_expires
ALTER TABLE users 
ADD COLUMN reset_token_expires DATETIME(3) NULL;

-- Vérifier la structure finale
DESCRIBE users;
