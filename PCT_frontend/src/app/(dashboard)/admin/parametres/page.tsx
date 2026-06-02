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
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil } from "lucide-react";
import api from "@/lib/api";
import type { ParametreCalcul } from "@/types";

// ─── Schéma ────────────────────────────────────────────────────
const parametreSchema = z.object({
  type_operation:    z.enum(["creation", "mise_a_jour"]),
  niveau_complexite: z.enum(["simple", "intermediaire", "complexe"]),
  coefficient_vhn:   z.coerce.number().min(0.01, "Valeur positive requise"),
  description:       z.string().optional(),
});
type FormData = z.infer<typeof parametreSchema>;

// ─── Page principale ───────────────────────────────────────────
export default function AdminParametres() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<ParametreCalcul | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["parametres"],
    queryFn: () => api.get<ParametreCalcul[]>("/parametres").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => api.post("/parametres", payload).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["parametres"] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      api.put(`/parametres/${id}`, payload).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["parametres"] }); closeDialog(); },
  });

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  return (
    <AppShell role="admin">
      <PageHeader
        title="Paramètres de calcul"
        description="Coefficients VHN par type d'opération et niveau de complexité"
        actions={
          <Button
            className="bg-gradient-primary text-white hover:opacity-95"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouveau paramètre</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        }
      />

      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Chargement…</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Type d'opération</TableHead>
                  <TableHead>Niveau de complexité</TableHead>
                  <TableHead>Coefficient VHN</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Badge className={
                        p.type_operation === "creation"
                          ? "bg-blue-50 text-blue-700 border-0"
                          : "bg-purple-50 text-purple-700 border-0"
                      }>
                        {p.type_operation === "creation" ? "Création" : "Mise à jour"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{p.niveau_complexite}</TableCell>
                    <TableCell className="text-sm font-semibold text-primary">
                      {p.coefficient_vhn}h
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                      {p.description ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditing(p); setDialogOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.length && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun paramètre configuré
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ParametreDialog
        open={dialogOpen}
        onClose={closeDialog}
        editing={editing}
        onSubmit={d => editing
          ? updateMutation.mutate({ id: editing.id, payload: d })
          : createMutation.mutate(d)
        }
        isLoading={createMutation.isPending || updateMutation.isPending}
        error={
          (createMutation.error || updateMutation.error) instanceof Error
            ? (createMutation.error ?? updateMutation.error)!.message
            : null
        }
      />
    </AppShell>
  );
}

// ─── Dialog formulaire paramètre ──────────────────────────────
function ParametreDialog({
  open, onClose, editing, onSubmit, isLoading, error,
}: {
  open: boolean;
  onClose: () => void;
  editing: ParametreCalcul | null;
  onSubmit: (d: FormData) => void;
  isLoading: boolean;
  error: string | null;
}) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(parametreSchema),
    values: editing
      ? {
          type_operation:    editing.type_operation,
          niveau_complexite: editing.niveau_complexite,
          coefficient_vhn:   editing.coefficient_vhn,
          description:       editing.description ?? "",
        }
      : { type_operation: "creation", niveau_complexite: "simple", coefficient_vhn: 1, description: "" },
  });

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Modifier le paramètre" : "Nouveau paramètre"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Type d'opération *</Label>
            <Controller name="type_operation" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="creation">Création</SelectItem>
                  <SelectItem value="mise_a_jour">Mise à jour</SelectItem>
                </SelectContent>
              </Select>
            )} />
            {errors.type_operation && <p className="text-xs text-destructive">{errors.type_operation.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Niveau de complexité *</Label>
            <Controller name="niveau_complexite" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                  <SelectItem value="complexe">Complexe</SelectItem>
                </SelectContent>
              </Select>
            )} />
            {errors.niveau_complexite && <p className="text-xs text-destructive">{errors.niveau_complexite.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coefficient_vhn">Coefficient VHN (heures) *</Label>
            <Input
              id="coefficient_vhn"
              type="number"
              step="0.01"
              min={0.01}
              {...register("coefficient_vhn")}
              placeholder="1.5"
            />
            {errors.coefficient_vhn && <p className="text-xs text-destructive">{errors.coefficient_vhn.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground text-xs">(optionnel)</span>
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Explication du coefficient…"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>Annuler</Button>
            <Button type="submit" className="bg-gradient-primary text-white hover:opacity-95" disabled={isLoading}>
              {isLoading ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
