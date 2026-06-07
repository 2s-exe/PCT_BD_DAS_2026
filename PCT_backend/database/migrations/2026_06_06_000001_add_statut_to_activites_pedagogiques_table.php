<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activites_pedagogiques', function (Blueprint $table) {
            $table->enum('statut', ['en_attente', 'valide', 'rejete'])
                  ->default('en_attente')
                  ->after('observations');
            $table->text('observations_secretaire')->nullable()->after('statut');
        });
    }

    public function down(): void
    {
        Schema::table('activites_pedagogiques', function (Blueprint $table) {
            $table->dropColumn(['statut', 'observations_secretaire']);
        });
    }
};
