<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Departement;
use Illuminate\Http\Request;

class DepartementController extends Controller
{
    public function index() { return Departement::all(); }
    public function store(Request $request) {
        $d = Departement::create($request->validate(['nom_departement'=>'required','responsable'=>'nullable']));
        return response()->json($d, 201);
    }
    public function show(Departement $departement) { return $departement; }
    public function update(Request $request, Departement $departement) {
        $departement->update($request->validate(['nom_departement'=>'required','responsable'=>'nullable']));
        return $departement;
    }
    public function destroy(Departement $departement) { $departement->delete(); return response()->json(null,204); }
}