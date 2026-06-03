<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ParametreCalcul;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ParametreController extends Controller
{
    #[OA\Get(path:"/parametres",tags:["Paramètres"],summary:"Liste des coefficients VHN",security:[["sanctum" => []]],responses:[new OA\Response(response:200,description:"Paramètres")])]
    public function index() { return ParametreCalcul::all(); }

    #[OA\Post(path:"/parametres",tags:["Paramètres"],summary:"Créer un paramètre",security:[["sanctum" => []]],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(required:["type_operation","niveau_complexite","coefficient_vhn"],properties:[
            new OA\Property(property:"type_operation",type:"string",enum:["creation","mise_a_jour"]),
            new OA\Property(property:"niveau_complexite",type:"string",enum:["simple","intermediaire","complexe"]),
            new OA\Property(property:"coefficient_vhn",type:"number",format:"float",example:1.5),
            new OA\Property(property:"description",type:"string"),
        ])),
        responses:[new OA\Response(response:201,description:"Créé")]
    )]
    public function store(Request $request) {
        $p = ParametreCalcul::create($request->validate(['type_operation'=>'required|in:creation,mise_a_jour','niveau_complexite'=>'required|in:simple,intermediaire,complexe','coefficient_vhn'=>'required|numeric|min:0','description'=>'nullable']));
        return response()->json($p,201);
    }

    #[OA\Put(path:"/parametres/{id}",tags:["Paramètres"],summary:"Modifier",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(properties:[new OA\Property(property:"coefficient_vhn",type:"number")])),responses:[new OA\Response(response:200,description:"Modifié")])]
    public function update(Request $request, ParametreCalcul $parametre) {
        $parametre->update($request->validate(['type_operation'=>'required|in:creation,mise_a_jour','niveau_complexite'=>'required|in:simple,intermediaire,complexe','coefficient_vhn'=>'required|numeric|min:0','description'=>'nullable']));
        return $parametre;
    }

    #[OA\Delete(path:"/parametres/{id}",tags:["Paramètres"],summary:"Supprimer",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:204,description:"Supprimé")])]
    public function destroy(ParametreCalcul $parametre) { $parametre->delete(); return response()->json(null,204); }
}