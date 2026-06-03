# PCT — Plateforme de Calcul des Traitements

Système fullstack de gestion des volumes horaires et des traitements enseignants.  
Monorepo contenant le frontend Next.js et le backend Laravel, orchestrés via Docker.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15 · React 19 · TypeScript · TailwindCSS · Radix UI |
| Backend | Laravel 12 · PHP 8.2 · Laravel Sanctum (API tokens) |
| Base de données | MySQL 8.0 |
| Reverse proxy | Nginx 1.27 |
| Conteneurisation | Docker · Docker Compose |

---

## Structure du projet

```
PCT_BD_DAS_2026/
├── PCT_frontend/          # Application Next.js
│   ├── src/app/
│   │   ├── (auth)/login/          # Authentification
│   │   ├── (dashboard)/admin/     # Interface administrateur
│   │   ├── (dashboard)/enseignant/# Interface enseignant
│   │   └── (dashboard)/secretaire/# Interface secrétaire
│   ├── src/components/    # Composants réutilisables
│   ├── src/lib/api.js     # Client HTTP (apiFetch)
│   ├── src/store/         # État global (Zustand)
│   └── Dockerfile
├── PctBackend/            # API Laravel
│   ├── app/Http/Controllers/Api/
│   ├── database/migrations/
│   ├── routes/api.php
│   └── Dockerfile
├── nginx/
│   └── default.conf       # Routing Nginx
├── docker-compose.yml
└── .env                   # Variables d'environnement (non commité)
```

---

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x
- Git

---

## Lancement rapide (Docker)

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd PCT_BD_DAS_2026
```

### 2. Configurer les variables d'environnement

Créer un fichier `.env` à la racine :

```env
APP_KEY=base64:...        # Générer avec la commande ci-dessous
DB_DATABASE=pct_db
DB_USERNAME=pct_user
DB_PASSWORD=pct_password
DB_ROOT_PASSWORD=root_secret
```

Générer une APP_KEY :

```bash
docker run --rm php:8.2-alpine php -r "echo 'base64:' . base64_encode(random_bytes(32)) . PHP_EOL;"
```

### 3. Démarrer l'application

```bash
docker compose up --build
```

Les migrations s'exécutent automatiquement au démarrage. L'application est prête quand vous voyez :

```
pct-backend  | NOTICE: ready to handle connections
pct-frontend | ✓ Ready in 234ms
```

---

## URLs

| Service | URL |
|---------|-----|
| Frontend Next.js | http://localhost:3000 |
| Application complète (via Nginx) | http://localhost:8000 |
| API Laravel | http://localhost:8000/api/v1 |
| Documentation Swagger | http://localhost:8000/swagger |

---

## Commandes Docker

```bash
# Démarrer en arrière-plan
docker compose up -d

# Voir les logs en temps réel
docker compose logs -f
docker compose logs -f backend

# Arrêter proprement
docker compose down

# Réinitialiser (supprime la base de données)
docker compose down -v

# Rebuild complet sans cache
docker compose build --no-cache
docker compose up

# Migrations manuelles
docker compose exec backend php artisan migrate

# Shell dans le container backend
docker compose exec backend sh

# Accès MySQL
docker compose exec db mysql -u pct_user -ppct_password pct_db
```

---

## Développement local (sans Docker)

### Backend Laravel

```bash
cd PctBackend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve        # → http://localhost:8000
```

### Frontend Next.js

```bash
cd PCT_frontend
npm install --legacy-peer-deps
npm run dev              # → http://localhost:3000
```

> Le fichier `PCT_frontend/.env.local` contient déjà `NEXT_PUBLIC_API_URL=http://localhost:8000`.

---

## API — Endpoints

Toutes les routes protégées requièrent :
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/v1/login` | Connexion — retourne un token Sanctum |
| `POST` | `/api/v1/logout` | Déconnexion |
| `GET` | `/api/v1/me` | Profil de l'utilisateur connecté |

### Ressources (authentifié)

| Ressource | Endpoint | Opérations |
|-----------|----------|------------|
| Enseignants | `/api/v1/enseignants` | GET · POST · PUT · PATCH · DELETE |
| Secrétaires | `/api/v1/secretaires` | GET · POST · PUT · PATCH · DELETE |
| Départements | `/api/v1/departements` | GET · POST · PUT · DELETE |
| Années académiques | `/api/v1/annees` | GET · POST · PUT · DELETE |
| Activer une année | `/api/v1/annees/{id}/activer` | PATCH |
| Cours | `/api/v1/cours` | GET · POST · PUT · DELETE |
| Attributions | `/api/v1/attributions` | GET · POST · PUT · DELETE |
| Activités pédagogiques | `/api/v1/activites` | GET · POST · DELETE |
| Volumes horaires | `/api/v1/volumes` | GET |
| Valider un volume | `/api/v1/volumes/{id}/valider` | POST |
| Paramètres de calcul | `/api/v1/parametres` | GET · POST · PUT · DELETE |
| Export PDF | `/api/v1/exports/pdf` | GET |
| Export Excel | `/api/v1/exports/excel` | GET |

---

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| **Admin** | Tableau de bord global, gestion enseignants/secrétaires/cours/attributions, paramètres, rapports |
| **Secrétaire** | Consultation enseignants, suivi heures, validation volumes |
| **Enseignant** | Déclaration d'activités, historique personnel |

---

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `APP_KEY` | Clé de chiffrement Laravel (obligatoire) |
| `DB_DATABASE` | Nom de la base de données MySQL |
| `DB_USERNAME` | Utilisateur MySQL |
| `DB_PASSWORD` | Mot de passe MySQL |
| `DB_ROOT_PASSWORD` | Mot de passe root MySQL |

> **Le fichier `.env` ne doit jamais être commité** — il est dans `.gitignore`.

---

## Architecture Docker

```
Host
 ├── :3000 ──────────► pct-frontend  (Next.js)
 │
 └── :8000 ──────────► pct-nginx     (Nginx)
                            │
                            ├── /api/*   ──► pct-backend (PHP-FPM :9000)
                            │                     └──────► pct-db (MySQL :3306)
                            │
                            └── /*       ──► pct-frontend (:3000)
```

---

## Branches Git

| Branche | Rôle |
|---------|------|
| `main` | Code stable de référence |
| `PCT_frontend` | Développement frontend |
| `PCT_backend` | Développement backend |
| `fullstack` | Configuration Docker complète |

---

## Dépannage

**Migrations échouent au démarrage :**
```bash
docker compose down -v
docker compose up --build
```

**Port déjà utilisé (PowerShell) :**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

**Forcer la reconstruction d'un seul service :**
```bash
docker compose build --no-cache backend
docker compose up backend nginx db
```