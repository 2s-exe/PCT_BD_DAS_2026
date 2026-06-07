# PCT UVCI — Plateforme de Calcul des Totaux

Système de gestion des activités pédagogiques et volumes horaires de l'Université Virtuelle de Côte d'Ivoire.

**Stack :** Next.js 15 · Laravel 12 · MySQL 8 · Docker · Nginx

---

## Démarrage rapide (Docker — recommandé)

### Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x
- Git

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/yassoungo1coulibaly-hue/PCT_BD_DAS_2026.git
cd PCT_BD_DAS_2026

# 2. Créer le fichier d'environnement
cp .env.example .env
```

Ouvrir `.env` et renseigner `APP_KEY`. Générer la clé :

```bash
# Linux / Mac / Windows (PowerShell avec Docker)
docker run --rm php:8.4-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Coller la valeur dans `.env` :
```env
APP_KEY=base64:xxx...
```

```bash
# 3. Construire et démarrer tous les services
docker compose up --build -d

# 4. Vérifier que tout est en ligne
docker compose ps
```

Accéder à l'application : **http://localhost:8000**

### Comptes par défaut

| Login | Mot de passe | Rôle |
|-------|-------------|------|
| `admin` | `admin123` | Administrateur |

> Changer le mot de passe à la première connexion en production.

---

## Installation manuelle (sans Docker)

### Prérequis

- PHP 8.4 + extensions : `pdo_mysql mbstring exif pcntl bcmath gd zip`
- Composer 2.x
- Node.js 20.x + npm
- MySQL 8.0

### Backend

```bash
cd PCT_backend

# Dépendances
composer install

# Configuration
cp .env.example .env
# Éditer .env : renseigner DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate

# Base de données
php artisan migrate
php artisan db:seed

# Démarrer le serveur de développement
php artisan serve --port=8001
```

### Frontend

```bash
cd PCT_frontend

# Dépendances
npm install

# Configuration
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local

# Démarrer
npm run dev
```

Accéder : **http://localhost:3000**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Navigateur — http://localhost:8000                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  Nginx :80      │  ← pct-nginx
              │  /api/*  → FPM  │
              │  /*      → Node │
              └────┬───────┬────┘
                   │       │
         ┌─────────▼─┐  ┌──▼──────────┐
         │  Laravel  │  │  Next.js    │
         │  PHP-FPM  │  │  Standalone │
         │  :9000    │  │  :3000      │
         └─────┬─────┘  └─────────────┘
               │
         ┌─────▼─────┐
         │  MySQL    │
         │  :3306    │
         └───────────┘
```

---

## Commandes utiles

### Docker

```bash
# Logs en temps réel
docker compose logs -f

# Logs d'un service
docker compose logs -f backend

# Redémarrer un service
docker compose restart backend

# Shell dans le backend
docker exec -it pct-backend sh

# Tinker (REPL Laravel)
docker exec -it pct-backend php artisan tinker

# Lister les routes API
docker exec pct-backend php artisan route:list

# Vider les caches
docker exec pct-backend php artisan optimize:clear

# Arrêter (conserve les volumes/données)
docker compose down

# Reset complet (supprime les données)
docker compose down -v
```

### Mise à jour du frontend sans rebuild Docker

```bash
cd PCT_frontend
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build
docker cp .next/server pct-frontend:/app/.next/server
docker cp .next/static pct-frontend:/app/.next/static
docker restart pct-frontend
```

### Sauvegarde de la base de données

```bash
# Export (le fichier .sql est ignoré par git)
docker exec pct-db mysqldump -u root -proot_secret pct_db \
  --no-tablespaces --single-transaction \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
docker exec -i pct-db mysql -u root -proot_secret pct_db < backup.sql
```

---

## Variables d'environnement

Le fichier `.env` à la racine alimente docker-compose. Il ne doit **jamais** être commité.

| Variable | Obligatoire | Description |
|----------|:-----------:|-------------|
| `APP_KEY` | ✅ | Clé de chiffrement Laravel |
| `DB_DATABASE` | ✅ | Nom de la base de données |
| `DB_USERNAME` | ✅ | Utilisateur MySQL |
| `DB_PASSWORD` | ✅ | Mot de passe MySQL |
| `DB_ROOT_PASSWORD` | ✅ | Mot de passe root MySQL |
| `MAIL_MAILER` | — | `log` (dev) ou `smtp` (prod) |
| `MAIL_PASSWORD` | — | App Password Gmail si SMTP activé |

Copier `.env.example` → `.env` et remplir les champs.

---

## Checklist après `git pull`

```
[ ] 1. Vérifier s'il y a de nouvelles migrations
        git diff HEAD~1 --name-only | grep migrations

[ ] 2. Appliquer les nouvelles migrations si nécessaire
        docker exec pct-backend php artisan migrate --force

[ ] 3. Si de nouveaux packages PHP (composer.lock modifié) → rebuild
        docker compose build --no-cache backend
        docker compose up -d --no-deps backend

[ ] 4. Si de nouveaux packages npm (package-lock.json modifié) → rebuild
        docker compose build --no-cache frontend
        docker compose up -d --no-deps frontend

[ ] 5. Vider les caches si config/routes modifiés
        docker exec pct-backend php artisan optimize:clear

[ ] 6. Vérifier les logs
        docker compose logs -f
```

---

## Checklist avant `git commit`

```
[ ] 1. .env absent du commit
        git status  →  .env ne doit PAS apparaître

[ ] 2. Aucun fichier .sql dans le commit
        git status  →  *.sql ne doit PAS apparaître

[ ] 3. vendor/ et node_modules/ absents
        git status  →  ces dossiers ne doivent PAS apparaître

[ ] 4. Nouvelle migration commitée si ajoutée
        git diff --name-only | grep migrations

[ ] 5. composer.lock / package-lock.json commités si packages ajoutés
        git add PCT_backend/composer.lock
        git add PCT_frontend/package-lock.json

[ ] 6. .env.example mis à jour si nouvelle variable ajoutée
        (sans la valeur réelle — seulement la clé avec une valeur exemple)
```

---

## Stratégie Git

### Branches

| Branche | Rôle |
|---------|------|
| `main` | Production — stable, protégée |
| `fullstack` | Intégration principale |
| `feature/xxx` | Nouvelle fonctionnalité |
| `fix/xxx` | Correction de bug |

### Workflow

```bash
# 1. Partir de fullstack à jour
git checkout fullstack
git pull origin fullstack

# 2. Créer une branche
git checkout -b feature/ma-fonctionnalite

# 3. Travailler, commiter
git add PCT_backend/app/... PCT_frontend/src/...
git commit -m "feat: description courte"

# 4. Synchroniser avant PR
git fetch origin
git rebase origin/fullstack

# 5. Pusher et ouvrir une PR vers fullstack
git push origin feature/ma-fonctionnalite
```

### Convention de commits

| Préfixe | Usage |
|---------|-------|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `refactor:` | Refactorisation |
| `docs:` | Documentation |
| `chore:` | Maintenance (dépendances, config) |

---

## Déploiement sur serveur distant

```bash
git clone https://github.com/yassoungo1coulibaly-hue/PCT_BD_DAS_2026.git
cd PCT_BD_DAS_2026
cp .env.example .env
# Remplir .env avec les valeurs de production

# Adapter l'URL de l'API (remplacer localhost par le domaine public)
# Dans docker-compose.yml, modifier :
#   NEXT_PUBLIC_API_URL: https://pct.uvci.edu.ci

docker compose up --build -d
```
