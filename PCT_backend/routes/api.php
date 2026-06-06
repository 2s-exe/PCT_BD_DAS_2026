<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EnseignantController;
use App\Http\Controllers\Api\SecretaireController;
use App\Http\Controllers\Api\DepartementController;
use App\Http\Controllers\Api\AnneeController;
use App\Http\Controllers\Api\CoursController;
use App\Http\Controllers\Api\AttributionController;
use App\Http\Controllers\Api\ActiviteController;
use App\Http\Controllers\Api\VolumeController;
use App\Http\Controllers\Api\ParametreController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\PasswordResetController;

Route::prefix('v1')->group(function () {

    // ── Public ────────────────────────────────────────────────────────────────
    Route::post('/login',           [AuthController::class,       'login']);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('/reset-password',  [PasswordResetController::class, 'reset']);

    // ── Authentifié ───────────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',     [AuthController::class, 'me']);

        // Années — lecture : tous les rôles (nécessaire pour les formulaires)
        Route::get('annees',               [AnneeController::class, 'index']);
        Route::get('annees/{annee}',       [AnneeController::class, 'show']);

        // Cours — lecture : secrétaire + enseignant + admin
        Route::middleware('role:admin,secretaire,enseignant')->group(function () {
            Route::get('cours',            [CoursController::class, 'index']);
            Route::get('cours/{cours}',    [CoursController::class, 'show']);
        });

        // Attributions — lecture : tous (controller filtre par rôle)
        // Écriture : admin uniquement
        Route::middleware('role:admin,secretaire,enseignant')->group(function () {
            Route::get('attributions',                     [AttributionController::class, 'index']);
            Route::get('attributions/{attribution}',       [AttributionController::class, 'show']);
        });

        // Activités — lecture : tous (controller filtre par rôle)
        // Création : enseignant + admin
        // Suppression : admin uniquement
        Route::middleware('role:admin,secretaire,enseignant')->group(function () {
            Route::get('activites',                        [ActiviteController::class, 'index']);
            Route::get('activites/{activite}',             [ActiviteController::class, 'show']);
        });
        Route::middleware('role:admin,enseignant')->group(function () {
            Route::post('activites',                       [ActiviteController::class, 'store']);
            Route::put('activites/{activite}',             [ActiviteController::class, 'update']);
        });

        // Enseignants — lecture : admin + secrétaire
        // Écriture : admin uniquement
        Route::middleware('role:admin,secretaire')->group(function () {
            Route::get('enseignants',                      [EnseignantController::class, 'index']);
            Route::get('enseignants/{enseignant}',         [EnseignantController::class, 'show']);
        });

        // Volumes — lecture + validation : admin + secrétaire
        Route::middleware('role:admin,secretaire')->group(function () {
            Route::get('volumes',                          [VolumeController::class, 'index']);
            Route::post('volumes/{volume}/valider',        [VolumeController::class, 'valider']);
        });

        // ── Admin uniquement ─────────────────────────────────────────────────
        Route::middleware('role:admin')->group(function () {

            // Enseignants — écriture + import CSV
            Route::post('enseignants/import',              [EnseignantController::class, 'importCsv']);
            Route::post('enseignants',                     [EnseignantController::class, 'store']);
            Route::put('enseignants/{enseignant}',         [EnseignantController::class, 'update']);
            Route::patch('enseignants/{enseignant}',       [EnseignantController::class, 'patch']);
            Route::delete('enseignants/{enseignant}',      [EnseignantController::class, 'destroy']);

            // Secrétaires — CRUD complet
            Route::get('secretaires',                      [SecretaireController::class, 'index']);
            Route::post('secretaires',                     [SecretaireController::class, 'store']);
            Route::get('secretaires/{secretaire}',         [SecretaireController::class, 'show']);
            Route::put('secretaires/{secretaire}',         [SecretaireController::class, 'update']);
            Route::patch('secretaires/{secretaire}',       [SecretaireController::class, 'patch']);
            Route::delete('secretaires/{secretaire}',      [SecretaireController::class, 'destroy']);

            // Départements — CRUD complet
            Route::get('departements',                     [DepartementController::class, 'index']);
            Route::post('departements',                    [DepartementController::class, 'store']);
            Route::get('departements/{departement}',       [DepartementController::class, 'show']);
            Route::put('departements/{departement}',       [DepartementController::class, 'update']);
            Route::delete('departements/{departement}',    [DepartementController::class, 'destroy']);

            // Cours — écriture
            Route::post('cours',                           [CoursController::class, 'store']);
            Route::put('cours/{cours}',                    [CoursController::class, 'update']);
            Route::delete('cours/{cours}',                 [CoursController::class, 'destroy']);

            // Attributions — écriture
            Route::post('attributions',                    [AttributionController::class, 'store']);
            Route::put('attributions/{attribution}',       [AttributionController::class, 'update']);
            Route::delete('attributions/{attribution}',    [AttributionController::class, 'destroy']);

            // Années — écriture
            Route::post('annees',                          [AnneeController::class, 'store']);
            Route::put('annees/{annee}',                   [AnneeController::class, 'update']);
            Route::delete('annees/{annee}',                [AnneeController::class, 'destroy']);
            Route::patch('annees/{annee}/activer',         [AnneeController::class, 'activer']);

            // Activités — suppression
            Route::delete('activites/{activite}',          [ActiviteController::class, 'destroy']);

            // Reset password admin (sans email)
            Route::post('users/{user}/reset-password',     [PasswordResetController::class, 'adminReset']);

            // Paramètres VHN — CRUD complet
            Route::get('parametres',                       [ParametreController::class, 'index']);
            Route::post('parametres',                      [ParametreController::class, 'store']);
            Route::put('parametres/{parametre}',           [ParametreController::class, 'update']);
            Route::delete('parametres/{parametre}',        [ParametreController::class, 'destroy']);

        });

        // Dashboards
        Route::middleware('role:admin,secretaire')->group(function () {
            Route::get('dashboard/stats',                  [DashboardController::class, 'stats']);
        });
        Route::middleware('role:enseignant')->group(function () {
            Route::get('dashboard/enseignant',             [DashboardController::class, 'enseignant']);
        });

        // Exports filtrés selon le rôle connecté
        Route::middleware('role:admin,secretaire,enseignant')->group(function () {
            Route::get('exports/pdf',                      [ExportController::class, 'pdf']);
            Route::get('exports/excel',                    [ExportController::class, 'excel']);
            Route::get('exports/{type}',                   [ExportController::class, 'resource']);
        });
    });
});
