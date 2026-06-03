<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\VolumeHoraire;
use App\Models\Validation;
use Illuminate\Http\Request;

class VolumeController extends Controller
{
    public function index(Request $request) {
        $q = VolumeHoraire::with(['enseignant.departement','annee','validation']);
        if ($s = $request->statut) {
            if ($s === 'en_attente') $q->whereDoesntHave('validation');
            else $q->whereHas('validation',fn($w)=>$w->where('statut_validation',$s));
        }
        return $q->paginate(50);
    }

    public function valider(Request $request, VolumeHoraire $volume)
    {
        $data = $request->validate(['statut_validation'=>'required|in:valide,rejete','observations'=>'nullable']);
        $validation = $volume->validation;
        if ($validation) {
            $validation->update(['statut_validation'=>$data['statut_validation'],'observations'=>$data['observations']??null,'date_validation'=>now()]);
        } else {
            Validation::create(['volume_id'=>$volume->id,'statut_validation'=>$data['statut_validation'],'observations'=>$data['observations']??null,'date_validation'=>now()]);
        }
        return $volume->load(['enseignant','annee','validation']);
    }
}