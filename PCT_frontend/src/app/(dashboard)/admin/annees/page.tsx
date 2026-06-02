"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Star } from "lucide-react";
import api from "@/lib/api";
import type { AnneeAcademique } from "@/types";

const schema = z.object({
  libelle_annee: z.string().min(4, "Ex : 2024-2025"),
  date_debut:    z.string().min(1, "Date requise"),
  date_fin:      z.string().min(1, "Date requise"),
  active:        z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminAnnees() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<AnneeAcademique | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["annees"],
    queryFn: () => api.get<AnneeAcademique[]>("/annees").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (p: FormData) => api.post("/annees", p).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["annees"] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      api.put(`/annees/${id}`, payload).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["annees"] }); closeDialog(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/annees/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["annees"] }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/annees/${id}/activer`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["annees"] }),
  });

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  return (
    <AppShell role="admin">
      <PageHeader
        title="Années académiques"
        description="Gestion des périodes d'enseignement"
        actions={
          <Button
            className="bg-gradient-primary text-white hover:opacity-95"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouvelle année</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        }
      />

      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Libellé</TableHead>
                  <TableHead className="hidden sm:table-cell">Début</TableHead>
                  <TableHead className="hidden sm:table-cell">Fin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {a.active && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />}
                        {a.libelle_annee}
                      </div>
                      <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
                        {a.date_debut} → {a.date_fin}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{a.date_debut}</TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{a.date_fin}</TableCell>
                    <TableCell>
                      {a.active
                        ? <Badge className="bg-green-50 text-green-700 border-0">Active</Badge>
                        : <Badge variant="outline" className="text-muted-foreground">Archivée</Badge>}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!a.active && (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => activateMutation.mutate(a.id)}
                            >
                              <Star className="h-4 w-4 mr-2" />Définir comme active
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => { setEditing(a); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4 mr-2" />Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(a.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.length && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune année académique
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'année" : "Nouvelle année académique"}</DialogTitle>
          </DialogHeader>
          <AnneeForm
            key={editing?.id ?? "new"}
            editing={editing}
            onSubmit={d => editing
              ? updateMutation.mutate({ id: editing.id, payload: d })
              : createMutation.mutate(d)
            }
            onClose={closeDialog}
            isLoading={createMutation.isPending || updateMutation.isPending}
            error={
              (createMutation.error || updateMutation.error) instanceof Error
                ? (createMutation.error ?? updateMutation.error)!.message : null
            }
          />
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function AnneeForm({ editing, onSubmit, onClose, isLoading, error }: {
  editing: AnneeAcademique | null;
  onSubmit: (d: FormData) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      libelle_annee: editing?.libelle_annee ?? "",
      date_debut:    editing?.date_debut ?? "",
      date_fin:      editing?.date_fin ?? "",
      active:        editing?.active ?? false,
    },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="libelle_annee">Libellé *</Label>
        <Input id="libelle_annee" {...register("libelle_annee")} placeholder="2025-2026" />
        {errors.libelle_annee && <p className="text-xs text-destructive">{errors.libelle_annee.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date_debut">Date de début *</Label>
          <Input id="date_debut" type="date" {...register("date_debut")} />
          {errors.date_debut && <p className="text-xs text-destructive">{errors.date_debut.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date_fin">Date de fin *</Label>
          <Input id="date_fin" type="date" {...register("date_fin")} />
          {errors.date_fin && <p className="text-xs text-destructive">{errors.date_fin.message}</p>}
        </div>
      </div>
      {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
      <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Annuler</Button>
        <Button type="submit" className="bg-gradient-primary text-white hover:opacity-95" disabled={isLoading}>
          {isLoading ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer"}
        </Button>
      </DialogFooter>
    </form>
  );
}
