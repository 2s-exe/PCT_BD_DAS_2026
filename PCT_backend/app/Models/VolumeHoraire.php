<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class VolumeHoraire extends Model
{
    protected $table = 'volumes_horaires';
    protected $fillable = ['heures_prevues','heures_realisees','heures_complementaires','enseignant_id','annee_id'];
    public function enseignant() { return $this->belongsTo(Enseignant::class)->with('departement'); }
    public function annee() { return $this->belongsTo(AnneeAcademique::class, 'annee_id'); }
    public function validation() { return $this->hasOne(Validation::class, 'volume_id'); }
}