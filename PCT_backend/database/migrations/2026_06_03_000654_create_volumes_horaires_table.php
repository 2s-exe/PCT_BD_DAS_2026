<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volumes_horaires', function (Blueprint $table) {
            $table->id();
            $table->decimal('heures_prevues', 8, 2)->default(0);
            $table->decimal('heures_realisees', 8, 2)->default(0);
            $table->decimal('heures_complementaires', 8, 2)->default(0);
            $table->foreignId('enseignant_id')->constrained('enseignants')->cascadeOnDelete();
            $table->foreignId('annee_id')->constrained('annees_academiques')->cascadeOnDelete();
            $table->unique(['enseignant_id', 'annee_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volumes_horaires');
    }
};
