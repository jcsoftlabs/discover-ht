const { prisma } = require('../config/database');

// Contrôleur pour la gestion des avis
const reviewsController = {
    // GET /api/reviews - Récupérer tous les avis
    getAllReviews: async (req, res) => {
        try {
            const { establishmentId, userId, rating, limit } = req.query;
            
            // Construction des filtres
            const whereClause = {};
            if (establishmentId) whereClause.establishmentId = establishmentId;
            if (userId) whereClause.userId = userId;
            if (rating) whereClause.rating = parseInt(rating);

            const reviews = await prisma.review.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    }
                },
                take: limit ? parseInt(limit) : undefined,
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: reviews,
                count: reviews.length,
                filters: {
                    establishmentId: establishmentId || null,
                    userId: userId || null,
                    rating: rating || null,
                    limit: limit || null
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des avis:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des avis'
            });
        }
    },

    // GET /api/reviews/:id - Récupérer un avis par ID
    getReviewById: async (req, res) => {
        try {
            const { id } = req.params;
            const review = await prisma.review.findUnique({
                where: { id },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            role: true
                        }
                    },
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true
                        }
                    }
                }
            });

            if (!review) {
                return res.status(404).json({
                    success: false,
                    error: 'Avis non trouvé'
                });
            }

            res.json({
                success: true,
                data: review
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'avis:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération de l\'avis'
            });
        }
    },

    // POST /api/reviews - Créer un nouvel avis (utilisateur connecté uniquement)
    createReview: async (req, res) => {
        try {
            const { rating, comment, establishmentId } = req.body;
            const userId = req.user.id; // Récupéré depuis le token JWT

            // Validation des données obligatoires
            if (!rating || !establishmentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Note et établissement sont obligatoires'
                });
            }

            // Validation de la note (1-5)
            const ratingNum = parseInt(rating);
            if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                return res.status(400).json({
                    success: false,
                    error: 'La note doit être entre 1 et 5'
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

            // Vérifier si l'utilisateur n'a pas déjà laissé un avis pour cet établissement
            const existingReview = await prisma.review.findFirst({
                where: {
                    userId,
                    establishmentId
                }
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    error: 'Vous avez déjà laissé un avis pour cet établissement'
                });
            }

            const review = await prisma.review.create({
                data: {
                    rating: ratingNum,
                    comment,
                    userId,
                    establishmentId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    }
                }
            });

            res.status(201).json({
                success: true,
                message: 'Avis créé avec succès',
                data: review
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'avis:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de l\'avis'
            });
        }
    },

    // PUT /api/reviews/:id - Mettre à jour un avis
    updateReview: async (req, res) => {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;

            // Vérifier si l'avis existe
            const existingReview = await prisma.review.findUnique({
                where: { id }
            });

            if (!existingReview) {
                return res.status(404).json({
                    success: false,
                    error: 'Avis non trouvé'
                });
            }

            // Validation de la note si fournie
            let ratingNum;
            if (rating !== undefined) {
                ratingNum = parseInt(rating);
                if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                    return res.status(400).json({
                        success: false,
                        error: 'La note doit être entre 1 et 5'
                    });
                }
            }

            const review = await prisma.review.update({
                where: { id },
                data: {
                    rating: ratingNum !== undefined ? ratingNum : existingReview.rating,
                    comment: comment !== undefined ? comment : existingReview.comment
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true
                        }
                    },
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    }
                }
            });

            res.json({
                success: true,
                message: 'Avis mis à jour avec succès',
                data: review
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'avis:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour de l\'avis'
            });
        }
    },

    // DELETE /api/reviews/:id - Supprimer un avis
    deleteReview: async (req, res) => {
        try {
            const { id } = req.params;

            const review = await prisma.review.findUnique({
                where: { id }
            });

            if (!review) {
                return res.status(404).json({
                    success: false,
                    error: 'Avis non trouvé'
                });
            }

            await prisma.review.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Avis supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'avis:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de l\'avis'
            });
        }
    },

    // GET /api/reviews/establishment/:establishmentId/stats - Statistiques d'avis pour un établissement
    getEstablishmentReviewStats: async (req, res) => {
        try {
            const { establishmentId } = req.params;

            // Vérifier que l'établissement existe
            const establishment = await prisma.establishment.findUnique({
                where: { id: establishmentId }
            });

            if (!establishment) {
                return res.status(404).json({
                    success: false,
                    error: 'Établissement non trouvé'
                });
            }

            const reviews = await prisma.review.findMany({
                where: { establishmentId },
                select: { rating: true }
            });

            if (reviews.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        establishmentId,
                        establishmentName: establishment.name,
                        totalReviews: 0,
                        averageRating: 0,
                        ratingDistribution: {
                            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
                        }
                    }
                });
            }

            const totalReviews = reviews.length;
            const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

            const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviews.forEach(review => {
                ratingDistribution[review.rating]++;
            });

            res.json({
                success: true,
                data: {
                    establishmentId,
                    establishmentName: establishment.name,
                    totalReviews,
                    averageRating: Math.round(averageRating * 10) / 10,
                    ratingDistribution
                }
            });
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du calcul des statistiques'
            });
        }
    },

    // GET /api/reviews/user/:userId - Récupérer tous les avis d'un utilisateur
    getUserReviews: async (req, res) => {
        try {
            const { userId } = req.params;

            // Vérifier que l'utilisateur existe
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            const reviews = await prisma.review.findMany({
                where: { userId },
                include: {
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: reviews,
                count: reviews.length,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des avis de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des avis de l\'utilisateur'
            });
        }
    }
};

module.exports = reviewsController;