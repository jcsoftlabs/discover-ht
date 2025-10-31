const { initEmailService, sendWelcomeEmail } = require('./src/services/emailService');
require('dotenv').config();

async function testWelcomeEmail() {
    console.log('🧪 Test d\'envoi d\'email de bienvenue...\n');
    
    // Initialiser le service email
    console.log('🔄 Initialisation du service email...');
    initEmailService();
    
    // Attendre un peu pour laisser l'initialisation se terminer
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Tester l'envoi
    console.log('\n📧 Envoi de l\'email de bienvenue...');
    const testEmail = 'test@example.com'; // Changez par l'email d'inscription réel
    const testFirstName = 'Test User';
    
    const result = await sendWelcomeEmail(testEmail, testFirstName);
    
    console.log('\n📊 Résultat:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
        console.log('\n✅ Email envoyé avec succès!');
        if (result.previewUrl) {
            console.log('🔗 URL de prévisualisation:', result.previewUrl);
        }
    } else {
        console.log('\n❌ Échec de l\'envoi');
        console.log('Erreur:', result.error);
    }
}

testWelcomeEmail().catch(console.error);
