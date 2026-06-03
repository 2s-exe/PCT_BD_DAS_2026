<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('login')->unique()->nullable()->after('name');
            $table->enum('role', ['admin', 'secretaire', 'enseignant'])->default('enseignant')->after('login');
            $table->boolean('actif')->default(true)->after('role');
            $table->foreignId('enseignant_id')->nullable()->constrained('enseignants')->nullOnDelete()->after('actif');
            $table->foreignId('secretaire_id')->nullable()->constrained('secretaires')->nullOnDelete()->after('enseignant_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['login', 'role', 'actif', 'enseignant_id', 'secretaire_id']);
        });
    }
};
