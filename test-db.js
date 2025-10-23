const { prisma, testConnection } = require('./src/config/database');

async function testDatabaseSetup() {
    console.log('🧪 Test de la configuration Prisma...\n');

    try {
        // Test de connexion
        await testConnection();
        
        // Test de comptage des tables
        console.log('\n📊 Vérification des tables:');
        
        const userCount = await prisma.user.count();
        console.log(`👥 Users: ${userCount} enregistrements`);
        
        const partnerCount = await prisma.partner.count();
        console.log(`🤝 Partners: ${partnerCount} enregistrements`);
        
        const establishmentCount = await prisma.establishment.count();
        console.log(`🏨 Establishments: ${establishmentCount} enregistrements`);
        
        const siteCount = await prisma.site.count();
        console.log(`🏛️ Sites: ${siteCount} enregistrements`);
        
        console.log('\n✅ Configuration Prisma fonctionnelle!');
        
        // Test d'une requête avec relation
        console.log('\n🔍 Test d\'une requête avec relation:');
        const establishments = await prisma.establishment.findMany({
            include: {
                partner: {
                    select: { name: true, email: true }
                }
            },
            take: 2
        });
        
        establishments.forEach((est, index) => {
            console.log(`${index + 1}. ${est.name} (${est.type}) - Partenaire: ${est.partner?.name || 'N/A'}`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        
        if (error.code === 'P1001') {
            console.error('\n💡 Solutions possibles:');
            console.error('1. Vérifiez que XAMPP MySQL est démarré');
            console.error('2. Vérifiez que la base de données "listing_app" existe');
            console.error('3. Exécutez le script SQL: prisma/manual_schema.sql dans phpMyAdmin');
        }
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

testDatabaseSetup();