const express = require('express');
const router = express.Router();
const establishmentsController = require('../controllers/establishmentsController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateCreateEstablishment, validateId } = require('../middleware/validation');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

// Routes pour les établissements

// GET /api/establishments - Récupérer tous les établissements (public)
router.get('/', establishmentsController.getAllEstablishments);

// GET /api/establishments/:id - Récupérer un établissement par ID (public)
router.get('/:id', validateId, establishmentsController.getEstablishmentById);

// POST /api/establishments - Créer un nouvel établissement avec upload d'images (PARTNER ou ADMIN)
router.post('/', 
    authenticateToken, 
    requireRole(['PARTNER', 'ADMIN']), 
    uploadMultiple, 
    handleUploadError,
    validateCreateEstablishment, 
    establishmentsController.createEstablishment
);

// PUT /api/establishments/:id - Mettre à jour un établissement avec upload d'images (PARTNER ou ADMIN)
router.put('/:id', 
    authenticateToken, 
    requireRole(['PARTNER', 'ADMIN']), 
    validateId,
    uploadMultiple,
    handleUploadError,
    establishmentsController.updateEstablishment
);

// DELETE /api/establishments/:id - Supprimer un établissement (ADMIN seulement)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), validateId, establishmentsController.deleteEstablishment);

module.exports = router;