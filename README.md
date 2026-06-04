# PCT — Plateforme de Calcul des Traitements

Système fullstack de gestion des volumes horaires et des traitements enseignants.  
Monorepo contenant le frontend Next.js et le backend Laravel, orchestrés via Docker.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15.5 · React 19 · TypeScript · TailwindCSS · Radix UI |
| Backend | Laravel 12 · PHP 8.2 · Laravel Sanctum (API tokens) |
| Base de données | MySQL 8.0 |
| Reverse proxy | Nginx 1.27 |
| Conteneurisation | Docker · Docker Compose |

---

## Structure du projet

```
PCT_BD_DAS_2026/
├── PCT_frontend/                      # Application Next.js
│   ├── middleware.ts                  # Garde-fou Edge (routes protégées)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/          # Page de connexion (publique)
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx         # Protection serveur : cookie requis
│   │   │       ├── admin/
│   │   │       │   ├── layout.tsx     # Protection serveur : rôle admin
│   │   │       │   └── */page.tsx     # Pages admin
│   │   │       ├── secretaire/
│   │   │       │   ├── layout.tsx     # Protection serveur : rôle secrétaire
│   │   │       │   └── */page.tsx
│   │   │       └── enseignant/
│   │   │           ├── layout.tsx     # Protection serveur : rôle enseignant
│   │   │           └── */page.tsx
│   │   ├── components/shared/
│   │   │   ├── AppShell.tsx           # Navigation + layout applicatif
│   │   │   └── AuthGuard.tsx          # Protection client (token réactif)
│   │   ├── lib/
│   │   │   ├── api.ts                 # Client axios (Bearer token auto)
│   │   │   └── errors.ts             # Gestion d'erreurs API
│   │   ├── store/authStore.ts         # État global Zustand + cookie sync
│   │   └── hooks/useAuth.ts          # Login / logout
│   └── Dockerfile
├── PctBackend/                        # API Laravel
│   ├── app/Http/
│   │   ├── Controllers/Api/           # 12 controllers REST
│   │   └── Middleware/CheckRole.php   # Middleware de rôle
│   ├── bootstrap/app.php              # Alias middleware 'role'
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/DatabaseSeeder.php # Données de démo
│   ├── routes/api.php                 # Routes avec contrôle de rôle
│   └── Dockerfile
├── nginx/default.conf                 # /api/* → Laravel, /* → Next.js
├── docker-compose.yml
└── .env                               # Variables d'environnement (non commité)
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

Générer une `APP_KEY` :

```bash
docker run --rm php:8.2-alpine php -r "echo 'base64:' . base64_encode(random_bytes(32)) . PHP_EOL;"
```

### 3. Démarrer l'application

```bash
docker compose up --build
```

L'application est prête quand vous voyez :

```
pct-db       | ready for connections
pct-backend  | NOTICE: ready to handle connections
pct-frontend | ✓ Ready in 200ms
```

### 4. Peupler la base de données

```bash
docker exec pct-backend php artisan db:seed
```

---

## URLs

| Service | URL |
|---------|-----|
| Application (frontend) | http://localhost:3000 |
| API via Nginx | http://localhost:8000/api/v1 |
| Documentation Swagger | http://localhost:8000/swagger |

> Le frontend (port 3000) et l'API (port 8000/api/v1) sont les deux points d'entrée.  
> MySQL n'est **pas** exposé à l'extérieur du réseau Docker.

---

## Comptes de démo

Après `db:seed` (`php artisan db:seed` ou `migrate:fresh --seed`) :

> Tous les utilisateurs se connectent avec leur **email institutionnel `@uvci.edu.ci`**.

### Administrateur

| Email | Mot de passe | Dashboard |
|-------|--------------|-----------|
| `admin@uvci.edu.ci` | `Admin@2026` | http://localhost:3000/admin |

### Secrétaires

| Email | Mot de passe | Nom |
|-------|--------------|-----|
| `a.kone@uvci.edu.ci` | `Sec@2026` | Aminata Koné |
| `f.traore@uvci.edu.ci` | `Sec@2026` | Fatoumata Traoré |

### Enseignants

| Email | Mot de passe | Nom | Grade | Département |
|-------|--------------|-----|-------|-------------|
| `k.nguessan@uvci.edu.ci` | `Ens@2026` | Kouassi N'Guessan | Maître-Assistant | Informatique |
| `b.diallo@uvci.edu.ci` | `Ens@2026` | Boubacar Diallo | Professeur | Mathématiques |
| `m.soro@uvci.edu.ci` | `Ens@2026` | Mariame Soro | Assistant | Gestion |
| `j.kouame@uvci.edu.ci` | `Ens@2026` | Jean-Pierre Kouamé | Maître-Assistant | Informatique |
| `s.bamba@uvci.edu.ci` | `Ens@2026` | Seydou Bamba | Professeur | Sciences Éco. |

### Création de comptes par l'admin

Quand l'admin crée un enseignant ou une secrétaire :
- **Identifiant de connexion** = email institutionnel saisi (ex : `prenom.nom@uvci.edu.ci`)
- **Mot de passe fourni** → utilisé tel quel
- **Mot de passe non fourni** → généré automatiquement : `Pct@{année}` (ex : `Pct@2026`)
- Le mot de passe généré est retourné dans la réponse API pour communication à l'utilisateur

---

## Sécurité & Contrôle d'accès

### Protection des routes frontend (3 couches)

1. **Server Component layout** — `cookies()` côté serveur, redirect HTTP 307 immédiat si non authentifié
2. **Nested layout par rôle** — chaque section (`/admin`, `/secretaire`, `/enseignant`) vérifie le rôle côté serveur avant tout rendu
3. **AuthGuard client** — vérifie le token Zustand (`!!token`) pour protéger les transitions client-side

### Contrôle d'accès API (backend)

Le middleware `role:` est appliqué sur chaque groupe de routes :

| Routes | Rôles autorisés |
|--------|----------------|
| `GET /enseignants`, `GET /volumes`, lecture générale | `admin`, `secretaire` |
| `POST/PUT/DELETE /enseignants`, CRUD complet | `admin` uniquement |
| `GET /secretaires`, CRUD secrétaires | `admin` uniquement |
| `POST /volumes/{id}/valider` | `admin`, `secretaire` |
| `GET /attributions`, `GET /activites` | tous (filtrés par rôle côté serveur) |
| `POST /activites` (déclaration) | `admin`, `enseignant` |
| `GET /exports/*`, `GET /parametres` | `admin` uniquement |

> Un enseignant ne voit que **ses propres** attributions et activités (filtre automatique dans le controller).

---

## API — Endpoints

Toutes les routes protégées requièrent :
```
Authorization: Bearer <token>
Accept: application/json
```

### Authentification (public)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/v1/login` | Connexion — retourne un token Sanctum + profil |
| `POST` | `/api/v1/logout` | Déconnexion (révoque le token) |
| `GET` | `/api/v1/me` | Profil de l'utilisateur connecté |

### Ressources

| Ressource | Endpoint | Rôles |
|-----------|----------|-------|
| Enseignants | `/api/v1/enseignants` | lecture: admin+sec / écriture: admin |
| Secrétaires | `/api/v1/secretaires` | admin |
| Départements | `/api/v1/departements` | lecture: admin+sec / écriture: admin |
| Années académiques | `/api/v1/annees` | lecture: tous / écriture: admin |
| Cours | `/api/v1/cours` | lecture: tous / écriture: admin |
| Attributions | `/api/v1/attributions` | lecture: tous (filtrés) / écriture: admin |
| Activités pédagogiques | `/api/v1/activites` | lecture: tous (filtrées) / création: admin+ens |
| Volumes horaires | `/api/v1/volumes` | admin+sec |
| Valider un volume | `/api/v1/volumes/{id}/valider` | admin+sec |
| Paramètres VHN | `/api/v1/parametres` | admin |
| Export CSV | `/api/v1/exports/pdf` | admin |

---

## Commandes Docker

```bash
# Démarrer en arrière-plan
docker compose up -d

# Voir les logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Arrêter proprement (conserve les données)
docker compose down

# Réinitialiser complètement (supprime la base)
docker compose down -v
docker compose up --build

# Rebuilder seulement le frontend
docker compose up --build --no-deps frontend

# Seeder la base de données
docker exec pct-backend php artisan db:seed

# Vider les caches Laravel
docker exec pct-backend php artisan optimize:clear

# Shell dans le backend
docker exec -it pct-backend sh

# Console Laravel (tinker)
docker exec pct-backend php artisan tinker
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
php artisan db:seed
php artisan serve        # → http://localhost:8000
```

### Frontend Next.js

```bash
cd PCT_frontend
npm install --legacy-peer-deps
# Créer PCT_frontend/.env.local :
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev              # → http://localhost:3000
```

---

## Architecture Docker

```
Navigateur
 ├── :3000 ──────────► pct-frontend  (Next.js standalone)
 │                           │
 │                           └── Server Components (SSR + auth côté serveur)
 │
 └── :8000 ──────────► pct-nginx     (Nginx 1.27)
                            │
                            ├── /api/*     ──► pct-backend (PHP-FPM :9000)
                            │   /sanctum/*       └──► pct-db (MySQL :3306)
                            │   /swagger/*
                            │
                            └── /*         ──► pct-frontend (:3000)

Réseau interne Docker uniquement :
  pct-db (MySQL) — port 3306 non exposé à l'extérieur
```

---

## Variables d'environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `APP_KEY` | Clé de chiffrement Laravel | Oui |
| `DB_DATABASE` | Nom de la base MySQL | Oui |
| `DB_USERNAME` | Utilisateur MySQL | Oui |
| `DB_PASSWORD` | Mot de passe MySQL | Oui |
| `DB_ROOT_PASSWORD` | Mot de passe root MySQL | Oui |

> **Le fichier `.env` ne doit jamais être commité** — il est dans `.gitignore`.

---

## Branches Git

| Branche | Rôle |
|---------|------|
| `main` | Code stable de référence |
| `PCT_frontend` | Développement actif (frontend + backend) |

---

## Dépannage

**Erreurs 401 sur toutes les requêtes API :**
```bash
# La base est vide — peupler les comptes de test
docker exec pct-backend php artisan db:seed
# Puis se connecter sur http://localhost:3000/login
```

**Redirection en boucle vers /login :**
```bash
# Vider le localStorage dans le navigateur (F12 → Application → Local Storage)
# OU ouvrir une fenêtre privée et se reconnecter
```

**Migrations échouent au démarrage :**
```bash
docker compose down -v
docker compose up --build
docker exec pct-backend php artisan db:seed
```

**Port déjà utilisé :**
```powershell
# Windows PowerShell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

**Rebuilder un seul service :**
```bash
docker compose up --build --no-deps backend
docker compose up --build --no-deps frontend
```

**Vider tous les caches Laravel :**
```bash
docker exec pct-backend php artisan optimize:clear
docker exec pct-backend php artisan route:clear
docker exec pct-backend php artisan config:clear
```
