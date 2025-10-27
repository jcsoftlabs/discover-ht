const { prisma } = require('../config/database');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

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
                ville,
                departement,
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
                    ville,
                    departement,
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
                ville,
                departement,
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
                    ville: ville !== undefined ? ville : existingEstablishment.ville,
                    departement: departement !== undefined ? departement : existingEstablishment.departement,
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
    },

    // POST /api/establishments/import-csv - Importer des établissements depuis un fichier CSV
    importFromCSV: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Aucun fichier CSV fourni'
                });
            }

            const filePath = req.file.path;
            const results = [];
            const errors = [];
            let lineNumber = 1;

            // Lire et parser le fichier CSV
            const stream = fs.createReadStream(filePath)
                .pipe(csv({
                    separator: ',',
                    mapHeaders: ({ header }) => header.trim().toLowerCase()
                }));

            for await (const row of stream) {
                lineNumber++;
                try {
                    // Validation des champs obligatoires
                    if (!row.name || !row.type || !row.price) {
                        errors.push({
                            line: lineNumber,
                            error: 'Champs obligatoires manquants (name, type, price)',
                            data: row
                        });
                        continue;
                    }

                    // Vérifier que le partenaire existe si un partnerId est fourni
                    let validPartnerId = null;
                    if (row.partnerid && row.partnerid.trim() !== '') {
                        const partner = await prisma.partner.findUnique({
                            where: { id: row.partnerid.trim() }
                        });

                        if (!partner) {
                            errors.push({
                                line: lineNumber,
                                error: `Partenaire non trouvé: ${row.partnerid}`,
                                data: row
                            });
                            continue;
                        }
                        validPartnerId = row.partnerid.trim();
                    }

                    // Traiter les images (si fournies comme URLs séparées par des virgules)
                    let imageUrls = null;
                    if (row.images) {
                        imageUrls = row.images.split('|').map(url => url.trim()).filter(url => url);
                    }

                    // Créer l'établissement
                    const establishment = await prisma.establishment.create({
                        data: {
                            name: row.name.trim(),
                            description: row.description ? row.description.trim() : null,
                            type: row.type.trim(),
                            price: parseFloat(row.price),
                            images: imageUrls,
                            address: row.address ? row.address.trim() : null,
                            ville: row.ville ? row.ville.trim() : null,
                            departement: row.departement ? row.departement.trim() : null,
                            latitude: row.latitude ? parseFloat(row.latitude) : null,
                            longitude: row.longitude ? parseFloat(row.longitude) : null,
                            partnerId: validPartnerId
                        }
                    });

                    results.push({
                        line: lineNumber,
                        success: true,
                        id: establishment.id,
                        name: establishment.name
                    });
                } catch (error) {
                    errors.push({
                        line: lineNumber,
                        error: error.message,
                        data: row
                    });
                }
            }

            // Supprimer le fichier CSV temporaire
            fs.unlinkSync(filePath);

            res.status(201).json({
                success: true,
                message: `Import terminé: ${results.length} établissements créés, ${errors.length} erreurs`,
                data: {
                    created: results,
                    errors: errors,
                    summary: {
                        total: lineNumber - 1,
                        success: results.length,
                        failed: errors.length
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'import CSV:', error);
            
            // Nettoyer le fichier temporaire en cas d'erreur
            if (req.file && req.file.path) {
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    console.error('Erreur lors de la suppression du fichier temporaire:', cleanupError);
                }
            }

            res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'import CSV',
                details: error.message
            });
        }
    }
};

module.exports = establishmentsController;
