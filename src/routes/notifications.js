const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les notifications

// GET /api/notifications/unread/count - Compter les notifications non lues
router.get('/unread/count', notificationsController.getUnreadCount);

// PATCH /api/notifications/mark-all-read - Marquer toutes les notifications comme lues
router.patch('/mark-all-read', notificationsController.markAllAsRead);

// GET /api/notifications - Récupérer toutes les notifications de l'utilisateur connecté
router.get('/', notificationsController.getUserNotifications);

// POST /api/notifications/review-invitation - Créer une notification d'invitation à laisser un avis (admin/system)
router.post('/review-invitation', notificationsController.createReviewInvitation);

// GET /api/notifications/:id - Récupérer une notification par ID
router.get('/:id', notificationsController.getNotificationById);

// PATCH /api/notifications/:id/read - Marquer une notification comme lue
router.patch('/:id/read', notificationsController.markAsRead);

// DELETE /api/notifications/:id - Supprimer une notification
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
