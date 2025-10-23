const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage pour les images d'établissements
const establishmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/establishments');
        // S'assurer que le dossier existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'establishment-' + uniqueSuffix + ext);
    }
});

// Configuration du stockage pour les images de sites
const siteStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads/sites');
        // S'assurer que le dossier existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'site-' + uniqueSuffix + ext);
    }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Seuls les formats JPEG, PNG et WebP sont acceptés.'), false);
    }
};

// Configuration de multer pour les établissements
const establishmentUpload = multer({
    storage: establishmentStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5 MB par fichier
    },
    fileFilter: fileFilter
});

// Configuration de multer pour les sites
const siteUpload = multer({
    storage: siteStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5 MB par fichier
    },
    fileFilter: fileFilter
});

// Middleware pour upload d'une seule image (établissement)
const uploadSingle = establishmentUpload.single('image');

// Middleware pour upload de plusieurs images (établissements, max 10)
const uploadMultiple = establishmentUpload.array('images', 10);

// Middleware pour upload de plusieurs images (sites, max 10)
const uploadMultipleSites = siteUpload.array('images', 10);

// Middleware de gestion d'erreurs pour multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'La taille du fichier dépasse la limite de 5 MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Trop de fichiers. Maximum 10 images autorisées'
            });
        }
        return res.status(400).json({
            success: false,
            error: 'Erreur lors de l\'upload: ' + err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next();
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    uploadMultipleSites,
    handleUploadError
};
