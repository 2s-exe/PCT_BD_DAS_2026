<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\AnneeAcademique;
use Illuminate\Http\Request;

class AnneeController extends Controller
{
    public function index() { return AnneeAcademique::orderByDesc('date_debut')->get(); }
    public function store(Request $request) {
        $a = AnneeAcademique::create($request->validate(['libelle_annee'=>'required','date_debut'=>'required|date','date_fin'=>'required|date','active'=>'boolean']));
        return response()->json($a, 201);
    }
    public function show(AnneeAcademique $annee) { return $annee; }
    public function update(Request $request, AnneeAcademique $annee) {
        $annee->update($request->validate(['libelle_annee'=>'required','date_debut'=>'required|date','date_fin'=>'required|date','active'=>'boolean']));
        return $annee;
    }
    public function destroy(AnneeAcademique $annee) { $annee->delete(); return response()->json(null,204); }
    public function activer(AnneeAcademique $annee) {
        AnneeAcademique::where('active',true)->update(['active'=>false]);
        $annee->update(['active'=>true]);
        return $annee;
    }
}