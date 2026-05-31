// ============================================================
// src/app/(dashboard)/admin/enseignants/page.tsx
// ============================================================
"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Filter, MoreHorizontal, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedResponse, Enseignant } from "@/types";

export default function AdminEnseignants() {
  const { data, isLoading } = useQuery({
    queryKey: ["enseignants"],
    queryFn: () => api.get<PaginatedResponse<Enseignant>>("/enseignants").then(r => r.data),
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Enseignants"
        description="Gestion centralisée des profils et taux horaires"
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exporter</Button>
            <Button className="bg-gradient-primary text-white hover:opacity-95">
              <Plus className="h-4 w-4 mr-2" />Nouvel enseignant
            </Button>
          </>
        }
      />

      <Card className="p-4 mb-4 shadow-soft">
        <div className="flex flex-wrap gap-3 items-center">
          <Input placeholder="Rechercher par nom, département…" className="max-w-xs" />
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Département</Button>
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Grade</Button>
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Statut</Button>
          {data && <div className="ml-auto text-xs text-muted-foreground">{data.total} résultats</div>}
        </div>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Chargement…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Enseignant</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Taux horaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary-soft text-primary text-xs">
                          {t.nom[0]}{t.prenom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{t.nom_complet}</div>
                        <div className="text-xs text-muted-foreground">{t.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{t.grade}</TableCell>
                  <TableCell className="text-sm">{t.departement?.nom_departement}</TableCell>
                  <TableCell className="text-sm font-medium">{t.taux_horaire.toLocaleString()} FCFA/h</TableCell>
                  <TableCell>
                    {t.actif ? (
                      <Badge className="bg-green-50 text-green-700 border-0">Actif</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {!data?.data.length && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucun enseignant trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </AppShell>
  );
}
