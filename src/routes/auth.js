const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const oauthController = require('../controllers/oauthController');
const { authenticateToken } = require('../middleware/auth');
const { validateCreateUser, validateLogin, handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');

// Validation pour le changement de mot de passe
const validateChangePassword = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Mot de passe actuel requis'),
    
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
    
    handleValidationErrors
];

// Validation pour la demande de réinitialisation de mot de passe
const validateRequestReset = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    
    handleValidationErrors
];

// Validation pour la réinitialisation de mot de passe
const validateResetPassword = [
    body('token')
        .notEmpty()
        .withMessage('Token de réinitialisation requis')
        .isLength({ min: 32, max: 128 })
        .withMessage('Token invalide'),
    
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
    
    handleValidationErrors
];

// Routes d'authentification

// POST /api/auth/register - Inscription
router.post('/register', validateCreateUser, authController.register);

// POST /api/auth/login - Connexion (utilisateur normal)
router.post('/login', validateLogin, authController.login);

// POST /api/auth/login/admin - Connexion administrateur
router.post('/login/admin', validateLogin, authController.loginAdmin);

// POST /api/auth/login/partner - Connexion partenaire
router.post('/login/partner', validateLogin, authController.loginPartner);

// POST /api/auth/refresh - Rafraîchir l'access token
router.post('/refresh', authController.refreshAccessToken);

// POST /api/auth/logout - Déconnexion
router.post('/logout', authController.logout);

// GET /api/auth/me - Profil utilisateur (authentification requise)
router.get('/me', authenticateToken, authController.getProfile);

// PUT /api/auth/change-password - Changement de mot de passe (authentification requise)
router.put('/change-password', authenticateToken, validateChangePassword, authController.changePassword);

// POST /api/auth/request-reset - Demande de réinitialisation de mot de passe
router.post('/request-reset', validateRequestReset, authController.requestPasswordReset);

// POST /api/auth/reset-password - Réinitialisation du mot de passe avec token
router.post('/reset-password', validateResetPassword, authController.resetPassword);

// OAuth Routes

// POST /api/auth/google - Authentification avec Google
router.post('/google', oauthController.googleLogin);

// POST /api/auth/unlink-google - Dissocier le compte Google (authentification requise)
router.post('/unlink-google', authenticateToken, oauthController.unlinkGoogle);

module.exports = router;
