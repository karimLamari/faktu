# 🐳 Guide de Déploiement Docker - FAKTU

## 📋 Prérequis sur votre VPS

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier les installations
docker --version
docker-compose --version
```

## 🚀 Déploiement sur VPS

### 1. Préparer le VPS

```bash
# Se connecter au VPS
ssh user@votre-vps-ip

# Créer le dossier pour l'application
mkdir -p /opt/faktu
cd /opt/faktu
```

### 2. Transférer les fichiers

**Option A: Via Git (Recommandé)**
```bash
# Sur le VPS
git clone https://github.com/karimLamari/faktu.git
cd faktu/invoice-app
```

**Option B: Via SCP (depuis votre PC)**
```bash
# Depuis votre PC Windows
scp -r "c:\Users\lkari\Desktop\BILLS\invoice-app" user@votre-vps-ip:/opt/faktu/
```

### 3. Configurer les variables d'environnement

```bash
# Sur le VPS, dans le dossier de l'app
cd /opt/faktu/invoice-app

# Créer le fichier .env.production
nano .env.production
```

Contenu du `.env.production`:
```bash
# MongoDB
MONGODB_URI=mongodb+srv://mirakiramal:VotreMotDePasse@cluster0.b8g5rc3.mongodb.net/faktu-prod?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://faktu.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Resend Email
RESEND_API_KEY=re_8MRy5Duc_EdQUoYVBoUriXMqXxigGyKoo

# Application
NEXT_PUBLIC_APP_URL=https://faktu.com
NODE_ENV=production
```

**Générer un secret sécurisé:**
```bash
openssl rand -base64 32
```

### 4. Builder et lancer l'application

```bash
# Builder l'image Docker
docker-compose build

# Lancer l'application
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### 5. Vérifier que ça fonctionne

```bash
# Vérifier le statut
docker-compose ps

# Tester l'API de santé
curl http://localhost:3000/api/health

# Voir les logs en temps réel
docker-compose logs -f faktu-app
```

## 🌐 Configuration Nginx (Reverse Proxy)

Pour exposer votre app sur le port 80/443:

```bash
# Installer Nginx
sudo apt update
sudo apt install nginx

# Créer la configuration
sudo nano /etc/nginx/sites-available/faktu
```

Contenu de `/etc/nginx/sites-available/faktu`:
```nginx
server {
    listen 80;
    server_name faktu.com www.faktu.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer la configuration:
```bash
sudo ln -s /etc/nginx/sites-available/faktu /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 HTTPS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir un certificat SSL
sudo certbot --nginx -d faktu.com -d www.faktu.com

# Le renouvellement automatique est configuré
sudo certbot renew --dry-run
```

## 🔄 Commandes utiles

### Gestion de l'application
```bash
# Arrêter l'application
docker-compose down

# Redémarrer
docker-compose restart

# Voir les logs
docker-compose logs -f

# Mettre à jour l'application
git pull
docker-compose build
docker-compose up -d
```

### Nettoyage
```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images non utilisées
docker image prune

# Tout nettoyer
docker system prune -a
```

## 📊 Monitoring

### Voir l'utilisation des ressources
```bash
docker stats faktu-invoice-app
```

### Accéder au conteneur
```bash
docker exec -it faktu-invoice-app sh
```

## 🔧 Dépannage

### L'app ne démarre pas
```bash
# Voir les logs détaillés
docker-compose logs faktu-app

# Vérifier les variables d'environnement
docker exec faktu-invoice-app env | grep MONGODB
```

### Erreur de connexion MongoDB
```bash
# Vérifier que l'IP du VPS est autorisée dans MongoDB Atlas
# Atlas > Network Access > Add IP Address
```

### Port 3000 déjà utilisé
```bash
# Trouver ce qui utilise le port
sudo lsof -i :3000

# Ou changer le port dans docker-compose.yml
ports:
  - "8080:3000"  # Port externe:interne
```

## 🔐 Sécurité

### Pare-feu (UFW)
```bash
# Installer UFW
sudo apt install ufw

# Autoriser SSH (IMPORTANT!)
sudo ufw allow 22

# Autoriser HTTP et HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Activer le pare-feu
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

### Mise à jour du système
```bash
# Mettre à jour régulièrement
sudo apt update && sudo apt upgrade -y
```

## 📝 Checklist de déploiement

- [ ] VPS avec Ubuntu 20.04+ ou Debian 11+
- [ ] Docker et Docker Compose installés
- [ ] Domaine pointé vers l'IP du VPS (A record)
- [ ] Variables d'environnement configurées
- [ ] MongoDB Atlas configuré (IP du VPS autorisée)
- [ ] Domaine email vérifié sur Resend
- [ ] Nginx configuré comme reverse proxy
- [ ] Certificat SSL Let's Encrypt installé
- [ ] Pare-feu configuré
- [ ] Application testée et fonctionnelle

## 🎯 URLs après déploiement

- Application: https://faktu.com
- API de santé: https://faktu.com/api/health
- Dashboard: https://faktu.com/dashboard

## 📞 Support

Si vous rencontrez des problèmes:

1. Vérifiez les logs: `docker-compose logs -f`
2. Vérifiez la santé: `curl http://localhost:3000/api/health`
3. Vérifiez les variables d'env: `docker exec faktu-invoice-app env`

---

**Bon déploiement ! 🚀**
