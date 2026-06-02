"use client";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PaginatedResponse, Enseignant } from "@/types";

export default function SecretaireEnseignants() {
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Enseignant | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["enseignants"],
    queryFn: () => api.get<PaginatedResponse<Enseignant>>("/enseignants").then(r => r.data),
  });

  const rows = (data?.data ?? []).filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.nom.toLowerCase().includes(q) ||
      t.prenom.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell role="secretaire">
      <PageHeader title="Enseignants" description="Consultation des profils et volumes horaires" />

      <Card className="p-3 md:p-4 mb-4 shadow-soft">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Rechercher un enseignant…"
            className="max-w-xs min-w-[160px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="ml-auto text-xs text-muted-foreground">
            {rows.length} résultat{rows.length !== 1 ? "s" : ""}
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
                  <TableHead>Enseignant</TableHead>
                  <TableHead className="hidden sm:table-cell">Grade</TableHead>
                  <TableHead className="hidden md:table-cell">Département</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-primary-soft text-primary text-xs">
                            {t.nom[0]}{t.prenom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{t.nom_complet}</div>
                          <div className="text-xs text-muted-foreground truncate">{t.email}</div>
                          <div className="sm:hidden text-xs text-muted-foreground mt-0.5">{t.grade}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{t.grade}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">
                      {t.departement?.nom_departement ?? "—"}
                    </TableCell>
                    <TableCell>
                      {t.actif
                        ? <Badge className="bg-green-50 text-green-700 border-0">Actif</Badge>
                        : <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Inactif</Badge>}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelected(t)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun enseignant trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Fiche détail enseignant */}
      <Dialog open={!!selected} onOpenChange={v => { if (!v) setSelected(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fiche enseignant</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary-soft text-primary text-lg">
                    {selected.nom[0]}{selected.prenom[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-base">{selected.nom_complet}</div>
                  <div className="text-sm text-muted-foreground">{selected.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Grade</div>
                  <div className="font-medium">{selected.grade}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Statut</div>
                  <div className="font-medium">{selected.statut}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Département</div>
                  <div className="font-medium">{selected.departement?.nom_departement ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Taux horaire</div>
                  <div className="font-medium">{selected.taux_horaire.toLocaleString()} FCFA/h</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Téléphone</div>
                  <div className="font-medium">{selected.telephone ?? "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Compte</div>
                  <Badge className={selected.actif ? "bg-green-50 text-green-700 border-0" : "bg-amber-50 text-amber-700 border-0"}>
                    {selected.actif ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
