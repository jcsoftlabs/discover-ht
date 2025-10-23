const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');

// Routes pour les favoris

// GET /api/favorites/user/:userId - Récupérer tous les favoris d'un utilisateur
router.get('/user/:userId', favoritesController.getUserFavorites);

// GET /api/favorites/check - Vérifier si un item est en favori
// Query params: userId, establishmentId ou siteId
router.get('/check', favoritesController.checkFavorite);

// POST /api/favorites - Ajouter un favori
// Body: { userId, establishmentId OR siteId }
router.post('/', favoritesController.addFavorite);

// DELETE /api/favorites/:id - Supprimer un favori par ID
router.delete('/:id', favoritesController.deleteFavorite);

// DELETE /api/favorites/user/:userId/establishment/:establishmentId - Supprimer un favori establishment
router.delete('/user/:userId/establishment/:establishmentId', favoritesController.deleteFavoriteByUserAndEstablishment);

// DELETE /api/favorites/user/:userId/site/:siteId - Supprimer un favori site
router.delete('/user/:userId/site/:siteId', favoritesController.deleteFavoriteByUserAndSite);

module.exports = router;