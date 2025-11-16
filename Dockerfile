# ===================================
# Dockerfile Multi-Stage pour Next.js 15
# Utilise @react-pdf/renderer (pas de Puppeteer/Chromium)
# ===================================

# -----------------------
# Stage 1 : Dependencies
# -----------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm ci --legacy-peer-deps

# -----------------------
# Stage 2 : Builder
# -----------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les node_modules depuis deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build de l'application Next.js
RUN npm run build

# -----------------------
# Stage 3 : Runner (Production)
# -----------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Installer uniquement les packages requis (pas de Chromium)
RUN apk add --no-cache \
    ca-certificates \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Créer les dossiers de persistance pour les PDFs
RUN mkdir -p /app/contracts /app/invoices /app/public \
    && chown -R nextjs:nodejs /app/contracts /app/invoices /app/public

# Copier les fichiers nécessaires depuis le builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Basculer vers l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Lancer l'application
CMD ["node", "server.js"]
