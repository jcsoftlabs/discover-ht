const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createMobileUser() {
  try {
    console.log('📱 Creating default mobile user for favorites API...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('mobile123', 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: 'default-user' }
    });

    if (existingUser) {
      console.log('✅ Default mobile user already exists');
      return;
    }

    // Create default mobile user with specific ID
    const user = await prisma.user.create({
      data: {
        id: 'default-user',
        firstName: 'Mobile',
        lastName: 'User',
        email: 'mobile@app.com',
        password: hashedPassword,
        role: 'USER'
      }
    });

    console.log('✅ Created default mobile user:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n🎉 Mobile user setup complete!');
    console.log('The favorites API is now ready to use with userId: "default-user"');

  } catch (error) {
    console.error('❌ Error creating mobile user:', error);
    
    // If the error is about duplicate email, try updating the existing user
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      try {
        console.log('📧 Email already exists, trying to update existing user...');
        
        // Find user by email and update ID if needed
        const existingUser = await prisma.user.findUnique({
          where: { email: 'mobile@app.com' }
        });
        
        if (existingUser) {
          console.log('✅ User with mobile@app.com already exists');
          console.log(`   Current ID: ${existingUser.id}`);
          console.log('💡 You can use this ID instead of "default-user" in your mobile app');
        }
      } catch (updateError) {
        console.error('❌ Error finding existing user:', updateError);
      }
    }
  }
}

createMobileUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });