<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('validations', function (Blueprint $table) {
            $table->id();
            $table->enum('statut_validation', ['en_attente', 'valide', 'rejete'])->default('en_attente');
            $table->timestamp('date_validation')->nullable();
            $table->text('observations')->nullable();
            $table->foreignId('volume_id')->constrained('volumes_horaires')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('validations');
    }
};
