"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedResponse, VolumeHoraire } from "@/types";

export default function SecretaireHeures() {
  const { data, isLoading } = useQuery({
    queryKey: ["volumes-secretaire"],
    queryFn: () => api.get<PaginatedResponse<VolumeHoraire>>("/volumes").then(r => r.data),
  });

  return (
    <AppShell role="secretaire">
      <PageHeader
        title="Suivi des heures"
        description="Vue consolidée des volumes horaires par enseignant"
        actions={<Button variant="outline"><Download className="h-4 w-4 mr-2" />Exporter</Button>}
      />
      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Enseignant</TableHead>
                <TableHead>Prévues</TableHead>
                <TableHead>Réalisées</TableHead>
                <TableHead>Complémentaires</TableHead>
                <TableHead>Validation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium text-sm">{v.enseignant?.nom_complet}</TableCell>
                  <TableCell className="text-sm">{v.heures_prevues}h</TableCell>
                  <TableCell className="text-sm font-medium">{v.heures_realisees}h</TableCell>
                  <TableCell className="text-sm">
                    {v.heures_complementaires > 0
                      ? <span className="text-amber-600 font-medium">+{v.heures_complementaires}h</span>
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {!v.validation && <Badge className="bg-amber-50 text-amber-700 border-0">En attente</Badge>}
                    {v.validation?.statut_validation === "valide" && <Badge className="bg-green-50 text-green-700 border-0">Validé</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </AppShell>
  );
}
