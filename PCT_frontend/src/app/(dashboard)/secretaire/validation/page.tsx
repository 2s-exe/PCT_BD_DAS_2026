"use client";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import type { PaginatedResponse, ActivitePedagogique } from "@/types";

type Statut = "en_attente" | "valide" | "rejete";

interface GroupedEnseignant {
  id: number;
  nom_complet: string;
  initiales: string;
  activites: ActivitePedagogique[];
}

function statutBadge(s: Statut) {
  if (s === "valide")    return <Badge className="bg-green-50 text-green-700 border-green-200 border text-[10px]">Validée</Badge>;
  if (s === "rejete")    return <Badge className="bg-red-50 text-red-700 border-red-200 border text-[10px]">Rejetée</Badge>;
  return                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-[10px]">En attente</Badge>;
}

function typeLabel(t: string) {
  return t === "creation" ? "Création" : "Mise à jour";
}

function niveauLabel(n: string) {
  if (n === "simple") return "Simple";
  if (n === "intermediaire") return "Intermédiaire";
  return "Complexe";
}

// ── Ligne activité avec actions inline ────────────────────────────────────────
function ActiviteRow({
  activite,
  onAction,
  isPending,
}: {
  activite: ActivitePedagogique;
  onAction: (id: number, statut: Statut, obs?: string) => void;
  isPending: boolean;
}) {
  const [showObs, setShowObs] = useState(false);
  const [obs, setObs] = useState(activite.observations_secretaire ?? "");

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{activite.attribution?.cours?.intitule_ecue ?? "—"}</span>
            <Badge variant="outline" className="text-[10px]">{typeLabel(activite.type_operation)}</Badge>
            <Badge variant="outline" className="text-[10px]">{niveauLabel(activite.niveau_complexite)}</Badge>
            {statutBadge((activite.statut_validation ?? "en_attente") as Statut)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {new Date(activite.date_activite).toLocaleDateString("fr-FR")}
            {" · "}
            <span className="font-semibold text-foreground">{activite.volume_horaire}h VHN</span>
            {activite.observations && (
              <span className="ml-2 italic">&quot;{activite.observations}&quot;</span>
            )}
          </div>
          {activite.observations_secretaire && (
            <div className="text-xs text-muted-foreground mt-0.5 italic">
              Obs. secrétaire : {activite.observations_secretaire}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-green-600 hover:bg-green-50"
            disabled={isPending || activite.statut_validation === "valide"}
            onClick={() => onAction(activite.id, "valide", obs || undefined)}
            title="Valider"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-amber-600 hover:bg-amber-50"
            disabled={isPending || activite.statut_validation === "en_attente"}
            onClick={() => onAction(activite.id, "en_attente", obs || undefined)}
            title="Remettre en attente"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-red-600 hover:bg-red-50"
            disabled={isPending || activite.statut_validation === "rejete"}
            onClick={() => setShowObs(!showObs)}
            title="Rejeter"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showObs && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Motif du rejet (optionnel)…"
            className="text-xs min-h-[52px]"
            value={obs}
            onChange={e => setObs(e.target.value)}
          />
          <Button
            size="sm"
            className="shrink-0 bg-red-600 hover:bg-red-700 text-white self-end"
            disabled={isPending}
            onClick={() => { onAction(activite.id, "rejete", obs || undefined); setShowObs(false); }}
          >
            Confirmer
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Groupe par enseignant ─────────────────────────────────────────────────────
function EnseignantGroup({
  groupe,
  onAction,
  isPending,
}: {
  groupe: GroupedEnseignant;
  onAction: (id: number, statut: Statut, obs?: string) => void;
  isPending: boolean;
}) {
  const [open, setOpen] = useState(true);
  const enAttente = groupe.activites.filter(a => a.statut_validation === "en_attente").length;
  const totalH = groupe.activites.reduce((s, a) => s + Number(a.volume_horaire), 0);

  return (
    <Card className="shadow-soft overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary-soft text-primary text-xs">
            {groupe.initiales}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{groupe.nom_complet}</span>
            {enAttente > 0 && (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 border text-[10px]">
                {enAttente} en attente
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {groupe.activites.length} activité{groupe.activites.length > 1 ? "s" : ""}
            {" · "}
            {totalH.toFixed(1)}h VHN total
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t pt-3">
          {groupe.activites.map(a => (
            <ActiviteRow key={a.id} activite={a} onAction={onAction} isPending={isPending} />
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function SecretaireValidation() {
  const qc = useQueryClient();
  const [filtre, setFiltre] = useState<"tous" | "en_attente" | "valide" | "rejete">("en_attente");

  const { data, isLoading } = useQuery({
    queryKey: ["activites-secretaire"],
    queryFn: () =>
      api.get<PaginatedResponse<ActivitePedagogique>>("/activites?per_page=200").then(r => r.data),
    staleTime: 30_000,
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, statut, observations_secretaire }: { id: number; statut: Statut; observations_secretaire?: string }) =>
      api.post(`/activites/${id}/statut`, { statut, observations_secretaire }),
    onSuccess: (_, { statut }) => {
      const msg = statut === "valide" ? "Activité validée." : statut === "rejete" ? "Activité rejetée." : "Remise en attente.";
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["activites-secretaire"] });
      qc.invalidateQueries({ queryKey: ["volumes-attente"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: () => toast.error("Une erreur est survenue."),
  });

  const handleAction = (id: number, statut: Statut, obs?: string) =>
    actionMutation.mutate({ id, statut, observations_secretaire: obs });

  // Filtrage + groupement par enseignant
  const activites = (data?.data ?? []).filter(a => {
    if (filtre === "tous") return true;
    return (a.statut_validation ?? "en_attente") === filtre;
  });

  const grouped: GroupedEnseignant[] = Object.values(
    activites.reduce<Record<number, GroupedEnseignant>>((acc, a) => {
      const ens = a.attribution?.enseignant;
      if (!ens) return acc;
      if (!acc[ens.id]) {
        acc[ens.id] = {
          id: ens.id,
          nom_complet: ens.nom_complet,
          initiales: `${ens.nom?.[0] ?? ""}${ens.prenom?.[0] ?? ""}`,
          activites: [],
        };
      }
      acc[ens.id].activites.push(a);
      return acc;
    }, {})
  ).sort((a, b) => {
    const aEn = a.activites.filter(x => x.statut_validation === "en_attente").length;
    const bEn = b.activites.filter(x => x.statut_validation === "en_attente").length;
    return bEn - aEn;
  });

  const totalEnAttente = (data?.data ?? []).filter(a => (a.statut_validation ?? "en_attente") === "en_attente").length;

  return (
    <AppShell role="secretaire">
      <PageHeader
        title="Validation des activités"
        description="Examinez et validez les activités déclarées par les enseignants"
      />

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap mb-4">
        {(["en_attente", "tous", "valide", "rejete"] as const).map(f => (
          <Button
            key={f}
            size="sm"
            variant={filtre === f ? "default" : "outline"}
            onClick={() => setFiltre(f)}
            className={filtre === f ? "bg-gradient-primary text-white" : ""}
          >
            {f === "en_attente" && `En attente${totalEnAttente > 0 ? ` (${totalEnAttente})` : ""}`}
            {f === "tous" && "Toutes"}
            {f === "valide" && "Validées"}
            {f === "rejete" && "Rejetées"}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Chargement…</div>
      ) : grouped.length === 0 ? (
        <Card className="p-12 text-center shadow-soft">
          <Check className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <p className="font-medium">
            {filtre === "en_attente" ? "Aucune activité en attente" : "Aucune activité trouvée"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Tout est à jour.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map(g => (
            <EnseignantGroup
              key={g.id}
              groupe={g}
              onAction={handleAction}
              isPending={actionMutation.isPending}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
