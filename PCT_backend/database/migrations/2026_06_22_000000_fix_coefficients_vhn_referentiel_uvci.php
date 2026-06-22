<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Corrige les coefficients VHN selon l'Annexe 1 & 2 du référentiel UVCI.
     * Formule : Vhtc = Ic × S
     *   Conception  : Niveau 1 = 8h, Niveau 2 = 15h, Niveau 3 = 30h
     *   Mise à jour : Niveau 1 = 4h, Niveau 2 = 7.5h, Niveau 3 = 15h
     */
    public function up(): void
    {
        $corrections = [
            ['type_operation' => 'creation',    'niveau_complexite' => 'simple',        'coefficient_vhn' =>  8.00, 'description' => 'Conception – Niveau 1 (simple)'],
            ['type_operation' => 'creation',    'niveau_complexite' => 'intermediaire',  'coefficient_vhn' => 15.00, 'description' => 'Conception – Niveau 2 (intermédiaire)'],
            ['type_operation' => 'creation',    'niveau_complexite' => 'complexe',       'coefficient_vhn' => 30.00, 'description' => 'Conception – Niveau 3 (complexe)'],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'simple',        'coefficient_vhn' =>  4.00, 'description' => 'Mise à jour – Niveau 1 (simple)'],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'intermediaire',  'coefficient_vhn' =>  7.50, 'description' => 'Mise à jour – Niveau 2 (intermédiaire)'],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'complexe',       'coefficient_vhn' => 15.00, 'description' => 'Mise à jour – Niveau 3 (complexe)'],
        ];

        foreach ($corrections as $c) {
            DB::table('parametres_calcul')
                ->where('type_operation', $c['type_operation'])
                ->where('niveau_complexite', $c['niveau_complexite'])
                ->update([
                    'coefficient_vhn' => $c['coefficient_vhn'],
                    'description'     => $c['description'],
                ]);
        }
    }

    public function down(): void
    {
        $originals = [
            ['type_operation' => 'creation',    'niveau_complexite' => 'simple',        'coefficient_vhn' => 1.00],
            ['type_operation' => 'creation',    'niveau_complexite' => 'intermediaire',  'coefficient_vhn' => 2.00],
            ['type_operation' => 'creation',    'niveau_complexite' => 'complexe',       'coefficient_vhn' => 3.00],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'simple',        'coefficient_vhn' => 0.50],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'intermediaire',  'coefficient_vhn' => 1.00],
            ['type_operation' => 'mise_a_jour', 'niveau_complexite' => 'complexe',       'coefficient_vhn' => 1.50],
        ];

        foreach ($originals as $o) {
            DB::table('parametres_calcul')
                ->where('type_operation', $o['type_operation'])
                ->where('niveau_complexite', $o['niveau_complexite'])
                ->update(['coefficient_vhn' => $o['coefficient_vhn']]);
        }
    }
};
