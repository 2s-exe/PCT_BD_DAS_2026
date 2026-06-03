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
import {
  Plus, Filter, MoreHorizontal, Download,
  Pencil, UserX, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { PaginatedResponse, Enseignant, Departement } from "@/types";

// ─── Schéma ────────────────────────────────────────────────────
const enseignantSchema = z.object({
  nom:               z.string().min(2, "Minimum 2 caractères"),
  prenom:            z.string().min(2, "Minimum 2 caractères"),
  email:             z.string().email("Email invalide"),
  telephone:         z.string().optional(),
  grade:             z.enum(["Assistant", "Maitre-Assistant", "Professeur"]),
  statut:            z.enum(["Permanent", "Vacataire"]),
  taux_horaire:      z.coerce.number().min(0, "Valeur positive requise"),
  departement_id:    z.string().min(1, "Sélectionnez un département"),
  login:             z.string().min(3, "Minimum 3 caractères").optional().or(z.literal("")),
  password:          z.string().min(6, "Minimum 6 caractères").optional().or(z.literal("")),
});
type FormData = z.infer<typeof enseignantSchema>;

// ─── Page principale ───────────────────────────────────────────
export default function AdminEnseignants() {
  const queryClient = useQueryClient();
  const [search, setSearch]         = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Enseignant | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["enseignants"],
    queryFn: () => api.get<PaginatedResponse<Enseignant>>("/enseignants").then(r => r.data),
  });

  const { data: departements } = useQuery({
    queryKey: ["departements"],
    queryFn: () => api.get<Departement[]>("/departements").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => api.post("/enseignants", payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Enseignant créé avec succès.");
      queryClient.invalidateQueries({ queryKey: ["enseignants"] });
      closeDialog();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormData }) =>
      api.put(`/enseignants/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Enseignant modifié avec succès.");
      queryClient.invalidateQueries({ queryKey: ["enseignants"] });
      closeDialog();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const toggleMutation = useMutation({
    mutationFn: (t: Enseignant) =>
      api.patch(`/enseignants/${t.id}`, { actif: !t.actif }).then(r => r.data),
    onSuccess: (_, t) => {
      toast.success(t.actif ? "Enseignant désactivé." : "Enseignant activé.");
      queryClient.invalidateQueries({ queryKey: ["enseignants"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const rows = (data?.data ?? []).filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.nom.toLowerCase().includes(q) ||
      t.prenom.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.departement?.nom_departement.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Enseignants"
        description="Gestion centralisée des profils et taux horaires"
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />Exporter
            </Button>
            <Button
              className="bg-gradient-primary text-white hover:opacity-95"
              onClick={() => { setEditing(null); setDialogOpen(true); }}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouvel enseignant</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </>
        }
      />

      <Card className="p-3 md:p-4 mb-4 shadow-soft">
        <div className="flex flex-wrap gap-2 items-center">
          <Input
            placeholder="Rechercher par nom, département…"
            className="max-w-xs min-w-[160px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Grade</Button>
          <Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-2" />Statut</Button>
          <div className="ml-auto text-xs text-muted-foreground">
            {rows.length} résultat{rows.length !== 1 ? "s" : ""}
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
                  <TableHead className="hidden md:table-cell">Grade</TableHead>
                  <TableHead className="hidden lg:table-cell">Département</TableHead>
                  <TableHead className="hidden sm:table-cell">Taux horaire</TableHead>
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
                          <div className="md:hidden text-xs text-muted-foreground mt-0.5">{t.grade}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm hidden md:table-cell">{t.grade}</TableCell>
                    <TableCell className="text-sm hidden lg:table-cell">{t.departement?.nom_departement ?? "—"}</TableCell>
                    <TableCell className="text-sm font-medium hidden sm:table-cell">
                      {t.taux_horaire.toLocaleString()} FCFA/h
                    </TableCell>
                    <TableCell>
                      {t.actif ? (
                        <Badge className="bg-green-50 text-green-700 border-0">Actif</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditing(t); setDialogOpen(true); }}>
                            <Pencil className="h-4 w-4 mr-2" />Modifier
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => toggleMutation.mutate(t)}
                            className={t.actif ? "text-amber-600" : "text-green-600"}
                          >
                            {t.actif
                              ? <><UserX className="h-4 w-4 mr-2" />Désactiver</>
                              : <><UserCheck className="h-4 w-4 mr-2" />Activer</>}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucun enseignant trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <EnseignantDialog
        open={dialogOpen}
        onClose={closeDialog}
        editing={editing}
        departements={departements ?? []}
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

// ─── Dialog formulaire enseignant ──────────────────────────────
function EnseignantDialog({
  open, onClose, editing, departements, onSubmit, isLoading, error,
}: {
  open: boolean;
  onClose: () => void;
  editing: Enseignant | null;
  departements: Departement[];
  onSubmit: (d: FormData) => void;
  isLoading: boolean;
  error: string | null;
}) {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(enseignantSchema),
    values: editing
      ? {
          nom:            editing.nom,
          prenom:         editing.prenom,
          email:          editing.email,
          telephone:      editing.telephone ?? "",
          grade:          editing.grade,
          statut:         editing.statut,
          taux_horaire:   editing.taux_horaire,
          departement_id: String(editing.departement?.id ?? ""),
          login:          "",
          password:       "",
        }
      : {
          nom: "", prenom: "", email: "", telephone: "",
          grade: "Assistant", statut: "Permanent",
          taux_horaire: 0, departement_id: "",
          login: "", password: "",
        },
  });

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Modifier l'enseignant" : "Nouvel enseignant"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Identité */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" {...register("prenom")} placeholder="Kouassi" />
              {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" {...register("nom")} placeholder="N'Guessan" />
              {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} placeholder="k.nguessan@uvci.edu.ci" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telephone">Téléphone <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
            <Input id="telephone" {...register("telephone")} placeholder="+225 07 00 00 00 00" />
          </div>

          {/* Statut académique */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Grade *</Label>
              <Controller name="grade" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Choisir le grade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assistant">Assistant</SelectItem>
                    <SelectItem value="Maitre-Assistant">Maître-Assistant</SelectItem>
                    <SelectItem value="Professeur">Professeur</SelectItem>
                  </SelectContent>
                </Select>
              )} />
              {errors.grade && <p className="text-xs text-destructive">{errors.grade.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Statut *</Label>
              <Controller name="statut" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Choisir le statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Permanent">Permanent</SelectItem>
                    <SelectItem value="Vacataire">Vacataire</SelectItem>
                  </SelectContent>
                </Select>
              )} />
              {errors.statut && <p className="text-xs text-destructive">{errors.statut.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="taux_horaire">Taux horaire (FCFA/h) *</Label>
              <Input id="taux_horaire" type="number" min={0} {...register("taux_horaire")} placeholder="5000" />
              {errors.taux_horaire && <p className="text-xs text-destructive">{errors.taux_horaire.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Département *</Label>
              <Controller name="departement_id" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Choisir le département" /></SelectTrigger>
                  <SelectContent>
                    {departements.map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.nom_departement}
                      </SelectItem>
                    ))}
                    {departements.length === 0 && (
                      <SelectItem value="__none__" disabled>Aucun département</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )} />
              {errors.departement_id && <p className="text-xs text-destructive">{errors.departement_id.message}</p>}
            </div>
          </div>

          {/* Compte utilisateur */}
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Compte d'accès
              {editing && <span className="normal-case ml-1">(laisser vide = inchangé)</span>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="login">Login {!editing && "*"}</Label>
                <Input id="login" {...register("login")} placeholder="k.nguessan" />
                {errors.login && <p className="text-xs text-destructive">{errors.login.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe {!editing && "*"}</Label>
                <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" className="bg-gradient-primary text-white hover:opacity-95" disabled={isLoading}>
              {isLoading ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer le profil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
