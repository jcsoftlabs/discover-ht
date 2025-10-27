const express = require('express');
const https = require('https');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./src/config/database');
const { initEmailService } = require('./src/services/emailService');

// Import des routes
const authRoutes = require('./src/routes/auth');
const listingsRoutes = require('./src/routes/listings');
const establishmentsRoutes = require('./src/routes/establishments');
const usersRoutes = require('./src/routes/users');
const sitesRoutes = require('./src/routes/sites');
const reviewsRoutes = require('./src/routes/reviews');
const promotionsRoutes = require('./src/routes/promotions');
const gdprRoutes = require('./src/routes/gdpr');
const partnerRoutes = require('./src/routes/partner');
const adminRoutes = require('./src/routes/admin');
const favoritesRoutes = require('./src/routes/favorites');
const notificationsRoutes = require('./src/routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Configuration des limites de taux (Rate Limiting)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite de 100 requêtes par IP toutes les 15 minutes
    message: {
        success: false,
        error: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting spécial pour l'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limite de 50 tentatives de connexion par IP toutes les 15 minutes
    message: {
        success: false,
        error: 'Trop de tentatives de connexion, réessayez dans 15 minutes.'
    },
    skipSuccessfulRequests: true
});

// Middlewares de sécurité
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(limiter);
app.use(cookieParser());

// Configuration CORS pour app mobile
const corsOptions = {
    origin: process.env.CORS_ORIGIN === '*' ? true : 
           (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 
            ['http://localhost:3000', 'https://localhost:3443']),
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Middleware pour gérer les requêtes preflight OPTIONS
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.status(200).end();
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (images uploadées) avec CORS
app.use('/uploads', (req, res, next) => {
    // Ajouter les en-têtes CORS pour les fichiers statiques
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
}, express.static('public/uploads'));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Touris API est en ligne',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            establishments: '/api/establishments',
            sites: '/api/sites', 
            reviews: '/api/reviews',
            promotions: '/api/promotions',
            notifications: '/api/notifications',
            gdpr: '/api/gdpr',
            partner: '/api/partner',
            admin: '/api/admin',
            favorites: '/api/favorites',
            listings: '/api/listings (legacy)'
        }
    });
});

// API Routes
app.get('/api/', (req, res) => {
    res.json({
        message: 'Touris API - Documentation des endpoints',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            establishments: '/api/establishments',
            sites: '/api/sites', 
            reviews: '/api/reviews',
            promotions: '/api/promotions',
            notifications: '/api/notifications',
            gdpr: '/api/gdpr',
            partner: '/api/partner',
            admin: '/api/admin',
            favorites: '/api/favorites',
            listings: '/api/listings (legacy)'
        },
        status: 'API fonctionnelle'
    });
});

// Appliquer le rate limiting spécial pour l'authentification
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/establishments', establishmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/admin', adminRoutes);

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error('Erreur:', err.stack);
    res.status(500).json({
        error: 'Une erreur interne est survenue',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur'
    });
});

// Route 404 - doit être en dernier
app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.originalUrl,
        availableEndpoints: {
            root: '/',
            api: '/api/',
            auth: '/api/auth',
            users: '/api/users',
            establishments: '/api/establishments',
            sites: '/api/sites',
            reviews: '/api/reviews',
            promotions: '/api/promotions',
            notifications: '/api/notifications',
            gdpr: '/api/gdpr',
            partner: '/api/partner',
            admin: '/api/admin',
            favorites: '/api/favorites'
        }
    });
});

// Démarrage du serveur
const startServer = async () => {
    try {
        // Vérifier les variables d'environnement nécessaires
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET n’est pas défini dans les variables d’environnement');
        }

        // Test de connexion à la base de données
        await testConnection();
        
        // Initialiser le service d'email
        initEmailService();
        
        // Démarrer le serveur HTTP
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Serveur HTTP démarré sur http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('📋 Routes disponibles:');
            console.log('   GET  / - Page d\'accueil');
            console.log('   POST /api/auth/register - Inscription');
            console.log('   POST /api/auth/login - Connexion');
            console.log('   GET  /api/establishments - Liste des établissements');
            console.log('   GET  /api/partner/dashboard - Interface partenaire');
            console.log('   GET  /api/admin/dashboard - Interface administrateur');
            console.log('\n✅ Serveur prêt à recevoir des requêtes!');
        });
        
        // Gérer l'arrêt propre du serveur
        process.on('SIGTERM', () => {
            console.log('\n⚠️  Signal SIGTERM reçu, arrêt du serveur...');
            server.close(() => {
                console.log('✅ Serveur arrêté proprement');
                process.exit(0);
            });
        });
        
        process.on('SIGINT', () => {
            console.log('\n⚠️  Signal SIGINT reçu, arrêt du serveur...');
            server.close(() => {
                console.log('✅ Serveur arrêté proprement');
                process.exit(0);
            });
        });

        // Optionnel: Démarrer le serveur HTTPS si les certificats existent
        if (process.env.ENABLE_HTTPS === 'true') {
            try {
                const key = fs.readFileSync('server.key');
                const cert = fs.readFileSync('server.crt');
                const httpsServer = https.createServer({ key, cert }, app);
                
                httpsServer.listen(HTTPS_PORT, () => {
                    console.log(`🔒 Serveur HTTPS sécurisé sur https://localhost:${HTTPS_PORT}`);
                });
                
                httpsServer.on('error', (httpsError) => {
                    console.log('⚠️  Erreur serveur HTTPS:', httpsError.message);
                });
            } catch (httpsError) {
                console.log('⚠️  Certificats HTTPS non trouvés');
            }
        } else {
            console.log('📝 Serveur HTTPS désactivé (set ENABLE_HTTPS=true pour l\'activer)');
        }

    } catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};

startServer();