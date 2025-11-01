const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage pour les établissements
const establishmentStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'touris-listings/establishments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto:good' }
        ],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `establishment-${uniqueSuffix}`;
        }
    }
});

// Configuration du stockage pour les sites touristiques
const siteStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'touris-listings/sites',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto:good' }
        ],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `site-${uniqueSuffix}`;
        }
    }
});

// Fonction utilitaire pour supprimer une image de Cloudinary
const deleteImage = async (imageUrl) => {
    try {
        // Extraire le public_id de l'URL Cloudinary
        // Format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[ext]
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        
        // Reconstruire le public_id avec le dossier
        const folderIndex = urlParts.indexOf('upload') + 2; // Skip version number
        const folders = urlParts.slice(folderIndex, -1);
        const fullPublicId = [...folders, publicId].join('/');
        
        const result = await cloudinary.uploader.destroy(fullPublicId);
        return result;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'image Cloudinary:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    establishmentStorage,
    siteStorage,
    deleteImage
};
