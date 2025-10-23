const { prisma } = require('../config/database');

// Contrôleur pour les établissements avec Prisma
const establishmentsController = {
    // GET /api/establishments - Récupérer tous les établissements
    getAllEstablishments: async (req, res) => {
        try {
            const establishments = await prisma.establishment.findMany({
                include: {
                    partner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    },
                    reviews: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    },
                    promotions: {
                        where: {
                            isActive: true,
                            validUntil: {
                                gte: new Date()
                            }
                        }
                    },
                    _count: {
                        select: {
                            reviews: true,
                            promotions: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: establishments,
                count: establishments.length
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des établissements:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des établissements'
            });
        }
    },

    // GET /api/establishments/:id - Récupérer un établissement par ID
    getEstablishmentById: async (req, res) => {
        try {
            const { id } = req.params;
            const establishment = await prisma.establishment.findUnique({
                where: { id },
                include: {
                    partner: true,
                    reviews: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        }
                    },
                    promotions: {
                        where: {
                            isActive: true
                        }
                    }
                }
            });

            if (!establishment) {
                return res.status(404).json({
                    success: false,
                    error: 'Établissement non trouvé'
                });
            }

            res.json({
                success: true,
                data: establishment
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'établissement:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération de l\'établissement'
            });
        }
    },

    // POST /api/establishments - Créer un nouvel établissement
    createEstablishment: async (req, res) => {
        try {
            const {
                name,
                description,
                type,
                price,
                images,
                address,
                latitude,
                longitude,
                partnerId
            } = req.body;

            // Validation des données obligatoires
            if (!name || !type || !price) {
                return res.status(400).json({
                    success: false,
                    error: 'Nom, type et prix sont obligatoires'
                });
            }

            // Vérifier que le partenaire existe si un partnerId est fourni
            if (partnerId) {
                const partner = await prisma.partner.findUnique({
                    where: { id: partnerId }
                });

                if (!partner) {
                    return res.status(400).json({
                        success: false,
                        error: 'Partenaire non trouvé'
                    });
                }
            }

            // Gérer les images uploadées
            let imageUrls = [];
            const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
            
            // Si des fichiers ont été uploadés via multer
            if (req.files && req.files.length > 0) {
                imageUrls = req.files.map(file => `${baseUrl}/uploads/establishments/${file.filename}`);
            }
            // Si des URLs d'images sont fournies dans le body
            else if (images) {
                imageUrls = Array.isArray(images) ? images : [images];
            }

            const establishment = await prisma.establishment.create({
                data: {
                    name,
                    description,
                    type,
                    price: parseFloat(price),
                    images: imageUrls.length > 0 ? imageUrls : null,
                    address,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    partnerId
                },
                include: {
                    partner: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            res.status(201).json({
                success: true,
                message: 'Établissement créé avec succès',
                data: establishment
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'établissement:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de l\'établissement'
            });
        }
    },

    // PUT /api/establishments/:id - Mettre à jour un établissement
    updateEstablishment: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                name,
                description,
                type,
                price,
                images,
                address,
                latitude,
                longitude
            } = req.body;

            // Vérifier si l'établissement existe
            const existingEstablishment = await prisma.establishment.findUnique({
                where: { id }
            });

            if (!existingEstablishment) {
                return res.status(404).json({
                    success: false,
                    error: 'Établissement non trouvé'
                });
            }

            // Gérer les images uploadées
            let imageUrls = existingEstablishment.images || [];
            const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
            
            // Si de nouveaux fichiers ont été uploadés
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => `${baseUrl}/uploads/establishments/${file.filename}`);
                // Ajouter les nouvelles images aux images existantes
                imageUrls = [...imageUrls, ...newImages];
            }
            // Si des URLs d'images sont fournies dans le body, les remplacer
            else if (images !== undefined) {
                imageUrls = Array.isArray(images) ? images : (images ? [images] : []);
            }

            const establishment = await prisma.establishment.update({
                where: { id },
                data: {
                    name: name || existingEstablishment.name,
                    description: description !== undefined ? description : existingEstablishment.description,
                    type: type || existingEstablishment.type,
                    price: price ? parseFloat(price) : existingEstablishment.price,
                    images: imageUrls.length > 0 ? imageUrls : null,
                    address: address !== undefined ? address : existingEstablishment.address,
                    latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : existingEstablishment.latitude,
                    longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : existingEstablishment.longitude
                },
                include: {
                    partner: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            res.json({
                success: true,
                message: 'Établissement mis à jour avec succès',
                data: establishment
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'établissement:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour de l\'établissement'
            });
        }
    },

    // DELETE /api/establishments/:id - Supprimer un établissement
    deleteEstablishment: async (req, res) => {
        try {
            const { id } = req.params;

            const establishment = await prisma.establishment.findUnique({
                where: { id }
            });

            if (!establishment) {
                return res.status(404).json({
                    success: false,
                    error: 'Établissement non trouvé'
                });
            }

            await prisma.establishment.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Établissement supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'établissement:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de l\'établissement'
            });
        }
    }
};

module.exports = establishmentsController;