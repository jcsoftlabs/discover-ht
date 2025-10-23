require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

async function testNewSchema() {
  console.log('🧪 Test des nouveaux champs du schéma...\n');

  try {
    // Test 1: Vérifier les nouveaux champs Partners
    console.log('📋 Test des champs Partners...');
    const partner = await prisma.partner.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        description: true,
        website: true,
        address: true,
        status: true,
        validatedBy: true,
        validatedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (partner) {
      console.log('✅ Partner fields:', Object.keys(partner));
      console.log(`   Status: ${partner.status || 'NULL'}`);
      console.log(`   Description: ${partner.description ? 'SET' : 'NULL'}`);
      console.log(`   Website: ${partner.website || 'NULL'}`);
    }

    // Test 2: Vérifier les nouveaux champs Establishments
    console.log('\n🏨 Test des champs Establishments...');
    const establishment = await prisma.establishment.findFirst({
      select: {
        id: true,
        name: true,
        type: true,
        phone: true,
        email: true,
        website: true,
        amenities: true,
        menu: true,
        availability: true,
        isActive: true
      }
    });
    
    if (establishment) {
      console.log('✅ Establishment fields:', Object.keys(establishment));
      console.log(`   Phone: ${establishment.phone || 'NULL'}`);
      console.log(`   Email: ${establishment.email || 'NULL'}`);
      console.log(`   IsActive: ${establishment.isActive}`);
      console.log(`   Menu: ${establishment.menu ? 'SET' : 'NULL'}`);
      console.log(`   Amenities: ${establishment.amenities ? 'SET' : 'NULL'}`);
    }

    // Test 3: Vérifier les nouveaux champs Sites
    console.log('\n🏛️ Test des champs Sites...');
    const site = await prisma.site.findFirst({
      select: {
        id: true,
        name: true,
        category: true,
        website: true,
        phone: true,
        isActive: true,
        createdBy: true
      }
    });
    
    if (site) {
      console.log('✅ Site fields:', Object.keys(site));
      console.log(`   Category: ${site.category || 'NULL'}`);
      console.log(`   IsActive: ${site.isActive}`);
      console.log(`   Phone: ${site.phone || 'NULL'}`);
      console.log(`   Website: ${site.website || 'NULL'}`);
    }

    // Test 4: Vérifier les nouveaux champs Reviews
    console.log('\n📝 Test des champs Reviews...');
    const review = await prisma.review.findFirst({
      select: {
        id: true,
        rating: true,
        comment: true,
        status: true,
        moderatedBy: true,
        moderatedAt: true,
        moderationNote: true
      }
    });
    
    if (review) {
      console.log('✅ Review fields:', Object.keys(review));
      console.log(`   Status: ${review.status || 'NULL'}`);
      console.log(`   ModeratedBy: ${review.moderatedBy || 'NULL'}`);
      console.log(`   ModerationNote: ${review.moderationNote || 'NULL'}`);
    }

    // Test 5: Test des relations
    console.log('\n🔗 Test des nouvelles relations...');
    
    // Test relation Partner -> User (validator)
    const partnerWithValidator = await prisma.partner.findFirst({
      include: {
        validator: {
          select: { firstName: true, lastName: true, role: true }
        }
      }
    });
    console.log('✅ Partner->Validator relation:', partnerWithValidator?.validator ? 'WORKS' : 'NO VALIDATOR SET');

    // Test relation Review -> User (moderator)
    const reviewWithModerator = await prisma.review.findFirst({
      include: {
        moderator: {
          select: { firstName: true, lastName: true, role: true }
        }
      }
    });
    console.log('✅ Review->Moderator relation:', reviewWithModerator?.moderator ? 'WORKS' : 'NO MODERATOR SET');

    // Test 6: Test d'écriture avec les nouveaux champs
    console.log('\n✏️ Test d\'écriture des nouveaux champs...');
    
    // Mettre à jour un partenaire avec les nouveaux champs
    const updatedPartner = await prisma.partner.update({
      where: { id: partner.id },
      data: {
        description: "Test description mise à jour",
        website: "https://example-updated.com",
        address: "123 Test Street, Test City"
      }
    });
    console.log('✅ Partner update successful:', updatedPartner.description ? 'YES' : 'NO');

    // Mettre à jour un établissement avec les nouveaux champs
    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishment.id },
      data: {
        phone: "+33123456789",
        email: "test@example.com",
        amenities: ["WiFi", "Parking", "Restaurant"],
        menu: {
          "categories": [
            {
              "name": "Plats principaux",
              "items": [
                {"name": "Test Dish", "price": 15.50}
              ]
            }
          ]
        }
      }
    });
    console.log('✅ Establishment update successful:', updatedEstablishment.phone ? 'YES' : 'NO');

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('✅ Les modifications de schéma ont été correctement appliquées.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    
    if (error.code === 'P2025') {
      console.log('💡 Suggestion: Vérifiez que les données existent dans la base');
    } else if (error.message.includes('Unknown column')) {
      console.log('💡 Suggestion: Les colonnes n\'ont pas été ajoutées correctement');
    } else {
      console.log('💡 Erreur inattendue:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testNewSchema();