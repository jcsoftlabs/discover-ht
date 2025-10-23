const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

// Middleware d'authentification JWT (supporte cookies et headers)
const authenticateToken = async (req, res, next) => {
    try {
        // Récupérer le token depuis le cookie ou le header Authorization
        const authHeader = req.headers['authorization'];
        const headerToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        const cookieToken = req.cookies?.accessToken;
        const token = cookieToken || headerToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token d\'authentification requis'
            });
        }

        // Vérification du token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier le type d'utilisateur (user/admin ou partner)
        let user = null;
        if (decoded.userType === 'partner') {
            user = await prisma.partner.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    status: true
                }
            });
            
            if (user) {
                user.userType = 'partner';
                user.role = 'PARTNER';
            }
        } else {
            user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    firstName: true,
                    lastName: true
                }
            });
            
            if (user) {
                user.userType = 'user';
            }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Utilisateur non trouvé'
            });
        }

        // Ajouter les informations utilisateur à la requête
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Token invalide'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expiré'
            });
        }
        
        console.error('Erreur d\'authentification:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur d\'authentification'
        });
    }
};

// Middleware pour vérifier les rôles
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentification requise'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Permissions insuffisantes'
            });
        }

        next();
    };
};

// Middleware pour vérifier que l'utilisateur peut modifier ses propres données
const requireOwnershipOrRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentification requise'
            });
        }

        // L'utilisateur peut modifier ses propres données ou avoir le bon rôle
        const canAccess = req.user.id === req.params.id || roles.includes(req.user.role);
        
        if (!canAccess) {
            return res.status(403).json({
                success: false,
                error: 'Accès non autorisé'
            });
        }

        next();
    };
};

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Accès refusé. Droits administrateur requis.'
        });
    }
    next();
};

// Middleware pour vérifier si le partenaire est validé
const isValidatedPartner = async (req, res, next) => {
    try {
        if (!req.user || req.user.userType !== 'partner') {
            return res.status(403).json({
                success: false,
                error: 'Accès refusé. Compte partenaire requis.'
            });
        }

        if (req.user.status !== 'APPROVED') {
            return res.status(403).json({
                success: false,
                error: 'Compte partenaire en attente de validation par le ministère.'
            });
        }

        next();
    } catch (error) {
        console.error('Erreur vérification partenaire:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la vérification du statut du partenaire.'
        });
    }
};

// Middleware pour vérifier si c'est un partenaire (même non validé)
const isPartner = (req, res, next) => {
    if (!req.user || req.user.userType !== 'partner') {
        return res.status(403).json({
            success: false,
            error: 'Accès refusé. Compte partenaire requis.'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireRole,
    requireOwnershipOrRole,
    isAdmin,
    isPartner,
    isValidatedPartner
};
