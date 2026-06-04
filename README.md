# PCT — Plateforme de Calcul des Traitements

Système fullstack de gestion des volumes horaires et des traitements enseignants.  
Monorepo contenant le frontend Next.js et le backend Laravel, orchestrés via Docker.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15.5 · React 19 · TypeScript · TailwindCSS · Radix UI |
| Backend | Laravel 12 · PHP 8.2 · Laravel Sanctum (Bearer tokens) |
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
│   │   │   ├── api.ts                 # Client axios (Bearer token auto + intercepteurs)
│   │   │   └── errors.ts             # Gestion d'erreurs API
│   │   ├── store/authStore.ts         # État global Zustand + sync cookie
│   │   └── hooks/useAuth.ts          # Login / logout
│   └── Dockerfile
├── PctBackend/                        # API Laravel
│   ├── app/Http/
│   │   ├── Controllers/Api/           # 12 controllers REST
│   │   └── Middleware/CheckRole.php   # Middleware de rôle (role:admin,secretaire,...)
│   ├── bootstrap/app.php              # Enregistrement alias 'role' (sans statefulApi)
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/DatabaseSeeder.php # 8 comptes de démo
│   ├── routes/api.php                 # Routes avec contrôle de rôle par groupe
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

### 3. Builder et démarrer l'application

```bash
docker compose up --build -d
```

> **Important** : toujours utiliser `--build` au premier lancement ou après modification du code source pour intégrer les changements dans les images Docker.

L'application est prête quand tous les services sont `Up` :

```bash
docker compose ps
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

> MySQL n'est **pas** exposé à l'extérieur du réseau Docker.

---

## Comptes de démo

Après `db:seed` :

> Tous les utilisateurs se connectent avec leur **email institutionnel `@uvci.edu.ci`**.

### Administrateur

| Email | Mot de passe | Dashboard |
|-------|--------------|-----------|
| `admin@uvci.edu.ci` | `Admin@2026` | http://localhost:3000/admin |

> L'admin peut créer, modifier et désactiver tous les comptes depuis le dashboard.

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

Quand l'admin crée un enseignant ou une secrétaire depuis le dashboard :
- **Identifiant de connexion** = email institutionnel saisi (`prenom.nom@uvci.edu.ci`)
- **Mot de passe fourni** → utilisé tel quel
- **Mot de passe non fourni** → généré automatiquement : `Pct@{année}` (ex : `Pct@2026`)
- Le mot de passe généré est retourné dans la réponse API

---

## Sécurité & Contrôle d'accès

### Protection des routes frontend (3 couches)

1. **Server Component layout** — `cookies()` côté serveur, redirect HTTP 307 immédiat si non authentifié
2. **Nested layout par rôle** — chaque section (`/admin`, `/secretaire`, `/enseignant`) vérifie le rôle côté serveur avant tout rendu
3. **AuthGuard client** — vérifie `!!token` dans Zustand pour protéger les transitions client-side

### Contrôle d'accès API (backend)

Middleware `role:` appliqué sur chaque groupe de routes. Aucune session Laravel — authentification **Bearer token uniquement** (pas de CSRF).

| Routes | Rôles autorisés |
|--------|----------------|
| `GET /enseignants`, `GET /volumes`, lecture générale | `admin`, `secretaire` |
| `POST/PUT/PATCH/DELETE /enseignants` | `admin` |
| `GET/POST/PUT/PATCH/DELETE /secretaires` | `admin` |
| `GET/POST/PUT/DELETE /departements`, `/cours`, `/attributions`, `/annees` | écriture: `admin` / lecture: selon ressource |
| `POST /volumes/{id}/valider` | `admin`, `secretaire` |
| `GET /attributions`, `GET /activites` | tous authentifiés (filtrés par rôle côté controller) |
| `POST /activites` | `admin`, `enseignant` |
| `GET /parametres`, `GET /exports/*` | `admin` |

> Un enseignant ne voit que **ses propres** attributions et activités — filtre automatique dans le controller.

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
| `POST` | `/api/v1/login` | Connexion avec email ou login — retourne token Sanctum + profil |
| `POST` | `/api/v1/logout` | Déconnexion (révoque le token courant) |
| `GET` | `/api/v1/me` | Profil de l'utilisateur connecté |

### Ressources (authentifié)

| Ressource | Endpoint | Rôles |
|-----------|----------|-------|
| Enseignants | `/api/v1/enseignants` | lecture: admin+sec / écriture: admin |
| Secrétaires | `/api/v1/secretaires` | admin |
| Départements | `/api/v1/departements` | lecture: admin+sec / écriture: admin |
| Années académiques | `/api/v1/annees` | lecture: tous / écriture: admin |
| Cours | `/api/v1/cours` | lecture: tous / écriture: admin |
| Attributions | `/api/v1/attributions` | lecture: tous (filtrées) / écriture: admin |
| Activités pédagogiques | `/api/v1/activites` | lecture: tous (filtrées) / création: admin+ens |
| Volumes horaires | `/api/v1/volumes` | admin+sec |
| Valider un volume | `/api/v1/volumes/{id}/valider` | admin+sec |
| Paramètres VHN | `/api/v1/parametres` | admin |
| Export CSV | `/api/v1/exports/pdf` et `/exports/excel` | admin |

---

## Commandes Docker

```bash
# Premier lancement ou après modification du code source
docker compose up --build -d

# Simple redémarrage sans modification (conserve les images existantes)
docker compose restart

# Arrêter proprement (conserve les données)
docker compose down

# Réinitialiser complètement (supprime la base de données)
docker compose down -v
docker compose up --build -d
docker exec pct-backend php artisan db:seed

# Rebuilder un seul service
docker compose up --build --no-deps -d backend
docker compose up --build --no-deps -d frontend

# Voir les logs en temps réel
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Statut des conteneurs
docker compose ps

# Seeder la base de données
docker exec pct-backend php artisan db:seed

# Réinitialiser la base + reseed
docker exec pct-backend php artisan migrate:fresh --seed --force

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
| `APP_KEY` | Clé de chiffrement Laravel (base64:...) | Oui |
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
| `PCT_frontend` | Branche de développement actif |

---

## Dépannage

**Erreur 419 CSRF au login :**
```bash
# Rebuilder le backend (vérifier que statefulApi() est absent de bootstrap/app.php)
docker compose up --build --no-deps -d backend
```

**Erreur 403 après un migrate:fresh (token expiré/invalide) :**
```
# Vider le localStorage dans le navigateur
# F12 → Console → coller :
localStorage.clear(); document.cookie="pct_user=;path=/;max-age=0"; location.href="/login";
```

**Erreurs 401 sur toutes les requêtes API :**
```bash
# La base est vide — peupler les comptes de test
docker exec pct-backend php artisan db:seed
# Puis se connecter sur http://localhost:3000/login
```

**Redirection en boucle vers /login :**
```
# Ouvrir une fenêtre privée et se reconnecter
# OU vider le localStorage (F12 → Application → Local Storage → tout supprimer)
```

**Migrations échouent au démarrage :**
```bash
docker compose down -v
docker compose up --build -d
docker exec pct-backend php artisan db:seed
```

**Port déjà utilisé :**
```powershell
# Windows PowerShell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

**Après modification du code source (backend ou frontend) :**
```bash
# Toujours rebuilder pour intégrer les changements dans l'image
docker compose up --build -d
# NE PAS utiliser seulement "docker compose restart" — recharge l'ancienne image
```

**Vider tous les caches Laravel :**
```bash
docker exec pct-backend php artisan optimize:clear
docker exec pct-backend php artisan route:clear
docker exec pct-backend php artisan config:clear
```
