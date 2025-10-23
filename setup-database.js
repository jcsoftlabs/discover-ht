const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    console.log('🔧 Configuration de la base de données listing_app...\n');

    // Configuration pour se connecter à MySQL (sans spécifier de base de données)
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    });

    try {
        console.log('✅ Connexion à MySQL établie');

        // Créer la base de données
        await connection.execute('CREATE DATABASE IF NOT EXISTS listing_app');
        console.log('✅ Base de données listing_app créée ou vérifiée');

        // Utiliser la base de données
        await connection.execute('USE listing_app');
        console.log('✅ Utilisation de la base de données listing_app');

        // Créer les tables
        console.log('\n📋 Création des tables...');

        // Table users
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(191) NOT NULL PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('USER', 'ADMIN', 'PARTNER') NOT NULL DEFAULT 'USER',
                created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            )
        `);
        console.log('✅ Table users créée');

        // Table partners
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS partners (
                id VARCHAR(191) NOT NULL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(255),
                created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
            )
        `);
        console.log('✅ Table partners créée');

        // Table establishments
        await connection.execute(`
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
            )
        `);
        console.log('✅ Table establishments créée');

        // Table sites
        await connection.execute(`
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
            )
        `);
        console.log('✅ Table sites créée');

        // Table reviews
        await connection.execute(`
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
            )
        `);
        console.log('✅ Table reviews créée');

        // Table promotions
        await connection.execute(`
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
            )
        `);
        console.log('✅ Table promotions créée');

        // Vérifier si des données d'exemple existent
        const [userRows] = await connection.execute('SELECT COUNT(*) as count FROM users');
        
        if (userRows[0].count === 0) {
            console.log('\n📝 Insertion des données d\'exemple...');

            // Données d'exemple
            await connection.execute(`
                INSERT INTO users (id, first_name, last_name, email, password, role) VALUES
                ('admin1', 'Admin', 'User', 'admin@listing.com', '$2b$10$hashedpassword', 'ADMIN'),
                ('user1', 'John', 'Doe', 'john.doe@email.com', '$2b$10$hashedpassword', 'USER')
            `);
            console.log('✅ Utilisateurs d\'exemple ajoutés');

            await connection.execute(`
                INSERT INTO partners (id, name, email, phone) VALUES
                ('partner1', 'Hotel Paradise Group', 'contact@hotelparadise.com', '+33123456789'),
                ('partner2', 'Restaurant Chain SA', 'info@restaurantchain.com', '+33987654321')
            `);
            console.log('✅ Partenaires d\'exemple ajoutés');

            await connection.execute(`
                INSERT INTO establishments (id, name, description, type, price, address, latitude, longitude, partner_id) VALUES
                ('estab1', 'Hotel Paradise', 'Luxurious hotel in the heart of Paris', 'HOTEL', 150.00, '123 Rue de Rivoli, Paris', 48.8566, 2.3522, 'partner1'),
                ('estab2', 'Le Bistrot Moderne', 'Contemporary French cuisine', 'RESTAURANT', 45.00, '456 Avenue des Champs-Élysées, Paris', 48.8698, 2.3076, 'partner2')
            `);
            console.log('✅ Établissements d\'exemple ajoutés');

            await connection.execute(`
                INSERT INTO sites (id, name, description, address, latitude, longitude) VALUES
                ('site1', 'Tour Eiffel', 'Iconic iron lattice tower on the Champ de Mars', 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris', 48.8584, 2.2945),
                ('site2', 'Louvre Museum', 'World\\'s largest art museum', 'Rue de Rivoli, 75001 Paris', 48.8606, 2.3376)
            `);
            console.log('✅ Sites d\'exemple ajoutés');
        } else {
            console.log('\n📝 Données d\'exemple déjà présentes, ignorer l\'insertion');
        }

        console.log('\n🎉 Configuration de la base de données terminée avec succès!');
        console.log('\n📊 Vous pouvez maintenant:');
        console.log('- Exécuter: npm run test-db');
        console.log('- Démarrer l\'API: npm run dev');
        console.log('- Ouvrir Prisma Studio: npm run prisma:studio');

    } catch (error) {
        console.error('❌ Erreur lors de la configuration:', error.message);
    } finally {
        await connection.end();
    }
}

setupDatabase();