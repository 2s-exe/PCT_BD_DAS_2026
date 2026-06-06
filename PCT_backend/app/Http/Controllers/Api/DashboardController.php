<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivitePedagogique;
use App\Models\AnneeAcademique;
use App\Models\Departement;
use App\Models\Enseignant;
use App\Models\VolumeHoraire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        // ── KPIs ─────────────────────────────────────────────────────────────
        $enseignantsTotal  = Enseignant::count();
        $enseignantsActifs = Enseignant::where('actif', true)->count();

        $heuresTotal   = (float) VolumeHoraire::sum('heures_realisees');
        $heuresValides = (float) VolumeHoraire::whereHas(
            'validation', fn($q) => $q->where('statut_validation', 'valide')
        )->sum('heures_realisees');

        $volumesEnAttente = VolumeHoraire::whereDoesntHave('validation')->count();

        // ── Heures par département (BarChart) ─────────────────────────────────
        $parDepartement = Departement::leftJoin('enseignants', 'departements.id', '=', 'enseignants.departement_id')
            ->leftJoin('volumes_horaires', 'enseignants.id', '=', 'volumes_horaires.enseignant_id')
            ->groupBy('departements.id', 'departements.nom_departement')
            ->select(
                'departements.nom_departement as name',
                DB::raw('COALESCE(SUM(volumes_horaires.heures_realisees), 0) as h')
            )
            ->orderByDesc('h')
            ->get();

        // ── Évolution mensuelle sur 12 mois (LineChart) ───────────────────────
        $evolutionMensuelle = ActivitePedagogique::select(
            DB::raw('YEAR(date_activite) as year'),
            DB::raw('MONTH(date_activite) as month'),
            DB::raw('SUM(volume_horaire) as h')
        )
            ->where('date_activite', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get()
            ->map(fn($row) => [
                'm' => \Carbon\Carbon::create((int) $row->year, (int) $row->month)
                    ->locale('fr')->isoFormat('MMM'),
                'h' => (float) $row->h,
            ])
            ->values();

        // ── Activités récentes ────────────────────────────────────────────────
        $activitesRecentes = ActivitePedagogique::with([
            'attribution.enseignant',
            'attribution.cours',
        ])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'id'    => $a->id,
                'titre' => $a->attribution?->cours?->intitule_ecue ?? 'Activité',
                'who'   => $a->attribution?->enseignant?->nom_complet ?? '—',
                'date'  => $a->created_at->diffForHumans(),
                'tone'  => 'info',
            ]);

        return response()->json([
            'kpis' => [
                'enseignants'        => $enseignantsTotal,
                'enseignants_actifs' => $enseignantsActifs,
                'heures_total'       => $heuresTotal,
                'heures_validees'    => $heuresValides,
                'volumes_en_attente' => $volumesEnAttente,
            ],
            'par_departement'     => $parDepartement,
            'evolution_mensuelle' => $evolutionMensuelle,
            'activites_recentes'  => $activitesRecentes,
        ]);
    }

    public function enseignant(Request $request)
    {
        $enseignant = $request->user()->enseignant;
        if (!$enseignant) {
            return response()->json(['message' => 'Profil enseignant introuvable.'], 404);
        }

        $annee = AnneeAcademique::where('active', true)->first();
        $volumes = VolumeHoraire::with('validation')
            ->where('enseignant_id', $enseignant->id)
            ->when($annee, fn($q) => $q->where('annee_id', $annee->id))
            ->get();

        $heuresRealisees = (float) $volumes->sum('heures_realisees');
        $heuresPrevues = (float) $volumes->sum('heures_prevues');
        $heuresValidees = (float) $volumes
            ->filter(fn($v) => $v->validation?->statut_validation === 'valide')
            ->sum('heures_realisees');
        $heuresEnAttente = (float) $volumes
            ->filter(fn($v) => !$v->validation || $v->validation->statut_validation === 'en_attente')
            ->sum('heures_realisees');

        $activites = ActivitePedagogique::with(['attribution.cours', 'annee'])
            ->whereHas('attribution', fn($q) => $q->where('enseignant_id', $enseignant->id))
            ->when($annee, fn($q) => $q->where('annee_id', $annee->id))
            ->latest('date_activite')
            ->take(5)
            ->get();

        $parType = ActivitePedagogique::select('type_operation', DB::raw('SUM(volume_horaire) as h'))
            ->whereHas('attribution', fn($q) => $q->where('enseignant_id', $enseignant->id))
            ->when($annee, fn($q) => $q->where('annee_id', $annee->id))
            ->groupBy('type_operation')
            ->get()
            ->map(fn($row) => [
                'label' => $row->type_operation === 'creation' ? 'Créations' : 'Mises à jour',
                'heures' => (float) $row->h,
            ])
            ->values();

        return response()->json([
            'annee' => $annee?->libelle_annee,
            'kpis' => [
                'heures_realisees' => $heuresRealisees,
                'heures_validees' => $heuresValidees,
                'heures_en_attente' => $heuresEnAttente,
                'heures_prevues' => $heuresPrevues,
                'heures_complementaires' => max(0, $heuresRealisees - $heuresPrevues),
                'activites_en_attente' => $activites->filter(fn($a) => $this->statutActivite($a, $enseignant->id) === 'en_attente')->count(),
            ],
            'recentes' => $activites->map(fn($a) => [
                'id' => $a->id,
                'date' => $a->date_activite,
                'cours' => $a->attribution?->cours?->intitule_ecue ?? 'Cours',
                'type_operation' => $a->type_operation,
                'niveau_complexite' => $a->niveau_complexite,
                'volume_horaire' => (float) $a->volume_horaire,
                'statut_validation' => $this->statutActivite($a, $enseignant->id),
            ]),
            'par_type' => $parType,
        ]);
    }

    private function statutActivite(ActivitePedagogique $activite, int $enseignantId): string
    {
        $validation = VolumeHoraire::where('enseignant_id', $enseignantId)
            ->where('annee_id', $activite->annee_id)
            ->with('validation')
            ->first()
            ?->validation;

        return $validation?->statut_validation ?? 'en_attente';
    }
}
