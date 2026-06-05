# PCT — Plateforme de Calcul des Traitements

Système fullstack de gestion des volumes horaires et des traitements enseignants à l'UVCI.  
Monorepo contenant le frontend Next.js et le backend Laravel, orchestrés via Docker.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 15.5 · React 19 · TypeScript · TailwindCSS · Radix UI |
| Backend | Laravel 12 · **PHP 8.4** · Laravel Sanctum (Bearer tokens) |
| Base de données | MySQL 8.0 |
| Reverse proxy | Nginx 1.27 |
| Conteneurisation | Docker · Docker Compose |
| Audit | spatie/laravel-activitylog 4.x |

---

## Structure du projet

```
PCT_BD_DAS_2026/
├── PCT_frontend/                      # Application Next.js
│   ├── middleware.ts                  # Garde-fou Edge (routes protégées)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/             # Page de connexion (publique)
│   │   │   │   ├── forgot-password/   # Demande reset mot de passe
│   │   │   │   └── reset-password/    # Formulaire nouveau mot de passe
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx         # Protection serveur : cookie requis
│   │   │       ├── admin/             # Interface administrateur
│   │   │       ├── secretaire/        # Interface secrétaire pédagogique
│   │   │       └── enseignant/        # Interface enseignant
│   │   ├── components/shared/
│   │   │   ├── AppShell.tsx           # Navigation + layout applicatif
│   │   │   ├── AuthGuard.tsx          # Protection client (token réactif)
│   │   │   └── ImportCsvButton.tsx    # Composant import CSV avec feedback
│   │   ├── lib/
│   │   │   ├── api.ts                 # Client Axios (Bearer token + intercepteurs)
│   │   │   └── errors.ts             # Gestion d'erreurs API
│   │   ├── store/authStore.ts         # État global Zustand + sync cookie
│   │   └── hooks/useAuth.ts          # Login / logout
│   ├── public/templates/
│   │   └── enseignants_template.csv  # Modèle d'import CSV
│   └── Dockerfile
├── PCT_backend/                       # API Laravel (PHP 8.4)
│   ├── app/Http/
│   │   ├── Controllers/Api/           # 13 controllers REST
│   │   │   ├── DashboardController.php   # KPIs + stats temps réel
│   │   │   └── PasswordResetController.php
│   │   └── Middleware/CheckRole.php   # Middleware RBAC
│   ├── app/Notifications/
│   │   ├── CompteCreeNotification.php # Email création de compte
│   │   └── VolumeValideNotification.php # Email validation/rejet volume
│   ├── bootstrap/app.php              # Config app (Bearer uniquement, pas de CSRF)
│   ├── database/migrations/           # 17 migrations dont activity_log
│   ├── database/seeders/              # 8 comptes de démo
│   ├── routes/api.php                 # Routes RBAC par groupe
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

# Email (optionnel — log par défaut, Mailtrap pour les tests)
MAIL_MAILER=log
MAIL_FROM_ADDRESS=pct@uvci.edu.ci
FRONTEND_URL=http://localhost:3000
```

Générer une `APP_KEY` :

```bash
docker run --rm php:8.4-alpine php -r "echo 'base64:' . base64_encode(random_bytes(32)) . PHP_EOL;"
```

### 3. Builder et démarrer

```bash
docker compose up --build -d
```

L'application est prête quand `docker compose ps` affiche tous les services `Running`.

### 4. Peupler la base de données (comptes de démo)

```bash
docker exec pct-backend php artisan db:seed
```

---

## URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend direct** | http://localhost:3000 | Next.js — accès principal |
| **Via Nginx** | http://localhost:8000 | Reverse proxy (API + frontend) |
| **API uniquement** | http://localhost:8000/api/v1 | Endpoints Laravel |
| **Swagger / Docs** | http://localhost:8000/swagger | Documentation interactive |

> **Utilise http://localhost:3000** pour naviguer dans l'application.  
> Le port **8000** est le point d'entrée Nginx : `/api/*` → Laravel, `/*` → Next.js.  
> MySQL n'est **pas** exposé hors du réseau Docker.

---

## Comptes de démo

Après `db:seed` — tous les comptes utilisent leur **email @uvci.edu.ci** comme identifiant.

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

- **Login** = email institutionnel (`prenom.nom@uvci.edu.ci`)
- **Mot de passe non fourni** → généré automatiquement `Pct@{année}` et retourné dans la réponse API
- Un email de bienvenue est envoyé automatiquement (si MAIL_MAILER configuré)

---

## Fonctionnalités

| Fonctionnalité | Rôles | Détail |
|----------------|-------|--------|
| Dashboard temps réel | Admin | KPIs, heures par département, évolution mensuelle |
| Gestion enseignants | Admin | CRUD + activation/désactivation + import CSV |
| Import CSV enseignants | Admin | Upload fichier, validation ligne par ligne, email automatique |
| Gestion secrétaires | Admin | CRUD + activation/désactivation |
| Gestion cours & attributions | Admin | CRUD + liaison enseignant/cours/année |
| Déclaration d'activité | Enseignant | Calcul VHN automatique via paramètres |
| Modification d'activité | Admin + Enseignant | Uniquement si volume non encore validé |
| Validation volumes horaires | Admin + Secrétaire | Valider / rejeter avec observations |
| Notifications email | Automatique | Création compte · Validation/rejet volume |
| Mot de passe oublié | Public | Lien de reset par email |
| Reset password admin | Admin | Reset direct sans email depuis le dashboard |
| Audit log | Automatique | Trace Enseignant, Activité, Validation (spatie/activitylog) |
| Export PDF / Excel | Admin | Rapports volumes horaires |
| Documentation API | Public | Swagger UI sur `/swagger` |

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
| `POST` | `/api/v1/login` | Connexion — retourne token Sanctum + profil |
| `POST` | `/api/v1/logout` | Déconnexion (révoque le token) |
| `GET` | `/api/v1/me` | Profil de l'utilisateur connecté |
| `POST` | `/api/v1/forgot-password` | Envoi d'un email de réinitialisation |
| `POST` | `/api/v1/reset-password` | Réinitialisation via token email |

### Ressources (authentifié)

| Ressource | Endpoint | Rôles |
|-----------|----------|-------|
| Dashboard stats | `GET /api/v1/dashboard/stats` | admin |
| Enseignants | `GET/POST/PUT/PATCH/DELETE /api/v1/enseignants` | lecture: admin+sec / écriture: admin |
| Import CSV | `POST /api/v1/enseignants/import` | admin |
| Reset password | `POST /api/v1/users/{id}/reset-password` | admin |
| Secrétaires | `GET/POST/PUT/PATCH/DELETE /api/v1/secretaires` | admin |
| Départements | `GET/POST/PUT/DELETE /api/v1/departements` | lecture: admin+sec / écriture: admin |
| Années | `GET/POST/PUT/DELETE /api/v1/annees` | lecture: tous / écriture: admin |
| Cours | `GET/POST/PUT/DELETE /api/v1/cours` | lecture: tous / écriture: admin |
| Attributions | `GET/POST/PUT/DELETE /api/v1/attributions` | lecture: tous (filtrées) / écriture: admin |
| Activités | `GET/POST /api/v1/activites` | lecture: tous (filtrées) / création: admin+ens |
| Modifier activité | `PUT /api/v1/activites/{id}` | admin+enseignant (si non validé) |
| Volumes | `GET /api/v1/volumes` | admin+sec |
| Valider volume | `POST /api/v1/volumes/{id}/valider` | admin+sec |
| Paramètres VHN | `GET/POST/PUT/DELETE /api/v1/parametres` | admin |
| Exports | `GET /api/v1/exports/pdf` · `/exports/excel` | admin |

---

## Sécurité & Contrôle d'accès

### Protection frontend (3 couches)

1. **Edge Middleware** (`middleware.ts`) — vérifie le cookie avant tout rendu, bloque les accès latéraux entre rôles
2. **Server Component layouts** — chaque section (`/admin`, `/secretaire`, `/enseignant`) vérifie le rôle côté serveur
3. **AuthGuard client** — protection réactive lors des navigations client-side

### Contrôle d'accès API

Middleware `role:` appliqué sur chaque groupe de routes. Authentification **Bearer token uniquement** — pas de sessions, pas de CSRF.

---

## Commandes Docker

```bash
# Lancement initial ou après modification du code
docker compose up --build -d

# Redémarrage simple (sans changement de code)
docker compose restart

# Arrêt (conserve les données)
docker compose down

# Reset complet (supprime la base de données)
docker compose down -v
docker compose up --build -d
docker exec pct-backend php artisan db:seed

# Rebuilder un seul service
docker compose up --build --no-deps -d backend
docker compose up --build --no-deps -d frontend

# Logs en temps réel
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Statut des containers
docker compose ps

# Migrations
docker exec pct-backend php artisan migrate
docker exec pct-backend php artisan migrate:fresh --seed --force

# Vider les caches Laravel
docker exec pct-backend php artisan optimize:clear

# Shell dans le backend
docker exec -it pct-backend sh

# Console Laravel
docker exec pct-backend php artisan tinker
```

---

## Développement local (sans Docker)

### Backend Laravel

```bash
cd PCT_backend
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
# .env.local est déjà configuré : NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev              # → http://localhost:3000
```

---

## Variables d'environnement

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `APP_KEY` | Clé de chiffrement Laravel (`base64:...`) | Oui |
| `DB_DATABASE` | Nom de la base MySQL | Oui |
| `DB_USERNAME` | Utilisateur MySQL | Oui |
| `DB_PASSWORD` | Mot de passe MySQL | Oui |
| `DB_ROOT_PASSWORD` | Mot de passe root MySQL | Oui |
| `MAIL_MAILER` | Driver mail (`log`, `smtp`) | Non — défaut: `log` |
| `MAIL_HOST` | Serveur SMTP | Non |
| `MAIL_PORT` | Port SMTP | Non |
| `MAIL_USERNAME` | Identifiant SMTP | Non |
| `MAIL_PASSWORD` | Mot de passe SMTP | Non |
| `MAIL_FROM_ADDRESS` | Adresse expéditeur | Non — défaut: `pct@uvci.edu.ci` |
| `FRONTEND_URL` | URL publique du frontend | Non — défaut: `http://localhost:3000` |

> **Le fichier `.env` ne doit jamais être commité** — il est dans `.gitignore`.

---

## Architecture Docker

```
Navigateur
 ├── :3000 ──────────► pct-frontend  (Next.js standalone, Node.js)
 │
 └── :8000 ──────────► pct-nginx     (Nginx 1.27)
                            │
                            ├── /api/*      ──► pct-backend (PHP-FPM 8.4 :9000)
                            │   /sanctum/*         └──► pct-db (MySQL 8.0)
                            │   /swagger/*
                            │
                            └── /*          ──► pct-frontend (:3000)
```

---

## Branches Git

| Branche | Rôle |
|---------|------|
| `main` | Code stable de référence |
| `fullstack` | Branche principale de développement (Docker + backend + frontend) |
| `PCT_frontend` | Développement frontend isolé |
| `PCT_backend` | Développement backend isolé |

---

## Dépannage

**Erreur 403 après migrate:fresh (token invalide) :**
```javascript
// F12 → Console navigateur
localStorage.clear(); document.cookie="pct_user=;path=/;max-age=0"; location.href="/login";
```

**Erreurs 401 sur toutes les requêtes :**
```bash
# Base vide — peupler les comptes
docker exec pct-backend php artisan db:seed
```

**Migrations échouent au démarrage :**
```bash
docker compose down -v
docker compose up --build -d
docker exec pct-backend php artisan db:seed
```

**Redirection en boucle vers /login :**
```
Ouvrir une fenêtre privée ou vider le localStorage
F12 → Application → Local Storage → tout supprimer
```

**Port déjà utilisé (PowerShell) :**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

**Après modification du code source :**
```bash
# Toujours rebuilder — "docker compose restart" ne prend pas en compte les changements
docker compose up --build -d
```

**Emails non reçus :**
```bash
# En développement, les emails sont dans les logs (MAIL_MAILER=log par défaut)
docker compose logs backend | grep "mail"
# Pour activer les vrais emails, configurer MAIL_MAILER=smtp dans .env
```
