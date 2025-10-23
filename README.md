# Listing Backend API

API REST pour la gestion d'annonces développée avec Node.js, Express et MySQL.

## 🚀 Fonctionnalités

- ✅ API REST complète pour les annonces (CRUD)
- ✅ Connexion à base de données MySQL (XAMPP compatible)
- ✅ Middleware CORS configuré
- ✅ Variables d'environnement avec dotenv
- ✅ Structure de projet organisée

## 📁 Structure du projet

```
listing-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuration MySQL
│   ├── controllers/
│   │   └── listingsController.js # Logique métier des annonces
│   ├── models/
│   │   └── Listing.js           # Modèle et schéma de données
│   └── routes/
│       └── listings.js          # Routes API des annonces
├── .env                         # Variables d'environnement
├── .gitignore                   # Fichiers à ignorer par Git
├── package.json                 # Dépendances et scripts
├── server.js                    # Point d'entrée de l'application
└── README.md                    # Documentation
```

## 🛠 Installation

1. **Cloner le projet** (si applicable)
   ```bash
   git clone <repo-url>
   cd listing-backend
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer la base de données**
   - Démarrer XAMPP et lancer MySQL
   - La base de données `listing_db` sera créée automatiquement au premier lancement

4. **Configurer les variables d'environnement**
   Le fichier `.env` est déjà configuré pour XAMPP :
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=listing_db
   ```

## 🏃‍♂️ Utilisation

### Démarrer le serveur

**Mode développement** (avec nodemon pour rechargement automatique) :
```bash
npm run dev
```

**Mode production** :
```bash
npm start
```

Le serveur sera disponible sur `http://localhost:3000`

## 📡 API Endpoints

### Annonces (Listings)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/listings` | Récupérer toutes les annonces |
| GET | `/api/listings/:id` | Récupérer une annonce par ID |
| POST | `/api/listings` | Créer une nouvelle annonce |
| PUT | `/api/listings/:id` | Mettre à jour une annonce |
| DELETE | `/api/listings/:id` | Supprimer une annonce |

### Exemples d'utilisation

**Créer une annonce (POST /api/listings)** :
```json
{
  "title": "iPhone 13",
  "description": "iPhone en excellent état, utilisé 6 mois",
  "price": 650.00,
  "category": "Téléphones",
  "location": "Paris",
  "contact_email": "vendeur@example.com"
}
```

**Réponse type** :
```json
{
  "success": true,
  "message": "Annonce créée avec succès",
  "data": {
    "id": 1,
    "title": "iPhone 13",
    "description": "iPhone en excellent état, utilisé 6 mois",
    "price": 650.00,
    "category": "Téléphones",
    "location": "Paris",
    "contact_email": "vendeur@example.com"
  }
}
```

## 💾 Base de données

### Schéma de la table `listings`

```sql
CREATE TABLE listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    location VARCHAR(255),
    contact_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver MySQL pour Node.js
- **Cors** - Middleware pour gérer CORS
- **Dotenv** - Gestion des variables d'environnement
- **Nodemon** - Rechargement automatique en développement

## 📝 Scripts disponibles

- `npm start` - Démarre le serveur en mode production
- `npm run dev` - Démarre le serveur en mode développement avec nodemon
- `npm test` - Lance les tests (à implémenter)

## 🚨 Prérequis

- Node.js (version 14 ou supérieure)
- XAMPP avec MySQL activé
- npm ou yarn

## 📞 Support

Pour toute question ou problème, vérifiez que :
1. XAMPP est démarré avec MySQL actif
2. Les paramètres de connexion dans `.env` sont corrects
3. Le port 3000 est disponible

Le serveur affichera des messages de confirmation lors du démarrage pour indiquer si la connexion à la base de données est réussie.