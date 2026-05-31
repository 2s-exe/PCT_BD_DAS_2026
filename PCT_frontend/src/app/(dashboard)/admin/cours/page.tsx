"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Filter, MoreHorizontal, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedResponse, Cours } from "@/types";

const NIVEAU_COLORS: Record<string, string> = {
  L1: "bg-blue-50 text-blue-700", L2: "bg-blue-50 text-blue-700", L3: "bg-blue-50 text-blue-700",
  M1: "bg-purple-50 text-purple-700", M2: "bg-purple-50 text-purple-700",
};

export default function AdminCours() {
  const { data, isLoading } = useQuery({
    queryKey: ["cours"],
    queryFn: () => api.get<PaginatedResponse<Cours>>("/cours").then(r => r.data),
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Cours & Filières"
        description="Catalogue des enseignements"
        actions={
          <Button className="bg-gradient-primary text-white hover:opacity-95">
            <Plus className="h-4 w-4 mr-2" />Nouveau cours
          </Button>
        }
      />
      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Chargement…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Intitulé ECUE</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Charge horaire</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-sm">{c.intitule_ecue}</TableCell>
                  <TableCell>
                    <Badge className={`border-0 ${NIVEAU_COLORS[c.niveau] ?? ""}`}>{c.niveau}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{c.semestre}</TableCell>
                  <TableCell className="text-sm">{c.credit_ecue} crédits</TableCell>
                  <TableCell className="text-sm font-medium">{c.charge_horaire_annuel}h</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
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
