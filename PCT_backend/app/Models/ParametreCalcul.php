<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ParametreCalcul extends Model
{
    protected $table = 'parametres_calcul';
    protected $fillable = ['type_operation','niveau_complexite','coefficient_vhn','description'];
}