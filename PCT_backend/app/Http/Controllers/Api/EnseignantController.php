<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Enseignant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class EnseignantController extends Controller
{
    #[OA\Get(path:"/enseignants",tags:["Enseignants"],summary:"Liste paginée des enseignants",
        security:[["sanctum" => []]],
        parameters:[new OA\Parameter(name:"search",in:"query",required:false,schema:new OA\Schema(type:"string"))],
        responses:[new OA\Response(response:200,description:"Liste paginée")]
    )]
    public function index(Request $request)
    {
        $q = Enseignant::with('departement');
        if ($s = $request->search) {
            $q->where(fn($w) => $w->where('nom','like',"%$s%")->orWhere('prenom','like',"%$s%")->orWhere('email','like',"%$s%"));
        }
        return $q->paginate(20);
    }

    #[OA\Post(path:"/enseignants",tags:["Enseignants"],summary:"Créer un enseignant",
        security:[["sanctum" => []]],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(
            required:["nom","prenom","email","grade","statut","taux_horaire"],
            properties:[
                new OA\Property(property:"nom",type:"string"),
                new OA\Property(property:"prenom",type:"string"),
                new OA\Property(property:"email",type:"string",format:"email"),
                new OA\Property(property:"telephone",type:"string"),
                new OA\Property(property:"grade",type:"string",enum:["Assistant","Maitre-Assistant","Professeur"]),
                new OA\Property(property:"statut",type:"string",enum:["Permanent","Vacataire"]),
                new OA\Property(property:"taux_horaire",type:"number"),
                new OA\Property(property:"departement_id",type:"integer"),
                new OA\Property(property:"login",type:"string"),
                new OA\Property(property:"password",type:"string",format:"password"),
            ]
        )),
        responses:[new OA\Response(response:201,description:"Enseignant créé")]
    )]
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'=>'required','prenom'=>'required','email'=>'required|email|unique:enseignants',
            'telephone'=>'nullable','grade'=>'required|in:Assistant,Maitre-Assistant,Professeur',
            'statut'=>'required|in:Permanent,Vacataire','taux_horaire'=>'required|numeric|min:0',
            'departement_id'=>'nullable|exists:departements,id',
            'login'=>'nullable|string|unique:users,login','password'=>'nullable|min:6',
        ]);
        $enseignant = Enseignant::create($data);
        if (!empty($data['login']) && !empty($data['password'])) {
            User::create(['name'=>"{$enseignant->prenom} {$enseignant->nom}",'login'=>$data['login'],
                'email'=>$enseignant->email,'password'=>Hash::make($data['password']),
                'role'=>'enseignant','enseignant_id'=>$enseignant->id]);
        }
        return response()->json($enseignant->load('departement'),201);
    }

    #[OA\Get(path:"/enseignants/{id}",tags:["Enseignants"],summary:"Détail d'un enseignant",
        security:[["sanctum" => []]],
        parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],
        responses:[new OA\Response(response:200,description:"Enseignant"),new OA\Response(response:404,description:"Non trouvé")]
    )]
    public function show(Enseignant $enseignant) { return $enseignant->load('departement'); }

    #[OA\Put(path:"/enseignants/{id}",tags:["Enseignants"],summary:"Modifier un enseignant",
        security:[["sanctum" => []]],
        parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(properties:[new OA\Property(property:"nom",type:"string")])),
        responses:[new OA\Response(response:200,description:"Modifié")]
    )]
    public function update(Request $request, Enseignant $enseignant)
    {
        $data = $request->validate([
            'nom'=>'sometimes|required','prenom'=>'sometimes|required',
            'email'=>'sometimes|required|email|unique:enseignants,email,'.$enseignant->id,
            'telephone'=>'nullable','grade'=>'sometimes|in:Assistant,Maitre-Assistant,Professeur',
            'statut'=>'sometimes|in:Permanent,Vacataire','taux_horaire'=>'sometimes|numeric|min:0',
            'departement_id'=>'nullable|exists:departements,id','login'=>'nullable|string','password'=>'nullable|min:6',
        ]);
        $enseignant->update($data);
        if (!empty($data['password'])) $enseignant->user?->update(['password'=>Hash::make($data['password'])]);
        return $enseignant->load('departement');
    }

    #[OA\Delete(path:"/enseignants/{id}",tags:["Enseignants"],summary:"Supprimer un enseignant",
        security:[["sanctum" => []]],
        parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],
        responses:[new OA\Response(response:204,description:"Supprimé")]
    )]
    public function destroy(Enseignant $enseignant) { $enseignant->delete(); return response()->json(null,204); }

    #[OA\Patch(path:"/enseignants/{id}",tags:["Enseignants"],summary:"Activer ou désactiver",
        security:[["sanctum" => []]],
        parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(properties:[new OA\Property(property:"actif",type:"boolean")])),
        responses:[new OA\Response(response:200,description:"Statut mis à jour")]
    )]
    public function patch(Request $request, Enseignant $enseignant)
    {
        $enseignant->update($request->only(['actif']));
        return $enseignant->load('departement');
    }
}