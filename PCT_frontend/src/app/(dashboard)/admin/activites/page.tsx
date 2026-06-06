"use client";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { PaginatedResponse, ActivitePedagogique } from "@/types";

export default function AdminActivites() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["activites"],
    queryFn: () => api.get<PaginatedResponse<ActivitePedagogique>>("/activites").then(r => r.data),
  });

  const rows = (data?.data ?? []).filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.attribution?.enseignant?.nom_complet?.toLowerCase().includes(q) ||
      a.attribution?.cours?.intitule_ecue?.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Activités pédagogiques"
        description="Toutes les déclarations d'activités soumises"
        actions={
          <Button
            variant="outline"
            onClick={() => downloadExport("/exports/activites", "activites").catch(e => toast.error(getErrorMessage(e)))}
          >
            <Download className="h-4 w-4 mr-2" />Exporter
          </Button>
        }
      />

      <Card className="p-3 md:p-4 mb-4 shadow-soft">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Rechercher par enseignant, cours…"
            className="max-w-xs min-w-[160px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="ml-auto text-xs text-muted-foreground">
            {rows.length} activité{rows.length !== 1 ? "s" : ""}
          </div>
        </div>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Date</TableHead>
                  <TableHead>Enseignant</TableHead>
                  <TableHead className="hidden md:table-cell">Cours</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Complexité</TableHead>
                  <TableHead>Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm whitespace-nowrap">{a.date_activite}</TableCell>
                    <TableCell className="text-sm font-medium">
                      <div>{a.attribution?.enseignant?.nom_complet}</div>
                      <div className="md:hidden text-xs text-muted-foreground mt-0.5">
                        {a.attribution?.cours?.intitule_ecue}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {a.attribution?.cours?.intitule_ecue}
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
                    <TableCell className="text-sm capitalize hidden lg:table-cell">
                      {a.niveau_complexite}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-primary">
                      {a.volume_horaire}h
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune activité
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
