<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Validation extends Model
{
    protected $fillable = ['statut_validation','date_validation','observations','volume_id'];
    public function volume() { return $this->belongsTo(VolumeHoraire::class, 'volume_id'); }
}