<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
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

    public function down(): void
    {
        DB::statement("ALTER TABLE enseignants MODIFY COLUMN grade ENUM(
            'Assistant',
            'Maitre-Assistant',
            'Professeur'
        ) NOT NULL");
    }
};
