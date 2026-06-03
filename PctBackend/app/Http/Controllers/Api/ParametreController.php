<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ParametreCalcul;
use Illuminate\Http\Request;

class ParametreController extends Controller
{
    public function index() { return ParametreCalcul::all(); }
    public function store(Request $request) {
        $p = ParametreCalcul::create($request->validate(['type_operation'=>'required|in:creation,mise_a_jour','niveau_complexite'=>'required|in:simple,intermediaire,complexe','coefficient_vhn'=>'required|numeric|min:0','description'=>'nullable']));
        return response()->json($p, 201);
    }
    public function update(Request $request, ParametreCalcul $parametre) {
        $parametre->update($request->validate(['type_operation'=>'required|in:creation,mise_a_jour','niveau_complexite'=>'required|in:simple,intermediaire,complexe','coefficient_vhn'=>'required|numeric|min:0','description'=>'nullable']));
        return $parametre;
    }
    public function destroy(ParametreCalcul $parametre) { $parametre->delete(); return response()->json(null,204); }
}