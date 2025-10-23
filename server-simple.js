const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./src/config/database');

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

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration des limites de taux (Rate Limiting)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        success: false,
        error: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
    }
});

// Rate limiting spécial pour l'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
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
    crossOriginEmbedderPolicy: false
}));

app.use(limiter);
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'https://localhost:3443'],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes principales
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
            gdpr: '/api/gdpr',
            partner: '/api/partner',
            admin: '/api/admin',
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
            gdpr: '/api/gdpr',
            partner: '/api/partner',
            admin: '/api/admin',
            listings: '/api/listings (legacy)'
        },
        status: 'API fonctionnelle'
    });
});

// Appliquer les routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/gdpr', gdprRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/establishments', establishmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/promotions', promotionsRoutes);
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

// Route 404
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
            gdpr: '/api/gdpr',
            partner: '/api/partner',
            admin: '/api/admin'
        }
    });
});

// Démarrage du serveur - VERSION SIMPLIFIÉE
async function startServer() {
    try {
        // Vérifier JWT_SECRET
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET non défini');
        }

        // Test de la base de données
        await testConnection();

        // Démarrer le serveur
        const server = app.listen(PORT, () => {
            console.log(`🚀 Serveur HTTP démarré sur http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('📋 Routes disponibles:');
            console.log('   GET  / - Page d\'accueil');
            console.log('   POST /api/auth/login - Connexion');
            console.log('   GET  /api/partner/dashboard - Interface partenaire');
            console.log('   GET  /api/admin/dashboard - Interface administrateur');
            console.log('\n✅ Serveur prêt à recevoir des requêtes!');
            console.log('\n🧪 COMPTES DE TEST:');
            console.log('👨‍💼 Admin: admin@tourism.gov / Test123!@#');
            console.log('🏨 Partner: partner@hotel-paradise.com / Test123!@#');
        });

        // Gérer l'arrêt propre
        process.on('SIGINT', () => {
            console.log('\n⚠️  Arrêt du serveur...');
            server.close(() => {
                console.log('✅ Serveur arrêté');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Erreur démarrage:', error);
        process.exit(1);
    }
}

startServer();