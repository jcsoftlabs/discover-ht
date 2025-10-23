-- Migration: Ajouter les champs refresh_token pour l'authentification JWT

-- Ajouter refresh_token à la table users
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `refresh_token` TEXT NULL AFTER `role`;

-- Ajouter password et refresh_token à la table partners
ALTER TABLE `partners` 
ADD COLUMN IF NOT EXISTS `password` VARCHAR(255) NULL AFTER `email`,
ADD COLUMN IF NOT EXISTS `refresh_token` TEXT NULL AFTER `password`;

-- Afficher un message de confirmation
SELECT 'Migration completed: refresh_token fields added to users and partners tables' AS Status;
