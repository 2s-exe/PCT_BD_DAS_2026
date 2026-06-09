<?php

namespace Database\Seeders;

use App\Models\AnneeAcademique;
use App\Models\ParametreCalcul;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder de production — données minimales pour le démarrage.
 * Pour les données de test locales : php artisan db:seed --class=DevSeeder
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Compte Admin ────────────────────────────────────────────────────────
        User::updateOrCreate(['email' => 'admin@uvci.edu.ci'], [
            'name'     => 'Administrateur PCT',
            'email'    => 'admin@uvci.edu.ci',
            'login'    => 'admin@uvci.edu.ci',
            'password' => Hash::make('Admin@2026'),
            'role'     => 'admin',
            'actif'    => true,
        ]);

        // ── Année académique initiale ────────────────────────────────────────────
        if (! AnneeAcademique::where('active', true)->exists()) {
            AnneeAcademique::firstOrCreate(['libelle_annee' => '2025-2026'], [
                'date_debut' => '2025-09-01',
                'date_fin'   => '2026-07-31',
                'active'     => true,
            ]);
        }

        // ── Paramètres VHN (coefficients requis par l'application) ───────────────
        $params = [
            ['type_operation' => 'creation',    'niveau_complexite' => 'simple',        'coefficient_vhn' => 1.0, 'description' => 'Création simple'],
            ['type_operation' => 'creation',    'niveau_complexite' => 'intermediaire',  'coefficient_vhn' => 2.0, 'description' => 'Création intermédiaire'],
            ['type_operation' => 'creation',    'niveau_complexite' => 'complexe',       'coefficient_vhn' => 3.0, 'description' => 'Création complexe'],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'simple',        'coefficient_vhn' => 0.5, 'description' => 'Mise à jour simple'],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'intermediaire',  'coefficient_vhn' => 1.0, 'description' => 'Mise à jour intermédiaire'],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'complexe',       'coefficient_vhn' => 1.5, 'description' => 'Mise à jour complexe'],
        ];
        foreach ($params as $p) {
            ParametreCalcul::firstOrCreate(
                ['type_operation' => $p['type_operation'], 'niveau_complexite' => $p['niveau_complexite']],
                $p
            );
        }
    }
}
