const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

/**
 * Contrôleur pour l'interface administrateur
 * Permet aux administrateurs de gérer les utilisateurs, valider les partenaires, 
 * modérer les avis et gérer les sites touristiques
 */

// Dashboard - Vue d'ensemble administrative
const getDashboard = async (req, res) => {
  try {
    // Statistiques générales du système
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.partner.count(),
      prisma.establishment.count(),
      prisma.site.count(),
      prisma.review.count(),
      prisma.promotion.count(),
      // Statistiques spécifiques
      prisma.partner.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.establishment.count({ where: { isActive: true } }),
      prisma.site.count({ where: { isActive: true } })
    ]);

    const [
      totalUsers, totalPartners, totalEstablishments, totalSites, 
      totalReviews, totalPromotions, pendingPartners, pendingReviews,
      activeEstablishments, activeSites
    ] = stats;

    // Activité récente
    const recentActivity = await Promise.all([
      prisma.partner.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, status: true, createdAt: true }
      }),
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        where: { status: 'PENDING' },
        include: {
          user: { select: { firstName: true, lastName: true } },
          establishment: { select: { name: true } }
        }
      })
    ]);

    const [recentPartners, recentPendingReviews] = recentActivity;

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalPartners,
          totalEstablishments,
          totalSites,
          totalReviews,
          totalPromotions,
          pendingPartners,
          pendingReviews,
          activeEstablishments,
          activeSites
        },
        recentActivity: {
          recentPartners,
          recentPendingReviews
        }
      }
    });

  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// === GESTION DES UTILISATEURS ===

// Récupérer tous les utilisateurs avec pagination et filtres
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const whereClause = {};
    if (role) whereClause.role = role;
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { reviews: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalItems: totalUsers,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Récupérer un utilisateur spécifique
const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        reviews: {
          include: {
            establishment: {
              select: { name: true, type: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true, validatedPartners: true, moderatedReviews: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Masquer le mot de passe
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Erreur récupération utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Créer un nouvel utilisateur (réservé aux admins)
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const creatorId = req.user.id;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Hacher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: `Compte ${role.toLowerCase()} créé avec succès`,
      data: newUser
    });

  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Mettre à jour le rôle d'un utilisateur
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Empêcher un admin de se rétrograder lui-même
    if (userId === adminId && role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Vous ne pouvez pas modifier votre propre rôle'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Rôle utilisateur mis à jour avec succès',
      data: updatedUser
    });

  } catch (error) {
    console.error('Erreur mise à jour rôle:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// === GESTION DES PARTENAIRES ===

// Récupérer tous les partenaires avec filtres
const getPartners = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const whereClause = {};
    if (status) whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const [partners, totalPartners] = await Promise.all([
      prisma.partner.findMany({
        where: whereClause,
        include: {
          validator: {
            select: { firstName: true, lastName: true }
          },
          _count: {
            select: { establishments: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.partner.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: partners,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPartners / parseInt(limit)),
        totalItems: totalPartners,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération partenaires:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Récupérer un partenaire spécifique
const getPartner = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: {
        validator: {
          select: { firstName: true, lastName: true }
        },
        establishments: {
          include: {
            _count: {
              select: { reviews: true, promotions: true }
            }
          }
        }
      }
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partenaire non trouvé'
      });
    }

    res.json({
      success: true,
      data: partner
    });

  } catch (error) {
    console.error('Erreur récupération partenaire:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Valider/Rejeter un partenaire
const updatePartnerStatus = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { status, reason } = req.body;
    const validatorId = req.user.id;

    const partner = await prisma.partner.findUnique({
      where: { id: partnerId }
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: 'Partenaire non trouvé'
      });
    }

    const updatedPartner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        status,
        validatedBy: validatorId,
        validatedAt: new Date()
      },
      include: {
        validator: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    res.json({
      success: true,
      message: `Partenaire ${status === 'APPROVED' ? 'approuvé' : 'rejeté'} avec succès`,
      data: updatedPartner
    });

  } catch (error) {
    console.error('Erreur validation partenaire:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// === MODÉRATION DES AVIS ===

// Récupérer les avis en attente de modération
const getReviewsToModerate = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'PENDING' } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const whereClause = { status };

    const [reviews, totalReviews] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true }
          },
          establishment: {
            include: {
              partner: {
                select: { name: true }
              }
            }
          },
          moderator: {
            select: { firstName: true, lastName: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReviews / parseInt(limit)),
        totalItems: totalReviews,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération avis à modérer:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Modérer un avis (approuver/rejeter)
const moderateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, moderationNote } = req.body;
    const moderatorId = req.user.id;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        establishment: { select: { name: true } }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Avis non trouvé'
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
        moderationNote
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        establishment: { select: { name: true } },
        moderator: { select: { firstName: true, lastName: true } }
      }
    });

    res.json({
      success: true,
      message: `Avis ${status === 'APPROVED' ? 'approuvé' : 'rejeté'} avec succès`,
      data: updatedReview
    });

  } catch (error) {
    console.error('Erreur modération avis:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// === GESTION DES SITES TOURISTIQUES ===

// Récupérer tous les sites avec pagination
const getSites = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isActive, search } = req.query;
    const skip = (page - 1) * parseInt(limit);

    const whereClause = {};
    if (category) whereClause.category = category;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } }
      ];
    }

    const [sites, totalSites] = await Promise.all([
      prisma.site.findMany({
        where: whereClause,
        include: {
          creator: {
            select: { firstName: true, lastName: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.site.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: sites,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSites / parseInt(limit)),
        totalItems: totalSites,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur récupération sites:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Créer un nouveau site touristique
const createSite = async (req, res) => {
  try {
    const siteData = req.body;
    const creatorId = req.user.id;

    const site = await prisma.site.create({
      data: {
        ...siteData,
        createdBy: creatorId
      },
      include: {
        creator: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Site touristique créé avec succès',
      data: site
    });

  } catch (error) {
    console.error('Erreur création site:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Mettre à jour un site touristique
const updateSite = async (req, res) => {
  try {
    const { siteId } = req.params;
    const updateData = req.body;

    const existingSite = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!existingSite) {
      return res.status(404).json({
        success: false,
        error: 'Site non trouvé'
      });
    }

    const updatedSite = await prisma.site.update({
      where: { id: siteId },
      data: updateData,
      include: {
        creator: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Site mis à jour avec succès',
      data: updatedSite
    });

  } catch (error) {
    console.error('Erreur mise à jour site:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Supprimer un site touristique
const deleteSite = async (req, res) => {
  try {
    const { siteId } = req.params;

    const existingSite = await prisma.site.findUnique({
      where: { id: siteId }
    });

    if (!existingSite) {
      return res.status(404).json({
        success: false,
        error: 'Site non trouvé'
      });
    }

    await prisma.site.delete({
      where: { id: siteId }
    });

    res.json({
      success: true,
      message: 'Site supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression site:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// === STATISTIQUES ET RAPPORTS ===

// Générer des statistiques détaillées
const getStatistics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // derniers X jours
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    const stats = await Promise.all([
      // Nouveaux utilisateurs
      prisma.user.count({
        where: { createdAt: { gte: dateFrom } }
      }),
      // Nouveaux partenaires
      prisma.partner.count({
        where: { createdAt: { gte: dateFrom } }
      }),
      // Nouveaux établissements
      prisma.establishment.count({
        where: { createdAt: { gte: dateFrom } }
      }),
      // Nouveaux avis
      prisma.review.count({
        where: { createdAt: { gte: dateFrom } }
      }),
      // Distribution des types d'établissements
      prisma.establishment.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      // Distribution des catégories de sites
      prisma.site.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      // Avis par note
      prisma.review.groupBy({
        by: ['rating'],
        _count: { rating: true },
        where: { status: 'APPROVED' }
      })
    ]);

    const [
      newUsers, newPartners, newEstablishments, newReviews,
      establishmentTypes, siteCategories, reviewRatings
    ] = stats;

    res.json({
      success: true,
      data: {
        period: parseInt(period),
        newUsers,
        newPartners,
        newEstablishments,
        newReviews,
        distributions: {
          establishmentTypes,
          siteCategories,
          reviewRatings
        }
      }
    });

  } catch (error) {
    console.error('Erreur génération statistiques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUser,
  createUser,
  updateUserRole,
  getPartners,
  getPartner,
  updatePartnerStatus,
  getReviewsToModerate,
  moderateReview,
  getSites,
  createSite,
  updateSite,
  deleteSite,
  getStatistics
};
