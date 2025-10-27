const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importUsers() {
  try {
    // Lire les données locales
    const usersData = JSON.parse(fs.readFileSync('./users_local_data.json', 'utf8'));
    
    console.log(`📊 ${usersData.length} utilisateurs à importer...`);
    
    // Vider la table users sur Railway d'abord (optionnel - supprimer si vous voulez garder les données existantes)
    await prisma.user.deleteMany({});
    console.log('🗑️  Table users vidée');
    
    // Importer chaque utilisateur
    let imported = 0;
    for (const user of usersData) {
      try {
        await prisma.user.create({
          data: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            country: user.country,
            role: user.role,
            refreshToken: user.refreshToken,
            resetToken: user.resetToken,
            resetTokenExpires: user.resetTokenExpires ? new Date(user.resetTokenExpires) : null,
            googleId: user.googleId,
            provider: user.provider,
            profilePicture: user.profilePicture,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt)
          }
        });
        imported++;
        console.log(`✅ Importé: ${user.email}`);
      } catch (error) {
        console.error(`❌ Erreur pour ${user.email}:`, error.message);
      }
    }
    
    console.log(`\n✨ Import terminé: ${imported}/${usersData.length} utilisateurs importés`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importUsers();
