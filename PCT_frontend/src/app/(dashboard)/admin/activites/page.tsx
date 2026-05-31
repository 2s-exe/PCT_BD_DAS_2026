"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedResponse, ActivitePedagogique } from "@/types";

export default function AdminActivites() {
  const { data, isLoading } = useQuery({
    queryKey: ["activites"],
    queryFn: () => api.get<PaginatedResponse<ActivitePedagogique>>("/activites").then(r => r.data),
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Activités pédagogiques"
        description="Toutes les déclarations d'activités soumises"
        actions={<Button variant="outline"><Download className="h-4 w-4 mr-2" />Exporter</Button>}
      />
      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Date</TableHead>
                <TableHead>Enseignant</TableHead>
                <TableHead>Cours</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Complexité</TableHead>
                <TableHead>Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-sm">{a.date_activite}</TableCell>
                  <TableCell className="text-sm font-medium">{a.attribution?.enseignant?.nom_complet}</TableCell>
                  <TableCell className="text-sm">{a.attribution?.cours?.intitule_ecue}</TableCell>
                  <TableCell>
                    <Badge className={a.type_operation === "creation" ? "bg-blue-50 text-blue-700 border-0" : "bg-purple-50 text-purple-700 border-0"}>
                      {a.type_operation === "creation" ? "Création" : "Mise à jour"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize">{a.niveau_complexite}</TableCell>
                  <TableCell className="text-sm font-semibold text-primary">{a.volume_horaire}h</TableCell>
                </TableRow>
              ))}
              {!data?.data.length && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Aucune activité</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </AppShell>
  );
}
