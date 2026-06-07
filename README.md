# PCT UVCI - Plateforme de Calcul des Totaux

> Système de gestion numérique des activités pédagogiques et des volumes horaires des enseignants de l'Université Virtuelle de Côte d'Ivoire.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)
![Laravel](https://img.shields.io/badge/Laravel-12-red?logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.4-blue?logo=php)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## Table des matières

1. [Présentation](#1-présentation)
2. [Démarrage rapide - Docker](#2-démarrage-rapide--docker)
3. [Installation manuelle](#3-installation-manuelle)
4. [Architecture](#4-architecture)
5. [Variables d'environnement](#5-variables-denvironnement)
6. [Commandes utiles](#6-commandes-utiles)
7. [Checklist après git pull](#7-checklist-après-git-pull)
8. [Checklist avant git commit](#8-checklist-avant-git-commit)
9. [Stratégie Git](#9-stratégie-git)
10. [Déploiement production](#10-déploiement-production)

---

## 1. Présentation

### Contexte

L'UVCI (Université Virtuelle de Côte d'Ivoire) dispensait ses formations à distance sans outil centralisé pour le suivi des heures d'enseignement. La gestion reposait sur des fichiers Excel et des échanges par mail, sources d'erreurs et de délais.

**PCT UVCI** résout ce problème en proposant une plateforme web qui :

- Permet aux **enseignants** de déclarer leurs activités pédagogiques en ligne
- Calcule automatiquement le **Volume Horaire Normalisé (VHN)** selon des coefficients configurables
- Offre au **secrétariat** un outil de validation/rejet par activité
- Donne à l'**administration** une vue consolidée par département avec exports PDF/Excel

### Rôles et accès

| Rôle | Accès |
|------|-------|
| **Administrateur** | Gestion complète : utilisateurs, cours, attributions, paramètres VHN, reporting |
| **Secrétaire pédagogique** | Validation/rejet des activités, suivi des volumes, exports |
| **Enseignant** | Déclaration d'activités, consultation de son historique, téléchargement récapitulatif |

### Circuit de validation

```
Enseignant → Déclare une activité (statut : EN ATTENTE)
                    ↓
Secrétaire → Valide ✅  /  Rejette ❌  /  Remet en attente ⏱
                    ↓
Système    → Recalcule automatiquement le volume horaire cumulé
                    ↓
Admin      → Consulte les états consolidés et exporte les rapports
```

---

## 2. Démarrage rapide - Docker

### Prérequis

| Outil | Version minimale | Lien |
|-------|-----------------|------|
| Docker Desktop | 4.x | https://www.docker.com/products/docker-desktop |
| Git | 2.x | https://git-scm.com |

### Étapes

**1 - Cloner le dépôt**

```bash
git clone https://github.com/yassoungo1coulibaly-hue/PCT_BD_DAS_2026.git
cd PCT_BD_DAS_2026
```

**2 - Créer le fichier d'environnement**

```bash
# Linux / Mac
cp .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env
```

**3 - Générer APP_KEY et remplir `.env`**

```bash
# Générer la clé (fonctionne sur toutes les plateformes via Docker)
docker run --rm php:8.4-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Coller la valeur dans `.env` à la ligne `APP_KEY=`.

> Les autres variables (`DB_DATABASE`, `DB_PASSWORD`, etc.) ont déjà des valeurs par défaut dans `.env.example` adaptées au développement local.

**4 - Démarrer tous les services**

```bash
docker compose up --build -d
```

Le premier démarrage prend 2 à 5 minutes (téléchargement des images + build).

**5 - Vérifier l'état**

```bash
docker compose ps
```

Tous les services doivent être `Up (healthy)` ou `Up`.

**Accéder à l'application : http://localhost:8000**

### Comptes par défaut

| Login | Mot de passe | Rôle |
|-------|-------------|------|
| `admin` | `admin123` | Administrateur |

> Modifier le mot de passe à la première connexion en production via l'avatar en haut à droite.

---

## 3. Installation manuelle

Pour développer sans Docker (backend et frontend lancés séparément).

### Prérequis

| Outil | Version |
|-------|---------|
| PHP | 8.4 + extensions : `pdo_mysql mbstring exif pcntl bcmath gd zip` |
| Composer | 2.x |
| Node.js | 20.x LTS |
| npm | 10.x |
| MySQL | 8.0 |

### Backend Laravel

```bash
cd PCT_backend

# 1. Installer les dépendances PHP
composer install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env : renseigner DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD

# 3. Générer la clé applicative
php artisan key:generate

# 4. Créer la base de données et appliquer les migrations
php artisan migrate

# 5. Créer les données initiales (compte admin)
php artisan db:seed

# 6. Lancer le serveur de développement
php artisan serve --port=8001
```

### Frontend Next.js

```bash
cd PCT_frontend

# 1. Installer les dépendances
npm install

# 2. Configurer l'URL de l'API
# Linux / Mac
echo "NEXT_PUBLIC_API_URL=http://localhost:8001" > .env.local

# Windows (PowerShell)
Set-Content .env.local "NEXT_PUBLIC_API_URL=http://localhost:8001"

# 3. Lancer le serveur de développement
npm run dev
```

Accéder : **http://localhost:3000**

---

## 4. Architecture

### Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────────┐
│  Navigateur - http://localhost:8000                              │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTP
                ┌────────▼─────────┐
                │   Nginx :80      │  pct-nginx
                │                  │
                │  /api/*  ──────► PHP-FPM :9000  (pct-backend)
                │  /sanctum ─────► PHP-FPM :9000
                │  /*      ──────► Next.js  :3000 (pct-frontend)
                └──────────────────┘
                         │
                ┌────────▼─────────┐
                │   MySQL :3306    │  pct-db
                │   (pct_db)       │
                └──────────────────┘
```

### Services Docker

| Conteneur | Image | Port exposé | Rôle |
|-----------|-------|------------|------|
| `pct-nginx` | nginx:1.27-alpine | **8000** → 80 | Reverse proxy |
| `pct-frontend` | node:20-alpine | interne :3000 | Next.js Standalone |
| `pct-backend` | php:8.4-fpm-alpine | interne :9000 | Laravel PHP-FPM |
| `pct-db` | mysql:8.0 | interne :3306 | Base de données |

### Structure du dépôt

```
PCT_BD_DAS_2026/
├── PCT_backend/              # API Laravel 12
│   ├── app/Http/Controllers/Api/
│   ├── database/migrations/
│   ├── routes/api.php
│   ├── docker/entrypoint.sh
│   ├── .env.example          # Modèle config backend (installation manuelle)
│   └── Dockerfile
│
├── PCT_frontend/             # Application Next.js 15
│   ├── src/app/              # Pages (admin/, secretaire/, enseignant/)
│   ├── src/components/       # Composants UI partagés
│   ├── src/lib/api.ts        # Client Axios
│   ├── src/store/authStore.ts
│   └── Dockerfile
│
├── nginx/default.conf        # Configuration Nginx
├── docker-compose.yml        # Orchestration des services
├── .env.example              # Modèle config docker-compose  ← COPIER EN .env
└── .env                      # Vos variables locales         ← NE PAS COMMITER
```

---

## 5. Variables d'environnement

Le fichier `.env` à la **racine du projet** alimente docker-compose.

> Il ne doit **jamais** être commité dans Git. Il est listé dans `.gitignore`.

```bash
cp .env.example .env   # puis éditer .env
```

| Variable | Obligatoire | Valeur par défaut | Description |
|----------|:-----------:|-------------------|-------------|
| `APP_KEY` | ✅ | *(à générer)* | Clé de chiffrement Laravel |
| `DB_DATABASE` | ✅ | `pct_db` | Nom de la base MySQL |
| `DB_USERNAME` | ✅ | `pct_user` | Utilisateur MySQL |
| `DB_PASSWORD` | ✅ | `pct_password` | Mot de passe MySQL |
| `DB_ROOT_PASSWORD` | ✅ | `root_secret` | Mot de passe root MySQL |
| `MAIL_MAILER` | - | `log` | `log` = emails dans logs Docker, `smtp` = envoi réel |
| `MAIL_HOST` | - | `smtp.gmail.com` | Serveur SMTP |
| `MAIL_USERNAME` | - | *(vide)* | Adresse email expéditeur |
| `MAIL_PASSWORD` | - | *(vide)* | App Password Gmail |

### Configurer les emails (optionnel)

Pour activer l'envoi réel de mails (création de compte, mot de passe oublié) :

1. Activer la validation en 2 étapes sur le compte Gmail UVCI
2. Créer un "Mot de passe d'application" sur https://myaccount.google.com/apppasswords
3. Dans `.env` :
   ```env
   MAIL_MAILER=smtp
   MAIL_USERNAME=admin@uvci.edu.ci
   MAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

---

## 6. Commandes utiles

### Gestion des conteneurs

```bash
# Démarrer tous les services
docker compose up -d

# Démarrer et reconstruire les images
docker compose up --build -d

# Voir l'état des services
docker compose ps

# Logs en temps réel (tous les services)
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Redémarrer un service
docker compose restart backend

# Arrêter (conserve les volumes et données)
docker compose down

# Reset complet - SUPPRIME toutes les données
docker compose down -v
```

### Laravel (backend)

```bash
# Shell dans le conteneur
docker exec -it pct-backend sh

# Tinker - REPL interactif Laravel
docker exec -it pct-backend php artisan tinker

# Appliquer les migrations
docker exec pct-backend php artisan migrate --force

# Lister les routes API
docker exec pct-backend php artisan route:list --path=api

# Vider tous les caches
docker exec pct-backend php artisan optimize:clear

# Voir les logs applicatifs
docker compose logs -f backend
```

### Mise à jour du frontend (sans rebuild Docker)

Utile quand `docker compose build` échoue à cause du réseau (npm registry timeout).

```bash
# Linux / Mac
cd PCT_frontend
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build
docker cp .next/server pct-frontend:/app/.next/server
docker cp .next/static pct-frontend:/app/.next/static
docker restart pct-frontend

# Windows (PowerShell)
cd PCT_frontend
$env:NEXT_PUBLIC_API_URL = "http://localhost:8000"
npm run build
docker cp .next/server pct-frontend:/app/.next/server
docker cp .next/static pct-frontend:/app/.next/static
docker restart pct-frontend
```

### Base de données

```bash
# Sauvegarde - le fichier .sql est ignoré par Git
docker exec pct-db mysqldump `
  -u root -p"${DB_ROOT_PASSWORD:-root_secret}" `
  --no-tablespaces --single-transaction pct_db `
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Restauration
docker exec -i pct-db mysql -u root -p"${DB_ROOT_PASSWORD:-root_secret}" pct_db < backup.sql
```

---

## 7. Checklist après `git pull`

Après chaque `git pull`, vérifier ces points avant de tester :

```
[ ] 1. Y a-t-il de nouvelles migrations ?
        git diff HEAD~1 --name-only | grep migrations
        → Si oui : docker exec pct-backend php artisan migrate --force

[ ] 2. composer.lock a-t-il changé ? (nouveau package PHP)
        git diff HEAD~1 --name-only | grep composer.lock
        → Si oui : docker compose build --no-cache backend
                   docker compose up -d --no-deps backend

[ ] 3. package-lock.json a-t-il changé ? (nouveau package npm)
        git diff HEAD~1 --name-only | grep package-lock
        → Si oui : docker compose build --no-cache frontend
                   docker compose up -d --no-deps frontend

[ ] 4. Un fichier de config Laravel a-t-il changé ?
        (config/, routes/, .env.example)
        → Si oui : docker exec pct-backend php artisan optimize:clear

[ ] 5. Vérifier que tout fonctionne
        docker compose ps       (tous healthy/up)
        docker compose logs -f  (pas d'erreur rouge)
```

---

## 8. Checklist avant `git commit`

```
[ ] 1. .env absent de git status
        git status → .env NE DOIT PAS apparaître

[ ] 2. Aucun fichier .sql dans git status
        git status → *.sql NE DOIT PAS apparaître

[ ] 3. vendor/ et node_modules/ absents
        git status → ces dossiers NE DOIVENT PAS apparaître

[ ] 4. Si nouveau package PHP ajouté → commiter composer.lock
        composer require mon-package
        git add PCT_backend/composer.lock PCT_backend/composer.json

[ ] 5. Si nouveau package npm ajouté → commiter package-lock.json
        npm install mon-package
        git add PCT_frontend/package-lock.json PCT_frontend/package.json

[ ] 6. Si nouvelle migration créée → vérifier qu'elle est bien dans le commit
        git diff --name-only | grep migrations

[ ] 7. Si nouvelle variable d'env ajoutée → mettre à jour .env.example
        (ajouter la clé avec une valeur exemple, sans la vraie valeur)
        git add .env.example
```

---

## 9. Stratégie Git

### Branches

| Branche | Rôle | Protection |
|---------|------|-----------|
| `main` | Code de production - stable | Protégée - PR obligatoire |
| `fullstack` | Branche d'intégration principale | Revue recommandée |
| `feature/xxx` | Nouvelle fonctionnalité | Libre |
| `fix/xxx` | Correction de bug | Libre |

### Workflow recommandé

```bash
# 1. Toujours partir de fullstack à jour
git checkout fullstack
git pull origin fullstack

# 2. Créer une branche dédiée
git checkout -b feature/nom-de-la-fonctionnalite

# 3. Développer et commiter régulièrement
git add PCT_backend/app/Http/...
git add PCT_frontend/src/...
git commit -m "feat: décrire ce qui a changé"

# 4. Avant de proposer une PR - synchroniser avec fullstack
git fetch origin
git rebase origin/fullstack

# 5. Pusher et ouvrir une Pull Request vers fullstack
git push origin feature/nom-de-la-fonctionnalite
# → Ouvrir la PR sur GitHub vers la branche fullstack
```

### Convention de commits

```
feat:     Nouvelle fonctionnalité visible par l'utilisateur
fix:      Correction de bug
refactor: Réécriture de code sans changement de comportement
docs:     Documentation uniquement
style:    Formatage (pas de changement logique)
chore:    Maintenance - dépendances, config, CI
test:     Ajout ou modification de tests
```

Exemples :
```
feat: ajouter le changement de mot de passe pour enseignant/secrétaire
fix: correction du bug de redirection au rafraîchissement de page
chore: mettre à jour composer.lock
docs: compléter README avec procédure de setup équipe
```

---

## 10. Déploiement production

### Sur un serveur Linux avec Docker

```bash
# 1. Cloner
git clone https://github.com/yassoungo1coulibaly-hue/PCT_BD_DAS_2026.git
cd PCT_BD_DAS_2026

# 2. Configurer l'environnement de production
cp .env.example .env
# Éditer .env avec des mots de passe forts et la vraie APP_KEY

# 3. Adapter l'URL publique du frontend
# Dans docker-compose.yml, modifier l'argument de build :
#   NEXT_PUBLIC_API_URL: https://pct.uvci.edu.ci

# 4. Lancer
docker compose up --build -d

# 5. Vérifier
docker compose ps
docker compose logs -f backend
```

### Mise à jour de l'application

```bash
git pull origin main
docker compose up --build -d
docker exec pct-backend php artisan migrate --force
docker exec pct-backend php artisan optimize:clear
```

### Points de sécurité en production

- Utiliser une `APP_KEY` unique générée pour la production
- Utiliser des mots de passe MySQL forts (`DB_PASSWORD`, `DB_ROOT_PASSWORD`)
- Configurer un vrai domaine avec HTTPS (Nginx + Certbot)
- Mettre `APP_DEBUG=false` dans le backend (déjà le cas via docker-compose)
- Changer le mot de passe du compte `admin` à la première connexion
- Activer SMTP pour les emails (`MAIL_MAILER=smtp`)

---

*PCT UVCI - Université Virtuelle de Côte d'Ivoire - 2026*
