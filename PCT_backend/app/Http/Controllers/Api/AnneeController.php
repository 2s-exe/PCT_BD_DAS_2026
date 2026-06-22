<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\AnneeAcademique;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AnneeController extends Controller
{
    #[OA\Get(path:"/annees",tags:["Années"],summary:"Liste des années académiques",security:[["sanctum" => []]],responses:[new OA\Response(response:200,description:"Liste")])]
    public function index() { return AnneeAcademique::orderByDesc('date_debut')->get(); }

    #[OA\Post(path:"/annees",tags:["Années"],summary:"Créer une année",security:[["sanctum" => []]],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(required:["libelle_annee","date_debut","date_fin"],properties:[
            new OA\Property(property:"libelle_annee",type:"string",example:"2025-2026"),
            new OA\Property(property:"date_debut",type:"string",format:"date"),
            new OA\Property(property:"date_fin",type:"string",format:"date"),
            new OA\Property(property:"active",type:"boolean"),
        ])),
        responses:[new OA\Response(response:201,description:"Créée")]
    )]
    public function store(Request $request) {
        $a = AnneeAcademique::create($request->validate(['libelle_annee'=>'required','date_debut'=>'required|date','date_fin'=>'required|date','active'=>'boolean']));
        return response()->json($a,201);
    }

    #[OA\Get(path:"/annees/{id}",tags:["Années"],summary:"Détail",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:200,description:"Année")])]
    public function show(AnneeAcademique $annee) { return $annee; }

    #[OA\Put(path:"/annees/{id}",tags:["Années"],summary:"Modifier",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(properties:[new OA\Property(property:"libelle_annee",type:"string")])),responses:[new OA\Response(response:200,description:"Modifié")])]
    public function update(Request $request, AnneeAcademique $annee) {
        $annee->update($request->validate(['libelle_annee'=>'required','date_debut'=>'required|date','date_fin'=>'required|date','active'=>'boolean']));
        return $annee;
    }

    #[OA\Delete(path:"/annees/{id}",tags:["Années"],summary:"Supprimer",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:204,description:"Supprimé"),new OA\Response(response:422,description:"Données liées")])]
    public function destroy(AnneeAcademique $annee)
    {
        if ($annee->active) {
            return response()->json([
                'message' => "Impossible de supprimer l'année académique active. Activez une autre année d'abord.",
            ], 422);
        }
        $attrCount = $annee->attributions()->count();
        if ($attrCount > 0) {
            return response()->json([
                'message' => "Impossible de supprimer : cette année contient {$attrCount} attribution(s) et toutes les activités associées. Supprimez d'abord les attributions.",
            ], 422);
        }
        $annee->delete();
        return response()->json(null, 204);
    }

    #[OA\Patch(path:"/annees/{id}/activer",tags:["Années"],summary:"Définir comme année active",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:200,description:"Activée")])]
    public function activer(AnneeAcademique $annee) {
        AnneeAcademique::where('active',true)->update(['active'=>false]);
        $annee->update(['active'=>true]);
        return $annee;
    }
}