<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivitePedagogique;
use App\Models\Departement;
use App\Models\Enseignant;
use App\Models\VolumeHoraire;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats()
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
}
