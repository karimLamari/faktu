# -----------------------
# Stage 1 : Base
# -----------------------
FROM node:20-slim AS base
WORKDIR /app

# -----------------------
# Stage 2 : Dependencies
# -----------------------
FROM base AS deps
COPY package*.json ./

# Installer toutes les dépendances pour builder
RUN npm install --no-audit --no-fund

# -----------------------
# Stage 3 : Builder
# -----------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Désactiver la télémétrie Next.js et optimiser le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Builder l'application Next.js avec gestion mémoire
RUN NEXT_DISABLE_ESLINT=true npm run build

# -----------------------
# Stage 4 : Runner / Production
# -----------------------
FROM node:20-slim AS runner
WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Installer les dépendances système pour Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    libxtst6 \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Configurer Puppeteer pour utiliser Chromium installé
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Créer un utilisateur non-root
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Créer les dossiers de persistance pour les PDFs (contracts et invoices)
RUN mkdir -p /app/contracts /app/invoices \
    && chown -R pptruser:pptruser /app/contracts /app/invoices

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder --chown=pptruser:pptruser /app/public ./public
COPY --from=builder --chown=pptruser:pptruser /app/.next/standalone ./
COPY --from=builder --chown=pptruser:pptruser /app/.next/static ./.next/static

# Basculer vers l'utilisateur non-root
USER pptruser

# Exposer le port
EXPOSE 3000

# Lancer l'application
CMD ["node", "server.js"]
