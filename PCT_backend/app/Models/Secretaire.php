<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Secretaire extends Model
{
    protected $fillable = ['nom','prenom','email','telephone','actif'];
    protected $casts = ['actif'=>'boolean'];
    protected $appends = ['nom_complet'];
    public function getNomCompletAttribute(): string { return $this->prenom . ' ' . $this->nom; }
    public function user() { return $this->hasOne(User::class); }
}