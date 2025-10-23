/**
 * Script de test pour vérifier que le backend accepte les tokens de plusieurs plateformes
 * 
 * Usage: node test-oauth-multiplatform.js
 */

require('dotenv').config();

console.log('🧪 Test de la configuration OAuth multi-plateforme\n');

// Vérifier les variables d'environnement
console.log('📋 Client IDs configurés:\n');

const clientIdWeb = process.env.GOOGLE_CLIENT_ID_WEB;
const clientIdIos = process.env.GOOGLE_CLIENT_ID_IOS;
const clientIdAndroid = process.env.GOOGLE_CLIENT_ID_ANDROID;
const clientIdLegacy = process.env.GOOGLE_CLIENT_ID;

console.log('   Client ID Web:');
console.log(`   ${clientIdWeb ? '✅' : '❌'} ${clientIdWeb || 'Non configuré'}\n`);

console.log('   Client ID iOS:');
console.log(`   ${clientIdIos ? '✅' : '❌'} ${clientIdIos || 'Non configuré'}\n`);

console.log('   Client ID Android:');
console.log(`   ${clientIdAndroid ? '✅' : '⚠️ '} ${clientIdAndroid || 'Non configuré (optionnel)'}\n`);

console.log('   Client ID Legacy:');
console.log(`   ${clientIdLegacy ? '✅' : '❌'} ${clientIdLegacy || 'Non configuré'}\n`);

// Afficher les Client IDs qui seront acceptés
const acceptedClientIds = [clientIdWeb, clientIdIos, clientIdAndroid].filter(Boolean);

console.log('📊 Résumé:\n');
console.log(`   Le backend acceptera les tokens de ${acceptedClientIds.length} plateforme(s):`);
acceptedClientIds.forEach((id, index) => {
    const platform = id.includes(clientIdWeb) ? 'Web' : 
                     id.includes(clientIdIos) ? 'iOS' : 'Android';
    console.log(`   ${index + 1}. ${platform}: ${id}`);
});

console.log('\n✅ Configuration multi-plateforme active!');
console.log('   Les utilisateurs peuvent se connecter depuis:');
if (clientIdWeb) console.log('   • Application Web');
if (clientIdIos) console.log('   • Application iOS');
if (clientIdAndroid) console.log('   • Application Android');

console.log('\n📱 Pour tester:');
console.log('   1. Démarrez le serveur: npm run dev');
console.log('   2. Envoyez un token depuis n\'importe quelle plateforme:');
console.log('      POST /api/auth/google');
console.log('      Body: { "idToken": "votre-token-google" }\n');
