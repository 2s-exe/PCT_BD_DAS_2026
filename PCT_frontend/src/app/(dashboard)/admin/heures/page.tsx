"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Clock, CheckCircle2, AlertTriangle, Download, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { downloadExport } from "@/lib/download";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import type { PaginatedResponse, VolumeHoraire } from "@/types";

const HEURES_PAR_GRADE: Record<string, number> = {
  "Assistant":             240,
  "Maitre-Assistant":      240,
  "Enseignant-Chercheur":  360,
  "Maitre-de-Conferences": 150,
  "Professeur-Titulaire":  150,
};

const GRADE_LABEL: Record<string, string> = {
  "Assistant":             "Assistant",
  "Maitre-Assistant":      "Maître-Assistant",
  "Enseignant-Chercheur":  "Ens. Chercheur",
  "Maitre-de-Conferences": "Maître de Conf.",
  "Professeur-Titulaire":  "Pr. Titulaire",
  "Professeur":            "Professeur",
};

function fmt(n: unknown) {
  const num = Number(n) || 0;
  return num >= 1000 ? `${(num / 1000).toFixed(1)} k` : num.toFixed(2).replace(/\.00$/, "");
}

function getQuota(grade?: string): number {
  return grade ? (HEURES_PAR_GRADE[grade] ?? 240) : 240;
}

export default function AdminHeures() {
  const { data, isLoading } = useQuery({
    queryKey: ["volumes"],
    queryFn: () => api.get<PaginatedResponse<VolumeHoraire>>("/volumes?per_page=1000").then(r => r.data),
  });

  const rows = data?.data ?? [];

  const totalRealise  = rows.reduce((s, v) => s + (Number(v.heures_realisees) || 0), 0);
  const totalValide   = rows.filter(v => v.validation?.statut_validation === "valide")
                            .reduce((s, v) => s + (Number(v.heures_realisees) || 0), 0);
  const totalSupp     = rows.reduce((s, v) => {
    const quota    = getQuota(v.enseignant?.grade);
    const realise  = Number(v.heures_realisees) || 0;
    return s + Math.max(0, realise - quota);
  }, 0);
  const nbDepasse = rows.filter(v => {
    const quota = getQuota(v.enseignant?.grade);
    return (Number(v.heures_realisees) || 0) > quota;
  }).length;

  return (
    <AppShell role="admin">
      <PageHeader
        title="Suivi des heures"
        description="Volumes horaires réalisés par grade et validation"
        actions={
          <Button
            variant="outline"
            onClick={() => downloadExport("/exports/volumes", "volumes_horaires").catch(e => toast.error(getErrorMessage(e)))}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exporter Excel</span>
            <span className="sm:hidden">Exporter</span>
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total réalisé"    value={isLoading ? "…" : `${fmt(totalRealise)} h`}  icon={Clock}        tone="primary" />
        <StatCard label="Validé"           value={isLoading ? "…" : `${fmt(totalValide)} h`}   icon={CheckCircle2} tone="success" />
        <StatCard label="Heures suppl."    value={isLoading ? "…" : `${fmt(totalSupp)} h`}     icon={TrendingUp}   tone="warning" />
        <StatCard label="Au-delà du quota" value={isLoading ? "…" : `${nbDepasse} ens.`}       icon={AlertTriangle} tone="danger" />
      </div>

      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Enseignant</TableHead>
                  <TableHead className="hidden md:table-cell">Grade</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Quota</TableHead>
                  <TableHead className="text-right">Réalisées</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">Suppl.</TableHead>
                  <TableHead className="hidden lg:table-cell">Avancement</TableHead>
                  <TableHead>Validation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((v) => {
                  const quota    = getQuota(v.enseignant?.grade);
                  const realise  = Number(v.heures_realisees) || 0;
                  const supp     = Math.max(0, realise - quota);
                  const pct      = Math.min(100, Math.round((realise / quota) * 100));
                  const manque   = Math.max(0, quota - realise);
                  const depasse  = realise > quota;
                  const atteint  = realise >= quota;

                  return (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{v.enseignant?.nom_complet}</div>
                        <div className="text-xs text-muted-foreground">
                          {v.enseignant?.departement?.nom_departement}
                        </div>
                        <div className="md:hidden text-xs text-muted-foreground mt-0.5">
                          {GRADE_LABEL[v.enseignant?.grade ?? ""] ?? v.enseignant?.grade}
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                          {GRADE_LABEL[v.enseignant?.grade ?? ""] ?? v.enseignant?.grade}
                        </span>
                      </TableCell>

                      <TableCell className="text-right hidden sm:table-cell text-sm text-muted-foreground">
                        {quota}h
                      </TableCell>

                      <TableCell className="text-right text-sm font-semibold">
                        <span className={depasse ? "text-amber-600" : atteint ? "text-green-600" : ""}>
                          {realise}h
                        </span>
                      </TableCell>

                      <TableCell className="text-right hidden sm:table-cell text-sm">
                        {depasse ? (
                          <span className="text-amber-600 font-medium">+{supp}h</span>
                        ) : manque > 0 ? (
                          <span className="text-muted-foreground">−{manque}h</span>
                        ) : (
                          <span className="text-green-600">✓</span>
                        )}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell w-36">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={pct}
                            className={`h-1.5 flex-1 ${depasse ? "[&>div]:bg-amber-500" : atteint ? "[&>div]:bg-green-500" : ""}`}
                          />
                          <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {!v.validation && (
                          <Badge className="bg-amber-50 text-amber-700 border-0 whitespace-nowrap text-xs">En attente</Badge>
                        )}
                        {v.validation?.statut_validation === "valide" && (
                          <Badge className="bg-green-50 text-green-700 border-0 text-xs">Validé</Badge>
                        )}
                        {v.validation?.statut_validation === "rejete" && (
                          <Badge className="bg-red-50 text-red-700 border-0 text-xs">Rejeté</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!rows.length && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucun volume horaire trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Légende */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Quota atteint</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Heures supplémentaires</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block" />Quota non atteint</div>
        <div className="ml-auto">Quotas : Assistant / M.-Assistant 240h · Ens. Chercheur 360h · Maître de Conf. / Pr. Titulaire 150h</div>
      </div>
    </AppShell>
  );
}
