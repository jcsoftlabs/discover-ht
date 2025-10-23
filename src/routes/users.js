const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, requireRole, requireOwnershipOrRole } = require('../middleware/auth');
const { validateCreateUser, validateUpdateUser, validateId, validateRole } = require('../middleware/validation');

// Routes pour les utilisateurs

// GET /api/users - Récupérer tous les utilisateurs (ADMIN seulement)
router.get('/', authenticateToken, requireRole(['ADMIN']), usersController.getAllUsers);

// GET /api/users/role/:role - Récupérer les utilisateurs par rôle (ADMIN seulement)
router.get('/role/:role', authenticateToken, requireRole(['ADMIN']), validateRole, usersController.getUsersByRole);

// GET /api/users/:id - Récupérer un utilisateur par ID (propriétaire ou ADMIN)
router.get('/:id', authenticateToken, requireOwnershipOrRole(['ADMIN']), validateId, usersController.getUserById);

// POST /api/users - Créer un nouvel utilisateur (ADMIN seulement - ou utiliser /auth/register)
router.post('/', authenticateToken, requireRole(['ADMIN']), validateCreateUser, usersController.createUser);

// PUT /api/users/:id - Mettre à jour un utilisateur (propriétaire ou ADMIN)
router.put('/:id', authenticateToken, requireOwnershipOrRole(['ADMIN']), validateUpdateUser, usersController.updateUser);

// DELETE /api/users/:id - Supprimer un utilisateur (ADMIN seulement)
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), validateId, usersController.deleteUser);

module.exports = router;