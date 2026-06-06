"use client";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { downloadExport } from "@/lib/download";
import { useAuthStore } from "@/store/authStore";
import type { PaginatedResponse, ActivitePedagogique } from "@/types";

const editSchema = z.object({
  type_operation:    z.enum(["creation", "mise_a_jour"]),
  niveau_complexite: z.enum(["simple", "intermediaire", "complexe"]),
  date_activite:     z.string().min(1),
  observations:      z.string().optional(),
});
type EditForm = z.infer<typeof editSchema>;

export default function EnseignantHistorique() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ActivitePedagogique | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["mes-activites", user?.enseignant?.id],
    queryFn: () =>
      api.get<PaginatedResponse<ActivitePedagogique>>(
        `/activites?id_enseignant=${user?.enseignant?.id}`
      ).then(r => r.data),
    enabled: !!user?.enseignant?.id,
  });

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
  });

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EditForm }) =>
      api.put(`/activites/${id}`, payload),
    onSuccess: () => {
      toast.success("Activité modifiée !");
      qc.invalidateQueries({ queryKey: ["mes-activites"] });
      setEditing(null);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  function openEdit(a: ActivitePedagogique) {
    reset({
      type_operation:    a.type_operation as EditForm["type_operation"],
      niveau_complexite: a.niveau_complexite as EditForm["niveau_complexite"],
      date_activite:     a.date_activite,
      observations:      a.observations ?? "",
    });
    setEditing(a);
  }

  return (
    <AppShell role="enseignant">
      <PageHeader
        title="Mes activités"
        description="Historique complet de vos déclarations pédagogiques"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadExport("/exports/activites", "recapitulatif_enseignant").catch(e => toast.error(getErrorMessage(e)))}
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Télécharger récapitulatif</span>
            <span className="sm:hidden">Télécharger</span>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Complexité</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm whitespace-nowrap">{a.date_activite}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {a.attribution?.cours?.intitule_ecue}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className={a.type_operation === "creation"
                        ? "bg-blue-50 text-blue-700 border-0"
                        : "bg-purple-50 text-purple-700 border-0"}>
                        {a.type_operation === "creation" ? "Création" : "Mise à jour"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm capitalize hidden md:table-cell">
                      {a.niveau_complexite}
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-primary">
                      {a.volume_horaire}h
                    </TableCell>
                    <TableCell>
                      {a.statut_validation === "valide" && (
                        <Badge className="bg-green-50 text-green-700 border-0 whitespace-nowrap">Validé</Badge>
                      )}
                      {a.statut_validation === "rejete" && (
                        <Badge className="bg-red-50 text-red-700 border-0 whitespace-nowrap">Rejeté</Badge>
                      )}
                      {(!a.statut_validation || a.statut_validation === "en_attente") && (
                        <Badge className="bg-amber-50 text-amber-700 border-0 whitespace-nowrap">En attente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(a)}
                        title="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.data.length && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucune activité déclarée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Dialog modification */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'activité</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((d) => editing && mutation.mutate({ id: editing.id, payload: d }))}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type d'opération</Label>
                <Controller name="type_operation" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="creation">Création</SelectItem>
                      <SelectItem value="mise_a_jour">Mise à jour</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <Label>Complexité</Label>
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
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" {...register("date_activite")} />
              {errors.date_activite && <p className="text-xs text-destructive">Date requise</p>}
            </div>
            <div className="space-y-2">
              <Label>Observations <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
              <Textarea {...register("observations")} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
              <Button type="submit" className="bg-gradient-primary text-white" disabled={mutation.isPending}>
                {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
