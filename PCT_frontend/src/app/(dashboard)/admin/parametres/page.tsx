"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ParametreCalcul } from "@/types";

export default function AdminParametres() {
  const { data, isLoading } = useQuery({
    queryKey: ["parametres"],
    queryFn: () => api.get<ParametreCalcul[]>("/parametres").then(r => r.data),
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Paramètres de calcul"
        description="Coefficients VHN par type d'opération et niveau de complexité"
        actions={
          <Button className="bg-gradient-primary text-white hover:opacity-95">
            <Plus className="h-4 w-4 mr-2" />Nouveau paramètre
          </Button>
        }
      />
      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Type d'opération</TableHead>
                <TableHead>Niveau de complexité</TableHead>
                <TableHead>Coefficient VHN</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Badge className={p.type_operation === "creation" ? "bg-blue-50 text-blue-700 border-0" : "bg-purple-50 text-purple-700 border-0"}>
                      {p.type_operation === "creation" ? "Création" : "Mise à jour"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize">{p.niveau_complexite}</TableCell>
                  <TableCell className="text-sm font-semibold text-primary">{p.coefficient_vhn}h</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.description ?? "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
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
