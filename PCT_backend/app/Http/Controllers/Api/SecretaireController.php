<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Secretaire;
use App\Models\User;
use App\Notifications\CompteCreeNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class SecretaireController extends Controller
{
    #[OA\Get(path:"/secretaires",tags:["Secrétaires"],summary:"Liste des secrétaires",security:[["sanctum" => []]],responses:[new OA\Response(response:200,description:"Liste")])]
    public function index() {
        $logins = User::whereNotNull('secretaire_id')->pluck('login', 'secretaire_id');
        return Secretaire::all()->map(fn($s) => array_merge($s->toArray(), [
            'login' => $logins[$s->id] ?? '',
        ]));
    }

    #[OA\Post(path:"/secretaires",tags:["Secrétaires"],summary:"Créer une secrétaire",security:[["sanctum" => []]],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(required:["nom","prenom","email","login","password"],properties:[
            new OA\Property(property:"nom",type:"string"),new OA\Property(property:"prenom",type:"string"),
            new OA\Property(property:"email",type:"string",format:"email"),new OA\Property(property:"telephone",type:"string"),
            new OA\Property(property:"login",type:"string"),new OA\Property(property:"password",type:"string",format:"password"),
        ])),
        responses:[new OA\Response(response:201,description:"Créée")]
    )]
    public function store(Request $request) {
        $data = $request->validate([
            'nom'       => 'required',
            'prenom'    => 'required',
            'email'     => 'required|email|unique:secretaires|unique:users,email',
            'telephone' => 'nullable',
            'password'  => 'required|min:6',
        ]);
        $s = Secretaire::create($data);
        $user = User::create([
            'name'         => "{$s->prenom} {$s->nom}",
            'login'        => $s->email,
            'email'        => $s->email,
            'password'     => Hash::make($data['password']),
            'role'         => 'secretaire',
            'secretaire_id'=> $s->id,
            'actif'        => true,
        ]);

        // Notification email de création de compte
        try {
            $user->notify(new CompteCreeNotification($s->email, $data['password'], 'secretaire'));
        } catch (\Exception) { /* ne pas bloquer si le mail échoue */ }

        return response()->json(array_merge($s->toArray(), ['login' => $s->email]), 201);
    }

    #[OA\Get(path:"/secretaires/{id}",tags:["Secrétaires"],summary:"Détail",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:200,description:"Secrétaire")])]
    public function show(Secretaire $secretaire) { return $secretaire; }

    #[OA\Put(path:"/secretaires/{id}",tags:["Secrétaires"],summary:"Modifier",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(properties:[new OA\Property(property:"nom",type:"string")])),responses:[new OA\Response(response:200,description:"Modifié")])]
    public function update(Request $request, Secretaire $secretaire) {
        $data = $request->validate(['nom'=>'sometimes','prenom'=>'sometimes','email'=>'sometimes|email|unique:secretaires,email,'.$secretaire->id,'telephone'=>'nullable','login'=>'nullable','password'=>'nullable|min:6']);
        $secretaire->update($data);
        $user = User::where('secretaire_id',$secretaire->id)->first();
        if ($user) {
            if (!empty($data['login'])) $user->update(['login'=>$data['login']]);
            if (!empty($data['password'])) $user->update(['password'=>Hash::make($data['password'])]);
        }
        return $secretaire;
    }

    #[OA\Delete(path:"/secretaires/{id}",tags:["Secrétaires"],summary:"Supprimer",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:204,description:"Supprimé")])]
    public function destroy(Secretaire $secretaire) { $secretaire->delete(); return response()->json(null,204); }

    #[OA\Patch(path:"/secretaires/{id}",tags:["Secrétaires"],summary:"Activer/désactiver",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(properties:[new OA\Property(property:"actif",type:"boolean")])),responses:[new OA\Response(response:200,description:"Statut mis à jour")])]
    public function patch(Request $request, Secretaire $secretaire) {
        $secretaire->update($request->only(['actif']));
        $secretaire->user?->update(['actif'=>$request->actif]);
        return $secretaire;
    }
}