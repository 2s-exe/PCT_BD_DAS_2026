# Guide Utilisateur - PCT UVCI
## Plateforme de Calcul des Totaux - Université Virtuelle de Côte d'Ivoire

---

## Table des matières

1. [Introduction](#1-introduction)
2. [Connexion à la plateforme](#2-connexion-à-la-plateforme)
3. [Guide Administrateur](#3-guide-administrateur)
4. [Guide Secrétaire Pédagogique](#4-guide-secrétaire-pédagogique)
5. [Guide Enseignant](#5-guide-enseignant)
6. [Fonctionnalités communes](#6-fonctionnalités-communes)
7. [Questions fréquentes](#7-questions-fréquentes)

---

## 1. Introduction

La plateforme **PCT UVCI** (Plateforme de Calcul des Totaux) permet la gestion numérique des activités pédagogiques des enseignants de l'Université Virtuelle de Côte d'Ivoire. Elle automatise le calcul des Volumes Horaires Normalisés (VHN) et facilite leur validation par le secrétariat pédagogique.

### Accès à la plateforme

Ouvrez votre navigateur web et saisissez l'adresse :
```
http://localhost:8000
```

### Navigateurs supportés

- Google Chrome (recommandé)
- Mozilla Firefox
- Microsoft Edge
- Safari

---

## 2. Connexion à la plateforme

### 2.1 Se connecter

1. Sur la page d'accueil, saisissez votre **login** (adresse email institutionnelle ou identifiant)
2. Saisissez votre **mot de passe**
3. Cliquez sur le bouton **Se connecter**

La plateforme vous redirige automatiquement vers votre tableau de bord selon votre rôle.

### 2.2 Mot de passe oublié

1. Sur la page de connexion, cliquez sur **Mot de passe oublié ?**
2. Saisissez votre adresse email institutionnelle (`@uvci.edu.ci`)
3. Consultez votre boîte mail et cliquez sur le lien reçu
4. Définissez votre nouveau mot de passe

### 2.3 Déconnexion

- Cliquez sur votre **avatar** en haut à droite
- Sélectionnez **Déconnexion**

---

## 3. Guide Administrateur

L'administrateur dispose d'un accès complet à toutes les fonctionnalités de la plateforme.

### 3.1 Tableau de bord

Le tableau de bord présente une vue synthétique :

| Indicateur | Description |
|------------|-------------|
| **Enseignants** | Nombre total et nombre d'enseignants actifs |
| **Heures totales** | Volume horaire réalisé cumulé |
| **Validées** | Heures validées par le secrétariat |
| **En attente** | Volumes en attente de validation |

Deux graphiques sont affichés :
- **Heures par département** (barres) : répartition des heures déclarées par département
- **Évolution mensuelle** (courbe) : tendance des VHN déclarés sur 12 mois

### 3.2 Gestion des enseignants

**Accès** : Menu latéral → *Enseignants*

#### Créer un enseignant

1. Cliquez sur le bouton **Nouvel enseignant**
2. Remplissez le formulaire :
   - **Prénom** et **Nom**
   - **Email** : doit être une adresse `@uvci.edu.ci`
   - **Grade** : Assistant / Maître-Assistant / Professeur
   - **Statut** : Permanent / Vacataire
   - **Taux horaire** (FCFA/h)
   - **Département** d'appartenance
3. Un login et un mot de passe sont générés automatiquement
4. Cliquez sur **Créer le profil**

> Un email de bienvenue avec les identifiants est automatiquement envoyé à l'enseignant.

#### Modifier un enseignant

1. Dans la liste, cliquez sur le menu **⋯** de la ligne concernée
2. Sélectionnez **Modifier**
3. Effectuez les modifications et cliquez sur **Mettre à jour**

#### Désactiver / Activer un compte

1. Cliquez sur le menu **⋯**
2. Sélectionnez **Désactiver** ou **Activer**

> Un compte désactivé ne peut plus se connecter mais ses données sont conservées.

#### Supprimer un enseignant

1. Cliquez sur le menu **⋯**
2. Sélectionnez **Supprimer**
3. Confirmez la suppression dans la boîte de dialogue

> ⚠️ La suppression est **irréversible** et entraîne la suppression de toutes les données associées (activités, volumes horaires).

#### Importer via CSV

1. Cliquez sur le bouton **Importer CSV**
2. Sélectionnez un fichier CSV avec les colonnes : `nom, prenom, email, grade, statut, taux_horaire, departement_id`
3. Le système crée les comptes et envoie les emails automatiquement

### 3.3 Gestion des secrétaires

**Accès** : Menu latéral → *Secrétaires*

Les actions disponibles sont identiques à la gestion des enseignants :
- **Créer** une secrétaire (email `@uvci.edu.ci` obligatoire)
- **Modifier** ses informations
- **Activer / Désactiver** son compte
- **Supprimer** son compte

### 3.4 Gestion des départements

**Accès** : Menu latéral → *Départements*

1. Cliquez sur **Nouveau département**
2. Saisissez le **nom du département** et le **responsable**
3. Cliquez sur **Enregistrer**

### 3.5 Gestion des cours et filières

**Accès** : Menu latéral → *Cours & Filières*

1. Cliquez sur **Nouveau cours**
2. Renseignez :
   - **Intitulé ECUE** (Élément Constitutif d'Unité d'Enseignement)
   - **Niveau** : L1, L2, L3, M1, M2
   - **Semestre**
   - **Crédits ECUE**
   - **Charge horaire annuelle**
3. Cliquez sur **Enregistrer**

### 3.6 Gestion des attributions

**Accès** : Menu latéral → *Attributions*

Une attribution affecte un cours à un enseignant pour une année académique donnée.

1. Cliquez sur **Nouvelle attribution**
2. Sélectionnez l'**enseignant**, le **cours** et l'**année académique**
3. Définissez la **charge horaire** allouée
4. Cliquez sur **Enregistrer**

### 3.7 Années académiques

**Accès** : Menu latéral → *Années académiques*

1. Cliquez sur **Nouvelle année**
2. Saisissez le **libellé** (ex : `2025-2026`), les dates de début et fin
3. Pour activer une année : cliquez sur le menu **⋯** → **Activer**

> Une seule année peut être active à la fois. L'activation désactive automatiquement la précédente.

### 3.8 Paramètres VHN

**Accès** : Menu latéral → *Paramètres*

Les paramètres VHN définissent le coefficient appliqué selon le type d'opération et le niveau de complexité.

| Type | Complexité | Coefficient |
|------|-----------|-------------|
| Création | Simple | ex: 1.0 |
| Création | Intermédiaire | ex: 1.5 |
| Création | Complexe | ex: 2.0 |
| Mise à jour | Simple | ex: 0.5 |
| Mise à jour | Intermédiaire | ex: 0.75 |
| Mise à jour | Complexe | ex: 1.0 |

Pour modifier un coefficient :
1. Cliquez sur le menu **⋯** de la ligne concernée
2. Sélectionnez **Modifier**
3. Saisissez le nouveau coefficient et sauvegardez

### 3.9 Suivi des heures

**Accès** : Menu latéral → *Suivi des heures*

Tableau de synthèse affichant pour chaque enseignant :
- Heures prévues vs heures réalisées
- Heures complémentaires (dépassement)
- Statut global de validation

### 3.10 Rapports

**Accès** : Menu latéral → *Rapports*

Génération d'exports :
- **PDF** : rapport formaté pour impression
- **Excel** : données brutes pour analyse

---

## 4. Guide Secrétaire Pédagogique

### 4.1 Tableau de bord

La secrétaire visualise en un coup d'œil :
- Le nombre d'activités en attente de validation
- Les statistiques globales des enseignants
- Les volumes en attente de traitement

### 4.2 Validation des activités

**Accès** : Menu latéral → *Validation*

C'est la fonctionnalité principale de la secrétaire. La page affiche les activités **groupées par enseignant**, avec les plus urgentes (plus d'activités en attente) en tête de liste.

#### Filtres disponibles

| Filtre | Description |
|--------|-------------|
| **En attente** (défaut) | Activités non encore traitées |
| **Toutes** | Toutes les activités |
| **Validées** | Activités approuvées |
| **Rejetées** | Activités rejetées |

#### Actions par activité

Pour chaque activité, trois actions sont possibles :

**✓ Valider**
- Cliquez sur le bouton vert ✓
- L'activité passe au statut *Validée*
- Le volume horaire est automatiquement recalculé

**✗ Rejeter**
- Cliquez sur le bouton rouge ✗
- Un champ texte s'ouvre pour saisir le motif (optionnel)
- Cliquez sur **Confirmer** pour finaliser le rejet
- L'activité est exclue du calcul des heures réalisées

**⏱ Remettre en attente**
- Cliquez sur le bouton amber ⏱
- L'activité retourne au statut *En attente*

#### Informations affichées par activité

- Cours concerné (intitulé ECUE)
- Type d'opération (Création / Mise à jour)
- Niveau de complexité
- Date de l'activité
- Volume horaire (VHN) calculé
- Observations de l'enseignant
- Observations déjà enregistrées par la secrétaire

### 4.3 Consultation des enseignants

**Accès** : Menu latéral → *Enseignants*

La secrétaire peut **consulter** les profils enseignants et leurs activités (lecture seule - pas de modification).

### 4.4 Suivi des heures

**Accès** : Menu latéral → *Heures*

Vue synthétique des volumes horaires de tous les enseignants, avec possibilité d'exporter.

---

## 5. Guide Enseignant

### 5.1 Tableau de bord

Le tableau de bord personnel affiche :
- **Heures effectuées** : total des VHN déclarés et non rejetés
- **Heures validées** : VHN approuvés par la secrétaire
- **En attente** : VHN en cours d'examen avec le nombre d'activités
- **Volume horaire annuel** : barre de progression par rapport à l'objectif
- **Mes dernières activités** : historique des 5 dernières déclarations avec leur statut

### 5.2 Déclarer une activité

**Accès** : Menu latéral → *Déclarer une activité* **ou** bouton **Ajouter une activité** sur le tableau de bord

1. **Sélectionnez l'attribution** (cours qui vous a été attribué)
2. **Type d'opération** :
   - *Création* : production d'un nouveau contenu pédagogique
   - *Mise à jour* : révision d'un contenu existant
3. **Niveau de complexité** :
   - *Simple* : modifications mineures ou contenu basique
   - *Intermédiaire* : contenu de complexité moyenne
   - *Complexe* : contenu élaboré ou recherche approfondie
4. **Date de l'activité**
5. **Observations** (optionnel) : précisez si nécessaire
6. Cliquez sur **Déclarer**

> Le **volume horaire (VHN)** est calculé automatiquement selon les paramètres configurés par l'administration. Vous n'avez pas à le saisir manuellement.

### 5.3 Historique des activités

**Accès** : Menu latéral → *Mes activités*

Tableau listant toutes vos activités déclarées avec :
- Date
- Cours concerné
- Type et niveau de complexité
- Volume VHN
- **Statut de validation** :
  - 🟡 **En attente** : non encore examinée par la secrétaire
  - ✅ **Validée** : approuvée, comptabilisée dans vos heures
  - ❌ **Rejetée** : non comptabilisée, vérifiez les observations

#### Modifier une activité

Vous pouvez modifier une activité **tant qu'elle n'a pas été validée** :

1. Cliquez sur le crayon ✏️ de la ligne concernée
2. Modifiez les champs souhaités
3. Cliquez sur **Enregistrer**

> Le VHN est recalculé automatiquement après modification.

### 5.4 Télécharger votre récapitulatif

Sur la page *Mes activités*, cliquez sur **Télécharger récapitulatif** pour obtenir un export PDF de vos activités déclarées.

---

## 6. Fonctionnalités communes

Ces fonctionnalités sont accessibles à tous les rôles.

### 6.1 Modifier son mot de passe

1. Cliquez sur votre **avatar/nom** en haut à droite de l'écran
2. Sélectionnez **Modifier mon mot de passe**
3. Saisissez votre **mot de passe actuel**
4. Saisissez le **nouveau mot de passe** (6 caractères minimum)
5. Confirmez le nouveau mot de passe
6. Cliquez sur **Modifier**

> Sur mobile, le bouton se trouve en bas du menu latéral.

### 6.2 Notifications

L'icône de cloche 🔔 en haut à droite affiche les alertes contextuelles :

| Rôle | Notifications reçues |
|------|----------------------|
| **Enseignant** | Activités validées ✅ ou rejetées ❌ par la secrétaire |
| **Secrétaire** | Nouvelles activités en attente de validation |
| **Administrateur** | Activités non traitées, déclarations de la semaine |

Le **badge rouge** indique le nombre de notifications. Cliquez sur la cloche pour les consulter. Chaque notification est un lien vers la page concernée.

### 6.3 Navigation mobile

Sur les appareils mobiles, le menu latéral est accessible via le bouton ☰ en haut à gauche.

---

## 7. Questions fréquentes

**Q : Je ne reçois pas l'email de création de compte.**
> Vérifiez votre dossier spam. Si le problème persiste, contactez l'administrateur pour qu'il réinitialise votre mot de passe manuellement.

**Q : Mon VHN affiché est 0 alors que j'ai déclaré des activités.**
> Vérifiez que les paramètres VHN sont bien configurés pour votre type d'opération et niveau de complexité. Contactez l'administrateur.

**Q : Je ne peux plus modifier une activité.**
> Une activité validée par la secrétaire ne peut plus être modifiée. Si une correction est nécessaire, contactez votre secrétariat.

**Q : Je vois toujours le même statut "En attente" après validation.**
> Actualisez la page (F5 ou Ctrl+R). Les données se rafraîchissent automatiquement après chaque action.

**Q : Comment exporter mes données en Excel ?**
> Sur les pages *Suivi des heures*, *Activités* ou *Mes activités*, un bouton **Exporter** ou **Télécharger** est disponible en haut de page.

**Q : Mon compte est bloqué.**
> Votre compte a peut-être été désactivé par l'administrateur. Contactez le service informatique ou l'administration.

---

*Pour toute assistance technique : contactez l'équipe informatique UVCI*
*PCT UVCI - Version 1.0 - Juin 2026*
