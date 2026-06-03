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
        // Compte admin
        User::updateOrCreate(['login' => 'admin'], [
            'name'     => 'Administrateur',
            'email'    => 'admin@uvci.edu.ci',
            'login'    => 'admin',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
            'actif'    => true,
        ]);

        // Départements
        $depts = [
            ['nom_departement' => 'Informatique',    'responsable' => 'Pr. Konan'],
            ['nom_departement' => 'Mathématiques',   'responsable' => 'Pr. Séka'],
            ['nom_departement' => 'Gestion',         'responsable' => 'Dr. Ouattara'],
            ['nom_departement' => 'Lettres',         'responsable' => 'Pr. Diabaté'],
        ];
        foreach ($depts as $d) {
            Departement::firstOrCreate(['nom_departement' => $d['nom_departement']], $d);
        }
        $info = Departement::where('nom_departement', 'Informatique')->first();

        // Année académique active
        $annee = AnneeAcademique::firstOrCreate(['libelle_annee' => '2024-2025'], [
            'date_debut' => '2024-09-01',
            'date_fin'   => '2025-07-31',
            'active'     => true,
        ]);

        // Un enseignant de démonstration
        $ens = Enseignant::firstOrCreate(['email' => 'k.nguessan@uvci.edu.ci'], [
            'nom'           => 'N\'Guessan',
            'prenom'        => 'Kouassi',
            'email'         => 'k.nguessan@uvci.edu.ci',
            'grade'         => 'Maitre-Assistant',
            'statut'        => 'Permanent',
            'taux_horaire'  => 5000,
            'actif'         => true,
            'departement_id'=> $info->id,
        ]);
        User::firstOrCreate(['login' => 'k.nguessan'], [
            'name'          => 'Kouassi N\'Guessan',
            'email'         => 'k.nguessan@uvci.edu.ci',
            'login'         => 'k.nguessan',
            'password'      => Hash::make('ens123'),
            'role'          => 'enseignant',
            'enseignant_id' => $ens->id,
            'actif'         => true,
        ]);

        // Une secrétaire de démonstration
        $sec = Secretaire::firstOrCreate(['email' => 'a.kone@uvci.edu.ci'], [
            'nom'      => 'Koné',
            'prenom'   => 'Aminata',
            'email'    => 'a.kone@uvci.edu.ci',
            'actif'    => true,
        ]);
        User::firstOrCreate(['login' => 'a.kone'], [
            'name'         => 'Aminata Koné',
            'email'        => 'a.kone@uvci.edu.ci',
            'login'        => 'a.kone',
            'password'     => Hash::make('sec123'),
            'role'         => 'secretaire',
            'secretaire_id'=> $sec->id,
            'actif'        => true,
        ]);

        // Paramètres VHN
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
