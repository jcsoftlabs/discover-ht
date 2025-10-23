const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Instance globale du client Prisma
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Test de connexion Prisma
const testConnection = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Connexion à la base de données MySQL (Prisma) établie avec succès');
        console.log(`📊 Base de données: ${process.env.DB_NAME || 'listing_app'}`);
    } catch (error) {
        console.error('❌ Erreur de connexion à la base de données:', error.message);
        console.error('Vérifiez que XAMPP MySQL est démarré et que la base de données listing_app existe');
        console.error('💡 Exécutez le script SQL manuel: prisma/manual_schema.sql dans phpMyAdmin');
    }
};

// Fonction pour fermer proprement la connexion
const closeConnection = async () => {
    await prisma.$disconnect();
};

// Gestionnaire de fermeture propre de l'application
process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeConnection();
    process.exit(0);
});

module.exports = {
    prisma,
    testConnection,
    closeConnection
};
