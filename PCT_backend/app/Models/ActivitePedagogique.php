<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class ActivitePedagogique extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logFillable()->logOnlyDirty()->dontSubmitEmptyLogs();
    }

    protected $table = 'activites_pedagogiques';
    protected $fillable = ['type_operation','niveau_complexite','date_activite','volume_horaire','observations','attribution_id','annee_id'];
    public function attribution() { return $this->belongsTo(Attribution::class)->with(['enseignant','cours']); }
    public function annee() { return $this->belongsTo(AnneeAcademique::class, 'annee_id'); }
}