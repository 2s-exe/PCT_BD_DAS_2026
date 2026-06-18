<?php

namespace Database\Seeders;

use App\Models\AnneeAcademique;
use App\Models\Departement;
use App\Models\Enseignant;
use App\Models\Secretaire;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder de développement local — étend le seeder de production avec des
 * données de test (départements, secrétaires, enseignants).
 *
 * Usage : php artisan db:seed --class=DevSeeder
 */
class DevSeeder extends Seeder
{
    public function run(): void
    {
        // Données de production en premier (admin + parametres + annee)
        $this->call(DatabaseSeeder::class);

        // ── Année supplémentaire (historique) ───────────────────────────────────
        AnneeAcademique::firstOrCreate(['libelle_annee' => '2024-2025'], [
            'date_debut' => '2024-09-01',
            'date_fin'   => '2025-07-31',
            'active'     => false,
        ]);

        // ── Départements ────────────────────────────────────────────────────────
        $depts = [
            ['nom_departement' => 'Informatique',                  'responsable' => 'Pr. Konan Brou'],
            ['nom_departement' => 'Mathématiques',                 'responsable' => 'Pr. Séka Appolinaire'],
            ['nom_departement' => 'Gestion',                       'responsable' => 'Dr. Ouattara Lacine'],
            ['nom_departement' => 'Lettres & Sciences du Langage', 'responsable' => 'Pr. Diabaté Moussa'],
            ['nom_departement' => 'Sciences Économiques',          'responsable' => 'Dr. Coulibaly Abou'],
        ];
        $deptMap = [];
        foreach ($depts as $d) {
            $dept = Departement::firstOrCreate(['nom_departement' => $d['nom_departement']], $d);
            $deptMap[$d['nom_departement']] = $dept;
        }

        // ── Secrétaires ─────────────────────────────────────────────────────────
        // Email : a.kone@uvci.edu.ci | Mot de passe : Sec@2026
        $sec1 = Secretaire::firstOrCreate(['email' => 'a.kone@uvci.edu.ci'], [
            'nom'    => 'Koné',
            'prenom' => 'Aminata',
            'email'  => 'a.kone@uvci.edu.ci',
            'actif'  => true,
        ]);
        User::firstOrCreate(['email' => 'a.kone@uvci.edu.ci'], [
            'name'          => 'Aminata Koné',
            'email'         => 'a.kone@uvci.edu.ci',
            'login'         => 'a.kone@uvci.edu.ci',
            'password'      => Hash::make('Sec@2026'),
            'role'          => 'secretaire',
            'secretaire_id' => $sec1->id,
            'actif'         => true,
        ]);

        // Email : f.traore@uvci.edu.ci | Mot de passe : Sec@2026
        $sec2 = Secretaire::firstOrCreate(['email' => 'f.traore@uvci.edu.ci'], [
            'nom'    => 'Traoré',
            'prenom' => 'Fatoumata',
            'email'  => 'f.traore@uvci.edu.ci',
            'actif'  => true,
        ]);
        User::firstOrCreate(['email' => 'f.traore@uvci.edu.ci'], [
            'name'          => 'Fatoumata Traoré',
            'email'         => 'f.traore@uvci.edu.ci',
            'login'         => 'f.traore@uvci.edu.ci',
            'password'      => Hash::make('Sec@2026'),
            'role'          => 'secretaire',
            'secretaire_id' => $sec2->id,
            'actif'         => true,
        ]);

        // ── Enseignants ─────────────────────────────────────────────────────────
        // Mot de passe commun : Ens@2026
        $enseignants = [
            [
                'enseignant' => [
                    'nom' => "N'Guessan", 'prenom' => 'Kouassi', 'email' => 'k.nguessan@uvci.edu.ci',
                    'grade' => 'Maitre-Assistant', 'statut' => 'Permanent', 'taux_horaire' => 5000,
                    'departement' => 'Informatique',
                ],
            ],
            [
                'enseignant' => [
                    'nom' => 'Diallo', 'prenom' => 'Boubacar', 'email' => 'b.diallo@uvci.edu.ci',
                    'grade' => 'Professeur-Titulaire', 'statut' => 'Permanent', 'taux_horaire' => 8000,
                    'departement' => 'Mathématiques',
                ],
            ],
            [
                'enseignant' => [
                    'nom' => 'Soro', 'prenom' => 'Moussa', 'email' => 'm.soro@uvci.edu.ci',
                    'grade' => 'Assistant', 'statut' => 'Vacataire', 'taux_horaire' => 3500,
                    'departement' => 'Gestion',
                ],
            ],
            [
                'enseignant' => [
                    'nom' => 'Kouamé', 'prenom' => 'Jean', 'email' => 'j.kouame@uvci.edu.ci',
                    'grade' => 'Maitre-de-Conferences', 'statut' => 'Permanent', 'taux_horaire' => 6500,
                    'departement' => 'Sciences Économiques',
                ],
            ],
            [
                'enseignant' => [
                    'nom' => 'Bamba', 'prenom' => 'Seydou', 'email' => 's.bamba@uvci.edu.ci',
                    'grade' => 'Professeur-Titulaire', 'statut' => 'Permanent', 'taux_horaire' => 8000,
                    'departement' => 'Informatique',
                ],
            ],
            [
                'enseignant' => [
                    'nom' => 'Sow', 'prenom' => 'Saidou', 'email' => 's.sow@uvci.edu.ci',
                    'grade' => 'Maitre-Assistant', 'statut' => 'Permanent', 'taux_horaire' => 5000,
                    'departement' => 'Informatique',
                ],
            ],
        ];

        foreach ($enseignants as $item) {
            $e = $item['enseignant'];
            $dept = $deptMap[$e['departement']] ?? null;

            $ens = Enseignant::firstOrCreate(['email' => $e['email']], [
                'nom'            => $e['nom'],
                'prenom'         => $e['prenom'],
                'email'          => $e['email'],
                'grade'          => $e['grade'],
                'statut'         => $e['statut'],
                'taux_horaire'   => $e['taux_horaire'],
                'actif'          => true,
                'departement_id' => $dept?->id,
            ]);

            User::firstOrCreate(['email' => $e['email']], [
                'name'          => "{$e['prenom']} {$e['nom']}",
                'email'         => $e['email'],
                'login'         => $e['email'],
                'password'      => Hash::make('Ens@2026'),
                'role'          => 'enseignant',
                'enseignant_id' => $ens->id,
                'actif'         => true,
            ]);
        }
    }
}
