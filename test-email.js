const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConnection() {
    console.log('🧪 Test de connexion SMTP...\n');
    
    console.log('Configuration actuelle:');
    console.log('- SMTP_HOST:', process.env.SMTP_HOST);
    console.log('- SMTP_PORT:', process.env.SMTP_PORT);
    console.log('- SMTP_SECURE:', process.env.SMTP_SECURE);
    console.log('- SMTP_USER:', process.env.SMTP_USER);
    console.log('- SMTP_FROM:', process.env.SMTP_FROM);
    console.log('');

    try {
        // Créer le transporteur
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false // Pour les certificats auto-signés
            }
        });

        console.log('🔄 Vérification de la connexion SMTP...');
        await transporter.verify();
        console.log('✅ Connexion SMTP réussie!\n');

        // Tester l'envoi d'un email
        console.log('📧 Envoi d\'un email de test...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: 'test@example.com', // Remplacer par votre email pour tester
            subject: '🧪 Test Email - Tourism Platform',
            html: `
                <h1>Email de test</h1>
                <p>Si vous recevez cet email, votre configuration SMTP fonctionne correctement!</p>
                <p>Date: ${new Date().toLocaleString()}</p>
            `,
            text: 'Email de test - Si vous recevez cet email, votre configuration SMTP fonctionne!'
        });

        console.log('✅ Email envoyé avec succès!');
        console.log('Message ID:', info.messageId);
        console.log('Réponse:', info.response);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('\nDétails de l\'erreur:');
        console.error(error);
        
        console.log('\n💡 Solutions possibles:');
        console.log('1. Vérifier que le serveur SMTP est accessible');
        console.log('2. Vérifier les identifiants (user/password)');
        console.log('3. Vérifier le port (465 pour SSL, 587 pour TLS)');
        console.log('4. Vérifier les règles de pare-feu');
        console.log('5. Essayer avec SMTP_SECURE=false et SMTP_PORT=587');
    }
}

testEmailConnection();
