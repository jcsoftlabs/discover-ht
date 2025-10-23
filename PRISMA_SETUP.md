# Configuration Prisma - Instructions d'installation

## 🚀 Installation rapide

### 1. Démarrer XAMPP
- Lancez XAMPP Control Panel
- Démarrez le service **MySQL**
- Ouvrez **phpMyAdmin** dans votre navigateur (http://localhost/phpmyadmin)

### 2. Créer la base de données
Dans phpMyAdmin :
1. Créez une nouvelle base de données nommée `listing_app`
2. Sélectionnez la base de données `listing_app`
3. Allez dans l'onglet **SQL**
4. Copiez et collez le contenu du fichier `prisma/manual_schema.sql`
5. Cliquez sur **Exécuter**

### 3. Vérifier la configuration
```bash
npm run test-db
```

Si tout est configuré correctement, vous devriez voir :
```
✅ Configuration Prisma fonctionnelle!
👥 Users: 2 enregistrements
🤝 Partners: 2 enregistrements  
🏨 Establishments: 2 enregistrements
🏛️ Sites: 2 enregistrements
```

### 4. Démarrer le serveur
```bash
npm run dev
```

## 🛠 Commandes Prisma utiles

```bash
# Générer le client Prisma après modification du schema
npm run prisma:generate

# Ouvrir l'interface graphique Prisma Studio
npm run prisma:studio

# Pousser les changements de schema vers la DB
npm run prisma:push

# Tester la connexion à la base de données
npm run test-db
```

## 🌐 Tester les nouvelles API

### Establishments
```bash
# Obtenir tous les établissements
curl http://localhost:3000/api/establishments

# Créer un nouvel établissement
curl -X POST http://localhost:3000/api/establishments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel Test",
    "description": "Hotel de test",
    "type": "HOTEL",
    "price": 120.00,
    "address": "123 Test Street",
    "partnerId": "partner1"
  }'
```

### Prisma Studio
Pour une interface graphique moderne de votre base de données :
```bash
npm run prisma:studio
```
Ouvrez http://localhost:5555 dans votre navigateur.

## ⚠️ Résolution des problèmes

### Erreur de connexion
Si vous obtenez une erreur `P1001` :
1. Vérifiez que XAMPP MySQL est démarré
2. Vérifiez que la base de données `listing_app` existe
3. Vérifiez les credentials dans `.env`

### Erreur de migration Prisma
Si `prisma migrate` échoue à cause de MariaDB :
- Utilisez le script SQL manuel fourni : `prisma/manual_schema.sql`
- C'est une limitation connue avec les versions MariaDB de XAMPP

### Port déjà utilisé
Si le port 3000 est occupé :
- Changez `PORT=3001` dans le fichier `.env`
- Ou arrêtez l'autre application utilisant le port 3000

## 📚 Structure de la base de données

La base de données comprend 6 tables principales :
- **users** : Utilisateurs et authentification
- **partners** : Partenaires commerciaux
- **establishments** : Hôtels, restaurants, etc.
- **sites** : Sites touristiques
- **reviews** : Avis des utilisateurs
- **promotions** : Offres spéciales

Toutes les relations sont gérées automatiquement par Prisma avec des clés étrangères et des suppressions en cascade appropriées.