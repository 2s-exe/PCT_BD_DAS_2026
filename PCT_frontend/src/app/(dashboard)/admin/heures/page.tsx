"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exporter Excel</Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatCard label="Total réalisé"  value="84 560 h" icon={Clock}        tone="primary" />
        <StatCard label="Validé"         value="72 120 h" icon={CheckCircle2} tone="success" />
        <StatCard label="Complémentaires" value="12 440 h" icon={AlertTriangle} tone="warning" />
      </div>
      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Enseignant</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Heures prévues</TableHead>
                <TableHead>Heures réalisées</TableHead>
                <TableHead>Complémentaires</TableHead>
                <TableHead>Validation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium text-sm">{v.enseignant?.nom_complet}</TableCell>
                  <TableCell className="text-sm">{v.enseignant?.departement?.nom_departement}</TableCell>
                  <TableCell className="text-sm">{v.heures_prevues}h</TableCell>
                  <TableCell className="text-sm font-medium">{v.heures_realisees}h</TableCell>
                  <TableCell className="text-sm">
                    {v.heures_complementaires > 0
                      ? <span className="text-amber-600 font-medium">+{v.heures_complementaires}h</span>
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {!v.validation && <Badge className="bg-amber-50 text-amber-700 border-0">En attente</Badge>}
                    {v.validation?.statut_validation === "valide" && <Badge className="bg-green-50 text-green-700 border-0">Validé</Badge>}
                    {v.validation?.statut_validation === "rejete" && <Badge className="bg-red-50 text-red-700 border-0">Rejeté</Badge>}
                  </TableCell>
                </TableRow>
              ))}
              {!data?.data.length && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucun volume trouvé</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </AppShell>
  );
}
