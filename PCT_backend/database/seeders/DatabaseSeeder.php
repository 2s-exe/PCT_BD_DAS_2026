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

        // ── Paramètres VHN — Annexe 1 & 2 du référentiel UVCI ──────────────────
        // Vhtc = Ic × S  (Ic = coefficient par séquence, S = nombre de séquences)
        // Conception : Niveau 1 = 8h, Niveau 2 = 15h, Niveau 3 = 30h
        // Mise à jour : Niveau 1 = 4h, Niveau 2 = 7.5h, Niveau 3 = 15h
        $params = [
            ['type_operation' => 'creation',    'niveau_complexite' => 'simple',        'coefficient_vhn' =>  8.0,  'description' => 'Conception – Niveau 1 (simple)'],
            ['type_operation' => 'creation',    'niveau_complexite' => 'intermediaire',  'coefficient_vhn' => 15.0,  'description' => 'Conception – Niveau 2 (intermédiaire)'],
            ['type_operation' => 'creation',    'niveau_complexite' => 'complexe',       'coefficient_vhn' => 30.0,  'description' => 'Conception – Niveau 3 (complexe)'],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'simple',        'coefficient_vhn' =>  4.0,  'description' => 'Mise à jour – Niveau 1 (simple)'],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'intermediaire',  'coefficient_vhn' =>  7.5,  'description' => 'Mise à jour – Niveau 2 (intermédiaire)'],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'complexe',       'coefficient_vhn' => 15.0,  'description' => 'Mise à jour – Niveau 3 (complexe)'],
        ];
        foreach ($params as $p) {
            ParametreCalcul::updateOrCreate(
                ['type_operation' => $p['type_operation'], 'niveau_complexite' => $p['niveau_complexite']],
                $p
            );
        }
    }
}
