# 🪟 Guide de Test Local avec Docker Desktop (Windows)

## Prérequis
- Docker Desktop installé et lancé
- WSL 2 activé (Docker Desktop l'installe automatiquement)

## 1. Builder l'image Docker

```powershell
# Naviguez vers le dossier du projet
cd "C:\Users\lkari\Desktop\BILLS\invoice-app"

# Builder l'image
docker-compose build
```

## 2. Créer le fichier .env.production

Créez un fichier `.env.production` dans le dossier `invoice-app` avec ce contenu:

```bash
MONGODB_URI=mongodb+srv://mirakiramal:HBHvGHRgd29nMaI7@cluster0.b8g5rc3.mongodb.net/invoice-app?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-temporaire-pour-test-local
RESEND_API_KEY=re_8MRy5Duc_EdQUoYVBoUriXMqXxigGyKoo
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production
```

## 3. Lancer le conteneur

```powershell
docker-compose up
```

Ou en arrière-plan:
```powershell
docker-compose up -d
```

## 4. Tester l'application

Ouvrez votre navigateur: http://localhost:3000

## 5. Voir les logs

```powershell
docker-compose logs -f
```

## 6. Arrêter le conteneur

```powershell
docker-compose down
```

## 🚀 Pour le déploiement sur VPS

Le guide `DEPLOYMENT.md` est pour votre **VPS Linux** (Ubuntu/Debian).

Sur votre VPS, les commandes Linux fonctionneront normalement:
```bash
ssh user@votre-vps-ip
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## 📝 Checklist

**Sur Windows (pour tester):**
- [ ] Docker Desktop installé
- [ ] Fichier `.env.production` créé
- [ ] `docker-compose build` réussi
- [ ] `docker-compose up` fonctionne
- [ ] Application accessible sur http://localhost:3000

**Sur VPS (pour déployer):**
- Suivez le guide `DEPLOYMENT.md` directement sur le VPS Linux
- Les commandes Linux y fonctionneront normalement
