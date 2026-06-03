<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activites_pedagogiques', function (Blueprint $table) {
            $table->id();
            $table->enum('type_operation', ['creation', 'mise_a_jour']);
            $table->enum('niveau_complexite', ['simple', 'intermediaire', 'complexe']);
            $table->date('date_activite');
            $table->decimal('volume_horaire', 8, 2);
            $table->text('observations')->nullable();
            $table->foreignId('attribution_id')->constrained('attributions')->cascadeOnDelete();
            $table->foreignId('annee_id')->constrained('annees_academiques')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activites_pedagogiques');
    }
};
