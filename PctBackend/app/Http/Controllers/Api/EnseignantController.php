<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Enseignant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EnseignantController extends Controller
{
    public function index(Request $request)
    {
        $q = Enseignant::with('departement');
        if ($s = $request->search) {
            $q->where(fn($w) => $w->where('nom','like',"%$s%")->orWhere('prenom','like',"%$s%")->orWhere('email','like',"%$s%"));
        }
        return $q->paginate(20);
    }

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
        return response()->json($enseignant->load('departement'), 201);
    }

    public function show(Enseignant $enseignant)
    {
        return $enseignant->load('departement');
    }

    public function update(Request $request, Enseignant $enseignant)
    {
        $data = $request->validate([
            'nom'=>'sometimes|required','prenom'=>'sometimes|required',
            'email'=>'sometimes|required|email|unique:enseignants,email,'.$enseignant->id,
            'telephone'=>'nullable','grade'=>'sometimes|in:Assistant,Maitre-Assistant,Professeur',
            'statut'=>'sometimes|in:Permanent,Vacataire','taux_horaire'=>'sometimes|numeric|min:0',
            'departement_id'=>'nullable|exists:departements,id',
            'login'=>'nullable|string','password'=>'nullable|min:6',
        ]);
        $enseignant->update($data);
        if (!empty($data['password'])) {
            $enseignant->user?->update(['password'=>Hash::make($data['password'])]);
        }
        return $enseignant->load('departement');
    }

    public function destroy(Enseignant $enseignant)
    {
        $enseignant->delete();
        return response()->json(null, 204);
    }

    public function patch(Request $request, Enseignant $enseignant)
    {
        $enseignant->update($request->only(['actif']));
        return $enseignant->load('departement');
    }
}