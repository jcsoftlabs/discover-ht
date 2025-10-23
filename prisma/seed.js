const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data in correct order (respecting foreign keys)
    console.log('🗑️  Cleaning existing data...');
    await prisma.review.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.establishment.deleteMany();
    await prisma.site.deleteMany();
    await prisma.partner.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared\n');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Users
    console.log('👥 Creating users...');
    const users = await prisma.user.createMany({
      data: [
        {
          firstName: 'Admin',
          lastName: 'System',
          email: 'admin@tourism.com',
          password: hashedPassword,
          role: 'ADMIN'
        },
        {
          firstName: 'Marie',
          lastName: 'Dubois',
          email: 'marie.dubois@email.com',
          password: hashedPassword,
          role: 'USER'
        },
        {
          firstName: 'Pierre',
          lastName: 'Martin',
          email: 'pierre.martin@email.com',
          password: hashedPassword,
          role: 'USER'
        },
        {
          firstName: 'Sophie',
          lastName: 'Bernard',
          email: 'sophie.bernard@email.com',
          password: hashedPassword,
          role: 'PARTNER'
        }
      ]
    });
    console.log(`✅ Created ${users.count} users\n`);

    // Get user IDs for relations
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@tourism.com' } });
    const marieUser = await prisma.user.findUnique({ where: { email: 'marie.dubois@email.com' } });
    const pierreUser = await prisma.user.findUnique({ where: { email: 'pierre.martin@email.com' } });

    // Create Partners
    console.log('🤝 Creating partners...');
    const partners = await prisma.partner.createMany({
      data: [
        {
          name: 'Luxe Hotels Paris',
          email: 'contact@luxehotels.com',
          phone: '+33 1 42 86 87 88',
          description: 'Chaîne d\'hôtels de luxe spécialisée dans l\'hospitalité haut de gamme',
          website: 'https://www.luxehotels.com',
          address: '15 Avenue des Champs-Élysées, 75008 Paris',
          status: 'APPROVED',
          validatedBy: adminUser.id,
          validatedAt: new Date()
        },
        {
          name: 'Saveurs de France',
          email: 'info@saveursdefrance.fr',
          phone: '+33 1 45 67 89 10',
          description: 'Groupe de restauration authentique française',
          website: 'https://www.saveursdefrance.fr',
          address: '28 Rue de la Paix, 75001 Paris',
          status: 'APPROVED',
          validatedBy: adminUser.id,
          validatedAt: new Date()
        },
        {
          name: 'Cafés & Bistros Parisiens',
          email: 'contact@cafesbistros.fr',
          phone: '+33 1 34 56 78 90',
          description: 'Réseau de cafés et bistros traditionnels parisiens',
          website: 'https://www.cafesbistros.fr',
          address: '42 Boulevard Saint-Germain, 75005 Paris',
          status: 'APPROVED',
          validatedBy: adminUser.id,
          validatedAt: new Date()
        }
      ]
    });
    console.log(`✅ Created ${partners.count} partners\n`);

    // Get partner IDs for relations
    const luxeHotels = await prisma.partner.findUnique({ where: { email: 'contact@luxehotels.com' } });
    const saveursFrance = await prisma.partner.findUnique({ where: { email: 'info@saveursdefrance.fr' } });
    const cafesBistros = await prisma.partner.findUnique({ where: { email: 'contact@cafesbistros.fr' } });

    // Create Establishments with images
    console.log('🏨 Creating establishments with images...');
    const establishments = [
      {
        name: 'Hôtel Le Meurice',
        description: 'Palace parisien situé face au jardin des Tuileries, alliant art de vivre français et raffinement contemporain.',
        type: 'HOTEL',
        price: 650.00,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&crop=center'
        ],
        address: '228 Rue de Rivoli, 75001 Paris',
        phone: '+33 1 44 58 10 10',
        email: 'reservations@lemeurice.com',
        website: 'https://www.dorchestercollection.com/paris/le-meurice',
        latitude: 48.8647,
        longitude: 2.3310,
        amenities: ['WiFi gratuit', 'Spa', 'Restaurant étoilé', 'Salle de fitness', 'Concierge', 'Room service 24h/24'],
        availability: { 'lun-dim': '24h/24' },
        partnerId: luxeHotels.id
      },
      {
        name: 'Restaurant Le Grand Véfour',
        description: 'Restaurant gastronomique mythique du Palais-Royal, temple de la haute cuisine française depuis 1784.',
        type: 'RESTAURANT',
        price: 290.00,
        images: [
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop&crop=center'
        ],
        address: '17 Rue de Beaujolais, 75001 Paris',
        phone: '+33 1 42 96 56 27',
        email: 'contact@grand-vefour.com',
        website: 'https://www.grand-vefour.com',
        latitude: 48.8634,
        longitude: 2.3360,
        amenities: ['Menu dégustation', 'Cave à vins', 'Service premium', 'Cuisine gastronomique'],
        menu: {
          'Menu dégustation': '290€',
          'Menu prestige': '390€',
          'À la carte': 'Variable'
        },
        partnerId: saveursFrance.id
      },
      {
        name: 'Café de Flore',
        description: 'Café mythique de Saint-Germain-des-Prés, lieu de rendez-vous des intellectuels et artistes depuis 1887.',
        type: 'CAFE',
        price: 25.00,
        images: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop&crop=center'
        ],
        address: '172 Boulevard Saint-Germain, 75006 Paris',
        phone: '+33 1 45 48 55 26',
        email: 'info@cafedeflore.fr',
        website: 'https://www.cafedeflore.fr',
        latitude: 48.8542,
        longitude: 2.3320,
        amenities: ['Terrasse', 'WiFi', 'Journaux', 'Ambiance historique'],
        menu: {
          'Petit-déjeuner': '12-18€',
          'Déjeuner': '18-28€',
          'Boissons': '4-12€'
        },
        partnerId: cafesBistros.id
      },
      {
        name: 'Harry\'s Bar Paris',
        description: 'Bar américain légendaire, berceau de cocktails mythiques comme le Bloody Mary et le Side Car.',
        type: 'BAR',
        price: 45.00,
        images: [
          'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop&crop=center'
        ],
        address: '5 Rue Daunou, 75002 Paris',
        phone: '+33 1 42 61 71 14',
        email: 'contact@harrysbar.fr',
        website: 'https://www.harrysbar.fr',
        latitude: 48.8695,
        longitude: 2.3315,
        amenities: ['Cocktails d\'exception', 'Ambiance vintage', 'Piano bar', 'Terrasse'],
        menu: {
          'Cocktails signature': '18-25€',
          'Cocktails classiques': '12-18€',
          'Spiritueux': '8-35€'
        },
        partnerId: cafesBistros.id
      },
      {
        name: 'Musée d\'Orsay Boutique',
        description: 'Boutique officielle du musée proposant des reproductions d\'art, livres et souvenirs culturels.',
        type: 'SHOP',
        price: 35.00,
        images: [
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center'
        ],
        address: '62 Rue de Lille, 75007 Paris',
        phone: '+33 1 40 49 48 14',
        email: 'boutique@musee-orsay.fr',
        website: 'https://www.musee-orsay.fr/boutique',
        latitude: 48.8600,
        longitude: 2.3266,
        amenities: ['Reproductions d\'art', 'Livres d\'art', 'Souvenirs culturels', 'Cadeaux'],
        menu: {
          'Reproductions': '15-150€',
          'Livres': '10-80€',
          'Souvenirs': '5-50€'
        },
        partnerId: saveursFrance.id
      }
    ];

    for (const establishment of establishments) {
      await prisma.establishment.create({
        data: establishment
      });
    }
    console.log(`✅ Created ${establishments.length} establishments with images\n`);

    // Create Sites with images
    console.log('🏛️ Creating tourist sites with images...');
    const sites = [
      {
        name: 'Tour Eiffel',
        description: 'Monument emblématique de Paris et symbole de la France, cette tour de fer de 330 mètres offre une vue panoramique exceptionnelle sur la capitale.',
        address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
        latitude: 48.8584,
        longitude: 2.2945,
        images: [
          'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center'
        ],
        category: 'MONUMENT',
        category: 'MONUMENT',
        createdBy: adminUser.id
      },
      {
        name: 'Musée du Louvre',
        description: 'Plus grand musée du monde et monument historique, abritant des œuvres d\'art inestimables dont La Joconde et la Vénus de Milo.',
        address: 'Rue de Rivoli, 75001 Paris',
        latitude: 48.8606,
        longitude: 2.3376,
        images: [
          'https://images.unsplash.com/photo-1566139992507-833c9b8c3bb1?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop&crop=center'
        ],
        category: 'MUSEUM',
        openingHours: {
          'lun': 'Fermé',
          'mar': '09h00-18h00',
          'mer': '09h00-21h45',
          'jeu-dim': '09h00-18h00'
        },
        entryFee: 17.00,
        website: 'https://www.louvre.fr',
        phone: '+33 1 40 20 50 50',
        createdBy: adminUser.id
      },
      {
        name: 'Notre-Dame de Paris',
        description: 'Cathédrale gothique emblématique située sur l\'Île de la Cité, chef-d\'œuvre de l\'architecture médiévale française.',
        address: '6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris',
        latitude: 48.8530,
        longitude: 2.3499,
        images: [
          'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1585159650914-1a56fc0d8cb7?w=800&h=600&fit=crop&crop=center'
        ],
        category: 'RELIGIOUS',
        openingHours: {
          'lun-ven': '08h00-18h45',
          'sam-dim': '08h00-19h15'
        },
        entryFee: 0.00,
        website: 'https://www.notredamedeparis.fr',
        phone: '+33 1 42 34 56 10',
        createdBy: adminUser.id
      },
      {
        name: 'Sacré-Cœur de Montmartre',
        description: 'Basilique romano-byzantine perchée au sommet de la butte Montmartre, offrant l\'une des plus belles vues sur Paris.',
        address: '35 Rue du Chevalier de la Barre, 75018 Paris',
        latitude: 48.8867,
        longitude: 2.3431,
        images: [
          'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1520637836862-4d197d17c0a4?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop&crop=center'
        ],
        category: 'RELIGIOUS',
        openingHours: {
          'lun-dim': '06h00-22h30'
        },
        entryFee: 0.00,
        website: 'https://www.sacre-coeur-montmartre.com',
        phone: '+33 1 53 41 89 00',
        createdBy: adminUser.id
      },
      {
        name: 'Arc de Triomphe',
        description: 'Monument emblématique situé au centre de la place Charles-de-Gaulle, symbole des victoires militaires françaises.',
        address: 'Place Charles de Gaulle, 75008 Paris',
        latitude: 48.8738,
        longitude: 2.2950,
        images: [
          'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1520637836862-4d197d17c0a4?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop&crop=center'
        ],
        category: 'MONUMENT',
        openingHours: {
          'lun-dim': '10h00-23h00'
        },
        entryFee: 13.00,
        website: 'https://www.paris-arc-de-triomphe.fr',
        phone: '+33 1 55 37 73 77',
        createdBy: adminUser.id
      },
      {
        name: 'Jardin du Luxembourg',
        description: 'Magnifique jardin à la française de 25 hectares, parfait pour se détendre avec ses parterres, ses statues et son bassin.',
        address: '6ème arrondissement de Paris',
        latitude: 48.8462,
        longitude: 2.3371,
        images: [
          'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1520637836862-4d197d17c0a4?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=600&fit=crop&crop=center'
        ],
        category: 'PARK',
        openingHours: {
          'lun-dim': '07h30-21h30'
        },
        entryFee: 0.00,
        website: 'https://www.senat.fr/visite/jardin',
        phone: '+33 1 42 34 20 00',
        createdBy: adminUser.id
      }
    ];

    for (const site of sites) {
      await prisma.site.create({
        data: site
      });
    }
    console.log(`✅ Created ${sites.length} tourist sites with images\n`);

    // Get establishment IDs for reviews and promotions
    const createdEstablishments = await prisma.establishment.findMany();

    // Create Reviews
    console.log('⭐ Creating reviews...');
    const reviews = [
      {
        rating: 5,
        comment: 'Expérience exceptionnelle ! Service impeccable et cadre somptueux.',
        status: 'APPROVED',
        userId: marieUser.id,
        establishmentId: createdEstablishments[0].id,
        moderatedBy: adminUser.id,
        moderatedAt: new Date()
      },
      {
        rating: 4,
        comment: 'Très bonne cuisine, ambiance chaleureuse. Je recommande !',
        status: 'APPROVED',
        userId: pierreUser.id,
        establishmentId: createdEstablishments[1].id,
        moderatedBy: adminUser.id,
        moderatedAt: new Date()
      },
      {
        rating: 5,
        comment: 'Café mythique avec une atmosphère unique. Incontournable !',
        status: 'APPROVED',
        userId: marieUser.id,
        establishmentId: createdEstablishments[2].id,
        moderatedBy: adminUser.id,
        moderatedAt: new Date()
      }
    ];

    for (const review of reviews) {
      await prisma.review.create({
        data: review
      });
    }
    console.log(`✅ Created ${reviews.length} reviews\n`);

    // Create Promotions
    console.log('🎯 Creating promotions...');
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const promotions = [
      {
        title: 'Offre Spéciale Été',
        description: 'Profitez de 20% de réduction sur votre séjour en réservant avant la fin du mois.',
        discount: 20.00,
        validFrom: now,
        validUntil: nextMonth,
        establishmentId: createdEstablishments[0].id
      },
      {
        title: 'Menu Découverte',
        description: 'Découvrez notre menu dégustation avec 15% de réduction pour les nouveaux clients.',
        discount: 15.00,
        validFrom: now,
        validUntil: nextWeek,
        establishmentId: createdEstablishments[1].id
      }
    ];

    for (const promotion of promotions) {
      await prisma.promotion.create({
        data: promotion
      });
    }
    console.log(`✅ Created ${promotions.length} promotions\n`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${users.count}`);
    console.log(`- Partners: ${partners.count}`);
    console.log(`- Establishments: ${establishments.length} (with images)`);
    console.log(`- Sites: ${sites.length} (with images)`);
    console.log(`- Reviews: ${reviews.length}`);
    console.log(`- Promotions: ${promotions.length}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });