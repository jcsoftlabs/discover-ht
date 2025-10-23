/**
 * Script de test pour vérifier la configuration OAuth
 * 
 * Usage: node test-oauth.js
 */

require('dotenv').config();
const { prisma } = require('./src/config/database');

async function testOAuthSetup() {
    console.log('🧪 Test de la configuration OAuth Google\n');
    
    try {
        // 1. Vérifier les variables d'environnement
        console.log('📋 Vérification des variables d\'environnement:');
        console.log('   ✓ JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configuré' : '❌ Manquant');
        console.log('   ✓ GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configuré' : '⚠️  Non configuré (requis pour OAuth)');
        console.log('   ✓ DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configuré' : '❌ Manquant');
        console.log();

        // 2. Vérifier la connexion à la base de données
        console.log('🔌 Test de connexion à la base de données:');
        await prisma.$connect();
        console.log('   ✅ Connexion réussie\n');

        // 3. Vérifier la structure de la table users
        console.log('🗂️  Vérification de la structure de la table users:');
        const result = await prisma.$queryRaw`DESCRIBE users`;
        
        const requiredFields = ['google_id', 'provider', 'profile_picture'];
        const existingFields = result.map(row => row.Field);
        
        console.log('   Champs OAuth:');
        requiredFields.forEach(field => {
            const exists = existingFields.includes(field);
            console.log(`   ${exists ? '✅' : '❌'} ${field}: ${exists ? 'Présent' : 'Manquant'}`);
        });
        
        // Vérifier que password est nullable
        const passwordField = result.find(row => row.Field === 'password');
        const isNullable = passwordField && passwordField.Null === 'YES';
        console.log(`   ${isNullable ? '✅' : '❌'} password (nullable): ${isNullable ? 'Oui' : 'Non'}`);
        console.log();

        // 4. Tester la création d'un utilisateur OAuth (simulation)
        console.log('🧪 Test de création d\'utilisateur OAuth:');
        
        // Vérifier si un utilisateur de test existe déjà
        const existingTestUser = await prisma.user.findUnique({
            where: { email: 'test-oauth@example.com' }
        });

        if (existingTestUser) {
            console.log('   ℹ️  Utilisateur de test existe déjà, suppression...');
            await prisma.user.delete({
                where: { email: 'test-oauth@example.com' }
            });
        }

        // Créer un utilisateur de test
        const testUser = await prisma.user.create({
            data: {
                email: 'test-oauth@example.com',
                firstName: 'Test',
                lastName: 'OAuth',
                googleId: 'google-test-id-' + Date.now(),
                provider: 'google',
                profilePicture: 'https://example.com/photo.jpg',
                password: null, // Pas de mot de passe pour OAuth
                role: 'USER'
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                googleId: true,
                provider: true,
                profilePicture: true
            }
        });

        console.log('   ✅ Utilisateur de test créé avec succès:');
        console.log('      ID:', testUser.id);
        console.log('      Email:', testUser.email);
        console.log('      Provider:', testUser.provider);
        console.log('      Google ID:', testUser.googleId);
        console.log();

        // Nettoyer l'utilisateur de test
        await prisma.user.delete({
            where: { email: 'test-oauth@example.com' }
        });
        console.log('   🧹 Utilisateur de test supprimé\n');

        // 5. Résumé
        console.log('📊 Résumé:');
        const allChecks = [
            process.env.JWT_SECRET ? true : false,
            process.env.DATABASE_URL ? true : false,
            existingFields.includes('google_id'),
            existingFields.includes('provider'),
            existingFields.includes('profile_picture'),
            isNullable
        ];
        
        const passedChecks = allChecks.filter(Boolean).length;
        const totalChecks = allChecks.length;
        
        console.log(`   ${passedChecks}/${totalChecks} vérifications passées`);
        
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.log('\n⚠️  ATTENTION:');
            console.log('   GOOGLE_CLIENT_ID n\'est pas configuré dans .env');
            console.log('   Ajoutez votre Client ID Google pour activer OAuth:');
            console.log('   GOOGLE_CLIENT_ID=votre-id.apps.googleusercontent.com');
            console.log('\n   Voir docs/OAUTH_SETUP.md pour les instructions complètes\n');
        }
        
        if (passedChecks === totalChecks && process.env.GOOGLE_CLIENT_ID) {
            console.log('\n✅ Configuration OAuth complète et fonctionnelle!\n');
        } else if (passedChecks === totalChecks - 1 && !process.env.GOOGLE_CLIENT_ID) {
            console.log('\n✅ Base de données prête pour OAuth!');
            console.log('⚠️  Configurez GOOGLE_CLIENT_ID pour activer l\'authentification\n');
        } else {
            console.log('\n❌ Des problèmes ont été détectés. Vérifiez les erreurs ci-dessus.\n');
        }

    } catch (error) {
        console.error('\n❌ Erreur lors du test:', error.message);
        console.error('\nDétails:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter le test
testOAuthSetup();
