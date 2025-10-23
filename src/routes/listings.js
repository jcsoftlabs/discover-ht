const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');

// Routes pour les annonces (listings)

// GET /api/listings - Récupérer toutes les annonces
router.get('/', listingsController.getAllListings);

// GET /api/listings/:id - Récupérer une annonce par ID
router.get('/:id', listingsController.getListingById);

// POST /api/listings - Créer une nouvelle annonce
router.post('/', listingsController.createListing);

// PUT /api/listings/:id - Mettre à jour une annonce
router.put('/:id', listingsController.updateListing);

// DELETE /api/listings/:id - Supprimer une annonce
router.delete('/:id', listingsController.deleteListing);

module.exports = router;