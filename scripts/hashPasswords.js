const bcrypt = require('bcrypt');
const { prisma } = require('../src/config/database');

/**
 * Script pour hasher les mots de passe existants en clair dans la base de données
 * Utiliser ce script une seule fois pour migrer les mots de passe existants
 */
async function hashExistingPasswords() {
  try {
    console.log('🔒 Début du hashing des mots de passe...\n');

    // Hasher les mots de passe des utilisateurs
    console.log('📝 Traitement des utilisateurs...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true
      }
    });

    let usersUpdated = 0;
    let usersSkipped = 0;

    for (const user of users) {
      if (!user.password) {
        console.log(`⚠️  User ${user.email}: Pas de mot de passe (OAuth)`);
        usersSkipped++;
        continue;
      }

      // Vérifier si le mot de passe est déjà hashé (bcrypt hash commence par $2a$ ou $2b$)
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log(`✅ User ${user.email}: Mot de passe déjà hashé`);
        usersSkipped++;
        continue;
      }

      // Hasher le mot de passe
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);

      // Mettre à jour dans la base de données
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      console.log(`🔐 User ${user.email}: Mot de passe hashé avec succès`);
      usersUpdated++;
    }

    console.log(`\n✅ Utilisateurs: ${usersUpdated} hashés, ${usersSkipped} ignorés (déjà hashés ou OAuth)`);

    // Hasher les mots de passe des partenaires
    console.log('\n📝 Traitement des partenaires...');
    const partners = await prisma.partner.findMany({
      select: {
        id: true,
        email: true,
        password: true
      }
    });

    let partnersUpdated = 0;
    let partnersSkipped = 0;

    for (const partner of partners) {
      if (!partner.password) {
        console.log(`⚠️  Partner ${partner.email}: Pas de mot de passe défini`);
        partnersSkipped++;
        continue;
      }

      // Vérifier si le mot de passe est déjà hashé
      if (partner.password.startsWith('$2a$') || partner.password.startsWith('$2b$')) {
        console.log(`✅ Partner ${partner.email}: Mot de passe déjà hashé`);
        partnersSkipped++;
        continue;
      }

      // Hasher le mot de passe
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(partner.password, saltRounds);

      // Mettre à jour dans la base de données
      await prisma.partner.update({
        where: { id: partner.id },
        data: { password: hashedPassword }
      });

      console.log(`🔐 Partner ${partner.email}: Mot de passe hashé avec succès`);
      partnersUpdated++;
    }

    console.log(`\n✅ Partenaires: ${partnersUpdated} hashés, ${partnersSkipped} ignorés (déjà hashés ou vides)`);

    console.log('\n✅ Migration des mots de passe terminée avec succès!');
    console.log('\n⚠️  IMPORTANT: Ce script ne doit être exécuté qu\'une seule fois.');
    console.log('Les mots de passe sont maintenant hashés de manière sécurisée avec bcrypt.\n');

  } catch (error) {
    console.error('❌ Erreur lors du hashing des mots de passe:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  hashExistingPasswords()
    .then(() => {
      console.log('Script terminé.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { hashExistingPasswords };
