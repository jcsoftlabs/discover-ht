const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminDashboardController');
const { authenticateToken: authenticate } = require('../middleware/auth');
const { validateAdmin } = require('../middleware/validation');

/**
 * Routes pour l'interface administrateur
 * Toutes les routes nécessitent une authentification et un rôle ADMIN
 */

// Middleware pour vérifier le rôle administrateur
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Accès réservé aux administrateurs'
    });
  }
  next();
};

// === DASHBOARD ===

// GET /api/admin/dashboard - Vue d'ensemble administrative
router.get('/dashboard', 
  authenticate, 
  requireAdmin, 
  adminController.getDashboard
);

// GET /api/admin/statistics - Statistiques détaillées
router.get('/statistics', 
  authenticate, 
  requireAdmin, 
  adminController.getStatistics
);

// === GESTION DES UTILISATEURS ===

// GET /api/admin/users - Liste des utilisateurs avec pagination et filtres
router.get('/users', 
  authenticate, 
  requireAdmin, 
  adminController.getUsers
);

// GET /api/admin/users/:userId - Détails d'un utilisateur
router.get('/users/:userId', 
  authenticate, 
  requireAdmin, 
  adminController.getUser
);

// POST /api/admin/users - Créer un nouveau compte utilisateur (ADMIN seulement)
router.post('/users', 
  authenticate, 
  requireAdmin,
  validateAdmin.createUser,
  adminController.createUser
);

// PUT /api/admin/users/:userId/role - Mettre à jour le rôle d'un utilisateur
router.put('/users/:userId/role', 
  authenticate, 
  requireAdmin,
  validateAdmin.updateUserRole,
  adminController.updateUserRole
);

// === GESTION DES PARTENAIRES ===

// GET /api/admin/partners - Liste des partenaires avec filtres
router.get('/partners', 
  authenticate, 
  requireAdmin, 
  adminController.getPartners
);

// GET /api/admin/partners/:partnerId - Détails d'un partenaire
router.get('/partners/:partnerId', 
  authenticate, 
  requireAdmin, 
  adminController.getPartner
);

// PUT /api/admin/partners/:partnerId/status - Valider/Rejeter un partenaire
router.put('/partners/:partnerId/status', 
  authenticate, 
  requireAdmin,
  validateAdmin.updatePartnerStatus,
  adminController.updatePartnerStatus
);

// === MODÉRATION DES AVIS ===

// GET /api/admin/reviews/moderate - Liste des avis en attente de modération
router.get('/reviews/moderate', 
  authenticate, 
  requireAdmin, 
  adminController.getReviewsToModerate
);

// PUT /api/admin/reviews/:reviewId/moderate - Modérer un avis (approuver/rejeter)
router.put('/reviews/:reviewId/moderate', 
  authenticate, 
  requireAdmin,
  validateAdmin.moderateReview,
  adminController.moderateReview
);

// === GESTION DES SITES TOURISTIQUES ===

// GET /api/admin/sites - Liste des sites touristiques
router.get('/sites', 
  authenticate, 
  requireAdmin, 
  adminController.getSites
);

// POST /api/admin/sites - Créer un nouveau site touristique
router.post('/sites', 
  authenticate, 
  requireAdmin,
  validateAdmin.createSite,
  adminController.createSite
);

// PUT /api/admin/sites/:siteId - Mettre à jour un site touristique
router.put('/sites/:siteId', 
  authenticate, 
  requireAdmin,
  validateAdmin.updateSite,
  adminController.updateSite
);

// DELETE /api/admin/sites/:siteId - Supprimer un site touristique
router.delete('/sites/:siteId', 
  authenticate, 
  requireAdmin, 
  adminController.deleteSite
);

module.exports = router;