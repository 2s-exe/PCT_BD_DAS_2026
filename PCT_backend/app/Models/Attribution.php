<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Attribution extends Model
{
    protected $fillable = ['enseignant_id','cours_id','annee_id','charge_horaire','date_attribution'];
    public function enseignant() { return $this->belongsTo(Enseignant::class); }
    public function cours() { return $this->belongsTo(Cours::class); }
    public function annee() { return $this->belongsTo(AnneeAcademique::class, 'annee_id'); }
    public function activites() { return $this->hasMany(ActivitePedagogique::class); }
}