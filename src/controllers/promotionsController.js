const { prisma } = require('../config/database');

// Contrôleur pour la gestion des promotions
const promotionsController = {
    // GET /api/promotions - Récupérer toutes les promotions
    getAllPromotions: async (req, res) => {
        try {
            const { active, establishmentId, limit } = req.query;
            
            // Construction des filtres
            const whereClause = {};
            if (establishmentId) whereClause.establishmentId = establishmentId;
            
            // Filtre pour les promotions actives par défaut
            if (active !== 'false') {
                whereClause.isActive = true;
                whereClause.validUntil = {
                    gte: new Date() // Promotions non expirées
                };
            }

            const promotions = await prisma.promotion.findMany({
                where: whereClause,
                include: {
                    establishment: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                            address: true,
                            partner: {
                                select: {
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                },
                take: limit ? parseInt(limit) : undefined,
                orderBy: [
                    { validUntil: 'asc' }, // Les promotions qui expirent bientôt en premier
                    { createdAt: 'desc' }
                ]
            });

            res.json({
                success: true,
                data: promotions,
                count: promotions.length,
                filters: {
                    active: active !== 'false',
                    establishmentId: establishmentId || null,
                    limit: limit || null
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des promotions:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des promotions'
            });
        }
    },

    // GET /api/promotions/:id - Récupérer une promotion par ID
    getPromotionById: async (req, res) => {
        try {
            const { id } = req.params;
            const promotion = await prisma.promotion.findUnique({
                where: { id },
                include: {
                    establishment: {
                        include: {
                            partner: {
                                select: {
                                    name: true,
                                    email: true,
                                    phone: true
                                }
                            }
                        }
                    }
                }
            });

            if (!promotion) {
                return res.status(404).json({
                    success: false,
                    error: 'Promotion non trouvée'
                });
            }

            res.json({
                success: true,
                data: promotion
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de la promotion:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération de la promotion'
            });
        }
    },

    // POST /api/promotions - Créer une nouvelle promotion
    createPromotion: async (req, res) => {
        try {
            const {
                title,
                description,
                discount,
                validFrom,
                validUntil,
                establishmentId,
                isActive = true
            } = req.body;

            // Validation des données obligatoires
            if (!title || !discount || !validFrom || !validUntil || !establishmentId) {
                return res.status(400).json({
                    success: false,
                    error: 'Titre, remise, dates de validité et établissement sont obligatoires'
                });
            }

            // Validation de la remise (0-100%)
            const discountNum = parseFloat(discount);
            if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
                return res.status(400).json({
                    success: false,
                    error: 'La remise doit être entre 0 et 100%'
                });
            }

            // Validation des dates
            const startDate = new Date(validFrom);
            const endDate = new Date(validUntil);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: 'Dates de validité invalides'
                });
            }

            if (endDate <= startDate) {
                return res.status(400).json({
                    success: false,
                    error: 'La date de fin doit être postérieure à la date de début'
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

            const promotion = await prisma.promotion.create({
                data: {
                    title,
                    description,
                    discount: discountNum,
                    validFrom: startDate,
                    validUntil: endDate,
                    isActive,
                    establishmentId
                },
                include: {
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
                message: 'Promotion créée avec succès',
                data: promotion
            });
        } catch (error) {
            console.error('Erreur lors de la création de la promotion:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de la promotion'
            });
        }
    },

    // PUT /api/promotions/:id - Mettre à jour une promotion
    updatePromotion: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title,
                description,
                discount,
                validFrom,
                validUntil,
                isActive
            } = req.body;

            // Vérifier si la promotion existe
            const existingPromotion = await prisma.promotion.findUnique({
                where: { id }
            });

            if (!existingPromotion) {
                return res.status(404).json({
                    success: false,
                    error: 'Promotion non trouvée'
                });
            }

            // Validation de la remise si fournie
            let discountNum;
            if (discount !== undefined) {
                discountNum = parseFloat(discount);
                if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
                    return res.status(400).json({
                        success: false,
                        error: 'La remise doit être entre 0 et 100%'
                    });
                }
            }

            // Validation des dates si fournies
            let startDate, endDate;
            if (validFrom) {
                startDate = new Date(validFrom);
                if (isNaN(startDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        error: 'Date de début invalide'
                    });
                }
            }

            if (validUntil) {
                endDate = new Date(validUntil);
                if (isNaN(endDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        error: 'Date de fin invalide'
                    });
                }
            }

            // Vérifier la cohérence des dates
            const finalStartDate = startDate || existingPromotion.validFrom;
            const finalEndDate = endDate || existingPromotion.validUntil;
            
            if (finalEndDate <= finalStartDate) {
                return res.status(400).json({
                    success: false,
                    error: 'La date de fin doit être postérieure à la date de début'
                });
            }

            const promotion = await prisma.promotion.update({
                where: { id },
                data: {
                    title: title || existingPromotion.title,
                    description: description !== undefined ? description : existingPromotion.description,
                    discount: discountNum !== undefined ? discountNum : existingPromotion.discount,
                    validFrom: startDate || existingPromotion.validFrom,
                    validUntil: endDate || existingPromotion.validUntil,
                    isActive: isActive !== undefined ? isActive : existingPromotion.isActive
                },
                include: {
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
                message: 'Promotion mise à jour avec succès',
                data: promotion
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la promotion:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour de la promotion'
            });
        }
    },

    // DELETE /api/promotions/:id - Supprimer une promotion
    deletePromotion: async (req, res) => {
        try {
            const { id } = req.params;

            const promotion = await prisma.promotion.findUnique({
                where: { id }
            });

            if (!promotion) {
                return res.status(404).json({
                    success: false,
                    error: 'Promotion non trouvée'
                });
            }

            await prisma.promotion.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Promotion supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de la promotion:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de la promotion'
            });
        }
    },

    // GET /api/promotions/current - Récupérer les promotions actuellement valides
    getCurrentPromotions: async (req, res) => {
        try {
            const { establishmentType, limit } = req.query;
            const now = new Date();

            // Construction des filtres
            const whereClause = {
                isActive: true,
                validFrom: { lte: now },
                validUntil: { gte: now }
            };

            // Inclure les relations avec filtres optionnels
            const includeClause = {
                establishment: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        address: true,
                        price: true
                    }
                }
            };

            // Filtre par type d'établissement si spécifié
            if (establishmentType) {
                includeClause.establishment.where = {
                    type: establishmentType.toUpperCase()
                };
            }

            const promotions = await prisma.promotion.findMany({
                where: whereClause,
                include: includeClause,
                take: limit ? parseInt(limit) : undefined,
                orderBy: [
                    { discount: 'desc' }, // Les meilleures remises en premier
                    { validUntil: 'asc' }  // Puis par date d'expiration
                ]
            });

            res.json({
                success: true,
                data: promotions,
                count: promotions.length,
                filters: {
                    establishmentType: establishmentType || null,
                    limit: limit || null
                },
                timestamp: now
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des promotions actuelles:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des promotions actuelles'
            });
        }
    },

    // GET /api/promotions/expiring - Récupérer les promotions qui expirent bientôt
    getExpiringPromotions: async (req, res) => {
        try {
            const { days = 7 } = req.query;
            const now = new Date();
            const futureDate = new Date();
            futureDate.setDate(now.getDate() + parseInt(days));

            const promotions = await prisma.promotion.findMany({
                where: {
                    isActive: true,
                    validFrom: { lte: now },
                    validUntil: {
                        gte: now,
                        lte: futureDate
                    }
                },
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
                    validUntil: 'asc'
                }
            });

            res.json({
                success: true,
                data: promotions,
                count: promotions.length,
                searchParams: {
                    days: parseInt(days),
                    expiringBefore: futureDate
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des promotions qui expirent:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des promotions qui expirent'
            });
        }
    },

    // GET /api/promotions/stats - Statistiques des promotions
    getPromotionStats: async (req, res) => {
        try {
            const now = new Date();
            
            const [totalPromotions, activePromotions, expiredPromotions, upcomingPromotions] = await Promise.all([
                prisma.promotion.count(),
                prisma.promotion.count({
                    where: {
                        isActive: true,
                        validFrom: { lte: now },
                        validUntil: { gte: now }
                    }
                }),
                prisma.promotion.count({
                    where: {
                        validUntil: { lt: now }
                    }
                }),
                prisma.promotion.count({
                    where: {
                        isActive: true,
                        validFrom: { gt: now }
                    }
                })
            ]);

            const averageDiscount = await prisma.promotion.aggregate({
                _avg: {
                    discount: true
                },
                where: {
                    isActive: true,
                    validFrom: { lte: now },
                    validUntil: { gte: now }
                }
            });

            res.json({
                success: true,
                data: {
                    totalPromotions,
                    activePromotions,
                    expiredPromotions,
                    upcomingPromotions,
                    averageDiscount: averageDiscount._avg.discount || 0
                }
            });
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du calcul des statistiques'
            });
        }
    }
};

module.exports = promotionsController;