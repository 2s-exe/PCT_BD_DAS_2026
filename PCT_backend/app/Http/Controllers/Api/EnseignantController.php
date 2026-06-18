<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Mail\AccountCreatedMail;
use App\Models\Enseignant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
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
            'nom'=>'required','prenom'=>'required','email'=>'required|email|ends_with:@uvci.edu.ci|unique:enseignants|unique:users,email|unique:users,login',
            'telephone'=>'nullable','grade'=>'required|in:Assistant,Maitre-Assistant,Enseignant-Chercheur,Maitre-de-Conferences,Professeur-Titulaire',
            'statut'=>'required|in:Permanent,Vacataire','taux_horaire'=>'required|numeric|min:0',
            'departement_id'=>'nullable|exists:departements,id',
            'login'=>'nullable|string|unique:users,login','password'=>'nullable|min:6',
        ]);

        $enseignant = Enseignant::create($data);

        // Le login est toujours l'email institutionnel de l'enseignant
        $login = $enseignant->email;

        // Mot de passe généré automatiquement si non précisé
        $password = !empty($data['password']) ? $data['password'] : Str::random(12);
        $passwordGenerated = empty($data['password']);

        $createdUser = User::create([
            'name'          => "{$enseignant->prenom} {$enseignant->nom}",
            'login'         => $login,
            'email'         => $enseignant->email,
            'password'      => Hash::make($password),
            'role'          => 'enseignant',
            'enseignant_id' => $enseignant->id,
            'actif'         => true,
        ]);

        // Envoi de l'email de création de compte
        try {
            Mail::to($createdUser->email)->send(new AccountCreatedMail($login, $password, 'enseignant', $createdUser->name));
        } catch (\Exception) { /* ne pas bloquer si le mail échoue */ }

        return response()->json(
            array_merge($enseignant->load('departement')->toArray(), [
                'login'              => $login,
                'generated_password' => $passwordGenerated ? $password : null,
            ]),
            201
        );
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
            'email'=>'sometimes|required|email|ends_with:@uvci.edu.ci|unique:enseignants,email,'.$enseignant->id,
            'telephone'=>'nullable','grade'=>'sometimes|in:Assistant,Maitre-Assistant,Enseignant-Chercheur,Maitre-de-Conferences,Professeur-Titulaire',
            'statut'=>'sometimes|in:Permanent,Vacataire','taux_horaire'=>'sometimes|numeric|min:0',
            'departement_id'=>'nullable|exists:departements,id','login'=>'nullable|string','password'=>'nullable|min:6',
        ]);
        $enseignant->update($data);
        if ($enseignant->user) {
            $userChanges = [];
            if (!empty($data['login'])) $userChanges['login'] = $data['login'];
            if (!empty($data['password'])) $userChanges['password'] = Hash::make($data['password']);
            if ($userChanges) $enseignant->user->update($userChanges);
        }
        return $enseignant->load('departement');
    }

    #[OA\Delete(path:"/enseignants/{id}",tags:["Enseignants"],summary:"Supprimer un enseignant",
        security:[["sanctum" => []]],
        parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],
        responses:[new OA\Response(response:204,description:"Supprimé")]
    )]
    public function destroy(Enseignant $enseignant)
    {
        // Supprimer le compte utilisateur associé avant l'enseignant
        $enseignant->user?->tokens()->delete();
        $enseignant->user?->delete();
        $enseignant->delete();
        return response()->json(null, 204);
    }

    #[OA\Post(path:"/enseignants/import",tags:["Enseignants"],summary:"Importer des enseignants depuis un fichier CSV",
        security:[["sanctum" => []]],
        requestBody:new OA\RequestBody(required:true,content:new OA\MediaType(mediaType:"multipart/form-data",schema:new OA\Schema(required:["file"],properties:[new OA\Property(property:"file",type:"string",format:"binary")]))),
        responses:[new OA\Response(response:200,description:"Résultat de l'import")]
    )]
    public function importCsv(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:2048']);

        $handle  = fopen($request->file('file')->getRealPath(), 'r');
        $headers = array_map('trim', fgetcsv($handle, 0, ',') ?: []);

        $imported = [];
        $errors   = [];
        $line     = 1;

        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            $line++;
            if (count($row) !== count($headers)) {
                $errors[] = ['ligne' => $line, 'erreur' => 'Nombre de colonnes incorrect.'];
                continue;
            }
            $data = array_combine($headers, array_map('trim', $row));

            $v = Validator::make($data, [
                'nom'          => 'required|string',
                'prenom'       => 'required|string',
                'email'        => 'required|email|ends_with:@uvci.edu.ci|unique:enseignants|unique:users,email|unique:users,login',
                'grade'        => 'required|in:Assistant,Maitre-Assistant,Enseignant-Chercheur,Maitre-de-Conferences,Professeur-Titulaire',
                'statut'       => 'required|in:Permanent,Vacataire',
                'taux_horaire' => 'required|numeric|min:0',
            ]);

            if ($v->fails()) {
                $errors[] = ['ligne' => $line, 'erreur' => implode(', ', $v->errors()->all())];
                continue;
            }

            $enseignant = Enseignant::create([
                'nom'            => $data['nom'],
                'prenom'         => $data['prenom'],
                'email'          => $data['email'],
                'telephone'      => $data['telephone'] ?? null,
                'grade'          => $data['grade'],
                'statut'         => $data['statut'],
                'taux_horaire'   => (float) $data['taux_horaire'],
                'departement_id' => !empty($data['departement_id']) ? (int) $data['departement_id'] : null,
                'actif'          => true,
            ]);

            $password = 'Pct@' . date('Y');
            $user = User::create([
                'name'          => "{$enseignant->prenom} {$enseignant->nom}",
                'login'         => $enseignant->email,
                'email'         => $enseignant->email,
                'password'      => Hash::make($password),
                'role'          => 'enseignant',
                'enseignant_id' => $enseignant->id,
                'actif'         => true,
            ]);

            try {
                Mail::to($user->email)->send(new AccountCreatedMail($enseignant->email, $password, 'enseignant', $user->name));
            } catch (\Exception) {}

            $imported[] = $enseignant->nom_complet;
        }

        fclose($handle);

        return response()->json([
            'importes'        => count($imported),
            'erreurs'         => count($errors),
            'noms_importes'   => $imported,
            'details_erreurs' => $errors,
        ]);
    }

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