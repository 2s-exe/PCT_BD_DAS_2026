"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import type { PaginatedResponse, Attribution, Enseignant, Cours, AnneeAcademique } from "@/types";

const schema = z.object({
  enseignant_id:   z.string().min(1, "Sélectionnez un enseignant"),
  cours_id:        z.string().min(1, "Sélectionnez un cours"),
  annee_id:        z.string().min(1, "Sélectionnez une année"),
  charge_horaire:  z.coerce.number().min(1, "Minimum 1 heure"),
  date_attribution: z.string().min(1, "Date requise"),
});
type FormData = z.infer<typeof schema>;

export default function AdminAttributions() {
  const queryClient = useQueryClient();
  const [search, setSearch]             = useState("");
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editing, setEditing]           = useState<Attribution | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Attribution | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["attributions"],
    queryFn: () => api.get<PaginatedResponse<Attribution>>("/attributions").then(r => r.data),
  });

  // Même queryFn que les pages principales pour éviter les conflits de cache
  const { data: enseignantsData } = useQuery({
    queryKey: ["enseignants"],
    queryFn: () => api.get<PaginatedResponse<Enseignant>>("/enseignants").then(r => r.data),
  });

  const { data: coursData } = useQuery({
    queryKey: ["cours"],
    queryFn: () => api.get<PaginatedResponse<Cours>>("/cours").then(r => r.data),
  });

  const { data: annees } = useQuery({
    queryKey: ["annees"],
    queryFn: () => api.get<AnneeAcademique[]>("/annees").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (p: FormData) => api.post("/attributions", p).then(r => r.data),
    onSuccess: () => {
      toast.success("Attribution créée avec succès.");
      queryClient.invalidateQueries({ queryKey: ["attributions"] });
      closeDialog();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      api.put(`/attributions/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Attribution modifiée avec succès.");
      queryClient.invalidateQueries({ queryKey: ["attributions"] });
      closeDialog();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/attributions/${id}`),
    onSuccess: () => {
      toast.success("Attribution supprimée.");
      queryClient.invalidateQueries({ queryKey: ["attributions"] });
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const rows = (data?.data ?? []).filter(a => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.enseignant?.nom_complet?.toLowerCase().includes(q) ||
      a.cours?.intitule_ecue?.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Attributions"
        description="Association enseignants ↔ cours par année académique"
        actions={
          <Button
            className="bg-gradient-primary text-white hover:opacity-95"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouvelle attribution</span>
            <span className="sm:hidden">Nouveau</span>
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
            {rows.length} attribution{rows.length !== 1 ? "s" : ""}
          </div>
        </div>
      </Card>

      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Enseignant</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead className="hidden sm:table-cell">Année</TableHead>
                  <TableHead className="hidden md:table-cell">Charge (h)</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary-soft text-primary text-xs">
                            {a.enseignant?.nom?.[0]}{a.enseignant?.prenom?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate">{a.enseignant?.nom_complet}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{a.cours?.intitule_ecue}</div>
                      <div className="sm:hidden text-xs text-muted-foreground">
                        {a.annee?.libelle_annee}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">
                      {a.annee?.libelle_annee}
                    </TableCell>
                    <TableCell className="text-sm font-medium hidden md:table-cell">
                      {a.charge_horaire}h
                    </TableCell>
                    <TableCell className="text-sm hidden lg:table-cell">
                      {a.date_attribution}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(a); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4 mr-2" />Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(a)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune attribution trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <AttributionDialog
        open={dialogOpen}
        onClose={closeDialog}
        editing={editing}
        enseignants={enseignantsData?.data ?? []}
        cours={coursData?.data ?? []}
        annees={annees ?? []}
        onSubmit={d => editing
          ? updateMutation.mutate({ id: editing.id, payload: d })
          : createMutation.mutate(d)
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        label={deleteTarget ? `${deleteTarget.enseignant?.nom_complet} — ${deleteTarget.cours?.intitule_ecue}` : undefined}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}

function AttributionDialog({ open, onClose, editing, enseignants, cours, annees, onSubmit, isLoading }: {
  open: boolean; onClose: () => void; editing: Attribution | null;
  enseignants: Enseignant[]; cours: Cours[]; annees: AnneeAcademique[];
  onSubmit: (d: FormData) => void; isLoading: boolean;
}) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: editing ? {
      enseignant_id:    String(editing.enseignant?.id ?? ""),
      cours_id:         String(editing.cours?.id ?? ""),
      annee_id:         String(editing.annee?.id ?? ""),
      charge_horaire:   editing.charge_horaire,
      date_attribution: editing.date_attribution,
    } : { enseignant_id: "", cours_id: "", annee_id: "", charge_horaire: 30, date_attribution: "" },
  });

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier l'attribution" : "Nouvelle attribution"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Enseignant *</Label>
            <Controller name="enseignant_id" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Choisir un enseignant" /></SelectTrigger>
                <SelectContent>
                  {enseignants.map(e => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.nom_complet}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            {errors.enseignant_id && <p className="text-xs text-destructive">{errors.enseignant_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Cours *</Label>
            <Controller name="cours_id" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Choisir un cours" /></SelectTrigger>
                <SelectContent>
                  {cours.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.intitule_ecue} ({c.niveau})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            {errors.cours_id && <p className="text-xs text-destructive">{errors.cours_id.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Année académique *</Label>
            <Controller name="annee_id" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Choisir une année" /></SelectTrigger>
                <SelectContent>
                  {annees.map(a => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.libelle_annee}{a.active ? " (active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            {errors.annee_id && <p className="text-xs text-destructive">{errors.annee_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="charge_horaire">Charge horaire (h) *</Label>
              <Input id="charge_horaire" type="number" min={1} {...register("charge_horaire")} />
              {errors.charge_horaire && <p className="text-xs text-destructive">{errors.charge_horaire.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_attribution">Date d'attribution *</Label>
              <Input id="date_attribution" type="date" {...register("date_attribution")} />
              {errors.date_attribution && <p className="text-xs text-destructive">{errors.date_attribution.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>Annuler</Button>
            <Button type="submit" className="bg-gradient-primary text-white hover:opacity-95" disabled={isLoading}>
              {isLoading ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer l'attribution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
