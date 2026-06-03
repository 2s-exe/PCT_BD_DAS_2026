<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\VolumeHoraire;
use App\Models\Validation;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class VolumeController extends Controller
{
    #[OA\Get(path:"/volumes",tags:["Volumes"],summary:"Liste des volumes horaires",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"statut",in:"query",description:"en_attente | valide | rejete",required:false,schema:new OA\Schema(type:"string"))],responses:[new OA\Response(response:200,description:"Volumes paginés")])]
    public function index(Request $request) {
        $q = VolumeHoraire::with(['enseignant.departement','annee','validation']);
        if ($s = $request->statut) {
            if ($s==='en_attente') $q->whereDoesntHave('validation');
            else $q->whereHas('validation',fn($w)=>$w->where('statut_validation',$s));
        }
        return $q->paginate(50);
    }

    #[OA\Post(path:"/volumes/{id}/valider",tags:["Volumes"],summary:"Valider ou rejeter un volume",security:[["sanctum" => []]],
        parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(required:["statut_validation"],properties:[
            new OA\Property(property:"statut_validation",type:"string",enum:["valide","rejete"]),
            new OA\Property(property:"observations",type:"string"),
        ])),
        responses:[new OA\Response(response:200,description:"Volume validé/rejeté")]
    )]
    public function valider(Request $request, VolumeHoraire $volume) {
        $data = $request->validate(['statut_validation'=>'required|in:valide,rejete','observations'=>'nullable']);
        $validation = $volume->validation;
        if ($validation) {
            $validation->update(['statut_validation'=>$data['statut_validation'],'observations'=>$data['observations']??null,'date_validation'=>now()]);
        } else {
            Validation::create(['volume_id'=>$volume->id,'statut_validation'=>$data['statut_validation'],'observations'=>$data['observations']??null,'date_validation'=>now()]);
        }
        return $volume->load(['enseignant','annee','validation']);
    }
}