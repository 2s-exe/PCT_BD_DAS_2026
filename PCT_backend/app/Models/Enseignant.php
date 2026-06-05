<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Enseignant extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontSubmitEmptyLogs();
    }

    protected $fillable = ['nom','prenom','email','telephone','grade','statut','taux_horaire','actif','departement_id'];
    protected $casts = ['actif'=>'boolean','taux_horaire'=>'float'];
    protected $appends = ['nom_complet'];
    public function getNomCompletAttribute(): string { return $this->prenom . ' ' . $this->nom; }
    public function departement() { return $this->belongsTo(Departement::class); }
    public function user() { return $this->hasOne(User::class); }
    public function attributions() { return $this->hasMany(Attribution::class); }
    public function volumes() { return $this->hasMany(VolumeHoraire::class); }
}