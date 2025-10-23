-- Create favorites table manually (simplified version)
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` VARCHAR(191) NOT NULL,
  `user_id` VARCHAR(191) NOT NULL,
  `establishment_id` VARCHAR(191) NULL,
  `site_id` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `favorites_userId_establishmentId_key`(`user_id`, `establishment_id`),
  UNIQUE INDEX `favorites_userId_siteId_key`(`user_id`, `site_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;