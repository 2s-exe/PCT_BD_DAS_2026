# Présentation du Projet — PCT UVCI
## Plateforme de Calcul des Totaux des Volumes Horaires
### Université Virtuelle de Côte d'Ivoire

---

## 1. Contexte et problématique

### 1.1 Présentation de l'établissement

L'**Université Virtuelle de Côte d'Ivoire (UVCI)** est un établissement d'enseignement supérieur public proposant des formations en ligne accessibles à distance sur l'ensemble du territoire ivoirien. La gestion administrative de ses enseignants exige un suivi rigoureux des activités pédagogiques et des volumes horaires afin de garantir la qualité des enseignements et le bon traitement des rémunérations.

### 1.2 Problématique initiale

Avant la mise en place de PCT UVCI, la gestion des heures d'enseignement reposait sur des processus manuels (tableaux Excel, formulaires papier, échanges de mails), sources de nombreuses difficultés :

- **Saisies multiples** et risques d'erreurs de calcul
- **Délais importants** entre la déclaration et la validation
- **Absence de traçabilité** des modifications et des validations
- **Difficultés de consolidation** des données par département
- **Pas de visibilité en temps réel** pour les décideurs

### 1.3 Solution apportée

Le projet PCT UVCI propose une **plateforme web centralisée** qui :

- Dématérialise la déclaration des activités pédagogiques
- Automatise le calcul des Volumes Horaires Normalisés (VHN)
- Fluidifie le circuit de validation enseignant → secrétariat → administration
- Offre des tableaux de bord et des exports pour le pilotage

---

## 2. Méthodologie de conception : MERISE

### 2.1 Choix de la méthodologie

Le projet a été conçu en suivant la méthodologie **MERISE** (Méthode d'Étude et de Réalisation Informatique pour les Systèmes d'Entreprise), choisie pour :

- Sa **démarche structurée** séparant les niveaux conceptuel, logique et physique
- Sa **maîtrise du cycle de vie** des données et des traitements
- Son adéquation avec les **systèmes d'information institutionnels** français et francophones

### 2.2 Démarche appliquée

```
┌─────────────────────────────────────────────────────────────────┐
│  NIVEAU CONCEPTUEL                                              │
│  ┌──────────────────┐     ┌──────────────────────────────────┐  │
│  │  MCD             │     │  MCT                             │  │
│  │  Modèle          │     │  Modèle Conceptuel               │  │
│  │  Conceptuel de   │     │  des Traitements                 │  │
│  │  Données         │     │  (quoi faire ?)                  │  │
│  └──────────────────┘     └──────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  NIVEAU ORGANISATIONNEL                                         │
│  ┌──────────────────┐     ┌──────────────────────────────────┐  │
│  │  MLD             │     │  MOT                             │  │
│  │  Modèle Logique  │     │  Modèle Organisationnel          │  │
│  │  de Données      │     │  des Traitements                 │  │
│  └──────────────────┘     │  (qui fait quoi, quand ?)        │  │
│                            └──────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  NIVEAU PHYSIQUE                                                │
│  ┌──────────────────┐     ┌──────────────────────────────────┐  │
│  │  MPD             │     │  MRT                             │  │
│  │  Modèle Physique │     │  Modèle Réel des Traitements     │  │
│  │  de Données      │     │  (code, API, services)           │  │
│  │  (tables MySQL)  │     │                                  │  │
│  └──────────────────┘     └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Résumé du Modèle Conceptuel de Données (MCD)

Les entités principales identifiées lors de l'analyse :

```
DEPARTEMENT ────< ENSEIGNANT >──── ATTRIBUTION ──< ACTIVITE_PEDAGOGIQUE
                      │               │
                      │           COURS
                      │           ANNEE_ACADEMIQUE
                      │
                 VOLUME_HORAIRE ──── VALIDATION

UTILISATEUR >── ENSEIGNANT
UTILISATEUR >── SECRETAIRE

PARAMETRE_CALCUL [coefficient VHN par type × complexité]
```

### 2.4 Règle métier centrale : le calcul VHN

Le **Volume Horaire Normalisé (VHN)** est calculé automatiquement selon la formule :

```
VHN = Coefficient(type_opération, niveau_complexité)
```

Cette formule est configurée par l'administrateur dans les **Paramètres de calcul** et s'applique à chaque activité déclarée par un enseignant.

---

## 3. Architecture de la solution

### 3.1 Architecture n-tiers

PCT UVCI repose sur une **architecture 3-tiers** containerisée :

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Couche     │    │   Couche     │    │   Couche     │
│ Présentation │◄──►│  Métier      │◄──►│   Données    │
│ Next.js 15   │    │  Laravel 12  │    │  MySQL 8.0   │
│ (React 19)   │    │  PHP 8.4     │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │
       └───── Nginx ────────┘
           (Reverse Proxy)
```

### 3.2 Choix technologiques

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| Frontend | Next.js 15 + TypeScript | Rendu hybride SSR/CSR, typage fort, performances |
| UI | Shadcn/UI + Tailwind CSS | Composants accessibles, design system cohérent |
| Backend | Laravel 12 (PHP 8.4) | Framework MVC éprouvé, ORM Eloquent, API REST |
| Auth | Laravel Sanctum | Tokens Bearer légers, adapté aux SPA |
| Base de données | MySQL 8.0 | SGBDR relationnel robuste, intégrité référentielle |
| Conteneurs | Docker + Docker Compose | Portabilité, isolation, déploiement reproductible |
| Proxy | Nginx | Haute performance, routage /api → backend |

---

## 4. Fonctionnalités principales

### 4.1 Gestion des utilisateurs

| Fonctionnalité | Admin | Secrétaire | Enseignant |
|----------------|:-----:|:----------:|:----------:|
| Créer un enseignant | ✅ | — | — |
| Créer une secrétaire | ✅ | — | — |
| Désactiver un compte | ✅ | — | — |
| Réinitialiser un mot de passe | ✅ | — | — |
| Modifier son propre mot de passe | ✅ | ✅ | ✅ |

### 4.2 Gestion pédagogique

| Fonctionnalité | Admin | Secrétaire | Enseignant |
|----------------|:-----:|:----------:|:----------:|
| Configurer les paramètres VHN | ✅ | — | — |
| Créer des cours/filières | ✅ | — | — |
| Attribuer un cours à un enseignant | ✅ | — | — |
| Déclarer une activité pédagogique | ✅ | — | ✅ |
| Modifier une activité (si non validée) | ✅ | — | ✅ |
| Valider / Rejeter une activité | ✅ | ✅ | — |
| Consulter son historique | ✅ | ✅ | ✅ |

### 4.3 Pilotage et reporting

| Fonctionnalité | Admin | Secrétaire | Enseignant |
|----------------|:-----:|:----------:|:----------:|
| Tableau de bord avec KPIs | ✅ | ✅ | ✅ |
| Graphique par département | ✅ | — | — |
| Suivi des volumes horaires | ✅ | ✅ | ✅ (personnel) |
| Export PDF | ✅ | ✅ | ✅ (personnel) |
| Export Excel | ✅ | ✅ | ✅ (personnel) |
| Notifications temps réel | ✅ | ✅ | ✅ |

---

## 5. Circuit de validation des activités

```
                        ENSEIGNANT
                            │
                    ① Déclare une activité
                            │
                            ▼
                    Calcul VHN automatique
                    (statut : EN ATTENTE)
                            │
                            ▼
                       SECRÉTAIRE
                     ┌─────┴──────┐
                     │            │
              ② Valide       ③ Rejette
                     │            │
                     ▼            ▼
               statut :       statut :
               VALIDÉE        REJETÉE
                     │            │
                     └─────┬──────┘
                            │
                    Synchronisation automatique
                    du volume horaire cumulé
                            │
                            ▼
                   ADMINISTRATEUR
                 Consultation des états
                    et reporting
```

---

## 6. Sécurité et contrôle d'accès

### 6.1 Authentification

- Chaque utilisateur dispose d'un **token Bearer** (Laravel Sanctum)
- Le token est invalidé à la déconnexion
- Les mots de passe sont **hachés avec bcrypt**

### 6.2 Contrôle d'accès par rôle (RBAC)

Trois rôles avec des périmètres d'accès distincts :

```
ADMIN       → Accès total (lecture + écriture sur toutes les ressources)
SECRÉTAIRE  → Lecture enseignants + Validation activités + Export
ENSEIGNANT  → Déclaration et consultation de ses propres activités uniquement
```

### 6.3 Validation des données

- **Backend** : validation Laravel (format email, unicité, types, longueurs)
- **Frontend** : validation Zod + React Hook Form (feedback immédiat)
- **Email institutionnel** obligatoire (`@uvci.edu.ci`)

---

## 7. Notifications et alertes

Le système génère automatiquement des notifications contextuelles adaptées à chaque rôle :

| Rôle | Déclencheur | Notification |
|------|------------|--------------|
| Enseignant | Activité validée par la secrétaire | « Activité validée » ✅ |
| Enseignant | Activité rejetée | « Activité rejetée » ❌ |
| Secrétaire | Nouvelles déclarations en attente | Compteur d'activités à traiter |
| Admin | Activités non traitées | Alerte globale |

Les notifications sont **mises à jour automatiquement toutes les 60 secondes** et affichées via un badge numérique sur l'icône cloche.

---

## 8. Points forts de la solution

✅ **Calcul automatique du VHN** — zéro risque d'erreur de calcul manuelle

✅ **Circuit de validation numérisé** — traçabilité complète de chaque décision

✅ **Interface responsive** — utilisable sur ordinateur, tablette et mobile

✅ **Notifications en temps réel** — les acteurs sont alertés sans délai

✅ **Export multi-format** — PDF pour les instances officielles, Excel pour l'analyse

✅ **Sécurité renforcée** — RBAC strict, tokens invalidables, mots de passe hachés

✅ **Architecture containerisée** — déploiement simple et reproductible avec Docker

✅ **Email institutionnel obligatoire** — maîtrise des accès aux adresses `@uvci.edu.ci`

---

## 9. Perspectives d'évolution

| Évolution envisagée | Description |
|---------------------|-------------|
| **Signature électronique** | Signature numérique des rapports de validation |
| **Application mobile** | Application iOS/Android pour les enseignants |
| **Intégration SCOLARIX** | Synchronisation avec le SI existant de l'UVCI |
| **Statistiques avancées** | Tableaux croisés dynamiques, BI intégré |
| **Workflow multi-niveaux** | Ajout d'un niveau de validation chef de département |
| **Archives multi-années** | Navigation et comparaison sur plusieurs années académiques |

---

## 10. Équipe projet

| Rôle | Responsabilité |
|------|----------------|
| Chef de projet | Coordination, architecture globale |
| Développeur Backend | API Laravel, base de données, logique métier |
| Développeur Frontend | Interface Next.js, composants UI, expérience utilisateur |
| Administrateur système | Docker, déploiement, configuration serveur |

---

## 11. Résumé exécutif

> **PCT UVCI** est une plateforme web moderne développée avec la méthodologie **MERISE** pour la gestion numérique des activités pédagogiques de l'Université Virtuelle de Côte d'Ivoire. Elle automatise le calcul des Volumes Horaires Normalisés, fluidifie le circuit de validation et offre aux décideurs une vision consolidée et en temps réel des heures d'enseignement. Basée sur une architecture n-tiers containerisée (Next.js + Laravel + MySQL + Docker), elle garantit sécurité, traçabilité et évolutivité.

---

*PCT UVCI - Université Virtuelle de Côte d'Ivoire - Juin 2026*
