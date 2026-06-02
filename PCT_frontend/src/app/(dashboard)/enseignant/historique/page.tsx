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
import type { PaginatedResponse, ActivitePedagogique } from "@/types";
import { useAuthStore } from "@/store/authStore";

export default function EnseignantHistorique() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["mes-activites", user?.enseignant?.id],
    queryFn: () => api.get<PaginatedResponse<ActivitePedagogique>>(
      `/activites?id_enseignant=${user?.enseignant?.id}`
    ).then(r => r.data),
    enabled: !!user?.enseignant?.id,
  });

  return (
    <AppShell role="enseignant">
      <PageHeader
        title="Mes activités"
        description="Historique complet de vos déclarations pédagogiques"
        actions={
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Télécharger récapitulatif</span>
            <span className="sm:hidden">Télécharger</span>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Complexité</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm whitespace-nowrap">{a.date_activite}</TableCell>
                    <TableCell className="text-sm font-medium">
                      <div>{a.attribution?.cours?.intitule_ecue}</div>
                      <div className="sm:hidden mt-0.5">
                        <Badge className={
                          a.type_operation === "creation"
                            ? "bg-blue-50 text-blue-700 border-0 text-xs"
                            : "bg-purple-50 text-purple-700 border-0 text-xs"
                        }>
                          {a.type_operation === "creation" ? "Création" : "Mise à jour"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={
                        a.type_operation === "creation"
                          ? "bg-blue-50 text-blue-700 border-0"
                          : "bg-purple-50 text-purple-700 border-0"
                      }>
                        {a.type_operation === "creation" ? "Création" : "Mise à jour"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm capitalize hidden md:table-cell">
                      {a.niveau_complexite}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-primary">
                      {a.volume_horaire}h
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-50 text-amber-700 border-0 whitespace-nowrap">
                        En attente
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune activité déclarée
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
