const { prisma } = require('../config/database');

// Contrôleur pour la gestion des favoris
const favoritesController = {
    // GET /api/favorites/user/:userId - Récupérer tous les favoris d'un utilisateur
    getUserFavorites: async (req, res) => {
        try {
            const { userId } = req.params;

            // Vérifier si l'utilisateur existe
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            const favorites = await prisma.favorite.findMany({
                where: { userId },
                include: {
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            price: true,
                            images: true,
                            address: true,
                            latitude: true,
                            longitude: true,
                            isActive: true,
                            partner: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    site: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                            address: true,
                            latitude: true,
                            longitude: true,
                            images: true,
                            entryFee: true,
                            isActive: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: favorites,
                count: favorites.length
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des favoris:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des favoris'
            });
        }
    },

    // POST /api/favorites - Ajouter un favori
    addFavorite: async (req, res) => {
        try {
            const { userId, establishmentId, siteId } = req.body;

            // Validation des données
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID utilisateur obligatoire'
                });
            }

            if (!establishmentId && !siteId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID establishment ou ID site obligatoire'
                });
            }

            if (establishmentId && siteId) {
                return res.status(400).json({
                    success: false,
                    error: 'Un favori ne peut pas avoir à la fois un establishment et un site'
                });
            }

            // Vérifier si l'utilisateur existe
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            // Vérifier si l'establishment ou le site existe
            if (establishmentId) {
                const establishment = await prisma.establishment.findUnique({
                    where: { id: establishmentId }
                });

                if (!establishment) {
                    return res.status(404).json({
                        success: false,
                        error: 'Establishment non trouvé'
                    });
                }

                // Vérifier si le favori existe déjà
                const existingFavorite = await prisma.favorite.findUnique({
                    where: {
                        userId_establishmentId: {
                            userId,
                            establishmentId
                        }
                    }
                });

                if (existingFavorite) {
                    return res.status(409).json({
                        success: false,
                        error: 'Cet establishment est déjà dans vos favoris'
                    });
                }
            }

            if (siteId) {
                const site = await prisma.site.findUnique({
                    where: { id: siteId }
                });

                if (!site) {
                    return res.status(404).json({
                        success: false,
                        error: 'Site non trouvé'
                    });
                }

                // Vérifier si le favori existe déjà
                const existingFavorite = await prisma.favorite.findUnique({
                    where: {
                        userId_siteId: {
                            userId,
                            siteId
                        }
                    }
                });

                if (existingFavorite) {
                    return res.status(409).json({
                        success: false,
                        error: 'Ce site est déjà dans vos favoris'
                    });
                }
            }

            const favorite = await prisma.favorite.create({
                data: {
                    userId,
                    establishmentId: establishmentId || null,
                    siteId: siteId || null
                },
                include: {
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            type: true
                        }
                    },
                    site: {
                        select: {
                            id: true,
                            name: true,
                            category: true
                        }
                    }
                }
            });

            res.status(201).json({
                success: true,
                message: 'Favori ajouté avec succès',
                data: favorite
            });
        } catch (error) {
            console.error('Erreur lors de l\'ajout du favori:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'ajout du favori'
            });
        }
    },

    // DELETE /api/favorites/:id - Supprimer un favori
    deleteFavorite: async (req, res) => {
        try {
            const { id } = req.params;

            // Vérifier si le favori existe
            const favorite = await prisma.favorite.findUnique({
                where: { id }
            });

            if (!favorite) {
                return res.status(404).json({
                    success: false,
                    error: 'Favori non trouvé'
                });
            }

            await prisma.favorite.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Favori supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du favori:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression du favori'
            });
        }
    },

    // DELETE /api/favorites/user/:userId/establishment/:establishmentId - Supprimer un favori par userId et establishmentId
    deleteFavoriteByUserAndEstablishment: async (req, res) => {
        try {
            const { userId, establishmentId } = req.params;

            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_establishmentId: {
                        userId,
                        establishmentId
                    }
                }
            });

            if (!favorite) {
                return res.status(404).json({
                    success: false,
                    error: 'Favori non trouvé'
                });
            }

            await prisma.favorite.delete({
                where: {
                    userId_establishmentId: {
                        userId,
                        establishmentId
                    }
                }
            });

            res.json({
                success: true,
                message: 'Favori supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du favori:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression du favori'
            });
        }
    },

    // DELETE /api/favorites/user/:userId/site/:siteId - Supprimer un favori par userId et siteId
    deleteFavoriteByUserAndSite: async (req, res) => {
        try {
            const { userId, siteId } = req.params;

            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_siteId: {
                        userId,
                        siteId
                    }
                }
            });

            if (!favorite) {
                return res.status(404).json({
                    success: false,
                    error: 'Favori non trouvé'
                });
            }

            await prisma.favorite.delete({
                where: {
                    userId_siteId: {
                        userId,
                        siteId
                    }
                }
            });

            res.json({
                success: true,
                message: 'Favori supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du favori:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression du favori'
            });
        }
    },

    // GET /api/favorites/check - Vérifier si un item est en favori
    checkFavorite: async (req, res) => {
        try {
            const { userId, establishmentId, siteId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID utilisateur obligatoire'
                });
            }

            if (!establishmentId && !siteId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID establishment ou ID site obligatoire'
                });
            }

            let whereClause = { userId };

            if (establishmentId) {
                whereClause.establishmentId = establishmentId;
            } else {
                whereClause.siteId = siteId;
            }

            const favorite = await prisma.favorite.findFirst({
                where: whereClause
            });

            res.json({
                success: true,
                data: {
                    isFavorite: !!favorite,
                    favoriteId: favorite?.id || null
                }
            });
        } catch (error) {
            console.error('Erreur lors de la vérification du favori:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la vérification du favori'
            });
        }
    }
};

module.exports = favoritesController;