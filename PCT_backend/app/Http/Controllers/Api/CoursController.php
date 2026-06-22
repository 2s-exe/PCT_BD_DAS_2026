<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Cours;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class CoursController extends Controller
{
    #[OA\Get(path:"/cours",tags:["Cours"],summary:"Liste paginée des cours",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"search",in:"query",required:false,schema:new OA\Schema(type:"string"))],responses:[new OA\Response(response:200,description:"Liste")])]
    public function index(Request $request) {
        $q = Cours::query();
        if ($s = $request->search) $q->where('intitule_ecue','like',"%$s%");
        return $q->paginate(20);
    }

    #[OA\Post(path:"/cours",tags:["Cours"],summary:"Créer un cours",security:[["sanctum" => []]],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(required:["intitule_ecue","niveau","semestre","credit_ecue","charge_horaire_annuel"],properties:[
            new OA\Property(property:"intitule_ecue",type:"string"),
            new OA\Property(property:"niveau",type:"string",enum:["L1","L2","L3","M1","M2"]),
            new OA\Property(property:"semestre",type:"string",example:"S1"),
            new OA\Property(property:"credit_ecue",type:"integer"),
            new OA\Property(property:"charge_horaire_annuel",type:"integer"),
            new OA\Property(property:"code_specialite",type:"string"),
        ])),
        responses:[new OA\Response(response:201,description:"Cours créé")]
    )]
    public function store(Request $request) {
        $c = Cours::create($request->validate(['intitule_ecue'=>'required','niveau'=>'required|in:L1,L2,L3,M1,M2','semestre'=>'required','credit_ecue'=>'required|integer','charge_horaire_annuel'=>'required|integer','code_specialite'=>'nullable']));
        return response()->json($c,201);
    }

    #[OA\Get(path:"/cours/{id}",tags:["Cours"],summary:"Détail",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:200,description:"Cours")])]
    public function show(Cours $cour) { return $cour; }

    #[OA\Put(path:"/cours/{id}",tags:["Cours"],summary:"Modifier",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(properties:[new OA\Property(property:"intitule_ecue",type:"string")])),responses:[new OA\Response(response:200,description:"Modifié")])]
    public function update(Request $request, Cours $cour) {
        $cour->update($request->validate(['intitule_ecue'=>'required','niveau'=>'required|in:L1,L2,L3,M1,M2','semestre'=>'required','credit_ecue'=>'required|integer','charge_horaire_annuel'=>'required|integer','code_specialite'=>'nullable']));
        return $cour;
    }

    #[OA\Delete(path:"/cours/{id}",tags:["Cours"],summary:"Supprimer",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:204,description:"Supprimé"),new OA\Response(response:422,description:"Données liées")])]
    public function destroy(Cours $cour)
    {
        $count = $cour->attributions()->count();
        if ($count > 0) {
            return response()->json([
                'message' => "Impossible de supprimer : ce cours est utilisé dans {$count} attribution(s). Supprimez d'abord les attributions concernées.",
            ], 422);
        }
        $cour->delete();
        return response()->json(null, 204);
    }
}