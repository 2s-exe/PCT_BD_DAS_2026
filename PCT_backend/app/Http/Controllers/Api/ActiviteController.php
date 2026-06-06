<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\ActivitePedagogique;
use App\Models\Attribution;
use App\Models\ParametreCalcul;
use App\Models\VolumeHoraire;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ActiviteController extends Controller
{
    #[OA\Get(path:"/activites",tags:["Activités"],summary:"Liste des activités pédagogiques",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id_enseignant",in:"query",required:false,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:200,description:"Liste")])]
    public function index(Request $request) {
        $q = ActivitePedagogique::with(['attribution.enseignant','attribution.cours','annee']);
        $user = $request->user();
        if ($user->role === 'enseignant') {
            $q->whereHas('attribution', fn($w) => $w->where('enseignant_id', $user->enseignant?->id));
        } elseif ($id = $request->id_enseignant) {
            $q->whereHas('attribution', fn($w) => $w->where('enseignant_id', $id));
        }
        $page = $q->latest()->paginate(50);
        $page->getCollection()->transform(function ($activite) {
            // Expose le champ statut sous le nom statut_validation attendu par le frontend
            $activite->setAttribute('statut_validation', $activite->statut ?? 'en_attente');
            return $activite;
        });
        return $page;
    }

    #[OA\Post(path:"/activites",tags:["Activités"],summary:"Déclarer une activité (calcul VHN automatique)",security:[["sanctum" => []]],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(required:["id_attribution","id_annee","type_operation","niveau_complexite","date_activite"],properties:[
            new OA\Property(property:"id_attribution",type:"integer"),
            new OA\Property(property:"id_annee",type:"integer"),
            new OA\Property(property:"type_operation",type:"string",enum:["creation","mise_a_jour"]),
            new OA\Property(property:"niveau_complexite",type:"string",enum:["simple","intermediaire","complexe"]),
            new OA\Property(property:"date_activite",type:"string",format:"date"),
            new OA\Property(property:"observations",type:"string"),
        ])),
        responses:[new OA\Response(response:201,description:"Activité créée avec volume_horaire calculé via paramètres VHN")]
    )]
    public function store(Request $request) {
        $data = $request->validate(['id_attribution'=>'required|exists:attributions,id','id_annee'=>'required|exists:annees_academiques,id','type_operation'=>'required|in:creation,mise_a_jour','niveau_complexite'=>'required|in:simple,intermediaire,complexe','date_activite'=>'required|date','observations'=>'nullable']);
        $p = ParametreCalcul::where('type_operation',$data['type_operation'])->where('niveau_complexite',$data['niveau_complexite'])->first();
        if (!$p) {
            return response()->json(['message' => 'Paramètre VHN introuvable pour ce type d\'opération et niveau de complexité.'], 422);
        }
        $volume = $p->coefficient_vhn;
        $activite = ActivitePedagogique::create(['type_operation'=>$data['type_operation'],'niveau_complexite'=>$data['niveau_complexite'],'date_activite'=>$data['date_activite'],'volume_horaire'=>$volume,'observations'=>$data['observations']??null,'attribution_id'=>$data['id_attribution'],'annee_id'=>$data['id_annee']]);
        $this->syncVolume($data['id_attribution'], $data['id_annee']);
        return response()->json($activite->load(['attribution.enseignant','attribution.cours','annee']),201);
    }

    #[OA\Put(path:"/activites/{id}",tags:["Activités"],summary:"Modifier une activité (en attente uniquement)",security:[["sanctum" => []]],
        parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],
        requestBody:new OA\RequestBody(required:true,content:new OA\JsonContent(required:["type_operation","niveau_complexite","date_activite"],properties:[
            new OA\Property(property:"type_operation",type:"string",enum:["creation","mise_a_jour"]),
            new OA\Property(property:"niveau_complexite",type:"string",enum:["simple","intermediaire","complexe"]),
            new OA\Property(property:"date_activite",type:"string",format:"date"),
            new OA\Property(property:"observations",type:"string"),
        ])),
        responses:[
            new OA\Response(response:200,description:"Activité modifiée"),
            new OA\Response(response:403,description:"Non autorisé ou déjà validée"),
        ]
    )]
    public function update(Request $request, ActivitePedagogique $activite)
    {
        $user = $request->user();

        // Seul l'enseignant propriétaire ou l'admin peut modifier
        if ($user->role === 'enseignant') {
            $enseignantId = $user->enseignant?->id;
            if ($activite->attribution?->enseignant_id !== $enseignantId) {
                return response()->json(['message' => 'Accès non autorisé.'], 403);
            }
        }

        // Bloquer si le volume associé est déjà validé
        $volumeValide = $activite->attribution?->enseignant
            ?->volumes()
            ->whereHas('validation', fn($q) => $q->where('statut_validation', 'valide'))
            ->where('annee_id', $activite->annee_id)
            ->exists();

        if ($volumeValide) {
            return response()->json(['message' => 'Cette activité appartient à un volume déjà validé et ne peut plus être modifiée.'], 403);
        }

        $data = $request->validate([
            'type_operation'    => 'required|in:creation,mise_a_jour',
            'niveau_complexite' => 'required|in:simple,intermediaire,complexe',
            'date_activite'     => 'required|date',
            'observations'      => 'nullable|string',
        ]);

        // Recalcul automatique du VHN
        $p = ParametreCalcul::where('type_operation', $data['type_operation'])
            ->where('niveau_complexite', $data['niveau_complexite'])
            ->first();

        if (!$p) {
            return response()->json(['message' => 'Paramètre VHN introuvable.'], 422);
        }

        $activite->update(array_merge($data, ['volume_horaire' => $p->coefficient_vhn]));
        $this->syncVolume($activite->attribution_id, $activite->annee_id);

        return response()->json($activite->load(['attribution.enseignant', 'attribution.cours', 'annee']));
    }

    public function validerStatut(Request $request, ActivitePedagogique $activite): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate([
            'statut'                  => 'required|in:en_attente,valide,rejete',
            'observations_secretaire' => 'nullable|string|max:1000',
        ]);

        $activite->update($data);
        $this->syncVolume($activite->attribution_id, $activite->annee_id);

        return response()->json($activite->load(['attribution.enseignant', 'attribution.cours', 'annee']));
    }

    #[OA\Get(path:"/activites/{id}",tags:["Activités"],summary:"Détail",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:200,description:"Activité")])]
    public function show(ActivitePedagogique $activite) { return $activite->load(['attribution.enseignant','attribution.cours','annee']); }

    #[OA\Delete(path:"/activites/{id}",tags:["Activités"],summary:"Supprimer",security:[["sanctum" => []]],parameters:[new OA\Parameter(name:"id",in:"path",required:true,schema:new OA\Schema(type:"integer"))],responses:[new OA\Response(response:204,description:"Supprimé")])]
    public function destroy(ActivitePedagogique $activite)
    {
        [$attribId, $anneeId] = [$activite->attribution_id, $activite->annee_id];
        $activite->delete();
        $this->syncVolume($attribId, $anneeId);
        return response()->json(null, 204);
    }

    private function syncVolume(int $attributionId, int $anneeId): void
    {
        $attribution = Attribution::find($attributionId);
        if (!$attribution) return;

        $enseignantId = $attribution->enseignant_id;

        // Somme des VHN non rejetés pour cet enseignant / cette année
        $heuresRealisees = ActivitePedagogique::whereHas(
            'attribution', fn($q) => $q->where('enseignant_id', $enseignantId)
        )->where('annee_id', $anneeId)->where('statut', '!=', 'rejete')->sum('volume_horaire');

        // Charge prévue = somme des charges de toutes ses attributions sur cette année
        $heuresPrevues = Attribution::where('enseignant_id', $enseignantId)
            ->where('annee_id', $anneeId)
            ->sum('charge_horaire');

        VolumeHoraire::updateOrCreate(
            ['enseignant_id' => $enseignantId, 'annee_id' => $anneeId],
            [
                'heures_realisees' => $heuresRealisees,
                'heures_prevues'   => $heuresPrevues,
            ]
        );
    }
}
