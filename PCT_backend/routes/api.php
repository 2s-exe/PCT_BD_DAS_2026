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
use App\Http\Controllers\Api\ExportController;

// Auth (public)
Route::prefix('v1')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    // Protected
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me',     [AuthController::class, 'me']);

        // Enseignants
        Route::apiResource('enseignants', EnseignantController::class);
        Route::patch('enseignants/{enseignant}', [EnseignantController::class, 'patch']);

        // Secrétaires
        Route::get('secretaires',                   [SecretaireController::class, 'index']);
        Route::post('secretaires',                  [SecretaireController::class, 'store']);
        Route::get('secretaires/{secretaire}',      [SecretaireController::class, 'show']);
        Route::put('secretaires/{secretaire}',      [SecretaireController::class, 'update']);
        Route::patch('secretaires/{secretaire}',    [SecretaireController::class, 'patch']);
        Route::delete('secretaires/{secretaire}',   [SecretaireController::class, 'destroy']);

        // Départements
        Route::apiResource('departements', DepartementController::class);

        // Années académiques
        Route::apiResource('annees', AnneeController::class);
        Route::patch('annees/{annee}/activer', [AnneeController::class, 'activer']);

        // Cours
        Route::apiResource('cours', CoursController::class);

        // Attributions
        Route::apiResource('attributions', AttributionController::class);

        // Activités pédagogiques
        Route::get('activites',           [ActiviteController::class, 'index']);
        Route::post('activites',          [ActiviteController::class, 'store']);
        Route::get('activites/{activite}', [ActiviteController::class, 'show']);
        Route::delete('activites/{activite}', [ActiviteController::class, 'destroy']);

        // Volumes horaires
        Route::get('volumes',                        [VolumeController::class, 'index']);
        Route::post('volumes/{volume}/valider',      [VolumeController::class, 'valider']);

        // Paramètres de calcul
        Route::get('parametres',              [ParametreController::class, 'index']);
        Route::post('parametres',             [ParametreController::class, 'store']);
        Route::put('parametres/{parametre}',  [ParametreController::class, 'update']);
        Route::delete('parametres/{parametre}', [ParametreController::class, 'destroy']);

        // Exports
        Route::get('exports/pdf',   [ExportController::class, 'pdf']);
        Route::get('exports/excel', [ExportController::class, 'excel']);
    });
});
