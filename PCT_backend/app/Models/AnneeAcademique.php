<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AnneeAcademique extends Model
{
    protected $table = 'annees_academiques';
    protected $fillable = ['libelle_annee','date_debut','date_fin','active'];
    protected $casts = ['active'=>'boolean'];
    public function attributions() { return $this->hasMany(Attribution::class, 'annee_id'); }
}