<?php

namespace App\Observers;

use App\Models\Enseignant;
use App\Models\VolumeHoraire;

class EnseignantObserver
{
    /**
     * Quand le grade change, recalculer heures_prevues sur tous ses volumes.
     */
    public function updated(Enseignant $enseignant): void
    {
        if (! $enseignant->wasChanged('grade')) {
            return;
        }

        $quota = Enseignant::HEURES_PAR_GRADE[$enseignant->grade] ?? 240;

        VolumeHoraire::where('enseignant_id', $enseignant->id)
            ->update(['heures_prevues' => $quota]);
    }
}
