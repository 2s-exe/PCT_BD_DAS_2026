<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Departement;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class DepartementController extends Controller
{
    #[OA\Get(path:"/departements",tags:["Départements"],summary:"Liste des départements",security:[["sanctum" => []]],responses:[new OA\Response(response:200,description:"Liste")])]
    public function index() { return Departement::all(); }

    #[OA\Post(path:"/departements",tags:["Départements"],summary:"Créer un département",security:[["sanctum" => []]],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(required:["nom_departement"],properties:[new OA\Property(property:"nom_departement",type:"string"),new OA\Property(property:"responsable",type:"string")])),
        responses:[new OA\Response(response:201,description:"Créé")]
    )]
    public function store(Request $request) {
        $d = Departement::create($request->validate(['nom_departement'=>'required','responsable'=>'nullable']));
        return response()->json($d,201);
    }

    #[OA\Get(path:"/departements/{id}",tags:["Départements"],summary:"Détail",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:200,description:"Département")])]
    public function show(Departement $departement) { return $departement; }

    #[OA\Put(path:"/departements/{id}",tags:["Départements"],summary:"Modifier",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(properties:[new OA\Property(property:"nom_departement",type:"string")])),responses:[new OA\Response(response:200,description:"Modifié")])]
    public function update(Request $request, Departement $departement) {
        $departement->update($request->validate(['nom_departement'=>'required','responsable'=>'nullable']));
        return $departement;
    }

    #[OA\Delete(path:"/departements/{id}",tags:["Départements"],summary:"Supprimer",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:204,description:"Supprimé")])]
    public function destroy(Departement $departement) { $departement->delete(); return response()->json(null,204); }
}