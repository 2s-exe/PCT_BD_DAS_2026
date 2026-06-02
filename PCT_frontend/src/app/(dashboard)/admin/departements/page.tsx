"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import api from "@/lib/api";
import type { Departement } from "@/types";

const schema = z.object({
  nom_departement: z.string().min(2, "Minimum 2 caractères"),
  responsable:     z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminDepartements() {
  const queryClient = useQueryClient();
  const [search, setSearch]         = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Departement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["departements"],
    queryFn: () => api.get<Departement[]>("/departements").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (p: FormData) => api.post("/departements", p).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["departements"] }); closeDialog(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      api.put(`/departements/${id}`, payload).then(r => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["departements"] }); closeDialog(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/departements/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departements"] }),
  });

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const rows = (data ?? []).filter(d =>
    !search || d.nom_departement.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell role="admin">
      <PageHeader
        title="Départements"
        description="Gestion des unités pédagogiques"
        actions={
          <Button
            className="bg-gradient-primary text-white hover:opacity-95"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Nouveau département</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        }
      />

      <Card className="p-3 md:p-4 mb-4 shadow-soft">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Rechercher un département…"
            className="max-w-xs min-w-[160px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="ml-auto text-xs text-muted-foreground">
            {rows.length} département{rows.length !== 1 ? "s" : ""}
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
                  <TableHead>Nom du département</TableHead>
                  <TableHead className="hidden sm:table-cell">Responsable</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{d.nom_departement}</div>
                      <div className="sm:hidden text-xs text-muted-foreground mt-0.5">
                        {d.responsable ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">
                      {d.responsable ?? "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(d); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4 mr-2" />Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(d.id)}
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
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      Aucun département trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier le département" : "Nouveau département"}</DialogTitle>
          </DialogHeader>
          <DeptForm
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

function DeptForm({ editing, onSubmit, onClose, isLoading, error }: {
  editing: Departement | null;
  onSubmit: (d: FormData) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nom_departement: editing?.nom_departement ?? "", responsable: editing?.responsable ?? "" },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label htmlFor="nom_departement">Nom du département *</Label>
        <Input id="nom_departement" {...register("nom_departement")} placeholder="Informatique" />
        {errors.nom_departement && <p className="text-xs text-destructive">{errors.nom_departement.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="responsable">Responsable <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
        <Input id="responsable" {...register("responsable")} placeholder="Pr. Konan" />
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
