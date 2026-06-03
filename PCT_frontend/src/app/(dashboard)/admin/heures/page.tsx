"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Clock, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedResponse, VolumeHoraire } from "@/types";

export default function AdminHeures() {
  const { data, isLoading } = useQuery({
    queryKey: ["volumes"],
    queryFn: () => api.get<PaginatedResponse<VolumeHoraire>>("/volumes").then(r => r.data),
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Suivi des heures"
        description="Volumes horaires réalisés et validation par enseignant"
        actions={
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exporter Excel</span>
            <span className="sm:hidden">Exporter</span>
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
        <StatCard label="Total réalisé"   value="84 560 h" icon={Clock}         tone="primary" />
        <StatCard label="Validé"          value="72 120 h" icon={CheckCircle2}  tone="success" />
        <StatCard label="Complémentaires" value="12 440 h" icon={AlertTriangle} tone="warning" />
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
                  <TableHead className="hidden md:table-cell">Département</TableHead>
                  <TableHead className="hidden sm:table-cell">Prévues</TableHead>
                  <TableHead>Réalisées</TableHead>
                  <TableHead className="hidden sm:table-cell">Complémentaires</TableHead>
                  <TableHead>Validation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{v.enseignant?.nom_complet}</div>
                      <div className="md:hidden text-xs text-muted-foreground">
                        {v.enseignant?.departement?.nom_departement}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {v.enseignant?.departement?.nom_departement}
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{v.heures_prevues}h</TableCell>
                    <TableCell className="text-sm font-medium">{v.heures_realisees}h</TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">
                      {v.heures_complementaires > 0
                        ? <span className="text-amber-600 font-medium">+{v.heures_complementaires}h</span>
                        : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {!v.validation && (
                        <Badge className="bg-amber-50 text-amber-700 border-0 whitespace-nowrap">En attente</Badge>
                      )}
                      {v.validation?.statut_validation === "valide" && (
                        <Badge className="bg-green-50 text-green-700 border-0">Validé</Badge>
                      )}
                      {v.validation?.statut_validation === "rejete" && (
                        <Badge className="bg-red-50 text-red-700 border-0">Rejeté</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucun volume trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
