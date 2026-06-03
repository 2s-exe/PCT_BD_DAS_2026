<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parametres_calcul', function (Blueprint $table) {
            $table->id();
            $table->enum('type_operation', ['creation', 'mise_a_jour']);
            $table->enum('niveau_complexite', ['simple', 'intermediaire', 'complexe']);
            $table->decimal('coefficient_vhn', 5, 2);
            $table->text('description')->nullable();
            $table->unique(['type_operation', 'niveau_complexite']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parametres_calcul');
    }
};
