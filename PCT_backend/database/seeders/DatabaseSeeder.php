<?php

namespace Database\Seeders;

use App\Models\AnneeAcademique;
use App\Models\Departement;
use App\Models\Enseignant;
use App\Models\ParametreCalcul;
use App\Models\Secretaire;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Compte Admin ────────────────────────────────────────────────────────
        // Email : admin@uvci.edu.ci | Mot de passe : Admin@2026
        User::updateOrCreate(['email' => 'admin@uvci.edu.ci'], [
            'name'     => 'Administrateur PCT',
            'email'    => 'admin@uvci.edu.ci',
            'login'    => 'admin@uvci.edu.ci',
            'password' => Hash::make('Admin@2026'),
            'role'     => 'admin',
            'actif'    => true,
        ]);

        // ── Départements ────────────────────────────────────────────────────────
        $depts = [
            ['nom_departement' => 'Informatique',         'responsable' => 'Pr. Konan Brou'],
            ['nom_departement' => 'Mathématiques',        'responsable' => 'Pr. Séka Appolinaire'],
            ['nom_departement' => 'Gestion',              'responsable' => 'Dr. Ouattara Lacine'],
            ['nom_departement' => 'Lettres & Sciences du Langage', 'responsable' => 'Pr. Diabaté Moussa'],
            ['nom_departement' => 'Sciences Économiques', 'responsable' => 'Dr. Coulibaly Abou'],
        ];
        $deptMap = [];
        foreach ($depts as $d) {
            $dept = Departement::firstOrCreate(['nom_departement' => $d['nom_departement']], $d);
            $deptMap[$d['nom_departement']] = $dept;
        }

        // ── Année académique active ──────────────────────────────────────────────
        AnneeAcademique::where('active', true)->update(['active' => false]);
        $annee = AnneeAcademique::firstOrCreate(['libelle_annee' => '2025-2026'], [
            'date_debut' => '2025-09-01',
            'date_fin'   => '2026-07-31',
            'active'     => true,
        ]);
        AnneeAcademique::firstOrCreate(['libelle_annee' => '2024-2025'], [
            'date_debut' => '2024-09-01',
            'date_fin'   => '2025-07-31',
            'active'     => false,
        ]);

        // ── Secrétaires ─────────────────────────────────────────────────────────
        // Email : a.kone@uvci.edu.ci | Mot de passe : Sec@2026
        $sec1 = Secretaire::firstOrCreate(['email' => 'a.kone@uvci.edu.ci'], [
            'nom'    => 'Koné',
            'prenom' => 'Aminata',
            'email'  => 'a.kone@uvci.edu.ci',
            'actif'  => true,
        ]);
        User::firstOrCreate(['email' => 'a.kone@uvci.edu.ci'], [
            'name'         => 'Aminata Koné',
            'email'        => 'a.kone@uvci.edu.ci',
            'login'        => 'a.kone@uvci.edu.ci',
            'password'     => Hash::make('Sec@2026'),
            'role'         => 'secretaire',
            'secretaire_id'=> $sec1->id,
            'actif'        => true,
        ]);

        // Email : f.traore@uvci.edu.ci | Mot de passe : Sec@2026
        $sec2 = Secretaire::firstOrCreate(['email' => 'f.traore@uvci.edu.ci'], [
            'nom'    => 'Traoré',
            'prenom' => 'Fatoumata',
            'email'  => 'f.traore@uvci.edu.ci',
            'actif'  => true,
        ]);
        User::firstOrCreate(['email' => 'f.traore@uvci.edu.ci'], [
            'name'         => 'Fatoumata Traoré',
            'email'        => 'f.traore@uvci.edu.ci',
            'login'        => 'f.traore@uvci.edu.ci',
            'password'     => Hash::make('Sec@2026'),
            'role'         => 'secretaire',
            'secretaire_id'=> $sec2->id,
            'actif'        => true,
        ]);

        // ── Enseignants ─────────────────────────────────────────────────────────
        $enseignants = [
            // Login : k.nguessan | Mot de passe : Ens@2026
            [
                'enseignant' => [
                    'nom' => "N'Guessan", 'prenom' => 'Kouassi', 'email' => 'k.nguessan@uvci.edu.ci',
                    'grade' => 'Maitre-Assistant', 'statut' => 'Permanent', 'taux_horaire' => 5000,
                    'departement' => 'Informatique',
                ],
                'user' => ['login' => 'k.nguessan', 'password' => 'Ens@2026'],
            ],
            // Login : b.diallo | Mot de passe : Ens@2026
            [
                'enseignant' => [
                    'nom' => 'Diallo', 'prenom' => 'Boubacar', 'email' => 'b.diallo@uvci.edu.ci',
                    'grade' => 'Professeur', 'statut' => 'Permanent', 'taux_horaire' => 8000,
                    'departement' => 'Mathématiques',
                ],
                'user' => ['login' => 'b.diallo', 'password' => 'Ens@2026'],
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

            // Login = email institutionnel
            User::firstOrCreate(['email' => $e['email']], [
                'name'          => "{$e['prenom']} {$e['nom']}",
                'email'         => $e['email'],
                'login'         => $e['email'],
                'password'      => Hash::make($item['user']['password']),
                'role'          => 'enseignant',
                'enseignant_id' => $ens->id,
                'actif'         => true,
            ]);
        }

        // ── Paramètres VHN ──────────────────────────────────────────────────────
        $params = [
            ['type_operation'=>'creation',    'niveau_complexite'=>'simple',        'coefficient_vhn'=>1.0, 'description'=>'Création simple'],
            ['type_operation'=>'creation',    'niveau_complexite'=>'intermediaire',  'coefficient_vhn'=>2.0, 'description'=>'Création intermédiaire'],
            ['type_operation'=>'creation',    'niveau_complexite'=>'complexe',       'coefficient_vhn'=>3.0, 'description'=>'Création complexe'],
            ['type_operation'=>'mise_a_jour', 'niveau_complexite'=>'simple',        'coefficient_vhn'=>0.5, 'description'=>'Mise à jour simple'],
            ['type_operation'=>'mise_a_jour', 'niveau_complexite'=>'intermediaire',  'coefficient_vhn'=>1.0, 'description'=>'Mise à jour intermédiaire'],
            ['type_operation'=>'mise_a_jour', 'niveau_complexite'=>'complexe',       'coefficient_vhn'=>1.5, 'description'=>'Mise à jour complexe'],
        ];
        foreach ($params as $p) {
            ParametreCalcul::firstOrCreate(
                ['type_operation'=>$p['type_operation'],'niveau_complexite'=>$p['niveau_complexite']],
                $p
            );
        }
    }
}
