const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Contrôleur pour l'interface partenaire
 * Permet aux partenaires de gérer leurs établissements, menus, disponibilités et promotions
 */

// Fonction helper pour récupérer le partnerId associé à un utilisateur
const getPartnerIdFromUser = async (userEmail) => {
  const partner = await prisma.partner.findFirst({
    where: { email: userEmail }
  });
  
  if (!partner) {
    throw new Error('Aucun partenaire associé à cet utilisateur');
  }
  
  return partner.id;
};

// Dashboard - Vue d'ensemble du partenaire
const getDashboard = async (req, res) => {
  try {
    // Récupérer le partenaire lié à cet utilisateur
    const partner = await prisma.partner.findFirst({
      where: { email: req.user.email }
    });
    
    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Aucun partenaire associé à cet utilisateur'
      });
    }
    
    const partnerId = partner.id;
    
    // Récupérer les statistiques complètes du partenaire
    const partnerWithStats = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        establishments: {
          include: {
            reviews: true,
            promotions: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!partnerWithStats) {
      return res.status(404).json({
        success: false,
        error: 'Partenaire non trouvé'
      });
    }

    // Calculer les statistiques
    const stats = {
      totalEstablishments: partnerWithStats.establishments.length,
      activeEstablishments: partnerWithStats.establishments.filter(e => e.isActive).length,
      totalReviews: partnerWithStats.establishments.reduce((sum, e) => sum + e.reviews.length, 0),
      averageRating: 0,
      activePromotions: partnerWithStats.establishments.reduce((sum, e) => sum + e.promotions.length, 0)
    };

    // Calculer la note moyenne
    const allReviews = partnerWithStats.establishments.flatMap(e => e.reviews);
    if (allReviews.length > 0) {
      stats.averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    }

    res.json({
      success: true,
      data: {
        partner: {
          id: partnerWithStats.id,
          name: partnerWithStats.name,
          email: partnerWithStats.email,
          status: partnerWithStats.status,
          validatedAt: partnerWithStats.validatedAt
        },
        stats,
        recentReviews: allReviews.slice(-5).reverse()
      }
    });

  } catch (error) {
    console.error('Erreur dashboard partenaire:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Gestion des établissements

// Récupérer tous les établissements du partenaire
const getEstablishments = async (req, res) => {
  try {
    const partnerId = await getPartnerIdFromUser(req.user.email);
    
    const establishments = await prisma.establishment.findMany({
      where: { partnerId },
      include: {
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        promotions: {
          where: { isActive: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: establishments,
      count: establishments.length
    });

  } catch (error) {
    console.error('Erreur récupération établissements:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Récupérer un établissement spécifique
const getEstablishment = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const partnerId = await getPartnerIdFromUser(req.user.email);
    
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        partnerId 
      },
      include: {
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        promotions: true
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
    console.error('Erreur récupération établissement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Mettre à jour les informations d'un établissement
const updateEstablishment = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const partnerId = await getPartnerIdFromUser(req.user.email);
    const updateData = req.body;

    // Vérifier que l'établissement appartient au partenaire
    const existingEstablishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        partnerId 
      }
    });

    if (!existingEstablishment) {
      return res.status(404).json({
        success: false,
        error: 'Établissement non trouvé'
      });
    }

    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: updateData,
      include: {
        reviews: true,
        promotions: true
      }
    });

    res.json({
      success: true,
      message: 'Établissement mis à jour avec succès',
      data: updatedEstablishment
    });

  } catch (error) {
    console.error('Erreur mise à jour établissement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Gestion des menus/services
const updateMenu = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const partnerId = await getPartnerIdFromUser(req.user.email);
    const { menu } = req.body;

    // Vérifier que l'établissement appartient au partenaire
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        partnerId 
      }
    });

    if (!establishment) {
      return res.status(404).json({
        success: false,
        error: 'Établissement non trouvé'
      });
    }

    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: { menu }
    });

    res.json({
      success: true,
      message: 'Menu/Services mis à jour avec succès',
      data: { menu: updatedEstablishment.menu }
    });

  } catch (error) {
    console.error('Erreur mise à jour menu:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Gestion des disponibilités
const updateAvailability = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const partnerId = await getPartnerIdFromUser(req.user.email);
    const { availability } = req.body;

    // Vérifier que l'établissement appartient au partenaire
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        partnerId 
      }
    });

    if (!establishment) {
      return res.status(404).json({
        success: false,
        error: 'Établissement non trouvé'
      });
    }

    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: { availability }
    });

    res.json({
      success: true,
      message: 'Disponibilités mises à jour avec succès',
      data: { availability: updatedEstablishment.availability }
    });

  } catch (error) {
    console.error('Erreur mise à jour disponibilités:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Gestion des images
const updateImages = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const partnerId = await getPartnerIdFromUser(req.user.email);
    const { images } = req.body;

    // Vérifier que l'établissement appartient au partenaire
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        partnerId 
      }
    });

    if (!establishment) {
      return res.status(404).json({
        success: false,
        error: 'Établissement non trouvé'
      });
    }

    const updatedEstablishment = await prisma.establishment.update({
      where: { id: establishmentId },
      data: { images }
    });

    res.json({
      success: true,
      message: 'Images mises à jour avec succès',
      data: { images: updatedEstablishment.images }
    });

  } catch (error) {
    console.error('Erreur mise à jour images:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Gestion des promotions

// Récupérer les promotions d'un établissement
const getPromotions = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const partnerId = await getPartnerIdFromUser(req.user.email);

    // Vérifier que l'établissement appartient au partenaire
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        partnerId 
      }
    });

    if (!establishment) {
      return res.status(404).json({
        success: false,
        error: 'Établissement non trouvé'
      });
    }

    const promotions = await prisma.promotion.findMany({
      where: { establishmentId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: promotions,
      count: promotions.length
    });

  } catch (error) {
    console.error('Erreur récupération promotions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Créer une nouvelle promotion
const createPromotion = async (req, res) => {
  try {
    const { establishmentId } = req.params;
    const partnerId = await getPartnerIdFromUser(req.user.email);
    const promotionData = req.body;

    // Vérifier que l'établissement appartient au partenaire
    const establishment = await prisma.establishment.findFirst({
      where: { 
        id: establishmentId,
        partnerId 
      }
    });

    if (!establishment) {
      return res.status(404).json({
        success: false,
        error: 'Établissement non trouvé'
      });
    }

    const promotion = await prisma.promotion.create({
      data: {
        ...promotionData,
        establishmentId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Promotion créée avec succès',
      data: promotion
    });

  } catch (error) {
    console.error('Erreur création promotion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Mettre à jour une promotion
const updatePromotion = async (req, res) => {
  try {
    const { establishmentId, promotionId } = req.params;
    const partnerId = await getPartnerIdFromUser(req.user.email);
    const updateData = req.body;

    // Vérifier que la promotion appartient à un établissement du partenaire
    const promotion = await prisma.promotion.findFirst({
      where: { 
        id: promotionId,
        establishment: {
          id: establishmentId,
          partnerId
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion non trouvée'
      });
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Promotion mise à jour avec succès',
      data: updatedPromotion
    });

  } catch (error) {
    console.error('Erreur mise à jour promotion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Supprimer une promotion
const deletePromotion = async (req, res) => {
  try {
    const { establishmentId, promotionId } = req.params;
    const partnerId = await getPartnerIdFromUser(req.user.email);

    // Vérifier que la promotion appartient à un établissement du partenaire
    const promotion = await prisma.promotion.findFirst({
      where: { 
        id: promotionId,
        establishment: {
          id: establishmentId,
          partnerId
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion non trouvée'
      });
    }

    await prisma.promotion.delete({
      where: { id: promotionId }
    });

    res.json({
      success: true,
      message: 'Promotion supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression promotion:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Gestion des avis - Répondre aux avis (fonctionnalité future)
const getReviews = async (req, res) => {
  try {
    const partnerId = await getPartnerIdFromUser(req.user.email);
    const { establishmentId } = req.params;
    
    const whereClause = { 
      establishment: { partnerId }
    };
    
    if (establishmentId) {
      whereClause.establishmentId = establishmentId;
    }

    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        user: {
          select: { firstName: true, lastName: true }
        },
        establishment: {
          select: { name: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });

  } catch (error) {
    console.error('Erreur récupération avis:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

module.exports = {
  getDashboard,
  getEstablishments,
  getEstablishment,
  updateEstablishment,
  updateMenu,
  updateAvailability,
  updateImages,
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getReviews
};