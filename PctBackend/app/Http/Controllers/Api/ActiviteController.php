<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ActivitePedagogique;
use App\Models\Attribution;
use App\Models\ParametreCalcul;
use Illuminate\Http\Request;

class ActiviteController extends Controller
{
    public function index(Request $request) {
        $q = ActivitePedagogique::with(['attribution.enseignant','attribution.cours','annee']);
        if ($id = $request->id_enseignant) $q->whereHas('attribution',fn($w)=>$w->where('enseignant_id',$id));
        return $q->latest()->paginate(50);
    }

    public function store(Request $request) {
        $data = $request->validate(['id_attribution'=>'required|exists:attributions,id','id_annee'=>'required|exists:annees_academiques,id','type_operation'=>'required|in:creation,mise_a_jour','niveau_complexite'=>'required|in:simple,intermediaire,complexe','date_activite'=>'required|date','observations'=>'nullable']);
        $parametre = ParametreCalcul::where('type_operation',$data['type_operation'])->where('niveau_complexite',$data['niveau_complexite'])->first();
        $volume = $parametre ? $parametre->coefficient_vhn : 1;
        $activite = ActivitePedagogique::create(['type_operation'=>$data['type_operation'],'niveau_complexite'=>$data['niveau_complexite'],'date_activite'=>$data['date_activite'],'volume_horaire'=>$volume,'observations'=>$data['observations']??null,'attribution_id'=>$data['id_attribution'],'annee_id'=>$data['id_annee']]);
        return response()->json($activite->load(['attribution.enseignant','attribution.cours','annee']), 201);
    }

    public function show(ActivitePedagogique $activite) { return $activite->load(['attribution.enseignant','attribution.cours','annee']); }
    public function destroy(ActivitePedagogique $activite) { $activite->delete(); return response()->json(null,204); }
}