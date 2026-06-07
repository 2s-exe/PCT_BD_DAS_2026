<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

#[OA\Info(
    title: "PCT UVCI — API REST",
    version: "1.0.0",
    description: "API de gestion des activités pédagogiques et volumes horaires — UVCI"
)]
#[OA\Server(url: "http://localhost:8000/api/v1", description: "Serveur local")]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "http",
    scheme: "bearer",
    bearerFormat: "Token",
    description: "Token obtenu via POST /login. Format : Bearer {token}"
)]
class AuthController extends Controller
{
    #[OA\Post(
        path: "/login",
        tags: ["Auth"],
        summary: "Connexion — obtenir un token",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["login","password"],
                properties: [
                    new OA\Property(property: "login",    type: "string", example: "admin"),
                    new OA\Property(property: "password", type: "string", example: "admin123"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Token Sanctum + user"),
            new OA\Response(response: 401, description: "Identifiants invalides"),
            new OA\Response(response: 403, description: "Compte désactivé"),
        ]
    )]
    public function login(Request $request)
    {
        $request->validate(['login'=>'required|string','password'=>'required|string']);
        $user = User::where('login',$request->login)->orWhere('email',$request->login)->first();
        if (!$user || !Hash::check($request->password,$user->password)) {
            return response()->json(['message'=>'Identifiants invalides.'],401);
        }
        if (!$user->actif) return response()->json(['message'=>'Compte désactivé.'],403);
        $token = $user->createToken('api-token')->plainTextToken;
        $userData = ['id'=>$user->id,'login'=>$user->login,'role'=>$user->role];
        if ($user->role==='enseignant' && $user->enseignant) {
            $userData['enseignant'] = $user->enseignant->load('departement');
        }
        return response()->json(['token'=>$token,'user'=>$userData]);
    }

    #[OA\Post(
        path: "/logout", tags: ["Auth"], summary: "Déconnexion",
        security: [["sanctum" => []]],
        responses: [new OA\Response(response: 200, description: "Déconnecté")]
    )]
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'Déconnecté.']);
    }

    #[OA\Get(
        path: "/me", tags: ["Auth"], summary: "Profil de l'utilisateur connecté",
        security: [["sanctum" => []]],
        responses: [new OA\Response(response: 200, description: "Profil utilisateur")]
    )]
    public function me(Request $request)
    {
        $user = $request->user();
        $data = ['id'=>$user->id,'login'=>$user->login,'role'=>$user->role];
        if ($user->role==='enseignant' && $user->enseignant) {
            $data['enseignant'] = $user->enseignant->load('departement');
        }
        return response()->json($data);
    }

    #[OA\Post(
        path: "/change-password", tags: ["Auth"], summary: "Modifier son mot de passe",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["current_password","new_password","new_password_confirmation"],
                properties: [
                    new OA\Property(property: "current_password",          type: "string"),
                    new OA\Property(property: "new_password",              type: "string", minLength: 6),
                    new OA\Property(property: "new_password_confirmation", type: "string"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Mot de passe modifié"),
            new OA\Response(response: 422, description: "Mot de passe actuel incorrect ou validation échouée"),
        ]
    )]
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'          => 'required|string',
            'new_password'              => 'required|string|min:6|confirmed',
            'new_password_confirmation' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.',
                'errors'  => ['current_password' => ['Le mot de passe actuel est incorrect.']],
            ], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }
}