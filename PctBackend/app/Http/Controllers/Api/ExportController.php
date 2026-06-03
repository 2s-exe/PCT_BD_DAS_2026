<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Enseignant;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function pdf(Request $request)
    {
        $enseignants = Enseignant::with(['departement','volumes.validation'])->get();
        $csv = "Nom,Departement,Heures prevues,Heures realisees,Complementaires,Statut\n";
        foreach ($enseignants as $e) {
            $v = $e->volumes->first();
            $csv .= "\"{$e->nom_complet}\",\"{$e->departement?->nom_departement}\",".
                ($v?->heures_prevues??0).",".($v?->heures_realisees??0).",".($v?->heures_complementaires??0).",".
                ($v?->validation?->statut_validation??'en_attente')."\n";
        }
        return response($csv, 200, ['Content-Type'=>'text/csv','Content-Disposition'=>'attachment; filename="rapport.csv"']);
    }

    public function excel(Request $request)
    {
        return $this->pdf($request);
    }
}