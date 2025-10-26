#!/bin/bash

# Script de déploiement Railway pour listing-backend
echo "🚀 Déploiement de la base de données sur Railway..."

# Variables - Source from environment or .env.production
RAILWAY_DB_URL="${DATABASE_URL:-mysql://root:password@host:port/railway}"
MYSQL_BIN="/Applications/XAMPP/xamppfiles/bin/mysql"

# Parse DATABASE_URL if available
if [ ! -z "$DATABASE_URL" ]; then
  # Extract components from DATABASE_URL
  # Format: mysql://user:pass@host:port/db
  MYSQL_USER=$(echo $DATABASE_URL | sed -E 's|mysql://([^:]+):.*|\1|')
  MYSQL_PASS=$(echo $DATABASE_URL | sed -E 's|mysql://[^:]+:([^@]+)@.*|\1|')
  MYSQL_HOST=$(echo $DATABASE_URL | sed -E 's|mysql://[^@]+@([^:]+):.*|\1|')
  MYSQL_PORT=$(echo $DATABASE_URL | sed -E 's|mysql://[^@]+@[^:]+:([^/]+)/.*|\1|')
  MYSQL_DB=$(echo $DATABASE_URL | sed -E 's|mysql://[^/]+/(.+)$|\1|')
else
  echo "⚠️  DATABASE_URL not set. Please set it or source .env.production"
  echo "   export DATABASE_URL='mysql://user:pass@host:port/database'"
  exit 1
fi

# Vérifier si le client MySQL existe
if [ ! -f "$MYSQL_BIN" ]; then
  echo "❌ MySQL client XAMPP non trouvé. Utilisation du client système..."
  MYSQL_BIN="mysql"
fi

# Option 1: Déployer le schéma complet (avec données de test)
deploy_full() {
  echo "📦 Déploiement du schéma complet avec données de test..."
  $MYSQL_BIN -h $MYSQL_HOST -P $MYSQL_PORT -u $MYSQL_USER -p$MYSQL_PASS $MYSQL_DB < prisma/manual_schema.sql
  echo "✅ Déploiement complet terminé!"
}

# Option 2: Utiliser Prisma Push (peut échouer avec mysql.proc)
deploy_prisma() {
  echo "🔄 Déploiement via Prisma Push..."
  DATABASE_URL=$RAILWAY_DB_URL npx prisma db push
  echo "✅ Prisma Push terminé!"
}

# Option 3: Générer et exécuter les migrations Prisma
deploy_migrate() {
  echo "🔄 Génération et application des migrations Prisma..."
  DATABASE_URL=$RAILWAY_DB_URL npx prisma migrate deploy
  echo "✅ Migrations appliquées!"
}

# Tester la connexion
test_connection() {
  echo "🧪 Test de connexion à Railway..."
  DATABASE_URL=$RAILWAY_DB_URL node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    async function test() {
      try {
        const users = await prisma.user.count();
        const establishments = await prisma.establishment.count();
        const partners = await prisma.partner.count();
        console.log('✅ Connexion réussie!');
        console.log('📊 Users:', users);
        console.log('🏨 Establishments:', establishments);
        console.log('🤝 Partners:', partners);
      } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
      } finally {
        await prisma.\$disconnect();
      }
    }
    
    test();
  "
}

# Menu principal
case "$1" in
  full)
    deploy_full
    test_connection
    ;;
  prisma)
    deploy_prisma
    test_connection
    ;;
  migrate)
    deploy_migrate
    test_connection
    ;;
  test)
    test_connection
    ;;
  *)
    echo "Usage: $0 {full|prisma|migrate|test}"
    echo ""
    echo "Options:"
    echo "  full     - Déployer le schéma SQL complet avec données de test"
    echo "  prisma   - Utiliser Prisma Push"
    echo "  migrate  - Générer et appliquer les migrations Prisma"
    echo "  test     - Tester la connexion Railway"
    exit 1
    ;;
esac
