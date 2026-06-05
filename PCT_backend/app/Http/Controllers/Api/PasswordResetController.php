<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use OpenApi\Attributes as OA;

class PasswordResetController extends Controller
{
    #[OA\Post(
        path: "/forgot-password",
        tags: ["Auth"],
        summary: "Demander un email de réinitialisation du mot de passe",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["email"],
                properties: [new OA\Property(property: "email", type: "string", format: "email")]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Email envoyé"),
            new OA\Response(response: 404, description: "Email introuvable"),
        ]
    )]
    public function forgot(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(['email' => $request->email]);

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Un email de réinitialisation a été envoyé.'])
            : response()->json(['message' => 'Aucun compte trouvé avec cet email.'], 404);
    }

    #[OA\Post(
        path: "/reset-password",
        tags: ["Auth"],
        summary: "Réinitialiser le mot de passe via token email",
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["token", "email", "password", "password_confirmation"],
                properties: [
                    new OA\Property(property: "token",                 type: "string"),
                    new OA\Property(property: "email",                 type: "string", format: "email"),
                    new OA\Property(property: "password",              type: "string", format: "password"),
                    new OA\Property(property: "password_confirmation", type: "string", format: "password"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Mot de passe réinitialisé"),
            new OA\Response(response: 422, description: "Token invalide ou expiré"),
        ]
    )]
    public function reset(Request $request)
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Mot de passe réinitialisé avec succès.'])
            : response()->json(['message' => 'Le lien est invalide ou a expiré.'], 422);
    }

    #[OA\Post(
        path: "/users/{user}/reset-password",
        tags: ["Auth"],
        summary: "Reset manuel du mot de passe par l'admin (sans email)",
        security: [["sanctum" => []]],
        parameters: [new OA\Parameter(name: "user", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["password"],
                properties: [new OA\Property(property: "password", type: "string", format: "password")]
            )
        ),
        responses: [new OA\Response(response: 200, description: "Mot de passe réinitialisé")]
    )]
    public function adminReset(Request $request, User $user)
    {
        $request->validate(['password' => 'required|min:6']);
        $user->forceFill(['password' => Hash::make($request->password)])->save();
        return response()->json(['message' => 'Mot de passe réinitialisé.']);
    }
}
