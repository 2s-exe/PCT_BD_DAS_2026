<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Cours;
use Illuminate\Http\Request;

class CoursController extends Controller
{
    public function index(Request $request) {
        $q = Cours::query();
        if ($s = $request->search) $q->where('intitule_ecue','like',"%$s%");
        return $q->paginate(20);
    }
    public function store(Request $request) {
        $c = Cours::create($request->validate(['intitule_ecue'=>'required','niveau'=>'required|in:L1,L2,L3,M1,M2','semestre'=>'required','credit_ecue'=>'required|integer','charge_horaire_annuel'=>'required|integer','code_specialite'=>'nullable']));
        return response()->json($c, 201);
    }
    public function show(Cours $cour) { return $cour; }
    public function update(Request $request, Cours $cour) {
        $cour->update($request->validate(['intitule_ecue'=>'required','niveau'=>'required|in:L1,L2,L3,M1,M2','semestre'=>'required','credit_ecue'=>'required|integer','charge_horaire_annuel'=>'required|integer','code_specialite'=>'nullable']));
        return $cour;
    }
    public function destroy(Cours $cour) { $cour->delete(); return response()->json(null,204); }
}