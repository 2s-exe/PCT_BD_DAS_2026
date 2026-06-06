<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivitePedagogique;
use App\Models\VolumeHoraire;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user  = $request->user();
        $items = [];

        if ($user->role === 'enseignant') {
            $enseignant = $user->enseignant;
            if ($enseignant) {
                $activites = ActivitePedagogique::whereHas(
                        'attribution', fn($q) => $q->where('enseignant_id', $enseignant->id)
                    )
                    ->whereIn('statut', ['valide', 'rejete'])
                    ->with('attribution.cours')
                    ->latest('updated_at')
                    ->take(10)
                    ->get();

                foreach ($activites as $a) {
                    $items[] = [
                        'id'    => "activite-{$a->id}",
                        'title' => $a->statut === 'valide' ? 'Activité validée' : 'Activité rejetée',
                        'body'  => $a->attribution?->cours?->intitule_ecue ?? 'Activité pédagogique',
                        'date'  => $a->updated_at->diffForHumans(),
                        'type'  => $a->statut === 'valide' ? 'success' : 'error',
                        'href'  => '/enseignant/historique',
                    ];
                }
            }
        } elseif ($user->role === 'secretaire') {
            // Activités globalement en attente
            $total = ActivitePedagogique::where('statut', 'en_attente')->count();
            if ($total > 0) {
                $items[] = [
                    'id'    => 'attente-total',
                    'title' => 'Activités en attente',
                    'body'  => "{$total} activité" . ($total > 1 ? 's' : '') . ' à valider',
                    'date'  => 'Maintenant',
                    'type'  => 'warning',
                    'href'  => '/secretaire/validation',
                ];
            }

            // Nouvelles soumissions des 7 derniers jours
            $recentes = ActivitePedagogique::where('statut', 'en_attente')
                ->where('created_at', '>=', now()->subDays(7))
                ->with('attribution.enseignant', 'attribution.cours')
                ->latest()
                ->take(5)
                ->get();

            foreach ($recentes as $a) {
                $nom   = $a->attribution?->enseignant?->nom_complet ?? '—';
                $cours = $a->attribution?->cours?->intitule_ecue ?? '';
                $items[] = [
                    'id'    => "new-{$a->id}",
                    'title' => 'Nouvelle déclaration',
                    'body'  => "{$nom} · {$cours}",
                    'date'  => $a->created_at->diffForHumans(),
                    'type'  => 'info',
                    'href'  => '/secretaire/validation',
                ];
            }
        } elseif ($user->role === 'admin') {
            // Activités en attente toutes confondues
            $actEnAttente = ActivitePedagogique::where('statut', 'en_attente')->count();
            if ($actEnAttente > 0) {
                $items[] = [
                    'id'    => 'admin-activites-attente',
                    'title' => 'Activités en attente',
                    'body'  => "{$actEnAttente} activité" . ($actEnAttente > 1 ? 's' : '') . ' non encore traitée' . ($actEnAttente > 1 ? 's' : ''),
                    'date'  => 'Maintenant',
                    'type'  => 'warning',
                    'href'  => '/admin/activites',
                ];
            }

            // Nouvelles déclarations de la semaine
            $recentCount = ActivitePedagogique::where('created_at', '>=', now()->subDays(7))->count();
            if ($recentCount > 0) {
                $items[] = [
                    'id'    => 'admin-recentes',
                    'title' => 'Nouvelles déclarations',
                    'body'  => "{$recentCount} activité" . ($recentCount > 1 ? 's' : '') . ' déclarée' . ($recentCount > 1 ? 's' : '') . ' cette semaine',
                    'date'  => 'Cette semaine',
                    'type'  => 'info',
                    'href'  => '/admin/activites',
                ];
            }
        }

        return response()->json([
            'count' => count($items),
            'items' => $items,
        ]);
    }
}
