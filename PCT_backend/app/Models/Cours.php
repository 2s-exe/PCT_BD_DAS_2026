<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Cours extends Model
{
    protected $fillable = ['intitule_ecue','niveau','semestre','credit_ecue','charge_horaire_annuel','code_specialite'];
    public function attributions() { return $this->hasMany(Attribution::class); }
}