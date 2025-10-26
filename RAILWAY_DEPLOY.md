# Déploiement sur Railway

Ce guide explique comment déployer et gérer la base de données sur Railway.

## Configuration

### Variables d'environnement Railway

Dans le dashboard Railway, configurez les variables suivantes :

```env
DATABASE_URL=mysql://root:TbmGieSBISIZvGOxzASbTJNviMpVgGOK@centerbeam.proxy.rlwy.net:15975/railway
NODE_ENV=production
PORT=3000
JWT_SECRET=votre_cle_secrete_jwt_tres_longue_et_securisee_changez_moi_en_production
JWT_REFRESH_SECRET=votre_cle_secrete_refresh_token_differente_tres_longue_changez_moi_en_production
CORS_ORIGIN=*
GOOGLE_CLIENT_ID_WEB=955108400371-uik3onuhrlibvaik5l6j0a28t8ajg0sd.apps.googleusercontent.com
GOOGLE_CLIENT_ID_IOS=955108400371-ehi0ndlb0750m6rii0t4ep2sjuabnuo8.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=955108400371-7e0dtjedlu93a9kcpvm7qbrqalua5rai.apps.googleusercontent.com
SMTP_HOST=discoverhaiti.ht
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@discoverhaiti.ht
SMTP_PASS=Shalom4910!
SMTP_FROM="Discover Haiti" <noreply@discoverhaiti.ht>
```

## Déploiement de la base de données

### Méthode 1: Script automatisé (recommandé)

```bash
# Déployer le schéma complet avec données de test
./deploy-railway.sh full

# Tester uniquement la connexion
./deploy-railway.sh test
```

### Méthode 2: Déploiement manuel avec MySQL

```bash
# Connexion directe à Railway MySQL
/Applications/XAMPP/xamppfiles/bin/mysql \
  -h centerbeam.proxy.rlwy.net \
  -P 15975 \
  -u root \
  -pTbmGieSBISIZvGOxzASbTJNviMpVgGOK \
  railway

# Déployer le schéma
/Applications/XAMPP/xamppfiles/bin/mysql \
  -h centerbeam.proxy.rlwy.net \
  -P 15975 \
  -u root \
  -pTbmGieSBISIZvGOxzASbTJNviMpVgGOK \
  railway < prisma/manual_schema.sql
```

### Méthode 3: Prisma (si mysql.proc est corrigé)

```bash
# Pousser le schéma Prisma
DATABASE_URL="mysql://root:TbmGieSBISIZvGOxzASbTJNviMpVgGOK@centerbeam.proxy.rlwy.net:15975/railway" \
  npm run prisma:push

# Ou utiliser les migrations
DATABASE_URL="mysql://root:TbmGieSBISIZvGOxzASbTJNviMpVgGOK@centerbeam.proxy.rlwy.net:15975/railway" \
  npx prisma migrate deploy
```

## Vérification

### Vérifier les tables

```bash
/Applications/XAMPP/xamppfiles/bin/mysql \
  -h centerbeam.proxy.rlwy.net \
  -P 15975 \
  -u root \
  -pTbmGieSBISIZvGOxzASbTJNviMpVgGOK \
  railway \
  -e "SHOW TABLES;"
```

### Vérifier les données

```bash
/Applications/XAMPP/xamppfiles/bin/mysql \
  -h centerbeam.proxy.rlwy.net \
  -P 15975 \
  -u root \
  -pTbmGieSBISIZvGOxzASbTJNviMpVgGOK \
  railway \
  -e "SELECT COUNT(*) as count FROM users; SELECT COUNT(*) as count FROM establishments;"
```

### Test avec Prisma

```bash
DATABASE_URL="mysql://root:TbmGieSBISIZvGOxzASbTJNviMpVgGOK@centerbeam.proxy.rlwy.net:15975/railway" \
  node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    async function test() {
      const users = await prisma.user.count();
      const establishments = await prisma.establishment.count();
      console.log('Users:', users, 'Establishments:', establishments);
      await prisma.\$disconnect();
    }
    test();
  "
```

## Structure de la base de données

Tables déployées :
- ✅ `users` - Utilisateurs (USER, ADMIN, PARTNER)
- ✅ `partners` - Partenaires commerciaux
- ✅ `establishments` - Hôtels, restaurants, attractions
- ✅ `sites` - Sites touristiques
- ✅ `reviews` - Avis utilisateurs
- ✅ `promotions` - Promotions temporaires
- ✅ `favorites` - Favoris utilisateurs (si présente)
- ✅ `notifications` - Notifications (si présente)

## Données de test

Le fichier `prisma/manual_schema.sql` inclut des données de test :
- 2 utilisateurs (admin + user normal)
- 2 partenaires
- 2 établissements
- 2 sites touristiques

## URLs de l'API

### Local (développement)
```
http://localhost:3000/api/users
http://localhost:3000/api/establishments
http://localhost:3000/api/sites
```

### Railway (production)
```
https://listing-backend-production.up.railway.app/api/users
https://listing-backend-production.up.railway.app/api/establishments
https://listing-backend-production.up.railway.app/api/sites
```

## Notes importantes

1. **mysql.proc issue** : En cas d'erreur `mysql.proc` avec Prisma, utilisez le script SQL manuel
2. **Sécurité** : Changez les secrets JWT en production
3. **CORS** : Ajustez `CORS_ORIGIN` pour limiter les origines autorisées
4. **Backup** : Railway ne fait pas de backup automatique, pensez à exporter régulièrement

## Commandes utiles

```bash
# Générer le client Prisma
npm run prisma:generate

# Ouvrir Prisma Studio (local)
npm run prisma:studio

# Ouvrir Prisma Studio (Railway)
DATABASE_URL="mysql://root:TbmGieSBISIZvGOxzASbTJNviMpVgGOK@centerbeam.proxy.rlwy.net:15975/railway" \
  npx prisma studio
```
