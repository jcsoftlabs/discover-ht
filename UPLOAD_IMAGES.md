# Guide d'Upload d'Images pour les Établissements et Sites

## Vue d'ensemble

Les administrateurs et partenaires peuvent maintenant uploader des images de fichiers (JPEG, PNG, WebP) lors de la création ou modification d'établissements et de sites touristiques. Le système supporte :
- Upload de plusieurs images (maximum 10)
- Taille maximale par fichier : 5 MB
- Formats acceptés : JPEG, JPG, PNG, WebP

## Configuration

**Établissements:**
- Stockés dans : `public/uploads/establishments/`
- URLs d'accès : `http://localhost:3000/uploads/establishments/[filename]`

**Sites:**
- Stockés dans : `public/uploads/sites/`
- URLs d'accès : `http://localhost:3000/uploads/sites/[filename]`

## Utilisation de l'API

---

## 🏛️ ÉTABLISSEMENTS

### 1. Créer un établissement avec images

**Endpoint:** `POST /api/establishments`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: "Hôtel Paradise"
description: "Un bel hôtel"
type: "HOTEL"
price: 150.00
partnerId: "clu..."
images: [file1.jpg, file2.jpg]  // Champ pour upload de fichiers
```

**Exemple avec curl:**
```bash
curl -X POST http://localhost:3000/api/establishments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Hôtel Paradise" \
  -F "description=Un bel hôtel" \
  -F "type=HOTEL" \
  -F "price=150.00" \
  -F "partnerId=YOUR_PARTNER_ID" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Réponse:**
```json
{
  "success": true,
  "message": "Établissement créé avec succès",
  "data": {
    "id": "clu...",
    "name": "Hôtel Paradise",
    "images": [
      "/uploads/establishments/establishment-1234567890-123456789.jpg",
      "/uploads/establishments/establishment-1234567890-987654321.jpg"
    ],
    ...
  }
}
```

### 2. Mettre à jour un établissement avec de nouvelles images

**Endpoint:** `PUT /api/establishments/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
images: [file3.jpg]  // Les nouvelles images s'ajoutent aux anciennes
```

**Exemple avec curl:**
```bash
curl -X PUT http://localhost:3000/api/establishments/ESTABLISHMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image3.jpg"
```

**Note:** Les nouvelles images sont **ajoutées** aux images existantes. Pour remplacer toutes les images, envoyez un tableau d'URLs dans le body JSON.

### 3. Remplacer toutes les images par des URLs

Pour remplacer complètement les images avec des URLs externes, utilisez JSON:

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

## Gestion d'erreurs

### Erreurs possibles :

**Fichier trop volumineux (>5MB):**
```json
{
  "success": false,
  "error": "La taille du fichier dépasse la limite de 5 MB"
}
```

**Trop de fichiers (>10):**
```json
{
  "success": false,
  "error": "Trop de fichiers. Maximum 10 images autorisées"
}
```

**Type de fichier non autorisé:**
```json
{
  "success": false,
  "error": "Type de fichier non autorisé. Seuls les formats JPEG, PNG et WebP sont acceptés."
}
```

## Accès aux images

Les images uploadées sont accessibles publiquement via :

```
http://localhost:3000/uploads/establishments/[filename]
```

Exemple:
```
http://localhost:3000/uploads/establishments/establishment-1234567890-123456789.jpg
```

## Sécurité

- Seuls les utilisateurs avec rôle **PARTNER** ou **ADMIN** peuvent uploader des images
- Les fichiers sont validés par type MIME
- Les noms de fichiers sont sécurisés avec des timestamps uniques
- Limite de taille stricte de 5 MB par fichier

## Structure de stockage

```
listing-backend/
├── public/
│   └── uploads/
│       ├── establishments/
│       │   ├── establishment-1234567890-123456789.jpg
│       │   ├── establishment-1234567890-987654321.png
│       │   └── ...
│       └── sites/
│           ├── site-1234567890-123456789.jpg
│           ├── site-1234567890-987654321.png
│           └── ...
```

---

## 🏞️ SITES TOURISTIQUES

### 1. Créer un site avec images

**Endpoint:** `POST /api/sites`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: "Tour Eiffel"
description: "Monument historique"
address: "Champ de Mars, Paris"
latitude: 48.8584
longitude: 2.2945
images: [file1.jpg, file2.jpg]  // Champ pour upload de fichiers
```

**Exemple avec curl:**
```bash
curl -X POST http://localhost:3000/api/sites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Tour Eiffel" \
  -F "description=Monument historique" \
  -F "address=Champ de Mars, Paris" \
  -F "latitude=48.8584" \
  -F "longitude=2.2945" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Réponse:**
```json
{
  "success": true,
  "message": "Site créé avec succès",
  "data": {
    "id": "clu...",
    "name": "Tour Eiffel",
    "images": [
      "/uploads/sites/site-1234567890-123456789.jpg",
      "/uploads/sites/site-1234567890-987654321.jpg"
    ],
    ...
  }
}
```

### 2. Mettre à jour un site avec de nouvelles images

**Endpoint:** `PUT /api/sites/:id`

**Exemple avec curl:**
```bash
curl -X PUT http://localhost:3000/api/sites/SITE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image3.jpg"
```

**Note:** Seuls les **ADMIN** peuvent créer et modifier des sites touristiques.

---

## Notes importantes

1. **Format multipart/form-data**: Pour uploader des fichiers, utilisez `multipart/form-data` au lieu de `application/json`
2. **Nom du champ**: Le champ pour les fichiers doit s'appeler `images` (pluriel)
3. **Images mixtes**: Vous pouvez combiner upload de fichiers ET URLs dans la même requête
4. **Base de données**: Les chemins d'images sont stockés au format JSON dans MySQL via Prisma
5. **Permissions**:
   - Établissements : **PARTNER** ou **ADMIN**
   - Sites : **ADMIN** seulement
