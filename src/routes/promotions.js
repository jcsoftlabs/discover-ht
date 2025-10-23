const express = require('express');
const router = express.Router();
const promotionsController = require('../controllers/promotionsController');

// Routes pour les promotions

// GET /api/promotions/current - Récupérer les promotions actuellement valides
router.get('/current', promotionsController.getCurrentPromotions);

// GET /api/promotions/expiring - Récupérer les promotions qui expirent bientôt
router.get('/expiring', promotionsController.getExpiringPromotions);

// GET /api/promotions/stats - Statistiques des promotions
router.get('/stats', promotionsController.getPromotionStats);

// GET /api/promotions - Récupérer toutes les promotions
router.get('/', promotionsController.getAllPromotions);

// GET /api/promotions/:id - Récupérer une promotion par ID
router.get('/:id', promotionsController.getPromotionById);

// POST /api/promotions - Créer une nouvelle promotion
router.post('/', promotionsController.createPromotion);

// PUT /api/promotions/:id - Mettre à jour une promotion
router.put('/:id', promotionsController.updatePromotion);

// DELETE /api/promotions/:id - Supprimer une promotion
router.delete('/:id', promotionsController.deletePromotion);

module.exports = router;