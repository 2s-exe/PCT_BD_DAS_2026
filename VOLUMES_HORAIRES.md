# Calcul des Volumes Horaires — PCT UVCI

Ce document explique la logique de calcul des volumes horaires telle qu'elle est implémentée dans le code du projet.

---

## 1. Concepts clés

| Terme | Définition |
|---|---|
| **Heures prévues** | Total des heures planifiées pour un enseignant (somme des `charge_horaire` de ses attributions) |
| **Volume horaire numérique (VHN)** | Valeur en heures affectée à une activité pédagogique déclarée, calculée automatiquement |
| **Heures réalisées** | Somme des VHN de toutes les activités non rejetées de l'enseignant |
| **Heures complémentaires** | Surplus d'heures au-delà des heures prévues : `MAX(0, réalisées − prévues)` |

---

## 2. Paramètres de calcul (`parametres_calcul`)

Chaque activité pédagogique est caractérisée par deux dimensions :

- **Type d'opération** : `creation` ou `mise_a_jour`
- **Niveau de complexité** : `simple`, `intermediaire` ou `complexe`

La combinaison de ces deux dimensions donne le **coefficient VHN** stocké dans la table `parametres_calcul`.

### Coefficients par défaut (seeds)

| Type d'opération | Niveau de complexité | Coefficient VHN (h) |
|---|---|---|
| `creation` | `simple` | **1,0 h** |
| `creation` | `intermediaire` | **2,0 h** |
| `creation` | `complexe` | **3,0 h** |
| `mise_a_jour` | `simple` | **0,5 h** |
| `mise_a_jour` | `intermediaire` | **1,0 h** |
| `mise_a_jour` | `complexe` | **1,5 h** |

> Ces valeurs sont modifiables par l'administrateur via la page **Paramètres** (`/admin/parametres`).

---

## 3. Calcul du VHN d'une activité

Quand un enseignant déclare une activité (POST `/api/v1/activites`), le backend effectue une simple **recherche dans la table `parametres_calcul`** :

```
volume_horaire = coefficient_vhn
  WHERE type_operation   = <type choisi>
    AND niveau_complexite = <complexité choisie>
```

**Fichier concerné :** [`PCT_backend/app/Http/Controllers/Api/ActiviteController.php`](PCT_backend/app/Http/Controllers/Api/ActiviteController.php) — méthode `store()`, lignes 42–51.

Il n'y a pas de calcul arithmétique : le `volume_horaire` de l'activité est directement égal au coefficient paramétré.

---

## 4. Agrégation dans `volumes_horaires`

La table `volumes_horaires` contient **une ligne par enseignant par année académique**. Elle est mise à jour automatiquement après chaque mutation d'activité via la méthode privée `syncVolume()`.

**Fichier concerné :** [`PCT_backend/app/Http/Controllers/Api/ActiviteController.php`](PCT_backend/app/Http/Controllers/Api/ActiviteController.php) — méthode `syncVolume()`, lignes 137–161.

### Formules

```
heures_prevues =
  SUM(attributions.charge_horaire)
  WHERE attributions.enseignant_id = {enseignant}
    AND attributions.annee_id      = {annee}

heures_realisees =
  SUM(activites_pedagogiques.volume_horaire)
  WHERE activites_pedagogiques.enseignant_id = {enseignant}
    AND activites_pedagogiques.annee_id      = {annee}
    AND activites_pedagogiques.statut       != 'rejete'

heures_complementaires =
  MAX(0, heures_realisees − heures_prevues)
```

> Les activités au statut `rejete` sont **exclues** des heures réalisées.  
> Les heures complémentaires ne peuvent pas être négatives.

### Déclencheurs de recalcul

`syncVolume()` est appelé automatiquement lors de :

- la **création** d'une activité (`store`)
- la **modification** d'une activité (`update`)
- la **suppression** d'une activité (`destroy`)
- le **changement de statut** d'une activité (`validerStatut` : validé / rejeté / remis en attente)

---

## 5. Flux de validation

```
Enseignant déclare une activité
        │
        ▼
statut = 'en_attente'
volume_horaire = coefficient_vhn (lookup)
syncVolume() → heures_realisees recalculé
        │
        ▼
Secrétaire examine l'activité
        │
   ┌────┴────┐
'valide'   'rejete'
   │           │
   │      exclue de heures_realisees
   │      syncVolume() appelé
   ▼
Secrétaire/Admin valide le Volume global
→ POST /api/v1/volumes/{id}/valider
→ Création d'un enregistrement Validation
→ Email de notification envoyé à l'enseignant
```

> Une activité ne peut plus être modifiée une fois que le `VolumeHoraire` parent est validé.

---

## 6. Structure des données

```
attributions
  └─ charge_horaire          ← heures planifiées par cours

activites_pedagogiques
  ├─ type_operation          ← 'creation' | 'mise_a_jour'
  ├─ niveau_complexite       ← 'simple' | 'intermediaire' | 'complexe'
  ├─ volume_horaire          ← VHN (issu de parametres_calcul)
  ├─ statut                  ← 'en_attente' | 'valide' | 'rejete'
  ├─ attribution_id          ─┐
  └─ annee_id                 │
                              │ clés utilisées par syncVolume()
parametres_calcul             │
  ├─ type_operation           │
  ├─ niveau_complexite        │
  └─ coefficient_vhn          │
                              │
volumes_horaires  ◄───────────┘
  ├─ heures_prevues           ← SUM(charge_horaire)
  ├─ heures_realisees         ← SUM(volume_horaire) hors rejetées
  ├─ heures_complementaires   ← MAX(0, réalisées − prévues)
  ├─ enseignant_id
  └─ annee_id
```

---

## 7. Points d'entrée dans le code

| Élément | Fichier |
|---|---|
| Migration `volumes_horaires` | [`PCT_backend/database/migrations/2026_06_03_000654_create_volumes_horaires_table.php`](PCT_backend/database/migrations/2026_06_03_000654_create_volumes_horaires_table.php) |
| Migration `activites_pedagogiques` | [`PCT_backend/database/migrations/2026_06_03_000654_create_activites_pedagogiques_table.php`](PCT_backend/database/migrations/2026_06_03_000654_create_activites_pedagogiques_table.php) |
| Migration `parametres_calcul` | [`PCT_backend/database/migrations/2026_06_03_000655_create_parametres_calcul_table.php`](PCT_backend/database/migrations/2026_06_03_000655_create_parametres_calcul_table.php) |
| Coefficients par défaut (seeds) | [`PCT_backend/database/seeders/DatabaseSeeder.php`](PCT_backend/database/seeders/DatabaseSeeder.php) lignes 39–52 |
| Calcul VHN + `syncVolume()` | [`PCT_backend/app/Http/Controllers/Api/ActiviteController.php`](PCT_backend/app/Http/Controllers/Api/ActiviteController.php) |
| Validation du volume global | [`PCT_backend/app/Http/Controllers/Api/VolumeController.php`](PCT_backend/app/Http/Controllers/Api/VolumeController.php) |
| Dashboard enseignant | [`PCT_backend/app/Http/Controllers/Api/DashboardController.php`](PCT_backend/app/Http/Controllers/Api/DashboardController.php) |
| Modèle `VolumeHoraire` | [`PCT_backend/app/Models/VolumeHoraire.php`](PCT_backend/app/Models/VolumeHoraire.php) |
| Modèle `ActivitePedagogique` | [`PCT_backend/app/Models/ActivitePedagogique.php`](PCT_backend/app/Models/ActivitePedagogique.php) |
| Modèle `ParametreCalcul` | [`PCT_backend/app/Models/ParametreCalcul.php`](PCT_backend/app/Models/ParametreCalcul.php) |
| Types TypeScript front | [`PCT_frontend/src/types/index.ts`](PCT_frontend/src/types/index.ts) |
