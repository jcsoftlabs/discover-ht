# Instructions de mise à jour de la base de données avec images

## Procédure à suivre dans phpMyAdmin

### 1. Mise à jour de la structure de la base de données

1. Ouvrir phpMyAdmin
2. Sélectionner la base de données `listing_app`
3. Aller dans l'onglet "SQL"
4. Copier et exécuter le contenu du fichier `database-update.sql`

Cette étape va :
- Ajouter tous les champs manquants aux tables existantes
- Créer les clés étrangères nécessaires
- Mettre à jour la structure pour être compatible avec le schéma Prisma complet

### 2. Insertion des données avec images

1. Toujours dans phpMyAdmin, onglet "SQL"
2. Copier et exécuter le contenu du fichier `seed-with-images.sql`

Cette étape va :
- Supprimer toutes les données existantes
- Insérer de nouvelles données complètes avec des images Unsplash
- Créer des établissements avec des URLs d'images dans le champ JSON
- Créer des sites touristiques avec des images
- Ajouter des utilisateurs, partenaires, avis et promotions

### 3. Vérification

Après avoir exécuté les deux scripts SQL :

```bash
# Régénérer le client Prisma
npm run prisma:generate

# Tester la connexion
npm run test-db

# Démarrer l'API
npm run dev
```

### 4. Test des endpoints avec images

```bash
# Tester les établissements avec images
curl http://localhost:3000/api/establishments

# Tester les sites avec images
curl http://localhost:3000/api/sites
```

## Structure des images

Les images sont stockées sous forme de tableaux JSON dans les champs `images` :

```json
[
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop&crop=center"
]
```

## Données créées

### Établissements avec images :
- **Hôtel Le Meurice** (HOTEL) - 3 images d'hôtel de luxe
- **Restaurant Le Grand Véfour** (RESTAURANT) - 3 images de restaurant gastronomique
- **Café de Flore** (CAFE) - 3 images de café parisien
- **Harry's Bar Paris** (BAR) - 3 images de bar vintage
- **Musée d'Orsay Boutique** (SHOP) - 3 images de boutique de musée

### Sites touristiques avec images :
- **Tour Eiffel** (MONUMENT) - 3 images emblématiques
- **Musée du Louvre** (MUSEUM) - 3 images du musée
- **Notre-Dame de Paris** (RELIGIOUS) - 3 images de la cathédrale
- **Sacré-Cœur de Montmartre** (RELIGIOUS) - 3 images de la basilique
- **Arc de Triomphe** (MONUMENT) - 3 images du monument
- **Jardin du Luxembourg** (PARK) - 3 images du jardin

## Notes importantes

- Toutes les images utilisent Unsplash avec des paramètres de redimensionnement (`w=800&h=600&fit=crop&crop=center`)
- Les mots de passe des utilisateurs test sont tous `password123`
- Les données incluent des informations complètes : coordonnées GPS, horaires d'ouverture, tarifs, amenities, etc.
- Les relations entre entités sont correctement configurées
- Tous les champs JSON sont correctement formatés pour MySQL