const express = require('express');
const router = express.Router();
const sitesController = require('../controllers/sitesController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');
const { uploadMultipleSites, uploadCSV, handleUploadError } = require('../middleware/upload');

// Routes pour les sites touristiques

// GET /api/sites/stats - Statistiques des sites
router.get('/stats', sitesController.getSiteStats);

// GET /api/sites/nearby - Récupérer les sites proches d'une position
router.get('/nearby', sitesController.getNearby);

// GET /api/sites - Récupérer tous les sites
router.get('/', sitesController.getAllSites);

// GET /api/sites/:id - Récupérer un site par ID
router.get('/:id', sitesController.getSiteById);

// POST /api/sites - Créer un nouveau site avec upload d'images (ADMIN seulement)
router.post('/', 
    authenticateToken, 
    requireRole(['ADMIN']), 
    uploadMultipleSites,
    handleUploadError,
    sitesController.createSite
);

// PUT /api/sites/:id - Mettre à jour un site avec upload d'images (ADMIN seulement)
router.put('/:id', 
    authenticateToken, 
    requireRole(['ADMIN']), 
    validateId,
    uploadMultipleSites,
    handleUploadError,
    sitesController.updateSite
);

// DELETE /api/sites/:id - Supprimer un site (ADMIN seulement)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), validateId, sitesController.deleteSite);

// POST /api/sites/import-csv - Importer des sites depuis un CSV (ADMIN seulement)
router.post('/import-csv', 
    authenticateToken, 
    requireRole(['ADMIN']), 
    uploadCSV, 
    handleUploadError,
    sitesController.importFromCSV
);

module.exports = router;
