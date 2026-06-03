<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Attribution;
use Illuminate\Http\Request;

class AttributionController extends Controller
{
    public function index(Request $request) {
        $q = Attribution::with(['enseignant','cours','annee']);
        if ($id = $request->id_enseignant) $q->where('enseignant_id',$id);
        return $q->paginate(50);
    }
    public function store(Request $request) {
        $a = Attribution::create($request->validate(['enseignant_id'=>'required|exists:enseignants,id','cours_id'=>'required|exists:cours,id','annee_id'=>'required|exists:annees_academiques,id','charge_horaire'=>'required|integer|min:1','date_attribution'=>'required|date']));
        return response()->json($a->load(['enseignant','cours','annee']), 201);
    }
    public function show(Attribution $attribution) { return $attribution->load(['enseignant','cours','annee']); }
    public function update(Request $request, Attribution $attribution) {
        $attribution->update($request->validate(['enseignant_id'=>'required|exists:enseignants,id','cours_id'=>'required|exists:cours,id','annee_id'=>'required|exists:annees_academiques,id','charge_horaire'=>'required|integer|min:1','date_attribution'=>'required|date']));
        return $attribution->load(['enseignant','cours','annee']);
    }
    public function destroy(Attribution $attribution) { $attribution->delete(); return response()->json(null,204); }
}