<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enseignants', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->string('telephone')->nullable();
            $table->enum('grade', ['Assistant', 'Maitre-Assistant', 'Professeur']);
            $table->enum('statut', ['Permanent', 'Vacataire']);
            $table->decimal('taux_horaire', 10, 2)->default(0);
            $table->boolean('actif')->default(true);
            $table->foreignId('departement_id')->nullable()->constrained('departements')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enseignants');
    }
};
