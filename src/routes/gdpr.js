const express = require('express');
const router = express.Router();
const gdprController = require('../controllers/gdprController');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');

// Validation pour la mise à jour des consentements
const validateConsent = [
    body('marketingEmails')
        .optional()
        .isBoolean()
        .withMessage('marketingEmails doit être un booléen'),
    
    body('analyticsTracking')
        .optional()
        .isBoolean()
        .withMessage('analyticsTracking doit être un booléen'),
    
    body('personalizedContent')
        .optional()
        .isBoolean()
        .withMessage('personalizedContent doit être un booléen'),
    
    handleValidationErrors
];

// Validation pour la demande de rectification
const validateRectification = [
    body('field')
        .notEmpty()
        .withMessage('Le champ à rectifier est requis')
        .escape(),
    
    body('currentValue')
        .notEmpty()
        .withMessage('La valeur actuelle est requise')
        .escape(),
    
    body('requestedValue')
        .notEmpty()
        .withMessage('La nouvelle valeur est requise')
        .escape(),
    
    body('reason')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La raison ne peut pas dépasser 500 caractères')
        .escape(),
    
    handleValidationErrors
];

// Toutes les routes RGPD nécessitent une authentification
router.use(authenticateToken);

// GET /api/gdpr/data-export - Exporter toutes les données utilisateur
router.get('/data-export', gdprController.exportUserData);

// DELETE /api/gdpr/delete-account - Suppression complète du compte
router.delete('/delete-account', gdprController.deleteUserAccount);

// PUT /api/gdpr/update-consent - Mise à jour des consentements
router.put('/update-consent', validateConsent, gdprController.updateConsent);

// GET /api/gdpr/data-usage - Informations sur l'utilisation des données
router.get('/data-usage', gdprController.getDataUsageInfo);

// POST /api/gdpr/data-rectification - Demande de rectification
router.post('/data-rectification', validateRectification, gdprController.requestDataRectification);

module.exports = router;