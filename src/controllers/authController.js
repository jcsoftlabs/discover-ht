const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');

// Configuration des tokens
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 jours

// Configuration des cookies sécurisés
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS en production
  sameSite: 'strict',
  path: '/'
};

// Génération de token d'accès
const generateAccessToken = (userId, email, role, userType) => {
  return jwt.sign(
    { userId, email, role, userType },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// Génération de refresh token
const generateRefreshToken = (userId, email, userType) => {
  return jwt.sign(
    { userId, email, userType },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

// Contrôleur pour l'authentification
const authController = {
    // POST /api/auth/register - Inscription d'un nouvel utilisateur
    register: async (req, res) => {
        try {
            const { firstName, lastName, email, password, country, role } = req.body;

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

            // Hasher le mot de passe
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Créer l'utilisateur
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

            // Générer le token JWT
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email, 
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { 
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
                    issuer: 'touris-api',
                    audience: 'touris-client'
                }
            );

            // Définir le cookie sécurisé
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24h
            });

            // Envoyer l'email de bienvenue (asynchrone, ne bloque pas la réponse)
            sendWelcomeEmail(email, firstName)
                .then((emailResult) => {
                    if (emailResult.success) {
                        console.log('📧 Email de bienvenue envoyé à:', email);
                        if (process.env.NODE_ENV === 'development' && emailResult.previewUrl) {
                            console.log('🔗 URL de prévisualisation:', emailResult.previewUrl);
                        }
                    } else {
                        console.error('⚠️ Erreur envoi email de bienvenue:', emailResult.error);
                    }
                })
                .catch((error) => {
                    console.error('⚠️ Erreur lors de l\'envoi de l\'email de bienvenue:', error);
                });

            res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès',
                data: {
                    user,
                    token
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'inscription'
            });
        }
    },

    // POST /api/auth/login - Connexion utilisateur
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Rechercher l'utilisateur
            const user = await prisma.user.findUnique({
                where: { email }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Email ou mot de passe incorrect'
                });
            }

            // Vérifier le mot de passe
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Email ou mot de passe incorrect'
                });
            }

            // Générer le token JWT
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    email: user.email, 
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { 
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
                    issuer: 'touris-api',
                    audience: 'touris-client'
                }
            );

            // Définir le cookie sécurisé
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24h
            });

            // Réponse sans le mot de passe
            const userResponse = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            };

            res.json({
                success: true,
                message: 'Connexion réussie',
                data: {
                    user: userResponse,
                    token
                }
            });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la connexion'
            });
        }
    },

    // POST /api/auth/login/admin - Connexion administrateur
    loginAdmin: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email et mot de passe requis.'
                });
            }

            // Trouver l'utilisateur
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    role: true,
                    firstName: true,
                    lastName: true
                }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Email ou mot de passe incorrect.'
                });
            }

            // Vérifier que l'utilisateur est admin
            if (user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    error: 'Accès refusé. Droits administrateur requis.'
                });
            }

            // Vérifier le mot de passe
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Email ou mot de passe incorrect.'
                });
            }

            // Générer les tokens
            const accessToken = generateAccessToken(user.id, user.email, user.role, 'user');
            const refreshToken = generateRefreshToken(user.id, user.email, 'user');

            // Sauvegarder le refresh token
            await prisma.user.update({
                where: { id: user.id },
                data: { refreshToken }
            });

            // Définir les cookies
            res.cookie('accessToken', accessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000
            });
            res.cookie('refreshToken', refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({
                success: true,
                message: 'Connexion réussie.',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        firstName: user.firstName,
                        lastName: user.lastName
                    },
                    accessToken,
                    refreshToken
                }
            });
        } catch (error) {
            console.error('Erreur login admin:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la connexion.'
            });
        }
    },

    // POST /api/auth/login/partner - Connexion partenaire
    loginPartner: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email et mot de passe requis.'
                });
            }

            // Trouver le partenaire
            const partner = await prisma.partner.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    name: true,
                    status: true
                }
            });

            if (!partner || !partner.password) {
                return res.status(401).json({
                    success: false,
                    error: 'Email ou mot de passe incorrect.'
                });
            }

            // Vérifier le mot de passe
            const isPasswordValid = await bcrypt.compare(password, partner.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Email ou mot de passe incorrect.'
                });
            }

            // Vérifier le statut du partenaire
            if (partner.status !== 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    error: 'Votre compte est en attente de validation par le ministère.',
                    status: partner.status
                });
            }

            // Générer les tokens
            const accessToken = generateAccessToken(partner.id, partner.email, 'PARTNER', 'partner');
            const refreshToken = generateRefreshToken(partner.id, partner.email, 'partner');

            // Sauvegarder le refresh token
            await prisma.partner.update({
                where: { id: partner.id },
                data: { refreshToken }
            });

            // Définir les cookies
            res.cookie('accessToken', accessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000
            });
            res.cookie('refreshToken', refreshToken, {
                ...cookieOptions,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({
                success: true,
                message: 'Connexion réussie.',
                data: {
                    partner: {
                        id: partner.id,
                        email: partner.email,
                        name: partner.name,
                        status: partner.status
                    },
                    accessToken,
                    refreshToken
                }
            });
        } catch (error) {
            console.error('Erreur login partenaire:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la connexion.'
            });
        }
    },

    // POST /api/auth/refresh - Rafraîchir l'access token
    refreshAccessToken: async (req, res) => {
        try {
            const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token manquant.'
                });
            }

            // Vérifier le refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // Vérifier le type d'utilisateur
            let entity = null;
            let userType = decoded.userType;
            
            if (userType === 'partner') {
                entity = await prisma.partner.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        status: true,
                        refreshToken: true
                    }
                });
            } else {
                entity = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        firstName: true,
                        lastName: true,
                        refreshToken: true
                    }
                });
            }

            if (!entity) {
                return res.status(401).json({
                    success: false,
                    error: 'Utilisateur non trouvé.'
                });
            }

            // Vérifier que le refresh token correspond
            if (entity.refreshToken !== refreshToken) {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token invalide.'
                });
            }

            // Générer un nouveau access token
            const role = userType === 'partner' ? 'PARTNER' : entity.role;
            const newAccessToken = generateAccessToken(entity.id, entity.email, role, userType);

            // Définir le nouveau cookie
            res.cookie('accessToken', newAccessToken, {
                ...cookieOptions,
                maxAge: 15 * 60 * 1000
            });

            res.json({
                success: true,
                message: 'Token renouvelé avec succès.',
                data: {
                    accessToken: newAccessToken
                }
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token expiré. Veuillez vous reconnecter.'
                });
            }
            
            console.error('Erreur refresh token:', error);
            res.status(401).json({
                success: false,
                error: 'Token invalide.'
            });
        }
    },

    // POST /api/auth/logout - Déconnexion utilisateur
    logout: async (req, res) => {
        try {
            const userId = req.user?.id;
            const userType = req.user?.userType;

            if (userId) {
                // Supprimer le refresh token de la base de données
                if (userType === 'partner') {
                    await prisma.partner.update({
                        where: { id: userId },
                        data: { refreshToken: null }
                    });
                } else {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { refreshToken: null }
                    });
                }
            }

            // Supprimer les cookies
            res.clearCookie('authToken');
            res.clearCookie('accessToken', cookieOptions);
            res.clearCookie('refreshToken', cookieOptions);

            res.json({
                success: true,
                message: 'Déconnexion réussie'
            });
        } catch (error) {
            console.error('Erreur logout:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la déconnexion.'
            });
        }
    },

    // GET /api/auth/me - Informations utilisateur connecté
    getProfile: async (req, res) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    country: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            reviews: true
                        }
                    }
                }
            });

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération du profil'
            });
        }
    },

    // PUT /api/auth/change-password - Changement de mot de passe
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            // Récupérer l'utilisateur avec le mot de passe
            const user = await prisma.user.findUnique({
                where: { id: req.user.id }
            });

            // Vérifier le mot de passe actuel
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);

            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Mot de passe actuel incorrect'
                });
            }

            // Hasher le nouveau mot de passe
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Mettre à jour le mot de passe
            await prisma.user.update({
                where: { id: req.user.id },
                data: { password: hashedNewPassword }
            });

            res.json({
                success: true,
                message: 'Mot de passe modifié avec succès'
            });
        } catch (error) {
            console.error('Erreur lors du changement de mot de passe:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors du changement de mot de passe'
            });
        }
    },

    // POST /api/auth/request-reset - Demande de réinitialisation de mot de passe
    requestPasswordReset: async (req, res) => {
        try {
            const { email } = req.body;

            // Vérifier que l'utilisateur existe
            const user = await prisma.user.findUnique({
                where: { email }
            });

            // Toujours renvoyer un message de succès pour des raisons de sécurité
            // (ne pas révéler si un email existe ou non)
            const successMessage = 'Si cet email existe dans notre système, vous recevrez un lien de réinitialisation';

            if (!user) {
                return res.json({
                    success: true,
                    message: successMessage
                });
            }

            // Générer un token de réinitialisation sécurisé
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

            // Sauvegarder le token dans la base de données
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExpires
                }
            });

            // Envoyer l'email de réinitialisation
            const emailResult = await sendPasswordResetEmail(email, user.firstName, resetToken);
            
            if (!emailResult.success) {
                console.error('⚠️ Erreur envoi email:', emailResult.error);
                // Ne pas échouer la requête si l'email n'a pas pu être envoyé
                // L'utilisateur voit quand même le message de succès pour la sécurité
            } else {
                console.log('📧 Email de réinitialisation envoyé avec succès');
                if (process.env.NODE_ENV === 'development' && emailResult.previewUrl) {
                    console.log('🔗 URL de prévisualisation:', emailResult.previewUrl);
                }
            }

            res.json({
                success: true,
                message: successMessage,
                // En développement, on peut inclure le token
                ...(process.env.NODE_ENV === 'development' && { 
                    dev_info: { token: resetToken, expires: resetTokenExpires } 
                })
            });

        } catch (error) {
            console.error('Erreur lors de la demande de réinitialisation:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la demande de réinitialisation'
            });
        }
    },

    // POST /api/auth/reset-password - Réinitialisation du mot de passe
    resetPassword: async (req, res) => {
        try {
            const { token, newPassword } = req.body;

            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'Token de réinitialisation requis'
                });
            }

            // Rechercher l'utilisateur avec le token valide et non expiré
            const user = await prisma.user.findFirst({
                where: {
                    resetToken: token,
                    resetTokenExpires: {
                        gt: new Date() // Token non expiré
                    }
                }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: 'Token de réinitialisation invalide ou expiré'
                });
            }

            // Hacher le nouveau mot de passe
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Mettre à jour le mot de passe et supprimer le token
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpires: null
                }
            });

            res.json({
                success: true,
                message: 'Mot de passe réinitialisé avec succès'
            });

        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la réinitialisation du mot de passe'
            });
        }
    }
};

module.exports = authController;