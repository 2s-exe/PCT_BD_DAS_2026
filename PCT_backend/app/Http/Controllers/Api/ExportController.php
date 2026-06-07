<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivitePedagogique;
use App\Models\Cours;
use App\Models\Enseignant;
use App\Models\Secretaire;
use App\Models\VolumeHoraire;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ExportController extends Controller
{
    private function csvCell(string $val): string
    {
        if (preg_match('/^[=+\-@\t]/', $val)) {
            $val = "'" . $val;
        }
        return '"' . str_replace('"', '""', $val) . '"';
    }

    #[OA\Get(path:"/exports/pdf",tags:["Exports"],summary:"Export état global des heures (CSV)",security:[["sanctum" => []]],responses:[new OA\Response(response:200,description:"Fichier CSV téléchargeable")])]
    public function pdf(Request $request)
    {
        $enseignants = Enseignant::with(['departement','volumes.validation'])
            ->when($request->user()->role === 'enseignant', function ($q) use ($request) {
                $q->whereKey($request->user()->enseignant?->id);
            })
            ->get();

        $csv = "Nom,Departement,Heures prevues,Heures realisees,Complementaires,Statut\n";
        foreach ($enseignants as $e) {
            $v = $e->volumes->first();
            $csv .= implode(',', [
                $this->csvCell($e->nom_complet),
                $this->csvCell($e->departement?->nom_departement ?? ''),
                $v?->heures_prevues ?? 0,
                $v?->heures_realisees ?? 0,
                $v?->heures_complementaires ?? 0,
                $this->csvCell($v?->validation?->statut_validation ?? 'en_attente'),
            ]) . "\n";
        }

        return $this->csvResponse('rapport.csv', $csv);
    }

    #[OA\Get(path:"/exports/excel",tags:["Exports"],summary:"Export Excel pour comptabilité (CSV)",security:[["sanctum" => []]],responses:[new OA\Response(response:200,description:"Fichier CSV pour comptabilité")])]
    public function excel(Request $request)
    {
        return $this->pdf($request);
    }

    public function resource(Request $request, string $type)
    {
        $user = $request->user();

        return match ($type) {
            'enseignants' => $this->csvResponse('enseignants.csv', $this->enseignantsCsv()),
            'secretaires' => $user->role === 'admin'
                ? $this->csvResponse('secretaires.csv', $this->secretairesCsv())
                : response()->json(['message' => 'Non autorisé.'], 403),
            'cours' => $this->csvResponse('cours.csv', $this->coursCsv()),
            'activites' => $this->csvResponse('activites.csv', $this->activitesCsv($request)),
            'volumes' => $this->csvResponse('volumes.csv', $this->volumesCsv($request)),
            default => response()->json(['message' => 'Export introuvable.'], 404),
        };
    }

    private function csvResponse(string $filename, string $csv)
    {
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function enseignantsCsv(): string
    {
        $csv = "Nom,Email,Telephone,Grade,Statut,Departement,Actif\n";
        foreach (Enseignant::with('departement')->orderBy('nom')->get() as $e) {
            $csv .= implode(',', [
                $this->csvCell($e->nom_complet),
                $this->csvCell($e->email),
                $this->csvCell($e->telephone ?? ''),
                $this->csvCell($e->grade),
                $this->csvCell($e->statut),
                $this->csvCell($e->departement?->nom_departement ?? ''),
                $this->csvCell($e->actif ? 'Actif' : 'Inactif'),
            ]) . "\n";
        }
        return $csv;
    }

    private function secretairesCsv(): string
    {
        $csv = "Nom,Email,Telephone,Login,Actif\n";
        foreach (Secretaire::with('user')->orderBy('nom')->get() as $s) {
            $csv .= implode(',', [
                $this->csvCell($s->nom_complet),
                $this->csvCell($s->email),
                $this->csvCell($s->telephone ?? ''),
                $this->csvCell($s->user?->login ?? ''),
                $this->csvCell($s->actif ? 'Actif' : 'Inactif'),
            ]) . "\n";
        }
        return $csv;
    }

    private function coursCsv(): string
    {
        $csv = "Intitule,Niveau,Semestre,Credit,Charge horaire,Specialite\n";
        foreach (Cours::orderBy('intitule_ecue')->get() as $c) {
            $csv .= implode(',', [
                $this->csvCell($c->intitule_ecue),
                $this->csvCell($c->niveau),
                $this->csvCell($c->semestre),
                $c->credit_ecue,
                $c->charge_horaire_annuel,
                $this->csvCell($c->code_specialite ?? ''),
            ]) . "\n";
        }
        return $csv;
    }

    private function activitesCsv(Request $request): string
    {
        $csv = "Date,Enseignant,Cours,Type,Complexite,Volume,Annee,Observations\n";
        $query = ActivitePedagogique::with(['attribution.enseignant', 'attribution.cours', 'annee'])
            ->when($request->user()->role === 'enseignant', function ($q) use ($request) {
                $q->whereHas('attribution', fn($w) => $w->where('enseignant_id', $request->user()->enseignant?->id));
            })
            ->latest('date_activite');

        foreach ($query->get() as $a) {
            $csv .= implode(',', [
                $this->csvCell($a->date_activite),
                $this->csvCell($a->attribution?->enseignant?->nom_complet ?? ''),
                $this->csvCell($a->attribution?->cours?->intitule_ecue ?? ''),
                $this->csvCell($a->type_operation),
                $this->csvCell($a->niveau_complexite),
                $a->volume_horaire,
                $this->csvCell($a->annee?->libelle_annee ?? ''),
                $this->csvCell($a->observations ?? ''),
            ]) . "\n";
        }
        return $csv;
    }

    private function volumesCsv(Request $request): string
    {
        $csv = "Enseignant,Departement,Annee,Heures prevues,Heures realisees,Complementaires,Validation\n";
        $query = VolumeHoraire::with(['enseignant.departement', 'annee', 'validation'])
            ->when($request->user()->role === 'enseignant', function ($q) use ($request) {
                $q->where('enseignant_id', $request->user()->enseignant?->id);
            });

        foreach ($query->get() as $v) {
            $csv .= implode(',', [
                $this->csvCell($v->enseignant?->nom_complet ?? ''),
                $this->csvCell($v->enseignant?->departement?->nom_departement ?? ''),
                $this->csvCell($v->annee?->libelle_annee ?? ''),
                $v->heures_prevues,
                $v->heures_realisees,
                $v->heures_complementaires,
                $this->csvCell($v->validation?->statut_validation ?? 'en_attente'),
            ]) . "\n";
        }
        return $csv;
    }
}
