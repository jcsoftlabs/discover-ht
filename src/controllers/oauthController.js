const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

// Client IDs Google supportés (Web + iOS)
const GOOGLE_CLIENT_IDS = [
    process.env.GOOGLE_CLIENT_ID_WEB || '955108400371-uik3onuhrlibvaik5l6j0a28t8ajg0sd.apps.googleusercontent.com',
    process.env.GOOGLE_CLIENT_ID_IOS || '955108400371-ehi0ndlb0750m6rii0t4ep2sjuabnuo8.apps.googleusercontent.com'
].filter(Boolean);

// Initialiser le client Google OAuth (utilise le premier Client ID par défaut)
const client = new OAuth2Client(GOOGLE_CLIENT_IDS[0]);

/**
 * Vérifier le token Google et créer/authentifier l'utilisateur
 */
const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                error: 'Token Google requis'
            });
        }

        // Vérifier le token Google avec tous les Client IDs supportés
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: GOOGLE_CLIENT_IDS  // Accepte Web ET iOS
        });

        const payload = ticket.getPayload();
        const googleId = payload.sub;
        const email = payload.email;
        const firstName = payload.given_name || '';
        const lastName = payload.family_name || '';
        const profilePicture = payload.picture || null;

        // Vérifier si l'email est vérifié par Google
        if (!payload.email_verified) {
            return res.status(400).json({
                success: false,
                error: 'Email non vérifié par Google'
            });
        }

        // Chercher l'utilisateur par googleId ou email
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: googleId },
                    { email: email }
                ]
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                googleId: true,
                provider: true,
                profilePicture: true,
                createdAt: true
            }
        });

        let isNewUser = false;

        if (!user) {
            // Créer un nouvel utilisateur
            user = await prisma.user.create({
                data: {
                    googleId: googleId,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    profilePicture: profilePicture,
                    provider: 'google',
                    password: null, // Pas de mot de passe pour OAuth
                    role: 'USER'
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    googleId: true,
                    provider: true,
                    profilePicture: true,
                    createdAt: true
                }
            });
            isNewUser = true;
        } else if (!user.googleId) {
            // Lier le compte existant avec Google
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: googleId,
                    provider: 'google',
                    profilePicture: profilePicture || user.profilePicture
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    googleId: true,
                    provider: true,
                    profilePicture: true,
                    createdAt: true
                }
            });
        }

        // Générer un JWT pour notre application
        const jwtToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Retourner les informations de l'utilisateur et le token
        res.json({
            success: true,
            message: isNewUser ? 'Compte créé avec succès' : 'Connexion réussie',
            isNewUser: isNewUser,
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profilePicture: user.profilePicture,
                provider: user.provider,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Erreur lors de l\'authentification Google:', error);

        // Gérer les erreurs spécifiques de vérification du token
        if (error.message && error.message.includes('Token used too late')) {
            return res.status(401).json({
                success: false,
                error: 'Token Google expiré'
            });
        }

        if (error.message && error.message.includes('Invalid token signature')) {
            return res.status(401).json({
                success: false,
                error: 'Token Google invalide'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'authentification Google',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Dissocier le compte Google de l'utilisateur
 */
const unlinkGoogle = async (req, res) => {
    try {
        const userId = req.user.id;

        // Vérifier si l'utilisateur a un mot de passe
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                password: true,
                googleId: true,
                provider: true
            }
        });

        if (!user.googleId) {
            return res.status(400).json({
                success: false,
                error: 'Aucun compte Google lié'
            });
        }

        // Si l'utilisateur n'a pas de mot de passe, il ne peut pas dissocier Google
        if (!user.password) {
            return res.status(400).json({
                success: false,
                error: 'Vous devez d\'abord définir un mot de passe avant de dissocier votre compte Google'
            });
        }

        // Dissocier le compte Google
        await prisma.user.update({
            where: { id: userId },
            data: {
                googleId: null,
                provider: 'local'
            }
        });

        res.json({
            success: true,
            message: 'Compte Google dissocié avec succès'
        });

    } catch (error) {
        console.error('Erreur lors de la dissociation du compte Google:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la dissociation du compte Google'
        });
    }
};

module.exports = {
    googleLogin,
    unlinkGoogle
};
