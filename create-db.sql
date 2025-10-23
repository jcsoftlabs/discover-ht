-- Script de création de la base de données listing_app
-- Exécutez ce script dans phpMyAdmin ou MySQL CLI

CREATE DATABASE IF NOT EXISTS listing_app;
USE listing_app;

-- Table users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN', 'PARTNER') NOT NULL DEFAULT 'USER',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Table partners
CREATE TABLE IF NOT EXISTS partners (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255),
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Table establishments
CREATE TABLE IF NOT EXISTS establishments (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('HOTEL', 'RESTAURANT', 'BAR', 'CAFE', 'ATTRACTION', 'SHOP', 'SERVICE') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    images JSON,
    address VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    partner_id VARCHAR(191) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- Table sites
CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    images JSON,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Table reviews
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    rating INT NOT NULL,
    comment TEXT,
    user_id VARCHAR(191) NOT NULL,
    establishment_id VARCHAR(191) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Table promotions
CREATE TABLE IF NOT EXISTS promotions (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount DECIMAL(5, 2) NOT NULL,
    valid_from DATETIME(3) NOT NULL,
    valid_until DATETIME(3) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    establishment_id VARCHAR(191) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE
);

-- Insertion des données d'exemple
INSERT IGNORE INTO users (id, first_name, last_name, email, password, role) VALUES
('admin1', 'Admin', 'User', 'admin@listing.com', '$2b$10$hashedpassword', 'ADMIN'),
('user1', 'John', 'Doe', 'john.doe@email.com', '$2b$10$hashedpassword', 'USER');

INSERT IGNORE INTO partners (id, name, email, phone) VALUES
('partner1', 'Hotel Paradise Group', 'contact@hotelparadise.com', '+33123456789'),
('partner2', 'Restaurant Chain SA', 'info@restaurantchain.com', '+33987654321');

INSERT IGNORE INTO establishments (id, name, description, type, price, address, latitude, longitude, partner_id) VALUES
('estab1', 'Hotel Paradise', 'Luxurious hotel in the heart of Paris', 'HOTEL', 150.00, '123 Rue de Rivoli, Paris', 48.8566, 2.3522, 'partner1'),
('estab2', 'Le Bistrot Moderne', 'Contemporary French cuisine', 'RESTAURANT', 45.00, '456 Avenue des Champs-Élysées, Paris', 48.8698, 2.3076, 'partner2');

INSERT IGNORE INTO sites (id, name, description, address, latitude, longitude) VALUES
('site1', 'Tour Eiffel', 'Iconic iron lattice tower on the Champ de Mars', 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris', 48.8584, 2.2945),
('site2', 'Louvre Museum', 'World\'s largest art museum', 'Rue de Rivoli, 75001 Paris', 48.8606, 2.3376);