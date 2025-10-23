-- Script pour mettre à jour le schéma de base de données manuellement
-- À exécuter dans MySQL/MariaDB

USE listing_app;

-- Ajouter les nouveaux champs à la table partners
ALTER TABLE partners 
ADD COLUMN description TEXT,
ADD COLUMN website VARCHAR(191),
ADD COLUMN address VARCHAR(191),
ADD COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING',
ADD COLUMN validated_by VARCHAR(191),
ADD COLUMN validated_at DATETIME(3);

-- Ajouter la contrainte de clé étrangère pour validated_by
ALTER TABLE partners 
ADD CONSTRAINT partners_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Ajouter les nouveaux champs à la table establishments
ALTER TABLE establishments 
ADD COLUMN phone VARCHAR(191),
ADD COLUMN email VARCHAR(191),
ADD COLUMN website VARCHAR(191),
ADD COLUMN amenities JSON,
ADD COLUMN menu JSON,
ADD COLUMN availability JSON,
ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Ajouter les nouveaux champs à la table sites
ALTER TABLE sites 
ADD COLUMN category ENUM('MONUMENT', 'MUSEUM', 'PARK', 'BEACH', 'MOUNTAIN', 'CULTURAL', 'RELIGIOUS', 'NATURAL', 'HISTORICAL', 'ENTERTAINMENT') NOT NULL DEFAULT 'CULTURAL',
ADD COLUMN opening_hours JSON,
ADD COLUMN entry_fee DECIMAL(10,2),
ADD COLUMN website VARCHAR(191),
ADD COLUMN phone VARCHAR(191),
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN created_by VARCHAR(191);

-- Ajouter la contrainte de clé étrangère pour created_by
ALTER TABLE sites 
ADD CONSTRAINT sites_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Ajouter les nouveaux champs à la table reviews
ALTER TABLE reviews 
ADD COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
ADD COLUMN moderated_by VARCHAR(191),
ADD COLUMN moderated_at DATETIME(3),
ADD COLUMN moderation_note TEXT;

-- Ajouter la contrainte de clé étrangère pour moderated_by
ALTER TABLE reviews 
ADD CONSTRAINT reviews_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- Mettre à jour les reviews existantes pour qu'elles soient approuvées par défaut
UPDATE reviews SET status = 'APPROVED' WHERE status IS NULL;

-- Mettre à jour les sites existants avec une catégorie par défaut
UPDATE sites SET category = 'CULTURAL' WHERE category IS NULL;

-- Vérifier les changements
SELECT 'Partners table updated' as status;
DESCRIBE partners;

SELECT 'Establishments table updated' as status;
DESCRIBE establishments;

SELECT 'Sites table updated' as status;
DESCRIBE sites;

SELECT 'Reviews table updated' as status;
DESCRIBE reviews;