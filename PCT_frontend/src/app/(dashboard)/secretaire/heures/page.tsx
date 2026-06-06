"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { downloadExport } from "@/lib/download";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
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
        actions={
          <Button
            variant="outline"
            onClick={() => downloadExport("/exports/volumes", "suivi_heures_secretaire").catch(e => toast.error(getErrorMessage(e)))}
          >
            <Download className="h-4 w-4 mr-2" />Exporter
          </Button>
        }
      />
      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Enseignant</TableHead>
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
                      <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
                        Prévues : {v.heures_prevues}h
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{v.heures_prevues}h</TableCell>
                    <TableCell className="text-sm font-medium">{v.heures_realisees}h</TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">
                      {v.heures_complementaires > 0
                        ? <span className="text-amber-600 font-medium">+{v.heures_complementaires}h</span>
                        : "—"}
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
