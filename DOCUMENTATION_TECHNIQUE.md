# Documentation Technique — PCT UVCI
## Plateforme de Calcul des Totaux — Université Virtuelle de Côte d'Ivoire

---

## Table des matières

1. [Contexte et objectifs](#1-contexte-et-objectifs)
2. [Méthodologie MERISE](#2-méthodologie-merise)
   - 2.1 Modèle Conceptuel de Données (MCD)
   - 2.2 Modèle Logique de Données (MLD)
   - 2.3 Modèle Physique de Données (MPD)
   - 2.4 Modèle Conceptuel des Traitements (MCT)
   - 2.5 Modèle Organisationnel des Traitements (MOT)
3. [Architecture technique](#3-architecture-technique)
4. [Structure des dossiers](#4-structure-des-dossiers)
5. [Base de données](#5-base-de-données)
6. [API REST](#6-api-rest)
7. [Authentification et sécurité](#7-authentification-et-sécurité)
8. [Déploiement Docker](#8-déploiement-docker)
9. [Variables d'environnement](#9-variables-denvironnement)
10. [Maintenance et administration](#10-maintenance-et-administration)

---

## 1. Contexte et objectifs

### 1.1 Présentation du projet

Le **PCT UVCI** (Plateforme de Calcul des Totaux de l'Université Virtuelle de Côte d'Ivoire) est un système d'information web destiné à la gestion des activités pédagogiques et des volumes horaires des enseignants. Il automatise le calcul des Volumes Horaires Normalisés (VHN) et le suivi des charges d'enseignement sur l'ensemble des années académiques.

### 1.2 Objectifs fonctionnels

- Permettre aux enseignants de déclarer leurs activités pédagogiques en ligne
- Calculer automatiquement le VHN de chaque activité selon des paramètres configurables
- Offrir au secrétariat pédagogique un outil de validation et de suivi des activités
- Fournir à l'administration une vue consolidée des heures par département
- Générer des rapports d'état (PDF, Excel) pour les instances décisionnelles

### 1.3 Acteurs du système

| Acteur | Rôle |
|--------|------|
| **Administrateur** | Gestion globale de la plateforme, configuration des paramètres VHN, gestion des utilisateurs |
| **Secrétaire pédagogique** | Validation/rejet des activités déclarées, suivi des volumes horaires |
| **Enseignant** | Déclaration des activités pédagogiques, consultation de son historique |

---

## 2. Méthodologie MERISE

La conception du système PCT UVCI repose sur la méthodologie **MERISE** (Méthode d'Étude et de Réalisation Informatique pour les Systèmes d'Entreprise), adoptée pour sa rigueur dans la modélisation des données et des traitements.

---

### 2.1 Modèle Conceptuel de Données (MCD)

Le MCD identifie les entités du domaine métier et leurs associations, indépendamment de toute contrainte technique.

#### Entités

| Entité | Description | Attributs principaux |
|--------|-------------|----------------------|
| **UTILISATEUR** | Compte d'accès à la plateforme | id, login, email, password, role, actif |
| **ENSEIGNANT** | Profil d'un enseignant | id, nom, prenom, email, grade, statut, taux_horaire, actif |
| **SECRETAIRE** | Profil d'une secrétaire | id, nom, prenom, email, telephone, actif |
| **DEPARTEMENT** | Unité organisationnelle | id, nom_departement, responsable |
| **ANNEE_ACADEMIQUE** | Période d'enseignement | id, libelle_annee, date_debut, date_fin, active |
| **COURS** | Unité d'enseignement (ECUE) | id, intitule_ecue, niveau, semestre, credit_ecue, charge_horaire_annuel |
| **ATTRIBUTION** | Affectation d'un cours à un enseignant | id, charge_horaire, date_attribution |
| **ACTIVITE_PEDAGOGIQUE** | Activité déclarée par un enseignant | id, type_operation, niveau_complexite, date_activite, volume_horaire, statut, observations |
| **VOLUME_HORAIRE** | Cumul annuel des heures d'un enseignant | id, heures_prevues, heures_realisees, heures_complementaires |
| **VALIDATION** | Décision de validation d'un volume | id, statut_validation, date_validation, observations |
| **PARAMETRE_CALCUL** | Coefficient VHN par type/complexité | id, type_operation, niveau_complexite, coefficient_vhn, description |

#### Associations

```
ENSEIGNANT ─────(appartient à)──── DEPARTEMENT
    │ 1,n                                  0,1
    │
    ├──(reçoit)────────────────── ATTRIBUTION ────(porte sur)──── COURS
    │              1,n         1,1           1,n              1,n
    │
    └──(cumule)────────────────── VOLUME_HORAIRE ────(validé par)──── VALIDATION
                   1,n         1,1             0,1               1,1

ATTRIBUTION ──(contient)──── ACTIVITE_PEDAGOGIQUE
                1,n        1,1

ANNEE_ACADEMIQUE ──(cadre)──── ATTRIBUTION
                    1,n      1,1

ANNEE_ACADEMIQUE ──(cadre)──── ACTIVITE_PEDAGOGIQUE
                    1,n      1,1

ANNEE_ACADEMIQUE ──(cadre)──── VOLUME_HORAIRE
                    1,n      1,1

UTILISATEUR ──(authentifie)──── ENSEIGNANT  (0,1)
UTILISATEUR ──(authentifie)──── SECRETAIRE  (0,1)
```

#### Cardinalités clés

| Association | Cardinalité | Signification |
|-------------|-------------|---------------|
| ENSEIGNANT — DEPARTEMENT | (1,1) — (0,n) | Un enseignant appartient à un seul département ; un département peut avoir plusieurs enseignants |
| ENSEIGNANT — ATTRIBUTION | (0,n) — (1,1) | Un enseignant peut avoir plusieurs attributions ; une attribution appartient à un seul enseignant |
| ATTRIBUTION — ACTIVITE | (0,n) — (1,1) | Une attribution peut générer plusieurs activités |
| ENSEIGNANT — VOLUME_HORAIRE | (0,n) — (1,1) | Un enseignant a un volume horaire par année académique |
| VOLUME_HORAIRE — VALIDATION | (0,1) — (1,1) | Un volume peut être validé une seule fois |

---

### 2.2 Modèle Logique de Données (MLD)

Le MLD traduit le MCD en tables relationnelles en appliquant les règles de passage.

```
utilisateurs (#id, login, email, password, role, actif, enseignant_id=>enseignants, secretaire_id=>secretaires)

departements (#id, nom_departement, responsable)

enseignants (#id, nom, prenom, email, telephone, grade, statut, taux_horaire, actif, departement_id=>departements)

secretaires (#id, nom, prenom, email, telephone, actif)

annees_academiques (#id, libelle_annee, date_debut, date_fin, active)

cours (#id, intitule_ecue, niveau, semestre, credit_ecue, code_specialite, charge_horaire_annuel)

attributions (#id, enseignant_id=>enseignants, cours_id=>cours, annee_id=>annees_academiques,
              charge_horaire, date_attribution)

activites_pedagogiques (#id, attribution_id=>attributions, annee_id=>annees_academiques,
                         type_operation, niveau_complexite, date_activite, volume_horaire,
                         statut, observations, observations_secretaire)

volumes_horaires (#id, enseignant_id=>enseignants, annee_id=>annees_academiques,
                  heures_prevues, heures_realisees, heures_complementaires)
                  UNIQUE (enseignant_id, annee_id)

validations (#id, volume_id=>volumes_horaires, statut_validation, date_validation, observations)

parametres_calcul (#id, type_operation, niveau_complexite, coefficient_vhn, description)
                   UNIQUE (type_operation, niveau_complexite)
```

---

### 2.3 Modèle Physique de Données (MPD)

#### Table `utilisateurs`

| Colonne | Type | Contrainte |
|---------|------|------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| login | VARCHAR(255) | NOT NULL, UNIQUE |
| email | VARCHAR(255) | NOT NULL |
| password | VARCHAR(255) | NOT NULL (bcrypt) |
| role | ENUM('admin','secretaire','enseignant') | NOT NULL |
| actif | TINYINT(1) | DEFAULT 1 |
| enseignant_id | BIGINT UNSIGNED | FK → enseignants(id), NULL |
| secretaire_id | BIGINT UNSIGNED | FK → secretaires(id), NULL |
| created_at, updated_at | TIMESTAMP | NULL |

#### Table `enseignants`

| Colonne | Type | Contrainte |
|---------|------|------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| nom | VARCHAR(255) | NOT NULL |
| prenom | VARCHAR(255) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| telephone | VARCHAR(255) | NULL |
| grade | ENUM('Assistant','Maitre-Assistant','Professeur') | NOT NULL |
| statut | ENUM('Permanent','Vacataire') | NOT NULL |
| taux_horaire | DECIMAL(10,2) | NOT NULL |
| actif | TINYINT(1) | DEFAULT 1 |
| departement_id | BIGINT UNSIGNED | FK → departements(id) |

#### Table `attributions`

| Colonne | Type | Contrainte |
|---------|------|------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| enseignant_id | BIGINT UNSIGNED | FK → enseignants(id), CASCADE DELETE |
| cours_id | BIGINT UNSIGNED | FK → cours(id), CASCADE DELETE |
| annee_id | BIGINT UNSIGNED | FK → annees_academiques(id), CASCADE DELETE |
| charge_horaire | INT | NOT NULL |
| date_attribution | DATE | NOT NULL |

#### Table `activites_pedagogiques`

| Colonne | Type | Contrainte |
|---------|------|------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| attribution_id | BIGINT UNSIGNED | FK → attributions(id), CASCADE DELETE |
| annee_id | BIGINT UNSIGNED | FK → annees_academiques(id), CASCADE DELETE |
| type_operation | ENUM('creation','mise_a_jour') | NOT NULL |
| niveau_complexite | ENUM('simple','intermediaire','complexe') | NOT NULL |
| date_activite | DATE | NOT NULL |
| volume_horaire | DECIMAL(8,2) | NOT NULL (calculé automatiquement) |
| statut | ENUM('en_attente','valide','rejete') | DEFAULT 'en_attente' |
| observations | TEXT | NULL |
| observations_secretaire | TEXT | NULL |

#### Table `volumes_horaires`

| Colonne | Type | Contrainte |
|---------|------|------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| enseignant_id | BIGINT UNSIGNED | FK → enseignants(id), CASCADE DELETE |
| annee_id | BIGINT UNSIGNED | FK → annees_academiques(id), CASCADE DELETE |
| heures_prevues | DECIMAL(8,2) | DEFAULT 0 |
| heures_realisees | DECIMAL(8,2) | DEFAULT 0 |
| heures_complementaires | DECIMAL(8,2) | DEFAULT 0 |
| — | UNIQUE | (enseignant_id, annee_id) |

#### Table `parametres_calcul`

| Colonne | Type | Contrainte |
|---------|------|------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT |
| type_operation | ENUM('creation','mise_a_jour') | NOT NULL |
| niveau_complexite | ENUM('simple','intermediaire','complexe') | NOT NULL |
| coefficient_vhn | DECIMAL(5,2) | NOT NULL |
| description | TEXT | NULL |
| — | UNIQUE | (type_operation, niveau_complexite) |

---

### 2.4 Modèle Conceptuel des Traitements (MCT)

Le MCT décrit les processus métier indépendamment de leur organisation.

#### Processus 1 : Authentification

```
Événement déclencheur : Saisie des identifiants
─────────────────────────────────────────────────
Opération : Vérifier identifiants
  - Chercher utilisateur par login/email
  - Comparer le mot de passe (Hash::check)
  - Vérifier le statut actif du compte
─────────────────────────────────────────────────
Résultats :
  [Identifiants valides]  → Émettre token Sanctum + profil utilisateur
  [Identifiants invalides] → Retourner erreur 401
  [Compte désactivé]       → Retourner erreur 403
```

#### Processus 2 : Déclaration d'activité pédagogique

```
Événement déclencheur : Soumission du formulaire d'activité (enseignant)
──────────────────────────────────────────────────────────────────────────
Opération : Enregistrer l'activité
  - Récupérer le paramètre VHN (type_operation × niveau_complexite)
  - Calculer volume_horaire = coefficient_vhn
  - Créer l'enregistrement ActivitePedagogique (statut = en_attente)
  - Mettre à jour le VolumeHoraire (syncVolume)
──────────────────────────────────────────────────────────────────────────
Résultats :
  [Paramètre VHN trouvé]   → Activité créée, volume synchronisé
  [Paramètre VHN manquant] → Erreur 422 (paramètre non configuré)
```

#### Processus 3 : Calcul automatique du VHN

```
Règle de gestion :
  VHN = coefficient(type_operation, niveau_complexite)

  Exemple :
  - Création × Simple       → 1.0 VHN
  - Création × Intermédiaire → 1.5 VHN
  - Création × Complexe     → 2.0 VHN
  - Mise à jour × Simple    → 0.5 VHN
  ...

Synchronisation automatique (syncVolume) :
  heures_realisees = Σ volume_horaire (activités NON rejetées)
  heures_prevues   = Σ charge_horaire (toutes les attributions)
```

#### Processus 4 : Validation d'une activité (secrétaire)

```
Événement déclencheur : Action du secrétaire sur une activité
──────────────────────────────────────────────────────────────
Opération : Changer le statut de l'activité
  - Mettre à jour statut : en_attente | valide | rejete
  - Optionnel : enregistrer observations_secretaire
  - Re-synchroniser le volume horaire (syncVolume)
──────────────────────────────────────────────────────────────
Résultats :
  [Validée]      → statut = 'valide',  heures_realisees recalculées
  [Rejetée]      → statut = 'rejete',  heures_realisees recalculées (exclut rejetées)
  [En attente]   → statut = 'en_attente', en attente de traitement
```

#### Processus 5 : Génération de rapport

```
Événement déclencheur : Demande d'export (admin ou secrétaire)
──────────────────────────────────────────────────────────────
Opération : Compiler les données filtrées par rôle
  - Admin     → Export complet (tous enseignants, tous départements)
  - Secrétaire → Export filtré (données pédagogiques)
  - Enseignant → Export personnel uniquement
──────────────────────────────────────────────────────────────
Résultats :
  [Format PDF]   → Rapport téléchargeable (DOMPDF/Snappy)
  [Format Excel] → Tableau structuré (PhpSpreadsheet)
```

---

### 2.5 Modèle Organisationnel des Traitements (MOT)

| Phase | Acteur | Traitement |
|-------|--------|------------|
| Paramétrage | Admin | Configurer les coefficients VHN, créer l'année académique active |
| Affectation | Admin | Attribuer les cours aux enseignants pour l'année en cours |
| Déclaration | Enseignant | Saisir les activités pédagogiques réalisées |
| Calcul VHN | Système (auto) | Calculer le volume horaire à la création/modification d'activité |
| Validation | Secrétaire | Valider, rejeter ou remettre en attente chaque activité |
| Consolidation | Système (auto) | Synchroniser le volume horaire cumulé après chaque action |
| Reporting | Admin / Secrétaire | Exporter les états de synthèse en PDF ou Excel |
| Notification | Système (auto) | Alerter les acteurs des événements en attente (badge temps réel) |

---

## 3. Architecture technique

### 3.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                       │
│              Next.js 15 (React 19, TypeScript)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/JSON
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     NGINX (Reverse Proxy)                   │
│        /api/* → pct-backend    /*  → pct-frontend           │
└──────────────────────────┬──────────────────────────────────┘
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌────────────────────┐        ┌────────────────────┐
│   pct-backend      │        │   pct-frontend     │
│  Laravel 12 / PHP  │        │  Next.js Standalone │
│  FPM (port 9000)   │        │  Node.js (port 3000)│
└────────┬───────────┘        └────────────────────┘
         │
         ▼
┌────────────────────┐
│     pct-db         │
│  MySQL 8.0         │
│  (port 3306)       │
└────────────────────┘
```

### 3.2 Pile technologique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | Next.js | 15.x |
| UI Components | Shadcn/UI + Tailwind CSS | — |
| State management | Zustand + TanStack React Query | — |
| Validation client | Zod + React Hook Form | — |
| Backend | Laravel | 12.x |
| Langage backend | PHP | 8.4 |
| Authentification | Laravel Sanctum (Bearer token) | — |
| Base de données | MySQL | 8.0 |
| Reverse proxy | Nginx | Alpine |
| Containerisation | Docker + Docker Compose | — |
| Mailing | SMTP Gmail (Laravel Mail) | — |

---

## 4. Structure des dossiers

```
PCT_BD_DAS_2026/
├── PCT_backend/                    # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/    # Contrôleurs REST
│   │   │   └── Middleware/
│   │   │       └── CheckRole.php   # Contrôle d'accès par rôle
│   │   ├── Models/                 # Modèles Eloquent
│   │   └── Mail/                   # Mails transactionnels
│   ├── database/
│   │   ├── migrations/             # Historique du schéma BD
│   │   └── seeders/                # Données initiales
│   ├── routes/
│   │   └── api.php                 # Définition des routes API
│   └── Dockerfile
│
├── PCT_frontend/                   # Application Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/        # Pages protégées par rôle
│   │   │   │   ├── admin/          # Pages administrateur
│   │   │   │   ├── secretaire/     # Pages secrétaire
│   │   │   │   └── enseignant/     # Pages enseignant
│   │   │   └── login/              # Page de connexion
│   │   ├── components/
│   │   │   ├── shared/             # Composants partagés
│   │   │   └── ui/                 # Composants Shadcn
│   │   ├── lib/
│   │   │   ├── api.ts              # Client Axios configuré
│   │   │   └── errors.ts           # Gestion des erreurs
│   │   ├── store/
│   │   │   └── authStore.ts        # Store Zustand (auth)
│   │   └── types/
│   │       └── index.ts            # Types TypeScript partagés
│   └── Dockerfile
│
├── docker-compose.yml
├── .env                            # Variables d'environnement (non versionné)
├── DOCUMENTATION_TECHNIQUE.md     # Ce fichier
├── GUIDE_UTILISATEUR.md
└── PRESENTATION.md
```

---

## 5. Base de données

### 5.1 Schéma relationnel complet

```
departements
  └──< enseignants (departement_id)
         └──< attributions (enseignant_id)
         │      └──< activites_pedagogiques (attribution_id)
         └──< volumes_horaires (enseignant_id)
                └── validations (volume_id)

cours >──< attributions (cours_id)
annees_academiques >──< attributions (annee_id)
annees_academiques >──< activites_pedagogiques (annee_id)
annees_academiques >──< volumes_horaires (annee_id)

utilisateurs >── enseignants (enseignant_id)
utilisateurs >── secretaires (secretaire_id)

parametres_calcul [type_operation × niveau_complexite → coefficient_vhn]
```

### 5.2 Règle de calcul VHN

```
volume_horaire = parametres_calcul.coefficient_vhn
                 WHERE type_operation = activite.type_operation
                   AND niveau_complexite = activite.niveau_complexite
```

### 5.3 Synchronisation automatique du volume horaire

Déclenchée après chaque création, modification ou suppression d'activité :

```php
heures_realisees = SUM(volume_horaire) 
                   WHERE enseignant_id = X 
                     AND annee_id = Y 
                     AND statut != 'rejete'

heures_prevues   = SUM(charge_horaire) 
                   FROM attributions 
                   WHERE enseignant_id = X 
                     AND annee_id = Y
```

---

## 6. API REST

### 6.1 Authentification

| Méthode | Endpoint | Accès | Description |
|---------|----------|-------|-------------|
| POST | `/api/v1/login` | Public | Connexion, retourne un Bearer token |
| POST | `/api/v1/logout` | Auth | Révocation du token courant |
| GET | `/api/v1/me` | Auth | Profil de l'utilisateur connecté |
| POST | `/api/v1/change-password` | Auth | Modification du mot de passe |
| POST | `/api/v1/forgot-password` | Public | Demande de réinitialisation |
| POST | `/api/v1/reset-password` | Public | Réinitialisation avec token email |

### 6.2 Gestion des ressources

| Méthode | Endpoint | Rôles | Description |
|---------|----------|-------|-------------|
| GET | `/api/v1/enseignants` | Admin, Secrétaire | Liste des enseignants |
| POST | `/api/v1/enseignants` | Admin | Créer un enseignant |
| PUT | `/api/v1/enseignants/{id}` | Admin | Modifier un enseignant |
| DELETE | `/api/v1/enseignants/{id}` | Admin | Supprimer un enseignant |
| GET | `/api/v1/secretaires` | Admin | Liste des secrétaires |
| POST | `/api/v1/secretaires` | Admin | Créer une secrétaire |
| DELETE | `/api/v1/secretaires/{id}` | Admin | Supprimer une secrétaire |
| GET | `/api/v1/cours` | Tous | Liste des cours/ECUE |
| GET | `/api/v1/attributions` | Tous | Attributions (filtrées par rôle) |
| GET | `/api/v1/activites` | Tous | Activités (filtrées par rôle) |
| POST | `/api/v1/activites` | Enseignant, Admin | Déclarer une activité |
| PUT | `/api/v1/activites/{id}` | Enseignant, Admin | Modifier une activité |
| POST | `/api/v1/activites/{id}/statut` | Secrétaire, Admin | Valider/Rejeter une activité |
| GET | `/api/v1/volumes` | Secrétaire, Admin | Volumes horaires |
| GET | `/api/v1/notifications` | Tous | Notifications contextuelles |
| GET | `/api/v1/exports/pdf` | Tous | Export PDF (filtré par rôle) |
| GET | `/api/v1/exports/excel` | Tous | Export Excel (filtré par rôle) |

### 6.3 Format des réponses

**Succès (200/201)**
```json
{
  "id": 1,
  "type_operation": "creation",
  "niveau_complexite": "intermediaire",
  "volume_horaire": 1.5,
  "statut": "en_attente",
  "attribution": { "enseignant": {...}, "cours": {...} },
  "annee": {...}
}
```

**Erreur de validation (422)**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["Doit être une adresse @uvci.edu.ci"]
  }
}
```

---

## 7. Authentification et sécurité

### 7.1 Mécanisme Sanctum

- Chaque connexion crée un **Personal Access Token** en base
- Le token est transmis dans l'en-tête : `Authorization: Bearer <token>`
- Le token est stocké côté client dans `localStorage` et synchronisé dans un cookie `pct_user` pour la protection Server-Side Next.js

### 7.2 Contrôle d'accès par rôle (RBAC)

Le middleware `CheckRole` vérifie le rôle de l'utilisateur authentifié :

```php
// bootstrap/app.php
$middleware->alias(['role' => \App\Http\Middleware\CheckRole::class]);

// Routes protégées
Route::middleware('role:admin,secretaire')->group(function () { ... });
Route::middleware('role:admin')->group(function () { ... });
```

### 7.3 Sécurité des emails

Seules les adresses `@uvci.edu.ci` sont acceptées pour les comptes enseignants et secrétaires. Cette validation est appliquée côté backend (Laravel) et côté frontend (Zod).

---

## 8. Déploiement Docker

### 8.1 Services Docker Compose

```yaml
services:
  pct-db:       # MySQL 8.0
  pct-backend:  # PHP 8.4 FPM + Laravel
  pct-frontend: # Node.js 20 + Next.js Standalone
  pct-nginx:    # Reverse proxy (port 8000)
```

### 8.2 Commandes de déploiement

```bash
# Premier démarrage
docker compose up -d

# Migrations de base de données
docker exec pct-backend php artisan migrate --force

# Créer le compte administrateur
docker exec pct-backend php artisan db:seed

# Vider les caches Laravel
docker exec pct-backend php artisan optimize:clear

# Consulter les logs
docker compose logs -f pct-backend

# Redémarrer un service
docker compose restart pct-backend

# Copier un fichier dans le backend (mise à jour sans rebuild)
docker cp ./fichier.php pct-backend:/var/www/app/Http/Controllers/Api/fichier.php
```

### 8.3 Mise à jour du frontend

```bash
# Rebuild de l'image (si réseau disponible)
docker compose build --no-cache frontend
docker compose up -d --no-deps frontend

# Build local + copie manuelle (si réseau Docker indisponible)
cd PCT_frontend
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build
docker cp .next/server pct-frontend:/app/.next/server
docker cp .next/static pct-frontend:/app/.next/static
docker restart pct-frontend
```

---

## 9. Variables d'environnement

### 9.1 Fichier `.env` (racine du projet)

```env
# Application
APP_KEY=base64:...

# Base de données
DB_DATABASE=pct_uvci
DB_USERNAME=pct_user
DB_PASSWORD=...

# Email SMTP Gmail
MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=admin@uvci.edu.ci
MAIL_PASSWORD=xxxx xxxx xxxx xxxx   # App Password Gmail
MAIL_FROM_ADDRESS=admin@uvci.edu.ci
MAIL_FROM_NAME="PCT UVCI"

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ **Le fichier `.env` ne doit jamais être commis dans Git.** Il est listé dans `.gitignore`.

---

## 10. Maintenance et administration

### 10.1 Accès administrateur par défaut

| Login | Mot de passe | Rôle |
|-------|-------------|------|
| admin | admin123 | Administrateur |

> ⚠️ Changer le mot de passe lors de la première connexion en production.

### 10.2 Commandes utiles

```bash
# Lister les routes API
docker exec pct-backend php artisan route:list

# Vérifier les migrations en attente
docker exec pct-backend php artisan migrate:status

# Accéder à Tinker (REPL Laravel)
docker exec -it pct-backend php artisan tinker

# Vérifier l'état des conteneurs
docker compose ps
```

### 10.3 Sauvegardes

```bash
# Sauvegarde de la base de données
docker exec pct-db mysqldump -u pct_user -p pct_uvci > backup_$(date +%Y%m%d).sql

# Restauration
docker exec -i pct-db mysql -u pct_user -p pct_uvci < backup.sql
```

---

*Document rédigé conformément à la méthodologie MERISE - PCT UVCI 2026*
