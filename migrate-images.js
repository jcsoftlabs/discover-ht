const { PrismaClient } = require('@prisma/client');
const { cloudinary } = require('./src/config/cloudinary');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

/**
 * Script de migration des images locales vers Cloudinary
 * 
 * Ce script :
 * 1. Récupère tous les établissements et sites avec des images locales
 * 2. Upload chaque image vers Cloudinary
 * 3. Met à jour la base de données avec les nouvelles URLs Cloudinary
 */

async function migrateImages() {
    console.log('🚀 Démarrage de la migration des images vers Cloudinary...\n');
    
    let totalMigrated = 0;
    let totalErrors = 0;

    try {
        // === MIGRATION DES ÉTABLISSEMENTS ===
        console.log('📦 Migration des images d\'établissements...');
        const establishments = await prisma.establishment.findMany({
            where: {
                images: {
                    not: null
                }
            }
        });

        console.log(`   Trouvé ${establishments.length} établissements avec images\n`);

        for (const establishment of establishments) {
            const images = establishment.images || [];
            const newImageUrls = [];

            console.log(`   🏨 ${establishment.name} (${images.length} images)`);

            for (const imageUrl of images) {
                // Vérifier si c'est une image locale
                if (imageUrl.includes('/uploads/establishments/') && !imageUrl.includes('cloudinary.com')) {
                    try {
                        // Extraire le nom du fichier
                        const filename = imageUrl.split('/').pop();
                        const localPath = path.join(__dirname, 'public/uploads/establishments', filename);

                        // Vérifier si le fichier existe
                        if (!fs.existsSync(localPath)) {
                            console.log(`      ⚠️  Fichier local introuvable: ${filename}`);
                            totalErrors++;
                            continue;
                        }

                        // Upload vers Cloudinary
                        console.log(`      ⬆️  Upload: ${filename}...`);
                        const result = await cloudinary.uploader.upload(localPath, {
                            folder: 'touris-listings/establishments',
                            public_id: filename.split('.')[0],
                            transformation: [
                                { width: 1200, height: 800, crop: 'limit' },
                                { quality: 'auto:good' }
                            ]
                        });

                        newImageUrls.push(result.secure_url);
                        console.log(`      ✅ Migré: ${result.secure_url}`);
                        totalMigrated++;

                    } catch (error) {
                        console.error(`      ❌ Erreur upload ${imageUrl}:`, error.message);
                        totalErrors++;
                    }
                } else if (imageUrl.includes('cloudinary.com')) {
                    // Déjà sur Cloudinary
                    newImageUrls.push(imageUrl);
                    console.log(`      ⏭️  Déjà sur Cloudinary: ${imageUrl.split('/').pop()}`);
                } else {
                    // URL externe ou autre
                    newImageUrls.push(imageUrl);
                    console.log(`      ⏭️  URL externe conservée: ${imageUrl}`);
                }
            }

            // Mettre à jour la base de données si de nouvelles URLs existent
            if (newImageUrls.length > 0 && newImageUrls.length !== images.length) {
                await prisma.establishment.update({
                    where: { id: establishment.id },
                    data: { images: newImageUrls }
                });
                console.log(`      💾 Base de données mise à jour\n`);
            }
        }

        // === MIGRATION DES SITES ===
        console.log('\n🏞️  Migration des images de sites touristiques...');
        const sites = await prisma.site.findMany({
            where: {
                images: {
                    not: null
                }
            }
        });

        console.log(`   Trouvé ${sites.length} sites avec images\n`);

        for (const site of sites) {
            const images = site.images || [];
            const newImageUrls = [];

            console.log(`   🗺️  ${site.name} (${images.length} images)`);

            for (const imageUrl of images) {
                // Vérifier si c'est une image locale
                if (imageUrl.includes('/uploads/sites/') && !imageUrl.includes('cloudinary.com')) {
                    try {
                        // Extraire le nom du fichier
                        const filename = imageUrl.split('/').pop();
                        const localPath = path.join(__dirname, 'public/uploads/sites', filename);

                        // Vérifier si le fichier existe
                        if (!fs.existsSync(localPath)) {
                            console.log(`      ⚠️  Fichier local introuvable: ${filename}`);
                            totalErrors++;
                            continue;
                        }

                        // Upload vers Cloudinary
                        console.log(`      ⬆️  Upload: ${filename}...`);
                        const result = await cloudinary.uploader.upload(localPath, {
                            folder: 'touris-listings/sites',
                            public_id: filename.split('.')[0],
                            transformation: [
                                { width: 1200, height: 800, crop: 'limit' },
                                { quality: 'auto:good' }
                            ]
                        });

                        newImageUrls.push(result.secure_url);
                        console.log(`      ✅ Migré: ${result.secure_url}`);
                        totalMigrated++;

                    } catch (error) {
                        console.error(`      ❌ Erreur upload ${imageUrl}:`, error.message);
                        totalErrors++;
                    }
                } else if (imageUrl.includes('cloudinary.com')) {
                    // Déjà sur Cloudinary
                    newImageUrls.push(imageUrl);
                    console.log(`      ⏭️  Déjà sur Cloudinary: ${imageUrl.split('/').pop()}`);
                } else {
                    // URL externe ou autre
                    newImageUrls.push(imageUrl);
                    console.log(`      ⏭️  URL externe conservée: ${imageUrl}`);
                }
            }

            // Mettre à jour la base de données si de nouvelles URLs existent
            if (newImageUrls.length > 0 && newImageUrls.length !== images.length) {
                await prisma.site.update({
                    where: { id: site.id },
                    data: { images: newImageUrls }
                });
                console.log(`      💾 Base de données mise à jour\n`);
            }
        }

        // === RÉSUMÉ ===
        console.log('\n' + '='.repeat(60));
        console.log('📊 RÉSUMÉ DE LA MIGRATION');
        console.log('='.repeat(60));
        console.log(`✅ Images migrées avec succès : ${totalMigrated}`);
        console.log(`❌ Erreurs rencontrées        : ${totalErrors}`);
        console.log('='.repeat(60));
        console.log('\n✨ Migration terminée !');
        console.log('🔍 Vérifiez vos images sur: https://console.cloudinary.com/console/media_library\n');

    } catch (error) {
        console.error('\n❌ Erreur fatale lors de la migration:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter la migration
migrateImages()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Erreur:', error);
        process.exit(1);
    });
