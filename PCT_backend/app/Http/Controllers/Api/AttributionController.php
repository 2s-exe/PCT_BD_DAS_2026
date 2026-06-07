<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Attribution;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AttributionController extends Controller
{
    #[OA\Get(path:"/attributions",tags:["Attributions"],summary:"Liste des attributions",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id_enseignant",in:"query",required:false,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:200,description:"Liste")])]
    public function index(Request $request) {
        $q = Attribution::with(['enseignant','cours','annee']);
        $user = $request->user();
        if ($user->role === 'enseignant') {
            $q->where('enseignant_id', $user->enseignant?->id);
        } elseif ($id = $request->id_enseignant) {
            $q->where('enseignant_id', $id);
        }
        return $q->paginate(50);
    }

    #[OA\Post(path:"/attributions",tags:["Attributions"],summary:"Créer une attribution",security:[["sanctum" => []]],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(required:["enseignant_id","cours_id","annee_id","charge_horaire","date_attribution"],properties:[
            new OA\Property(property:"enseignant_id",type:"integer"),
            new OA\Property(property:"cours_id",type:"integer"),
            new OA\Property(property:"annee_id",type:"integer"),
            new OA\Property(property:"charge_horaire",type:"integer"),
            new OA\Property(property:"date_attribution",type:"string",format:"date"),
        ])),
        responses:[new OA\Response(response:201,description:"Créée")]
    )]
    public function store(Request $request) {
        $a = Attribution::create($request->validate(['enseignant_id'=>'required|exists:enseignants,id','cours_id'=>'required|exists:cours,id','annee_id'=>'required|exists:annees_academiques,id','charge_horaire'=>'required|integer|min:1','date_attribution'=>'required|date']));
        return response()->json($a->load(['enseignant','cours','annee']),201);
    }

    #[OA\Get(path:"/attributions/{id}",tags:["Attributions"],summary:"Détail",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:200,description:"Attribution")])]
    public function show(Attribution $attribution) { return $attribution->load(['enseignant','cours','annee']); }

    #[OA\Put(path:"/attributions/{id}",tags:["Attributions"],summary:"Modifier",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(properties:[new OA\Property(property:"charge_horaire",type:"integer")])),responses:[new OA\Response(response:200,description:"Modifié")])]
    public function update(Request $request, Attribution $attribution) {
        $attribution->update($request->validate(['enseignant_id'=>'required|exists:enseignants,id','cours_id'=>'required|exists:cours,id','annee_id'=>'required|exists:annees_academiques,id','charge_horaire'=>'required|integer|min:1','date_attribution'=>'required|date']));
        return $attribution->load(['enseignant','cours','annee']);
    }

    #[OA\Delete(path:"/attributions/{id}",tags:["Attributions"],summary:"Supprimer",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:204,description:"Supprimé")])]
    public function destroy(Attribution $attribution) { $attribution->delete(); return response()->json(null,204); }
}