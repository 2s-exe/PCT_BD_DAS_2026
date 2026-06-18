<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Migrer les éventuels "Professeur" restants vers "Professeur-Titulaire"
        DB::statement("UPDATE enseignants SET grade = 'Professeur-Titulaire' WHERE grade = 'Professeur'");

        DB::statement("ALTER TABLE enseignants MODIFY COLUMN grade ENUM(
            'Assistant',
            'Maitre-Assistant',
            'Enseignant-Chercheur',
            'Maitre-de-Conferences',
            'Professeur-Titulaire'
        ) NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE enseignants MODIFY COLUMN grade ENUM(
            'Assistant',
            'Maitre-Assistant',
            'Professeur',
            'Enseignant-Chercheur',
            'Maitre-de-Conferences',
            'Professeur-Titulaire'
        ) NOT NULL");
    }
};
