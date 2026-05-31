"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedResponse, Enseignant } from "@/types";

export default function SecretaireEnseignants() {
  const { data, isLoading } = useQuery({
    queryKey: ["enseignants"],
    queryFn: () => api.get<PaginatedResponse<Enseignant>>("/enseignants").then(r => r.data),
  });

  return (
    <AppShell role="secretaire">
      <PageHeader title="Enseignants" description="Consultation des profils et volumes horaires" />
      <Card className="p-4 mb-4 shadow-soft">
        <Input placeholder="Rechercher un enseignant…" className="max-w-xs" />
      </Card>
      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Enseignant</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Département</TableHead>
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
                  <TableCell>
                    {t.actif
                      ? <Badge className="bg-green-50 text-green-700 border-0">Actif</Badge>
                      : <Badge variant="outline">Inactif</Badge>}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
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
