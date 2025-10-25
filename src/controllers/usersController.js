const { prisma } = require('../config/database');
const bcrypt = require('bcrypt');

// Contrôleur pour la gestion des utilisateurs
const usersController = {
    // GET /api/users - Récupérer tous les utilisateurs
    getAllUsers: async (req, res) => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    country: true,
                    role: true,
                    createdAt: true,
                    // Exclure le mot de passe pour la sécurité
                    _count: {
                        select: {
                            reviews: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: users,
                count: users.length
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des utilisateurs'
            });
        }
    },

    // GET /api/users/:id - Récupérer un utilisateur par ID
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    country: true,
                    role: true,
                    createdAt: true,
                    reviews: {
                        include: {
                            establishment: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
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

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération de l\'utilisateur'
            });
        }
    },

    // POST /api/users - Créer un nouvel utilisateur
    createUser: async (req, res) => {
        try {
            const { firstName, lastName, email, password, country, role } = req.body;

            // Validation des données
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Prénom, nom, email et mot de passe sont obligatoires'
                });
            }

            // Validation du pays pour les utilisateurs normaux
            if ((!role || role === 'USER') && !country) {
                return res.status(400).json({
                    success: false,
                    error: 'Le pays est obligatoire pour l\'inscription'
                });
            }

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

            // Validation du rôle
            const validRoles = ['USER', 'ADMIN', 'PARTNER'];
            if (role && !validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    error: 'Rôle invalide. Rôles acceptés: USER, ADMIN, PARTNER'
                });
            }

            // Hasher le mot de passe
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const user = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    country: country || null,
                    role: role || 'USER'
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    country: true,
                    role: true,
                    createdAt: true
                }
            });

            // Si l'utilisateur est un PARTNER, créer automatiquement l'entrée Partner
            if (user.role === 'PARTNER') {
                try {
                    await prisma.partner.create({
                        data: {
                            name: `${firstName} ${lastName}`,
                            email: email,
                            description: `Compte partenaire de ${firstName} ${lastName}`,
                            status: 'PENDING' // Nécessite une approbation admin
                        }
                    });
                    console.log(`✅ Entrée Partner créée automatiquement pour: ${email}`);
                } catch (partnerError) {
                    // Si le Partner existe déjà (email unique), on ignore l'erreur
                    if (partnerError.code !== 'P2002') {
                        console.error('⚠️ Erreur lors de la création du Partner:', partnerError);
                    }
                }
            }

            res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès',
                data: user
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de l\'utilisateur'
            });
        }
    },

    // PUT /api/users/:id - Mettre à jour un utilisateur
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { firstName, lastName, email, country, role } = req.body;

            // Vérifier si l'utilisateur existe
            const existingUser = await prisma.user.findUnique({
                where: { id }
            });

            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            // Si l'email change, vérifier qu'il n'existe pas déjà
            if (email && email !== existingUser.email) {
                const emailExists = await prisma.user.findUnique({
                    where: { email }
                });

                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        error: 'Un utilisateur avec cet email existe déjà'
                    });
                }
            }

            // Validation du rôle
            const validRoles = ['USER', 'ADMIN', 'PARTNER'];
            if (role && !validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    error: 'Rôle invalide. Rôles acceptés: USER, ADMIN, PARTNER'
                });
            }

            const user = await prisma.user.update({
                where: { id },
                data: {
                    firstName: firstName || existingUser.firstName,
                    lastName: lastName || existingUser.lastName,
                    email: email || existingUser.email,
                    country: country !== undefined ? country : existingUser.country,
                    role: role || existingUser.role
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    country: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            res.json({
                success: true,
                message: 'Utilisateur mis à jour avec succès',
                data: user
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour de l\'utilisateur'
            });
        }
    },

    // DELETE /api/users/:id - Supprimer un utilisateur
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({
                where: { id }
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Utilisateur non trouvé'
                });
            }

            await prisma.user.delete({
                where: { id }
            });

            res.json({
                success: true,
                message: 'Utilisateur supprimé avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de l\'utilisateur'
            });
        }
    },

    // GET /api/users/role/:role - Récupérer les utilisateurs par rôle
    getUsersByRole: async (req, res) => {
        try {
            const { role } = req.params;
            const validRoles = ['USER', 'ADMIN', 'PARTNER'];
            
            if (!validRoles.includes(role.toUpperCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Rôle invalide. Rôles acceptés: USER, ADMIN, PARTNER'
                });
            }

            const users = await prisma.user.findMany({
                where: { role: role.toUpperCase() },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    country: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: {
                            reviews: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: users,
                count: users.length,
                role: role.toUpperCase()
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs par rôle:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des utilisateurs par rôle'
            });
        }
    }
};

module.exports = usersController;