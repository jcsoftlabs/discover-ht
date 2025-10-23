const { body, param, query, validationResult } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Erreurs de validation',
            details: errors.array()
        });
    }
    next();
};

// Validation pour la création d'utilisateur
const validateCreateUser = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Le prénom est requis')
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .withMessage('Le prénom ne peut contenir que des lettres, espaces et tirets'),
    
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .withMessage('Le nom ne peut contenir que des lettres, espaces et tirets'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
    
    body('role')
        .optional()
        .isIn(['USER', 'ADMIN', 'PARTNER'])
        .withMessage('Rôle invalide'),
    
    handleValidationErrors
];

// Validation pour la mise à jour d'utilisateur
const validateUpdateUser = [
    param('id')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID utilisateur invalide'),
    
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .withMessage('Le prénom ne peut contenir que des lettres, espaces et tirets'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .withMessage('Le nom ne peut contenir que des lettres, espaces et tirets'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    
    body('role')
        .optional()
        .isIn(['USER', 'ADMIN', 'PARTNER'])
        .withMessage('Rôle invalide'),
    
    handleValidationErrors
];

// Validation pour l'authentification
const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis'),
    
    handleValidationErrors
];

// Validation pour la création d'établissement
const validateCreateEstablishment = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères')
        .escape(),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La description ne peut pas dépasser 1000 caractères')
        .escape(),
    
    body('type')
        .isIn(['HOTEL', 'RESTAURANT', 'BAR', 'CAFE', 'ATTRACTION', 'SHOP', 'SERVICE'])
        .withMessage('Type d\'établissement invalide'),
    
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Le prix doit être un nombre positif'),
    
    body('address')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('L\'adresse ne peut pas dépasser 255 caractères')
        .escape(),
    
    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude invalide'),
    
    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude invalide'),
    
    body('partnerId')
        .optional()
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID partenaire invalide'),
    
    handleValidationErrors
];

// Validation pour la création d'avis
const validateCreateReview = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('La note doit être entre 1 et 5'),
    
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Le commentaire ne peut pas dépasser 500 caractères')
        .escape(),
    
    body('userId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID utilisateur invalide'),
    
    body('establishmentId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID établissement invalide'),
    
    handleValidationErrors
];

// Validation pour la création de promotion
const validateCreatePromotion = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Le titre est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le titre doit contenir entre 2 et 100 caractères')
        .escape(),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La description ne peut pas dépasser 500 caractères')
        .escape(),
    
    body('discount')
        .isFloat({ min: 0, max: 100 })
        .withMessage('La remise doit être entre 0 et 100%'),
    
    body('validFrom')
        .isISO8601()
        .withMessage('Date de début invalide'),
    
    body('validUntil')
        .isISO8601()
        .withMessage('Date de fin invalide')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.validFrom)) {
                throw new Error('La date de fin doit être postérieure à la date de début');
            }
            return true;
        }),
    
    body('establishmentId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID établissement invalide'),
    
    handleValidationErrors
];

// Validation pour les paramètres d'ID
const validateId = [
    param('id')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID invalide'),
    
    handleValidationErrors
];

// Validation pour les rôles
const validateRole = [
    param('role')
        .isIn(['USER', 'ADMIN', 'PARTNER'])
        .withMessage('Rôle invalide'),
    
    handleValidationErrors
];

// === VALIDATIONS POUR L'INTERFACE PARTENAIRE ===

// Validation pour mise à jour d'établissement par partenaire
const validatePartnerUpdateEstablishment = [
    param('establishmentId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID établissement invalide'),
    
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La description ne peut pas dépasser 1000 caractères'),
    
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix doit être un nombre positif'),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[+]?[0-9\s\-\(\)]{10,15}$/)
        .withMessage('Numéro de téléphone invalide'),
    
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email invalide'),
    
    body('website')
        .optional()
        .isURL()
        .withMessage('URL du site web invalide'),
    
    handleValidationErrors
];

// Validation pour mise à jour du menu
const validatePartnerUpdateMenu = [
    param('establishmentId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID établissement invalide'),
    
    body('menu')
        .isObject()
        .withMessage('Le menu doit être un objet JSON valide'),
    
    handleValidationErrors
];

// Validation pour mise à jour des disponibilités
const validatePartnerUpdateAvailability = [
    param('establishmentId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID établissement invalide'),
    
    body('availability')
        .isObject()
        .withMessage('Les disponibilités doivent être un objet JSON valide'),
    
    handleValidationErrors
];

// Validation pour mise à jour des images
const validatePartnerUpdateImages = [
    param('establishmentId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID établissement invalide'),
    
    body('images')
        .isArray()
        .withMessage('Les images doivent être un tableau')
        .custom((images) => {
            if (images.length > 10) {
                throw new Error('Maximum 10 images autorisées');
            }
            for (const image of images) {
                if (typeof image !== 'string' || !image.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i)) {
                    throw new Error('URL d\'image invalide');
                }
            }
            return true;
        }),
    
    handleValidationErrors
];

// Validation pour création de promotion par partenaire
const validatePartnerCreatePromotion = [
    param('establishmentId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID établissement invalide'),
    
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Le titre est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le titre doit contenir entre 2 et 100 caractères'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La description ne peut pas dépasser 500 caractères'),
    
    body('discount')
        .isFloat({ min: 0, max: 100 })
        .withMessage('La remise doit être entre 0 et 100%'),
    
    body('validFrom')
        .isISO8601()
        .withMessage('Date de début invalide')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('La date de début ne peut pas être dans le passé');
            }
            return true;
        }),
    
    body('validUntil')
        .isISO8601()
        .withMessage('Date de fin invalide')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.validFrom)) {
                throw new Error('La date de fin doit être postérieure à la date de début');
            }
            return true;
        }),
    
    handleValidationErrors
];

// Validation pour mise à jour de promotion par partenaire
const validatePartnerUpdatePromotion = [
    param('establishmentId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID établissement invalide'),
    
    param('promotionId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID promotion invalide'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le titre doit contenir entre 2 et 100 caractères'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La description ne peut pas dépasser 500 caractères'),
    
    body('discount')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('La remise doit être entre 0 et 100%'),
    
    body('validFrom')
        .optional()
        .isISO8601()
        .withMessage('Date de début invalide'),
    
    body('validUntil')
        .optional()
        .isISO8601()
        .withMessage('Date de fin invalide')
        .custom((value, { req }) => {
            if (req.body.validFrom && new Date(value) <= new Date(req.body.validFrom)) {
                throw new Error('La date de fin doit être postérieure à la date de début');
            }
            return true;
        }),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive doit être un booléen'),
    
    handleValidationErrors
];

// === VALIDATIONS POUR L'INTERFACE ADMIN ===

// Validation pour mise à jour du rôle utilisateur
const validateAdminUpdateUserRole = [
    param('userId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID utilisateur invalide'),
    
    body('role')
        .isIn(['USER', 'ADMIN', 'PARTNER'])
        .withMessage('Rôle invalide'),
    
    handleValidationErrors
];

// Validation pour mise à jour du statut partenaire
const validateAdminUpdatePartnerStatus = [
    param('partnerId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID partenaire invalide'),
    
    body('status')
        .isIn(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])
        .withMessage('Statut invalide'),
    
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La raison ne peut pas dépasser 500 caractères'),
    
    handleValidationErrors
];

// Validation pour modération d'avis
const validateAdminModerateReview = [
    param('reviewId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID avis invalide'),
    
    body('status')
        .isIn(['PENDING', 'APPROVED', 'REJECTED'])
        .withMessage('Statut de modération invalide'),
    
    body('moderationNote')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('La note de modération ne peut pas dépasser 300 caractères'),
    
    handleValidationErrors
];

// Validation pour création d'utilisateur par admin
const validateAdminCreateUser = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Le prénom est requis')
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .withMessage('Le prénom ne peut contenir que des lettres, espaces et tirets'),
    
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .withMessage('Le nom ne peut contenir que des lettres, espaces et tirets'),
    
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
    
    body('role')
        .isIn(['USER', 'ADMIN', 'PARTNER'])
        .withMessage('Rôle invalide. Doit être USER, ADMIN ou PARTNER'),
    
    handleValidationErrors
];

// Validation pour création de site touristique
const validateAdminCreateSite = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Le nom est requis')
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La description ne peut pas dépasser 1000 caractères'),
    
    body('address')
        .trim()
        .notEmpty()
        .withMessage('L\'adresse est requise')
        .isLength({ max: 255 })
        .withMessage('L\'adresse ne peut pas dépasser 255 caractères'),
    
    body('latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude invalide'),
    
    body('longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude invalide'),
    
    body('category')
        .isIn(['MONUMENT', 'MUSEUM', 'PARK', 'BEACH', 'MOUNTAIN', 'CULTURAL', 'RELIGIOUS', 'NATURAL', 'HISTORICAL', 'ENTERTAINMENT'])
        .withMessage('Catégorie invalide'),
    
    body('entryFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix d\'entrée doit être un nombre positif'),
    
    body('website')
        .optional()
        .isURL()
        .withMessage('URL du site web invalide'),
    
    body('phone')
        .optional()
        .matches(/^[+]?[0-9\s\-\(\)]{10,15}$/)
        .withMessage('Numéro de téléphone invalide'),
    
    handleValidationErrors
];

// Validation pour mise à jour de site touristique
const validateAdminUpdateSite = [
    param('siteId')
        .matches(/^[a-zA-Z0-9]{25}$/)
        .withMessage('ID site invalide'),
    
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La description ne peut pas dépasser 1000 caractères'),
    
    body('address')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('L\'adresse ne peut pas dépasser 255 caractères'),
    
    body('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude invalide'),
    
    body('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude invalide'),
    
    body('category')
        .optional()
        .isIn(['MONUMENT', 'MUSEUM', 'PARK', 'BEACH', 'MOUNTAIN', 'CULTURAL', 'RELIGIOUS', 'NATURAL', 'HISTORICAL', 'ENTERTAINMENT'])
        .withMessage('Catégorie invalide'),
    
    body('entryFee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Le prix d\'entrée doit être un nombre positif'),
    
    body('website')
        .optional()
        .isURL()
        .withMessage('URL du site web invalide'),
    
    body('phone')
        .optional()
        .matches(/^[+]?[0-9\s\-\(\)]{10,15}$/)
        .withMessage('Numéro de téléphone invalide'),
    
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive doit être un booléen'),
    
    handleValidationErrors
];

module.exports = {
    // Validations existantes
    validateCreateUser,
    validateUpdateUser,
    validateLogin,
    validateCreateEstablishment,
    validateCreateReview,
    validateCreatePromotion,
    validateId,
    validateRole,
    handleValidationErrors,
    
    // Validations pour interface partenaire
    validatePartner: {
        updateEstablishment: validatePartnerUpdateEstablishment,
        updateMenu: validatePartnerUpdateMenu,
        updateAvailability: validatePartnerUpdateAvailability,
        updateImages: validatePartnerUpdateImages,
        createPromotion: validatePartnerCreatePromotion,
        updatePromotion: validatePartnerUpdatePromotion
    },
    
    // Validations pour interface admin
    validateAdmin: {
        createUser: validateAdminCreateUser,
        updateUserRole: validateAdminUpdateUserRole,
        updatePartnerStatus: validateAdminUpdatePartnerStatus,
        moderateReview: validateAdminModerateReview,
        createSite: validateAdminCreateSite,
        updateSite: validateAdminUpdateSite
    }
};
