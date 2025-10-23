/**
 * Modèle pour les annonces (Listing)
 * 
 * Structure de la table MySQL pour les annonces.
 * Créez cette table dans votre base de données 'listing_db' via phpMyAdmin ou MySQL CLI.
 * 
 * SQL pour créer la table:
 * 
 * CREATE DATABASE IF NOT EXISTS listing_db;
 * USE listing_db;
 * 
 * CREATE TABLE listings (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     title VARCHAR(255) NOT NULL,
 *     description TEXT NOT NULL,
 *     price DECIMAL(10, 2) NOT NULL,
 *     category VARCHAR(100),
 *     location VARCHAR(255),
 *     contact_email VARCHAR(255),
 *     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 * );
 */

const { pool } = require('../config/database');

class Listing {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description;
        this.price = data.price;
        this.category = data.category;
        this.location = data.location;
        this.contact_email = data.contact_email;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Méthode statique pour initialiser la base de données
    static async initializeDatabase() {
        try {
            // Créer la base de données si elle n'existe pas
            await pool.execute('CREATE DATABASE IF NOT EXISTS listing_db');
            await pool.execute('USE listing_db');

            // Créer la table listings si elle n'existe pas
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS listings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    category VARCHAR(100),
                    location VARCHAR(255),
                    contact_email VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `;

            await pool.execute(createTableSQL);
            console.log('✅ Table "listings" créée ou vérifiée avec succès');

            // Ajouter quelques données d'exemple (optionnel)
            const [rows] = await pool.execute('SELECT COUNT(*) as count FROM listings');
            if (rows[0].count === 0) {
                await this.insertSampleData();
            }

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
            throw error;
        }
    }

    // Ajouter des données d'exemple
    static async insertSampleData() {
        try {
            const sampleListings = [
                {
                    title: 'Ordinateur portable Dell',
                    description: 'Excellent état, idéal pour le travail et les études',
                    price: 450.00,
                    category: 'Informatique',
                    location: 'Paris',
                    contact_email: 'contact@example.com'
                },
                {
                    title: 'Vélo de ville',
                    description: 'Vélo en très bon état, parfait pour les trajets urbains',
                    price: 180.00,
                    category: 'Transport',
                    location: 'Lyon',
                    contact_email: 'velo@example.com'
                }
            ];

            for (const listing of sampleListings) {
                await pool.execute(
                    `INSERT INTO listings (title, description, price, category, location, contact_email, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                    [listing.title, listing.description, listing.price, listing.category, listing.location, listing.contact_email]
                );
            }

            console.log('✅ Données d\'exemple ajoutées avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout des données d\'exemple:', error);
        }
    }
}

module.exports = Listing;