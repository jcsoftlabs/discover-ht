/**
 * Middleware et utilitaires pour différencier les clients web et mobile
 */

// Middleware pour restreindre l'accès à un type de client spécifique
const requireClientType = (allowedTypes) => {
    return (req, res, next) => {
        const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
        
        if (!req.clientInfo || !types.includes(req.clientInfo.type)) {
            return res.status(403).json({
                success: false,
                error: `Cette route est réservée aux clients: ${types.join(', ')}`,
                clientDetected: req.clientInfo?.type || 'unknown'
            });
        }
        
        next();
    };
};

// Helper pour adapter la réponse selon le type de client
const adaptResponseForClient = (req, data) => {
    if (req.clientInfo?.isMobile) {
        // Pour mobile : réponse optimisée (moins de données)
        return {
            success: true,
            data,
            client: 'mobile'
        };
    } else {
        // Pour web : réponse complète avec métadonnées
        return {
            success: true,
            data,
            client: 'web',
            timestamp: new Date().toISOString()
        };
    }
};

// Helper pour formatter les images selon le client
const formatImagesForClient = (req, images) => {
    if (!images) return images;
    
    if (req.clientInfo?.isMobile) {
        // Mobile : utiliser des versions compressées/thumbnails si disponibles
        return Array.isArray(images) 
            ? images.map(img => typeof img === 'string' ? img.replace(/\.(jpg|jpeg|png)$/i, '_thumb.$1') : img)
            : images;
    }
    
    // Web : images haute qualité
    return images;
};

// Middleware pour logger les statistiques d'utilisation par plateforme
const logClientUsage = (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function (data) {
        // Logger les informations de client pour analytics
        if (req.clientInfo) {
            console.log(`[Analytics] ${req.method} ${req.path} - Client: ${req.clientInfo.type}`);
        }
        return originalJson(data);
    };
    
    next();
};

// Helper pour vérifier si la requête vient du mobile
const isMobileRequest = (req) => {
    return req.clientInfo?.isMobile === true;
};

// Helper pour vérifier si la requête vient du web
const isWebRequest = (req) => {
    return req.clientInfo?.isWeb === true;
};

module.exports = {
    requireClientType,
    adaptResponseForClient,
    formatImagesForClient,
    logClientUsage,
    isMobileRequest,
    isWebRequest
};
