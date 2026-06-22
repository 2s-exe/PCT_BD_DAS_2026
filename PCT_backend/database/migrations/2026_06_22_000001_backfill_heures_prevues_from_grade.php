<?php

use App\Models\Enseignant;
use App\Models\VolumeHoraire;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Recalcule heures_prevues pour tous les volumes existants
     * d'après le grade de l'enseignant (référentiel UVCI).
     */
    public function up(): void
    {
        VolumeHoraire::with('enseignant')->get()->each(function (VolumeHoraire $v) {
            if (! $v->enseignant) return;
            $quota = Enseignant::HEURES_PAR_GRADE[$v->enseignant->grade] ?? 240;
            $v->update(['heures_prevues' => $quota]);
        });
    }

    public function down(): void
    {
        // La valeur précédente (sum charge_horaire) n'est pas recalculable ici.
        // Relancer php artisan db:seed pour réinitialiser les données de test.
    }
};
