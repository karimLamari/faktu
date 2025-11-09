#!/bin/bash
# Script pour builder l'image Docker avec plus de ressources

# Arrêter en cas d'erreur
set -e

echo "🔨 Building Docker image avec optimisations..."

# Builder avec plus de mémoire allouée à Docker
docker build \
  --memory="4g" \
  --memory-swap="4g" \
  --shm-size="2g" \
  -t blink:1.0 \
  .

echo "✅ Build terminé avec succès!"
echo "📦 Image: blink:1.0"
