<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Enseignant extends Model
{
    use LogsActivity;

    public const HEURES_PAR_GRADE = [
        'Assistant'             => 240,
        'Maitre-Assistant'      => 240,
        'Enseignant-Chercheur'  => 360,
        'Maitre-de-Conferences' => 150,
        'Professeur-Titulaire'  => 150,
    ];

    public const GRADES = [
        'Assistant', 'Maitre-Assistant',
        'Enseignant-Chercheur', 'Maitre-de-Conferences', 'Professeur-Titulaire',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontSubmitEmptyLogs();
    }

    protected $fillable = ['nom','prenom','email','telephone','grade','statut','taux_horaire','actif','departement_id'];
    protected $casts = ['actif'=>'boolean','taux_horaire'=>'float'];
    protected $appends = ['nom_complet','heures_annuelles'];
    public function getNomCompletAttribute(): string { return $this->prenom . ' ' . $this->nom; }
    public function getHeuresAnnuellesAttribute(): int { return self::HEURES_PAR_GRADE[$this->grade] ?? 240; }
    public function departement() { return $this->belongsTo(Departement::class); }
    public function user() { return $this->hasOne(User::class); }
    public function attributions() { return $this->hasMany(Attribution::class); }
    public function volumes() { return $this->hasMany(VolumeHoraire::class); }
}