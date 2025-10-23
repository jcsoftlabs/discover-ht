const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFavorites() {
  try {
    console.log('🔍 Testing favorites functionality...\n');

    // Test 1: Check if we can connect to database
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Test 2: Check if users table works
    console.log('2. Testing users table...');
    const user = await prisma.user.findUnique({
      where: { id: 'default-user' }
    });
    if (user) {
      console.log(`✅ Found default user: ${user.firstName} ${user.lastName}`);
    } else {
      console.log('❌ Default user not found');
    }
    console.log('');

    // Test 3: Check if establishments table works
    console.log('3. Testing establishments table...');
    const establishments = await prisma.establishment.findMany({
      take: 1,
      select: {
        id: true,
        name: true
      }
    });
    if (establishments.length > 0) {
      console.log(`✅ Found establishment: ${establishments[0].name} (${establishments[0].id})`);
    } else {
      console.log('❌ No establishments found');
    }
    console.log('');

    // Test 4: Try to check if favorites table exists and is accessible
    console.log('4. Testing favorites table...');
    try {
      const favoriteCount = await prisma.favorite.count();
      console.log(`✅ Favorites table accessible. Current count: ${favoriteCount}`);
    } catch (error) {
      console.log('❌ Error accessing favorites table:', error.message);
      
      // If favorites table doesn't exist, suggest solution
      if (error.code === 'P2021' || error.message.includes('does not exist')) {
        console.log('💡 Solution: The favorites table may not exist. Try running:');
        console.log('   npx prisma migrate dev --name add-favorites');
        console.log('   or');
        console.log('   npx prisma db push --force-reset');
      }
    }
    console.log('');

    // Test 5: If favorites table works, try a simple operation
    if (user && establishments.length > 0) {
      console.log('5. Testing favorites operations...');
      try {
        // Check if favorite exists
        const existingFavorite = await prisma.favorite.findFirst({
          where: {
            userId: 'default-user',
            establishmentId: establishments[0].id
          }
        });
        
        if (existingFavorite) {
          console.log('✅ Found existing favorite');
        } else {
          console.log('ℹ️  No existing favorite found - this is normal');
          
          // Try to create a favorite
          const favorite = await prisma.favorite.create({
            data: {
              userId: 'default-user',
              establishmentId: establishments[0].id
            }
          });
          console.log('✅ Successfully created test favorite');
          
          // Clean up - delete the test favorite
          await prisma.favorite.delete({
            where: { id: favorite.id }
          });
          console.log('✅ Successfully deleted test favorite');
        }
      } catch (error) {
        console.log('❌ Error with favorites operations:', error.message);
        console.log('Error code:', error.code);
      }
    }

    console.log('\n🎉 Favorites test completed!');

  } catch (error) {
    console.error('❌ General error:', error);
  }
}

testFavorites()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });