-- Create favorites table manually
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `establishment_id` VARCHAR(191) NULL,
  `site_id` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `favorites_userId_establishmentId_key`(`user_id`, `establishment_id`),
  UNIQUE INDEX `favorites_userId_siteId_key`(`user_id`, `site_id`),
  INDEX `favorites_user_id_idx` (`user_id`),
  INDEX `favorites_establishment_id_idx` (`establishment_id`),
  INDEX `favorites_site_id_idx` (`site_id`),
  
  CONSTRAINT `favorites_user_id_fkey` 
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
    
  CONSTRAINT `favorites_establishment_id_fkey` 
    FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
    
  CONSTRAINT `favorites_site_id_fkey` 
    FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;