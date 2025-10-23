-- Mise à jour de la base de données listing_app
-- Exécuter dans phpMyAdmin

USE listing_app;

-- Mise à jour de la table partners (ajouter les nouveaux champs)
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS description TEXT AFTER phone,
ADD COLUMN IF NOT EXISTS website VARCHAR(255) AFTER description,
ADD COLUMN IF NOT EXISTS address VARCHAR(255) AFTER website,
ADD COLUMN IF NOT EXISTS status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING' AFTER address,
ADD COLUMN IF NOT EXISTS validated_by VARCHAR(191) AFTER status,
ADD COLUMN IF NOT EXISTS validated_at DATETIME(3) AFTER validated_by;

-- Mise à jour de la table establishments (ajouter les nouveaux champs)
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS phone VARCHAR(255) AFTER address,
ADD COLUMN IF NOT EXISTS email VARCHAR(255) AFTER phone,
ADD COLUMN IF NOT EXISTS website VARCHAR(255) AFTER email,
ADD COLUMN IF NOT EXISTS amenities JSON AFTER longitude,
ADD COLUMN IF NOT EXISTS menu JSON AFTER amenities,
ADD COLUMN IF NOT EXISTS availability JSON AFTER menu,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true AFTER availability;

-- Mise à jour de la table sites (ajouter les nouveaux champs)
ALTER TABLE sites 
ADD COLUMN IF NOT EXISTS category ENUM('MONUMENT', 'MUSEUM', 'PARK', 'BEACH', 'MOUNTAIN', 'CULTURAL', 'RELIGIOUS', 'NATURAL', 'HISTORICAL', 'ENTERTAINMENT') NOT NULL DEFAULT 'MONUMENT' AFTER images,
ADD COLUMN IF NOT EXISTS opening_hours JSON AFTER category,
ADD COLUMN IF NOT EXISTS entry_fee DECIMAL(10, 2) AFTER opening_hours,
ADD COLUMN IF NOT EXISTS website VARCHAR(255) AFTER entry_fee,
ADD COLUMN IF NOT EXISTS phone VARCHAR(255) AFTER website,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true AFTER phone,
ADD COLUMN IF NOT EXISTS created_by VARCHAR(191) AFTER is_active;

-- Mise à jour de la table reviews (ajouter les nouveaux champs)
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING' AFTER comment,
ADD COLUMN IF NOT EXISTS moderated_by VARCHAR(191) AFTER status,
ADD COLUMN IF NOT EXISTS moderated_at DATETIME(3) AFTER moderated_by,
ADD COLUMN IF NOT EXISTS moderation_note TEXT AFTER moderated_at;

-- Ajouter les clés étrangères manquantes si elles n'existent pas
ALTER TABLE partners 
ADD CONSTRAINT fk_partners_validated_by 
FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE sites 
ADD CONSTRAINT fk_sites_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE reviews 
ADD CONSTRAINT fk_reviews_moderated_by 
FOREIGN KEY (moderated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Vérifier les structures des tables
DESCRIBE users;
DESCRIBE partners;
DESCRIBE establishments;
DESCRIBE sites;
DESCRIBE reviews;
DESCRIBE promotions;