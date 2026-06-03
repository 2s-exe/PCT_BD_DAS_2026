<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Secretaire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SecretaireController extends Controller
{
    public function index()
    {
        return Secretaire::all()->map(fn($s) => array_merge($s->toArray(), [
            'login' => User::where('secretaire_id', $s->id)->value('login') ?? '',
        ]));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom'=>'required','prenom'=>'required','email'=>'required|email|unique:secretaires',
            'telephone'=>'nullable','login'=>'required|unique:users,login','password'=>'required|min:6',
        ]);
        $secretaire = Secretaire::create($data);
        User::create(['name'=>"{$secretaire->prenom} {$secretaire->nom}",'login'=>$data['login'],
            'email'=>$secretaire->email,'password'=>Hash::make($data['password']),
            'role'=>'secretaire','secretaire_id'=>$secretaire->id]);
        return response()->json(array_merge($secretaire->toArray(), ['login'=>$data['login']]), 201);
    }

    public function show(Secretaire $secretaire)
    {
        return $secretaire;
    }

    public function update(Request $request, Secretaire $secretaire)
    {
        $data = $request->validate([
            'nom'=>'sometimes','prenom'=>'sometimes',
            'email'=>'sometimes|email|unique:secretaires,email,'.$secretaire->id,
            'telephone'=>'nullable','login'=>'nullable','password'=>'nullable|min:6',
        ]);
        $secretaire->update($data);
        $user = User::where('secretaire_id', $secretaire->id)->first();
        if ($user) {
            if (!empty($data['login'])) $user->update(['login'=>$data['login']]);
            if (!empty($data['password'])) $user->update(['password'=>Hash::make($data['password'])]);
        }
        return $secretaire;
    }

    public function destroy(Secretaire $secretaire)
    {
        $secretaire->delete();
        return response()->json(null, 204);
    }

    public function patch(Request $request, Secretaire $secretaire)
    {
        $secretaire->update($request->only(['actif']));
        $secretaire->user?->update(['actif' => $request->actif]);
        return $secretaire;
    }
}