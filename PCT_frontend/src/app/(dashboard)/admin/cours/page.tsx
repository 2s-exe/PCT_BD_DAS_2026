"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { downloadExport } from "@/lib/download";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import type { PaginatedResponse, Cours } from "@/types";

// ─── Schéma ────────────────────────────────────────────────────
const coursSchema = z.object({
  intitule_ecue:         z.string().min(3, "Minimum 3 caractères"),
  niveau:                z.enum(["L1", "L2", "L3", "M1", "M2"]),
  semestre:              z.string().min(1, "Champ requis"),
  credit_ecue:           z.coerce.number().min(1, "Minimum 1 crédit"),
  charge_horaire_annuel: z.coerce.number().min(1, "Minimum 1 heure"),
  code_specialite:       z.string().optional(),
});
type FormData = z.infer<typeof coursSchema>;

const NIVEAU_COLORS: Record<string, string> = {
  L1: "bg-blue-50 text-blue-700",
  L2: "bg-blue-50 text-blue-700",
  L3: "bg-blue-50 text-blue-700",
  M1: "bg-purple-50 text-purple-700",
  M2: "bg-purple-50 text-purple-700",
};

// ─── Page principale ───────────────────────────────────────────
export default function AdminCours() {
  const queryClient = useQueryClient();
  const [search, setSearch]             = useState("");
  const [dialogOpen, setDialogOpen]     = useState(false);
  const [editing, setEditing]           = useState<Cours | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cours | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["cours"],
    queryFn: () => api.get<PaginatedResponse<Cours>>("/cours").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => api.post("/cours", payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Cours créé avec succès.");
      queryClient.invalidateQueries({ queryKey: ["cours"] });
      closeDialog();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      api.put(`/cours/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Cours modifié avec succès.");
      queryClient.invalidateQueries({ queryKey: ["cours"] });
      closeDialog();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/cours/${id}`),
    onSuccess: () => {
      toast.success("Cours supprimé.");
      queryClient.invalidateQueries({ queryKey: ["cours"] });
      setDeleteTarget(null);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const rows = (data?.data ?? []).filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.intitule_ecue.toLowerCase().includes(q) ||
      c.niveau.toLowerCase().includes(q) ||
      (c.code_specialite ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Cours & Filières"
        description="Catalogue des enseignements"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={() => downloadExport("/exports/cours", "cours").catch(e => toast.error(getErrorMessage(e)))}
            >
              <Download className="h-4 w-4 mr-2" />Exporter
            </Button>
            <Button
              className="bg-gradient-primary text-white hover:opacity-95"
              onClick={() => { setEditing(null); setDialogOpen(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouveau cours</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </>
        }
      />

      <Card className="p-3 md:p-4 mb-4 shadow-soft">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Rechercher par intitulé, niveau…"
            className="max-w-xs min-w-[160px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="ml-auto text-xs text-muted-foreground">
            {rows.length} cours
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
                  <TableHead>Intitulé ECUE</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead className="hidden sm:table-cell">Semestre</TableHead>
                  <TableHead className="hidden md:table-cell">Crédits</TableHead>
                  <TableHead className="hidden sm:table-cell">Charge horaire</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{c.intitule_ecue}</div>
                      {c.code_specialite && (
                        <div className="text-xs text-muted-foreground">{c.code_specialite}</div>
                      )}
                      <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
                        {c.semestre} — {c.charge_horaire_annuel}h
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-0 ${NIVEAU_COLORS[c.niveau] ?? ""}`}>{c.niveau}</Badge>
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{c.semestre}</TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{c.credit_ecue} crédits</TableCell>
                    <TableCell className="text-sm font-medium hidden sm:table-cell">
                      {c.charge_horaire_annuel}h
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(c); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4 mr-2" />Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(c)}
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
                      Aucun cours trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <CoursDialog
        key={dialogOpen ? (editing ? `edit-${editing.id}` : "new") : "closed"}
        open={dialogOpen}
        onClose={closeDialog}
        editing={editing}
        onSubmit={d => editing
          ? updateMutation.mutate({ id: editing.id, payload: d })
          : createMutation.mutate(d)
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        label={deleteTarget?.intitule_ecue}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </AppShell>
  );
}

// ─── Dialog formulaire cours ───────────────────────────────────
function CoursDialog({
  open, onClose, editing, onSubmit, isLoading,
}: {
  open: boolean;
  onClose: () => void;
  editing: Cours | null;
  onSubmit: (d: FormData) => void;
  isLoading: boolean;
}) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(coursSchema),
    values: editing
      ? {
          intitule_ecue:         editing.intitule_ecue,
          niveau:                editing.niveau,
          semestre:              editing.semestre,
          credit_ecue:           editing.credit_ecue,
          charge_horaire_annuel: editing.charge_horaire_annuel,
          code_specialite:       editing.code_specialite ?? "",
        }
      : {
          intitule_ecue: "", niveau: "L1", semestre: "",
          credit_ecue: 3, charge_horaire_annuel: 30, code_specialite: "",
        },
  });

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{editing ? "Modifier le cours" : "Nouveau cours"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="intitule_ecue">Intitulé ECUE *</Label>
            <Input id="intitule_ecue" {...register("intitule_ecue")} placeholder="Algorithmique avancée" />
            {errors.intitule_ecue && <p className="text-xs text-destructive">{errors.intitule_ecue.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="code_specialite">Code spécialité <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
            <Input id="code_specialite" {...register("code_specialite")} placeholder="INF-301" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Niveau *</Label>
              <Controller name="niveau" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent>
                    {["L1", "L2", "L3", "M1", "M2"].map(n => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
              {errors.niveau && <p className="text-xs text-destructive">{errors.niveau.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Semestre *</Label>
              <Controller name="semestre" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Semestre" /></SelectTrigger>
                  <SelectContent>
                    {["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
              {errors.semestre && <p className="text-xs text-destructive">{errors.semestre.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="credit_ecue">Crédits ECUE *</Label>
              <Input id="credit_ecue" type="number" min={1} max={30} {...register("credit_ecue")} placeholder="3" />
              {errors.credit_ecue && <p className="text-xs text-destructive">{errors.credit_ecue.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="charge_horaire_annuel">Charge horaire annuelle (h) *</Label>
              <Input id="charge_horaire_annuel" type="number" min={1} {...register("charge_horaire_annuel")} placeholder="30" />
              {errors.charge_horaire_annuel && <p className="text-xs text-destructive">{errors.charge_horaire_annuel.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>Annuler</Button>
            <Button type="submit" className="bg-gradient-primary text-white hover:opacity-95" disabled={isLoading}>
              {isLoading ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer le cours"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
