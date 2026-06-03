<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Enseignant;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ExportController extends Controller
{
    #[OA\Get(path:"/exports/pdf",tags:["Exports"],summary:"Export état global des heures (CSV)",security:[["sanctum" => []]],responses:[new OA\Response(response:200,description:"Fichier CSV téléchargeable")])]
    public function pdf(Request $request) {
        $enseignants = Enseignant::with(['departement','volumes.validation'])->get();
        $csv = "Nom,Departement,Heures prevues,Heures realisees,Complementaires,Statut\n";
        foreach ($enseignants as $e) {
            $v = $e->volumes->first();
            $csv .= "\"{$e->nom_complet}\",\"{$e->departement?->nom_departement}\",".($v?->heures_prevues??0).",".($v?->heures_realisees??0).",".($v?->heures_complementaires??0).",".($v?->validation?->statut_validation??'en_attente')."\n";
        }
        return response($csv,200,['Content-Type'=>'text/csv','Content-Disposition'=>'attachment; filename="rapport.csv"']);
    }

    #[OA\Get(path:"/exports/excel",tags:["Exports"],summary:"Export Excel pour comptabilité (CSV)",security:[["sanctum" => []]],responses:[new OA\Response(response:200,description:"Fichier CSV pour comptabilité")])]
    public function excel(Request $request) { return $this->pdf($request); }
}