const { prisma } = require('../config/database');

// Contrôleur pour la gestion des notifications
const notificationsController = {
    // GET /api/notifications - Récupérer toutes les notifications d'un utilisateur connecté
    getUserNotifications: async (req, res) => {
        try {
            const userId = req.user.id;
            const { isRead, limit } = req.query;
            
            // Construction des filtres
            const whereClause = { userId };
            if (isRead !== undefined) {
                whereClause.isRead = isRead === 'true';
            }

            const notifications = await prisma.notification.findMany({
                where: whereClause,
                take: limit ? parseInt(limit) : undefined,
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // Compter les notifications non lues
            const unreadCount = await prisma.notification.count({
                where: {
                    userId,
                    isRead: false
                }
            });

            res.json({
                success: true,
                data: notifications,
                count: notifications.length,
                unreadCount
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des notifications:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des notifications'
            });
        }
    },

    // GET /api/notifications/:id - Récupérer une notification par ID
    getNotificationById: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const notification = await prisma.notification.findFirst({
                where: {
                    id,
                    userId // Vérifier que la notification appartient à l'utilisateur
                }
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification non trouvée'
                });
            }

            res.json({
                success: true,
                data: notification
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la notification:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération de la notification'
            });
        }
    },

    // POST /api/notifications/review-invitation - Créer une notification d'invitation à laisser un avis
    createReviewInvitation: async (req, res) => {
        try {
            const { userId, establishmentId } = req.body;

            // Validation des données obligatoires
            if (!userId || !establishmentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Utilisateur et établissement sont obligatoires'
                });
            }

            // Vérifier que l'utilisateur existe
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            // Vérifier que l'établissement existe
            const establishment = await prisma.establishment.findUnique({
                where: { id: establishmentId }
            });

            if (!establishment) {
                return res.status(400).json({
                    success: false,
                    error: 'Établissement non trouvé'
                });
            }

            // Vérifier si l'utilisateur a déjà un avis pour cet établissement
            const existingReview = await prisma.review.findFirst({
                where: {
                    userId,
                    establishmentId
                }
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    error: 'L\'utilisateur a déjà laissé un avis pour cet établissement'
                });
            }

            // Vérifier s'il existe déjà une notification non lue pour cet établissement
            const existingNotification = await prisma.notification.findFirst({
                where: {
                    userId,
                    establishmentId,
                    type: 'REVIEW_INVITATION',
                    isRead: false
                }
            });

            if (existingNotification) {
                return res.status(400).json({
                    success: false,
                    error: 'Une invitation est déjà en attente pour cet établissement'
                });
            }

            // Créer la notification
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    type: 'REVIEW_INVITATION',
                    title: `Donnez votre avis sur ${establishment.name}`,
                    message: `Vous avez récemment visité ${establishment.name}. Partagez votre expérience en laissant un avis !`,
                    establishmentId
                }
            });

            res.status(201).json({
                success: true,
                message: 'Notification d\'invitation créée avec succès',
                data: notification
            });
        } catch (error) {
            console.error('Erreur lors de la création de la notification:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de la notification'
            });
        }
    },

    // PATCH /api/notifications/:id/read - Marquer une notification comme lue
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Vérifier que la notification existe et appartient à l'utilisateur
            const notification = await prisma.notification.findFirst({
                where: {
                    id,
                    userId
                }
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification non trouvée'
                });
            }

            // Mettre à jour la notification
            const updatedNotification = await prisma.notification.update({
                where: { id },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            });

            res.json({
                success: true,
                message: 'Notification marquée comme lue',
                data: updatedNotification
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la notification:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour de la notification'
            });
        }
    },

    // PATCH /api/notifications/mark-all-read - Marquer toutes les notifications comme lues
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user.id;

            const result = await prisma.notification.updateMany({
                where: {
                    userId,
                    isRead: false
                },
                data: {
                    isRead: true,
                    readAt: new Date()
                }
            });

            res.json({
                success: true,
                message: `${result.count} notification(s) marquée(s) comme lue(s)`,
                count: result.count
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des notifications:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour des notifications'
            });
        }
    },

    // DELETE /api/notifications/:id - Supprimer une notification
    deleteNotification: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Vérifier que la notification existe et appartient à l'utilisateur
            const notification = await prisma.notification.findFirst({
                where: {
                    id,
                    userId
                }
            });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification non trouvée'
                });
            }

            await prisma.notification.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Notification supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la notification:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de la notification'
            });
        }
    },

    // GET /api/notifications/unread/count - Compter les notifications non lues
    getUnreadCount: async (req, res) => {
        try {
            const userId = req.user.id;

            const count = await prisma.notification.count({
                where: {
                    userId,
                    isRead: false
                }
            });

            res.json({
                success: true,
                data: {
                    count
                }
            });
        } catch (error) {
            console.error('Erreur lors du comptage des notifications:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du comptage des notifications'
            });
        }
    }
};

module.exports = notificationsController;
