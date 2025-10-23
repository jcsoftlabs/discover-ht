require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migratePartners() {
  console.log('🔄 Migration des Partners manquants...\n');

  try {
    // 1. Trouver tous les utilisateurs avec le rôle PARTNER
    const partnerUsers = await prisma.user.findMany({
      where: { role: 'PARTNER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true
      }
    });

    console.log(`📊 Trouvé ${partnerUsers.length} utilisateur(s) avec le rôle PARTNER\n`);

    if (partnerUsers.length === 0) {
      console.log('✅ Aucune migration nécessaire');
      return;
    }

    let created = 0;
    let existing = 0;

    // 2. Pour chaque utilisateur PARTNER, vérifier et créer l'entrée Partner si nécessaire
    for (const user of partnerUsers) {
      // Vérifier si un Partner existe déjà avec cet email
      const existingPartner = await prisma.partner.findUnique({
        where: { email: user.email }
      });

      if (existingPartner) {
        console.log(`⏭️  Partner existe déjà pour: ${user.email}`);
        existing++;
        continue;
      }

      // Créer le Partner
      const newPartner = await prisma.partner.create({
        data: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: null,
          description: `Compte partenaire de ${user.firstName} ${user.lastName}`,
          website: null,
          address: null,
          status: 'PENDING' // Les nouveaux partners doivent être approuvés
        }
      });

      console.log(`✅ Partner créé pour: ${user.email} (ID: ${newPartner.id})`);
      created++;
    }

    console.log('\n📈 RÉSUMÉ DE LA MIGRATION:');
    console.log(`   ✅ Partners créés: ${created}`);
    console.log(`   ⏭️  Partners existants: ${existing}`);
    console.log(`   📊 Total traité: ${partnerUsers.length}`);
    console.log('\n✅ Migration terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migratePartners();
