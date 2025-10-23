require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log('🧪 Création des utilisateurs de test...\n');

  try {
    // Mot de passe commun pour tous les utilisateurs de test
    const password = 'Test123!@#';
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Créer un utilisateur ADMIN
    let adminUser;
    try {
      adminUser = await prisma.user.upsert({
        where: { email: 'admin@tourism.gov' },
        update: {},
        create: {
          firstName: 'Ministère',
          lastName: 'Tourisme',
          email: 'admin@tourism.gov',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Utilisateur ADMIN créé/trouvé:', adminUser.email);
    } catch (error) {
      console.log('⚠️ Admin déjà existe, récupération...');
      adminUser = await prisma.user.findUnique({
        where: { email: 'admin@tourism.gov' }
      });
    }

    // 2. Créer un utilisateur PARTNER
    let partnerUser;
    try {
      partnerUser = await prisma.user.upsert({
        where: { email: 'partner@hotel-paradise.com' },
        update: {},
        create: {
          firstName: 'Manager',
          lastName: 'Hotel Paradise',
          email: 'partner@hotel-paradise.com',
          password: hashedPassword,
          role: 'PARTNER'
        }
      });
      console.log('✅ Utilisateur PARTNER créé/trouvé:', partnerUser.email);
    } catch (error) {
      console.log('⚠️ Partner déjà existe, récupération...');
      partnerUser = await prisma.user.findUnique({
        where: { email: 'partner@hotel-paradise.com' }
      });
    }

    // 3. Créer/Vérifier un partenaire associé
    let partner;
    try {
      partner = await prisma.partner.upsert({
        where: { email: 'partner@hotel-paradise.com' },
        update: {},
        create: {
          name: 'Hotel Paradise Group',
          email: 'partner@hotel-paradise.com',
          phone: '+33123456789',
          description: 'Groupe hôtelier de luxe',
          website: 'https://hotel-paradise.com',
          address: '123 Avenue des Champs, Paris',
          status: 'APPROVED'
        }
      });
      console.log('✅ Partenaire créé/trouvé:', partner.name);
    } catch (error) {
      console.log('⚠️ Partenaire déjà existe');
      partner = await prisma.partner.findUnique({
        where: { email: 'partner@hotel-paradise.com' }
      });
    }

    // 4. Générer les tokens JWT
    const adminToken = jwt.sign(
      { userId: adminUser.id, email: adminUser.email, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const partnerToken = jwt.sign(
      { userId: partnerUser.id, email: partnerUser.email, role: partnerUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('\n📝 INFORMATIONS DE TEST:\n');
    console.log('🔐 Mot de passe pour tous les comptes:', password);
    console.log('\n👨‍💼 COMPTE ADMIN:');
    console.log('   Email:', adminUser.email);
    console.log('   Rôle:', adminUser.role);
    console.log('   Token:', adminToken);

    console.log('\n🏨 COMPTE PARTNER:');
    console.log('   Email:', partnerUser.email);
    console.log('   Rôle:', partnerUser.role);
    console.log('   Token:', partnerToken);

    console.log('\n🧪 COMMANDES DE TEST:\n');
    
    console.log('📊 Test Dashboard Admin:');
    console.log(`curl -H "Authorization: Bearer ${adminToken}" http://localhost:3000/api/admin/dashboard`);
    
    console.log('\n🏨 Test Dashboard Partner:');
    console.log(`curl -H "Authorization: Bearer ${partnerToken}" http://localhost:3000/api/partner/dashboard`);
    
    console.log('\n📝 Test Login Admin:');
    console.log(`curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@tourism.gov","password":"${password}"}'`);
    
    console.log('\n🏨 Test Login Partner:');
    console.log(`curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"partner@hotel-paradise.com","password":"${password}"}'`);

    console.log('\n✅ Utilisateurs de test créés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();