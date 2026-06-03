<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ActivitePedagogique extends Model
{
    protected $table = 'activites_pedagogiques';
    protected $fillable = ['type_operation','niveau_complexite','date_activite','volume_horaire','observations','attribution_id','annee_id'];
    public function attribution() { return $this->belongsTo(Attribution::class)->with(['enseignant','cours']); }
    public function annee() { return $this->belongsTo(AnneeAcademique::class, 'annee_id'); }
}