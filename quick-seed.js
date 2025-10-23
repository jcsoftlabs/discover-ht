const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function quickSeed() {
  console.log('🌱 Quick seeding for favorites test...\n');

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create default mobile user first
    console.log('👤 Creating default mobile user...');
    await prisma.user.create({
      data: {
        id: 'default-user',
        firstName: 'Mobile',
        lastName: 'User',
        email: 'mobile@app.com',
        password: hashedPassword,
        role: 'USER'
      }
    });
    console.log('✅ Created mobile user\n');

    // Create admin user
    console.log('👥 Creating admin user...');
    const adminUser = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@tourism.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('✅ Created admin user\n');

    // Create a partner
    console.log('🤝 Creating partner...');
    const partner = await prisma.partner.create({
      data: {
        name: 'Test Hotels',
        email: 'contact@testhotels.com',
        phone: '+33 1 42 86 87 88',
        description: 'Test partner for favorites',
        status: 'APPROVED',
        validatedBy: adminUser.id,
        validatedAt: new Date()
      }
    });
    console.log('✅ Created partner\n');

    // Create some establishments
    console.log('🏨 Creating establishments...');
    const establishment1 = await prisma.establishment.create({
      data: {
        name: 'Test Hotel',
        description: 'A test hotel for favorites',
        type: 'HOTEL',
        price: 100.00,
        address: '123 Test Street, Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        partnerId: partner.id
      }
    });

    const establishment2 = await prisma.establishment.create({
      data: {
        name: 'Test Restaurant',
        description: 'A test restaurant for favorites',
        type: 'RESTAURANT',
        price: 50.00,
        address: '456 Test Avenue, Paris',
        latitude: 48.8606,
        longitude: 2.3376,
        partnerId: partner.id
      }
    });
    console.log('✅ Created establishments\n');

    console.log('🎉 Quick seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Default mobile user: default-user');
    console.log(`- Admin user: ${adminUser.id}`);
    console.log(`- Partner: ${partner.id}`);
    console.log(`- Establishment 1: ${establishment1.id} (${establishment1.name})`);
    console.log(`- Establishment 2: ${establishment2.id} (${establishment2.name})`);

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Some data already exists, which is fine for testing');
    } else {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }
}

quickSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });