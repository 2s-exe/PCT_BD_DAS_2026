<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login'    => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('login', $request->login)
            ->orWhere('email', $request->login)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants invalides.'], 401);
        }

        if (! $user->actif) {
            return response()->json(['message' => 'Compte désactivé.'], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        $userData = [
            'id'    => $user->id,
            'login' => $user->login,
            'role'  => $user->role,
        ];

        if ($user->role === 'enseignant' && $user->enseignant) {
            $userData['enseignant'] = $user->enseignant->load('departement');
        }

        return response()->json(['token' => $token, 'user' => $userData]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $data = ['id' => $user->id, 'login' => $user->login, 'role' => $user->role];
        if ($user->role === 'enseignant' && $user->enseignant) {
            $data['enseignant'] = $user->enseignant->load('departement');
        }
        return response()->json($data);
    }
}
