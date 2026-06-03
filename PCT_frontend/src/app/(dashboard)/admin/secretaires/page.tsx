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
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, MoreHorizontal, Download, Pencil,
  UserX, UserCheck, Filter,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { PaginatedResponse, Secretaire } from "@/types";

// ─── Schéma de validation ─────────────────────────────────────
const secretaireSchema = z.object({
  nom:        z.string().min(2, "Minimum 2 caractères"),
  prenom:     z.string().min(2, "Minimum 2 caractères"),
  email:      z.string().email("Email invalide"),
  telephone:  z.string().optional(),
  login:      z.string().min(3, "Minimum 3 caractères"),
  password:   z.string().min(6, "Minimum 6 caractères").optional().or(z.literal("")),
});
type SecretaireFormData = z.infer<typeof secretaireSchema>;

// ─── Composant principal ──────────────────────────────────────
export default function AdminSecretaires() {
  const queryClient = useQueryClient();
  const [search, setSearch]         = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Secretaire | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["secretaires"],
    queryFn: () =>
      api.get<PaginatedResponse<Secretaire>>("/secretaires").then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (payload: SecretaireFormData) =>
      api.post("/secretaires", payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Secrétaire créée avec succès.");
      queryClient.invalidateQueries({ queryKey: ["secretaires"] });
      setDialogOpen(false);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SecretaireFormData }) =>
      api.put(`/secretaires/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      toast.success("Secrétaire modifiée avec succès.");
      queryClient.invalidateQueries({ queryKey: ["secretaires"] });
      setDialogOpen(false);
      setEditing(null);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const toggleMutation = useMutation({
    mutationFn: (s: Secretaire) =>
      api.patch(`/secretaires/${s.id}`, { actif: !s.actif }).then(r => r.data),
    onSuccess: (_, s) => {
      toast.success(s.actif ? "Compte désactivé." : "Compte activé.");
      queryClient.invalidateQueries({ queryKey: ["secretaires"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (s: Secretaire) => {
    setEditing(s);
    setDialogOpen(true);
  };

  // Filtrage côté client sur les données reçues
  const rows = (data?.data ?? []).filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.nom.toLowerCase().includes(q) ||
      s.prenom.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.login.toLowerCase().includes(q)
    );
  });

  return (
    <AppShell role="admin">
      <PageHeader
        title="Secrétaires"
        description="Gestion des comptes du secrétariat pédagogique"
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />Exporter
            </Button>
            <Button
              className="bg-gradient-primary text-white hover:opacity-95"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4 mr-2" />Nouveau secrétaire
            </Button>
          </>
        }
      />

      {/* Barre de recherche */}
      <Card className="p-4 mb-4 shadow-soft">
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Rechercher par nom, email, login…"
            className="max-w-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />Statut
          </Button>
          <div className="ml-auto text-xs text-muted-foreground">
            {rows.length} résultat{rows.length !== 1 ? "s" : ""}
          </div>
        </div>
      </Card>

      {/* Tableau */}
      <Card className="shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Chargement…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Secrétaire</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary-soft text-primary text-xs">
                          {s.nom[0]}{s.prenom[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{s.nom_complet ?? `${s.prenom} ${s.nom}`}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{s.login}</TableCell>
                  <TableCell className="text-sm">{s.telephone ?? "—"}</TableCell>
                  <TableCell>
                    {s.actif ? (
                      <Badge className="bg-green-50 text-green-700 border-0">Actif</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
                        Inactif
                      </Badge>
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
                        <DropdownMenuItem onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4 mr-2" />Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleMutation.mutate(s)}
                          className={s.actif ? "text-amber-600" : "text-green-600"}
                        >
                          {s.actif ? (
                            <><UserX className="h-4 w-4 mr-2" />Désactiver</>
                          ) : (
                            <><UserCheck className="h-4 w-4 mr-2" />Activer</>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucun secrétaire trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Dialog création / édition */}
      <SecretaireDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        editing={editing}
        onSubmit={data => {
          if (editing) {
            updateMutation.mutate({ id: editing.id, payload: data });
          } else {
            createMutation.mutate(data);
          }
        }}
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

// ─── Dialog de formulaire ─────────────────────────────────────
function SecretaireDialog({
  open, onClose, editing, onSubmit, isLoading, error,
}: {
  open: boolean;
  onClose: () => void;
  editing: Secretaire | null;
  onSubmit: (data: SecretaireFormData) => void;
  isLoading: boolean;
  error: string | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecretaireFormData>({
    resolver: zodResolver(secretaireSchema),
    values: editing
      ? {
          nom:       editing.nom,
          prenom:    editing.prenom,
          email:     editing.email,
          telephone: editing.telephone ?? "",
          login:     editing.login,
          password:  "",
        }
      : { nom: "", prenom: "", email: "", telephone: "", login: "", password: "" },
  });

  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Modifier le secrétaire" : "Nouveau secrétaire"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" {...register("prenom")} placeholder="Ex : Aminata" />
              {errors.prenom && <p className="text-xs text-destructive">{errors.prenom.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" {...register("nom")} placeholder="Ex : Koné" />
              {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="aminata.kone@uvci.edu.ci" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telephone">Téléphone <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
            <Input id="telephone" {...register("telephone")} placeholder="+225 07 00 00 00 00" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="login">Login</Label>
              <Input id="login" {...register("login")} placeholder="a.kone" />
              {errors.login && <p className="text-xs text-destructive">{errors.login.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">
                Mot de passe
                {editing && <span className="text-muted-foreground text-xs ml-1">(laisser vide = inchangé)</span>}
              </Label>
              <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary text-white hover:opacity-95"
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement…" : editing ? "Mettre à jour" : "Créer le compte"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
