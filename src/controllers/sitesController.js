const { prisma } = require('../config/database');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Contrôleur pour la gestion des sites touristiques
const sitesController = {
    // GET /api/sites - Récupérer tous les sites
    getAllSites: async (req, res) => {
        try {
            const { search, limit } = req.query;
            
            // Construction de la requête avec filtres optionnels
            const whereClause = search ? {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } },
                    { address: { contains: search } }
                ]
            } : {};

            const sites = await prisma.site.findMany({
                where: whereClause,
                take: limit ? parseInt(limit) : undefined,
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: sites,
                count: sites.length,
                filters: {
                    search: search || null,
                    limit: limit || null
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des sites:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des sites'
            });
        }
    },

    // GET /api/sites/:id - Récupérer un site par ID
    getSiteById: async (req, res) => {
        try {
            const { id } = req.params;
            const site = await prisma.site.findUnique({
                where: { id }
            });

            if (!site) {
                return res.status(404).json({
                    success: false,
                    error: 'Site non trouvé'
                });
            }

            res.json({
                success: true,
                data: site
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du site:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération du site'
            });
        }
    },

    // POST /api/sites - Créer un nouveau site
    createSite: async (req, res) => {
        try {
            const { name, description, address, ville, departement, latitude, longitude, images } = req.body;

            // Validation des données obligatoires
            if (!name || !address || !latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    error: 'Nom, adresse, latitude et longitude sont obligatoires'
                });
            }

            // Validation des coordonnées GPS
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return res.status(400).json({
                    success: false,
                    error: 'Coordonnées GPS invalides'
                });
            }

            // Gérer les images uploadées
            let imageUrls = [];
            
            // Si des fichiers ont été uploadés via multer
            if (req.files && req.files.length > 0) {
                imageUrls = req.files.map(file => `/uploads/sites/${file.filename}`);
            }
            // Si des URLs d'images sont fournies dans le body
            else if (images) {
                imageUrls = Array.isArray(images) ? images : [images];
            }

            const site = await prisma.site.create({
                data: {
                    name,
                    description,
                    address,
                    ville,
                    departement,
                    latitude: lat,
                    longitude: lng,
                    images: imageUrls.length > 0 ? imageUrls : null
                }
            });

            res.status(201).json({
                success: true,
                message: 'Site créé avec succès',
                data: site
            });
        } catch (error) {
            console.error('Erreur lors de la création du site:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création du site'
            });
        }
    },

    // PUT /api/sites/:id - Mettre à jour un site
    updateSite: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, description, address, ville, departement, latitude, longitude, images } = req.body;

            // Vérifier si le site existe
            const existingSite = await prisma.site.findUnique({
                where: { id }
            });

            if (!existingSite) {
                return res.status(404).json({
                    success: false,
                    error: 'Site non trouvé'
                });
            }

            // Validation des coordonnées GPS si fournies
            let lat, lng;
            if (latitude !== undefined) {
                lat = parseFloat(latitude);
                if (isNaN(lat) || lat < -90 || lat > 90) {
                    return res.status(400).json({
                        success: false,
                        error: 'Latitude invalide'
                    });
                }
            }
            
            if (longitude !== undefined) {
                lng = parseFloat(longitude);
                if (isNaN(lng) || lng < -180 || lng > 180) {
                    return res.status(400).json({
                        success: false,
                        error: 'Longitude invalide'
                    });
                }
            }

            // Gérer les images uploadées
            let imageUrls = existingSite.images || [];
            
            // Si de nouveaux fichiers ont été uploadés
            if (req.files && req.files.length > 0) {
                const newImages = req.files.map(file => `/uploads/sites/${file.filename}`);
                // Ajouter les nouvelles images aux images existantes
                imageUrls = [...imageUrls, ...newImages];
            }
            // Si des URLs d'images sont fournies dans le body, les remplacer
            else if (images !== undefined) {
                imageUrls = Array.isArray(images) ? images : (images ? [images] : []);
            }

            const site = await prisma.site.update({
                where: { id },
                data: {
                    name: name || existingSite.name,
                    description: description !== undefined ? description : existingSite.description,
                    address: address || existingSite.address,
                    ville: ville !== undefined ? ville : existingSite.ville,
                    departement: departement !== undefined ? departement : existingSite.departement,
                    latitude: lat !== undefined ? lat : existingSite.latitude,
                    longitude: lng !== undefined ? lng : existingSite.longitude,
                    images: imageUrls.length > 0 ? imageUrls : null
                }
            });

            res.json({
                success: true,
                message: 'Site mis à jour avec succès',
                data: site
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du site:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour du site'
            });
        }
    },

    // DELETE /api/sites/:id - Supprimer un site
    deleteSite: async (req, res) => {
        try {
            const { id } = req.params;

            const site = await prisma.site.findUnique({
                where: { id }
            });

            if (!site) {
                return res.status(404).json({
                    success: false,
                    error: 'Site non trouvé'
                });
            }

            await prisma.site.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Site supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du site:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression du site'
            });
        }
    },

    // GET /api/sites/nearby - Récupérer les sites proches d'une position
    getNearby: async (req, res) => {
        try {
            const { latitude, longitude, radius } = req.query;

            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    error: 'Latitude et longitude sont obligatoires'
                });
            }

            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const searchRadius = parseFloat(radius) || 10; // 10km par défaut

            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return res.status(400).json({
                    success: false,
                    error: 'Coordonnées GPS invalides'
                });
            }

            // Note: Cette requête est simplifiée. Pour une recherche par distance précise,
            // il faudrait utiliser des fonctions géospatiales MySQL ou une formule de distance
            const sites = await prisma.site.findMany({
                where: {
                    latitude: {
                        gte: lat - (searchRadius / 111), // Approximation: 1 degré ≈ 111 km
                        lte: lat + (searchRadius / 111)
                    },
                    longitude: {
                        gte: lng - (searchRadius / 111),
                        lte: lng + (searchRadius / 111)
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });

            res.json({
                success: true,
                data: sites,
                count: sites.length,
                searchParams: {
                    latitude: lat,
                    longitude: lng,
                    radius: searchRadius
                }
            });
        } catch (error) {
            console.error('Erreur lors de la recherche de sites proches:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la recherche de sites proches'
            });
        }
    },

    // GET /api/sites/stats - Statistiques des sites
    getSiteStats: async (req, res) => {
        try {
            const totalSites = await prisma.site.count();
            
            const sitesWithImages = await prisma.site.count({
                where: {
                    images: { not: null }
                }
            });

            res.json({
                success: true,
                data: {
                    totalSites,
                    sitesWithImages,
                    sitesWithoutImages: totalSites - sitesWithImages
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des statistiques'
            });
        }
    },

    // POST /api/sites/import-csv - Importer des sites depuis un fichier CSV
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
                    if (!row.name || !row.address || !row.latitude || !row.longitude) {
                        errors.push({
                            line: lineNumber,
                            error: 'Champs obligatoires manquants (name, address, latitude, longitude)',
                            data: row
                        });
                        continue;
                    }

                    // Validation des coordonnées GPS
                    const lat = parseFloat(row.latitude);
                    const lng = parseFloat(row.longitude);
                    
                    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                        errors.push({
                            line: lineNumber,
                            error: 'Coordonnées GPS invalides',
                            data: row
                        });
                        continue;
                    }

                    // Traiter les images (si fournies comme URLs séparées par des pipes)
                    let imageUrls = null;
                    if (row.images) {
                        imageUrls = row.images.split('|').map(url => url.trim()).filter(url => url);
                    }

                    // Créer le site
                    const site = await prisma.site.create({
                        data: {
                            name: row.name.trim(),
                            description: row.description ? row.description.trim() : null,
                            address: row.address.trim(),
                            ville: row.ville ? row.ville.trim() : null,
                            departement: row.departement ? row.departement.trim() : null,
                            latitude: lat,
                            longitude: lng,
                            images: imageUrls
                        }
                    });

                    results.push({
                        line: lineNumber,
                        success: true,
                        id: site.id,
                        name: site.name
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
                message: `Import terminé: ${results.length} sites créés, ${errors.length} erreurs`,
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

module.exports = sitesController;
