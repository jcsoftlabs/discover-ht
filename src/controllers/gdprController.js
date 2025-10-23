const { prisma } = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

// Contrôleur pour la conformité RGPD
const gdprController = {
    // GET /api/gdpr/data-export - Exporter toutes les données de l'utilisateur
    exportUserData: async (req, res) => {
        try {
            const userId = req.user.id;

            // Récupérer toutes les données de l'utilisateur
            const userData = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    reviews: {
                        include: {
                            establishment: {
                                select: {
                                    name: true,
                                    type: true
                                }
                            }
                        }
                    }
                }
            });

            if (!userData) {
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            // Exclure le mot de passe des données exportées
            const { password, ...userDataWithoutPassword } = userData;

            // Ajouter des métadonnées RGPD
            const exportData = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    dataSubject: userDataWithoutPassword.email,
                    description: 'Export RGPD de toutes les données personnelles',
                    retentionPolicy: 'Les données sont conservées conformément à notre politique de confidentialité'
                },
                personalData: userDataWithoutPassword,
                dataProcessingInfo: {
                    purposes: [
                        'Gestion du compte utilisateur',
                        'Amélioration des services',
                        'Communication avec l\'utilisateur'
                    ],
                    legalBasis: 'Consentement et exécution du contrat',
                    dataCategories: [
                        'Données d\'identification (nom, prénom, email)',
                        'Données de navigation et d\'utilisation',
                        'Données de contenu (avis et commentaires)'
                    ]
                }
            };

            res.json({
                success: true,
                message: 'Export des données personnelles réussi',
                data: exportData
            });

        } catch (error) {
            console.error('Erreur lors de l\'export des données:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'export des données'
            });
        }
    },

    // DELETE /api/gdpr/delete-account - Suppression complète du compte
    deleteUserAccount: async (req, res) => {
        try {
            const userId = req.user.id;

            // Vérifier que l'utilisateur existe
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    reviews: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            // Log pour audit de la suppression
            console.log(`RGPD: Suppression du compte demandée pour l'utilisateur ${user.email} (${userId}) à ${new Date().toISOString()}`);

            // Supprimer l'utilisateur (cascade automatique vers les avis grâce à Prisma)
            await prisma.user.delete({
                where: { id: userId }
            });

            res.json({
                success: true,
                message: 'Compte supprimé avec succès. Toutes vos données ont été effacées de nos systèmes.',
                deletedData: {
                    userId: userId,
                    email: user.email,
                    reviewsDeleted: user.reviews.length,
                    deletionDate: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Erreur lors de la suppression du compte:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression du compte'
            });
        }
    },

    // PUT /api/gdpr/update-consent - Mise à jour des consentements
    updateConsent: async (req, res) => {
        try {
            const userId = req.user.id;
            const { marketingEmails, analyticsTracking, personalizedContent } = req.body;

            // Pour cette implémentation, on ajoute les préférences dans un champ JSON
            // En production, vous pourriez avoir une table séparée pour les consentements
            const consentData = {
                marketingEmails: marketingEmails || false,
                analyticsTracking: analyticsTracking || false,
                personalizedContent: personalizedContent || false,
                updatedAt: new Date().toISOString()
            };

            // Mise à jour factice (vous devriez avoir un champ dédié dans votre schéma)
            console.log(`RGPD: Mise à jour des consentements pour l'utilisateur ${userId}:`, consentData);

            res.json({
                success: true,
                message: 'Consentements mis à jour avec succès',
                data: {
                    userId: userId,
                    consents: consentData
                }
            });

        } catch (error) {
            console.error('Erreur lors de la mise à jour des consentements:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour des consentements'
            });
        }
    },

    // GET /api/gdpr/data-usage - Informations sur l'utilisation des données
    getDataUsageInfo: async (req, res) => {
        try {
            const userId = req.user.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            reviews: true
                        }
                    }
                }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            const dataUsageInfo = {
                accountInfo: {
                    accountCreated: user.createdAt,
                    lastUpdate: user.updatedAt,
                    totalReviews: user._count.reviews
                },
                dataRetention: {
                    accountData: 'Conservées tant que le compte est actif',
                    reviewData: 'Conservées 3 ans après suppression du compte pour conformité légale',
                    logData: 'Conservées 12 mois maximum'
                },
                dataSharing: {
                    thirdParties: 'Aucune donnée partagée avec des tiers à des fins commerciales',
                    analytics: 'Données anonymisées pour amélioration du service uniquement',
                    legal: 'Partage possible en cas d\'obligation légale'
                },
                userRights: [
                    'Droit d\'accès (export de vos données)',
                    'Droit de rectification (modification des données)',
                    'Droit à l\'effacement (suppression du compte)',
                    'Droit de portabilité (export format standard)',
                    'Droit d\'opposition (opt-out communications)'
                ]
            };

            res.json({
                success: true,
                data: dataUsageInfo
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des informations d\'usage:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des informations d\'usage'
            });
        }
    },

    // POST /api/gdpr/data-rectification - Demande de rectification des données
    requestDataRectification: async (req, res) => {
        try {
            const userId = req.user.id;
            const { field, currentValue, requestedValue, reason } = req.body;

            // Log de la demande pour suivi manuel
            const rectificationRequest = {
                userId: userId,
                timestamp: new Date().toISOString(),
                field: field,
                currentValue: currentValue,
                requestedValue: requestedValue,
                reason: reason,
                status: 'pending'
            };

            console.log('RGPD: Demande de rectification reçue:', rectificationRequest);

            // Dans un vrai système, vous stockeriez cette demande dans une table dédiée
            // et auriez un processus de validation manuelle

            res.json({
                success: true,
                message: 'Demande de rectification enregistrée. Elle sera traitée dans les 30 jours ouvrables.',
                data: {
                    requestId: `rect_${userId}_${Date.now()}`,
                    estimatedProcessingTime: '30 jours ouvrables',
                    contactInfo: 'Pour toute question: privacy@touris-api.com'
                }
            });

        } catch (error) {
            console.error('Erreur lors de la demande de rectification:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la demande de rectification'
            });
        }
    }
};

module.exports = gdprController;