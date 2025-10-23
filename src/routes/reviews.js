const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { authenticateToken } = require('../middleware/auth');

// Routes pour les avis

// GET /api/reviews/establishment/:establishmentId/stats - Statistiques d'avis pour un établissement
router.get('/establishment/:establishmentId/stats', reviewsController.getEstablishmentReviewStats);

// GET /api/reviews/user/:userId - Récupérer tous les avis d'un utilisateur
router.get('/user/:userId', reviewsController.getUserReviews);

// GET /api/reviews - Récupérer tous les avis
router.get('/', reviewsController.getAllReviews);

// GET /api/reviews/:id - Récupérer un avis par ID
router.get('/:id', reviewsController.getReviewById);

// POST /api/reviews - Créer un nouvel avis (authentification requise)
router.post('/', authenticateToken, reviewsController.createReview);

// PUT /api/reviews/:id - Mettre à jour un avis
router.put('/:id', reviewsController.updateReview);

// DELETE /api/reviews/:id - Supprimer un avis
router.delete('/:id', reviewsController.deleteReview);

module.exports = router;
