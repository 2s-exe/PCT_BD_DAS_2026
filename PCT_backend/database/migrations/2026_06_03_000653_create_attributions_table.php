<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enseignant_id')->constrained('enseignants')->cascadeOnDelete();
            $table->foreignId('cours_id')->constrained('cours')->cascadeOnDelete();
            $table->foreignId('annee_id')->constrained('annees_academiques')->cascadeOnDelete();
            $table->integer('charge_horaire');
            $table->date('date_attribution');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attributions');
    }
};
