const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerDashboardController');
const { authenticateToken: authenticate } = require('../middleware/auth');
const { validatePartner } = require('../middleware/validation');

/**
 * Routes pour l'interface partenaire
 * Toutes les routes nécessitent une authentification et un rôle PARTNER
 */

// Middleware pour vérifier le rôle partenaire
const requirePartner = (req, res, next) => {
  if (req.user.role !== 'PARTNER') {
    return res.status(403).json({
      success: false,
      error: 'Accès réservé aux partenaires'
    });
  }
  next();
};

// === DASHBOARD ===

// GET /api/partner/dashboard - Vue d'ensemble du partenaire
router.get('/dashboard', 
  authenticate,
  requirePartner, 
  partnerController.getDashboard
);

// === GESTION DES ÉTABLISSEMENTS ===

// GET /api/partner/establishments - Liste des établissements du partenaire
router.get('/establishments', 
  authenticate,
  requirePartner, 
  partnerController.getEstablishments
);

// GET /api/partner/establishments/:establishmentId - Détails d'un établissement
router.get('/establishments/:establishmentId', 
  authenticate, 
  requirePartner, 
  partnerController.getEstablishment
);

// PUT /api/partner/establishments/:establishmentId - Mettre à jour un établissement
router.put('/establishments/:establishmentId', 
  authenticate, 
  requirePartner,
  validatePartner.updateEstablishment,
  partnerController.updateEstablishment
);

// === GESTION DES MENUS ===

// PUT /api/partner/establishments/:establishmentId/menu - Mettre à jour le menu
router.put('/establishments/:establishmentId/menu', 
  authenticate, 
  requirePartner,
  validatePartner.updateMenu,
  partnerController.updateMenu
);

// === GESTION DES DISPONIBILITÉS ===

// PUT /api/partner/establishments/:establishmentId/availability - Mettre à jour les disponibilités
router.put('/establishments/:establishmentId/availability', 
  authenticate, 
  requirePartner,
  validatePartner.updateAvailability,
  partnerController.updateAvailability
);

// === GESTION DES IMAGES ===

// PUT /api/partner/establishments/:establishmentId/images - Mettre à jour les images
router.put('/establishments/:establishmentId/images', 
  authenticate, 
  requirePartner,
  validatePartner.updateImages,
  partnerController.updateImages
);

// === GESTION DES PROMOTIONS ===

// GET /api/partner/establishments/:establishmentId/promotions - Liste des promotions
router.get('/establishments/:establishmentId/promotions', 
  authenticate, 
  requirePartner, 
  partnerController.getPromotions
);

// POST /api/partner/establishments/:establishmentId/promotions - Créer une promotion
router.post('/establishments/:establishmentId/promotions', 
  authenticate, 
  requirePartner,
  validatePartner.createPromotion,
  partnerController.createPromotion
);

// PUT /api/partner/establishments/:establishmentId/promotions/:promotionId - Mettre à jour une promotion
router.put('/establishments/:establishmentId/promotions/:promotionId', 
  authenticate, 
  requirePartner,
  validatePartner.updatePromotion,
  partnerController.updatePromotion
);

// DELETE /api/partner/establishments/:establishmentId/promotions/:promotionId - Supprimer une promotion
router.delete('/establishments/:establishmentId/promotions/:promotionId', 
  authenticate, 
  requirePartner, 
  partnerController.deletePromotion
);

// === GESTION DES AVIS ===

// GET /api/partner/reviews - Tous les avis des établissements du partenaire
router.get('/reviews', 
  authenticate, 
  requirePartner, 
  partnerController.getReviews
);

// GET /api/partner/establishments/:establishmentId/reviews - Avis d'un établissement spécifique
router.get('/establishments/:establishmentId/reviews', 
  authenticate, 
  requirePartner, 
  partnerController.getReviews
);

module.exports = router;