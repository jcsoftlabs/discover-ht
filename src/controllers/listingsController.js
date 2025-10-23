const { pool } = require('../config/database');

// Contrôleur pour les annonces (listings)
const listingsController = {
    // GET /api/listings - Récupérer toutes les annonces
    getAllListings: async (req, res) => {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM listings ORDER BY created_at DESC'
            );
            
            res.json({
                success: true,
                data: rows,
                count: rows.length
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des annonces:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des annonces'
            });
        }
    },

    // GET /api/listings/:id - Récupérer une annonce par ID
    getListingById: async (req, res) => {
        try {
            const { id } = req.params;
            const [rows] = await pool.execute(
                'SELECT * FROM listings WHERE id = ?',
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Annonce non trouvée'
                });
            }

            res.json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'annonce:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération de l\'annonce'
            });
        }
    },

    // POST /api/listings - Créer une nouvelle annonce
    createListing: async (req, res) => {
        try {
            const { title, description, price, category, location, contact_email } = req.body;

            // Validation des données
            if (!title || !description || !price) {
                return res.status(400).json({
                    success: false,
                    error: 'Titre, description et prix sont obligatoires'
                });
            }

            const [result] = await pool.execute(
                `INSERT INTO listings (title, description, price, category, location, contact_email, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [title, description, price, category || null, location || null, contact_email || null]
            );

            res.status(201).json({
                success: true,
                message: 'Annonce créée avec succès',
                data: {
                    id: result.insertId,
                    title,
                    description,
                    price,
                    category,
                    location,
                    contact_email
                }
            });
        } catch (error) {
            console.error('Erreur lors de la création de l\'annonce:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de l\'annonce'
            });
        }
    },

    // PUT /api/listings/:id - Mettre à jour une annonce
    updateListing: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, price, category, location, contact_email } = req.body;

            // Vérifier si l'annonce existe
            const [existingListing] = await pool.execute(
                'SELECT id FROM listings WHERE id = ?',
                [id]
            );

            if (existingListing.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Annonce non trouvée'
                });
            }

            const [result] = await pool.execute(
                `UPDATE listings SET title = ?, description = ?, price = ?, 
                 category = ?, location = ?, contact_email = ?, updated_at = NOW()
                 WHERE id = ?`,
                [title, description, price, category, location, contact_email, id]
            );

            res.json({
                success: true,
                message: 'Annonce mise à jour avec succès',
                data: { id, title, description, price, category, location, contact_email }
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'annonce:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour de l\'annonce'
            });
        }
    },

    // DELETE /api/listings/:id - Supprimer une annonce
    deleteListing: async (req, res) => {
        try {
            const { id } = req.params;

            const [result] = await pool.execute(
                'DELETE FROM listings WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Annonce non trouvée'
                });
            }

            res.json({
                success: true,
                message: 'Annonce supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'annonce:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de l\'annonce'
            });
        }
    }
};

module.exports = listingsController;