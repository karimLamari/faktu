#!/bin/bash

# Script pour corriger les numéros de factures depuis Docker
# Usage: ./scripts/docker-fix-invoices.sh [userId]

set -e

echo "🐳 Correction des numéros de factures via Docker"
echo ""

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier que le container existe
CONTAINER_NAME="blink-appR"
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Container ${CONTAINER_NAME} non trouvé"
    echo "💡 Vérifiez le nom du container avec: docker ps -a"
    exit 1
fi

# Vérifier que le container est démarré
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "⚠️  Container ${CONTAINER_NAME} n'est pas démarré"
    echo "▶️  Démarrage du container..."
    docker start ${CONTAINER_NAME}
    sleep 3
fi

USER_ID="${1:-}"

if [ -z "$USER_ID" ]; then
    echo "📋 Liste des utilisateurs:"
    docker exec -it ${CONTAINER_NAME} npm run db:get-user
    echo ""
    echo "💡 Usage: $0 <userId>"
    exit 0
fi

echo "👤 Utilisateur: ${USER_ID}"
echo ""

# 1. Vérifier d'abord
echo "🔍 Étape 1/2 - Vérification des problèmes..."
docker exec -it ${CONTAINER_NAME} npm run db:check-invoices ${USER_ID}

echo ""
echo "⏸️  Voulez-vous continuer avec la correction? (oui/non)"
read -r CONFIRM

if [ "$CONFIRM" != "oui" ] && [ "$CONFIRM" != "o" ] && [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "yes" ]; then
    echo "❌ Opération annulée"
    exit 0
fi

# 2. Corriger
echo ""
echo "🔧 Étape 2/2 - Correction..."
docker exec -it ${CONTAINER_NAME} npm run db:fix-invoices ${USER_ID}

echo ""
echo "✅ Terminé!"
