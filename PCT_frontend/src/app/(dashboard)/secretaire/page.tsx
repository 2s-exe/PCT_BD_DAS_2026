"use client";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClipboardList, CheckCircle2, Clock, Users, Check, X } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import type { PaginatedResponse, VolumeHoraire } from "@/types";

interface DashboardStats {
  kpis: {
    enseignants: number;
    enseignants_actifs: number;
    heures_total: number;
    heures_validees: number;
    volumes_en_attente: number;
  };
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)} k` : String(n);
}

export default function SecretaireDashboard() {
  const qc = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<DashboardStats>("/dashboard/stats").then(r => r.data),
    staleTime: 60_000,
  });

  const { data: pending, isLoading: pendingLoading } = useQuery({
    queryKey: ["volumes-attente"],
    queryFn: () => api.get<PaginatedResponse<VolumeHoraire>>("/volumes?statut=en_attente").then(r => r.data),
  });

  const valider = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: "valide" | "rejete" }) =>
      api.post(`/volumes/${id}/valider`, { statut_validation: statut }),
    onSuccess: (_, { statut }) => {
      toast.success(statut === "valide" ? "Volume validé !" : "Volume rejeté.");
      qc.invalidateQueries({ queryKey: ["volumes-attente"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const kpis = stats?.kpis;
  const pendingRows = pending?.data.slice(0, 4) ?? [];

  return (
    <AppShell role="secretaire">
      <PageHeader
        title="Espace secrétariat"
        description="Suivi quotidien des activités déclarées par les enseignants"
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard label="À valider" value={statsLoading ? "..." : String(kpis?.volumes_en_attente ?? 0)} icon={ClipboardList} tone="warning" />
        <StatCard label="Heures validées" value={statsLoading ? "..." : `${fmt(kpis?.heures_validees ?? 0)} h`} icon={CheckCircle2} tone="success" />
        <StatCard label="Heures déclarées" value={statsLoading ? "..." : `${fmt(kpis?.heures_total ?? 0)} h`} icon={Clock} tone="info" />
        <StatCard label="Enseignants actifs" value={statsLoading ? "..." : String(kpis?.enseignants_actifs ?? 0)} icon={Users} tone="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 shadow-soft">
          <div className="p-4 md:p-5 border-b flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-sm md:text-base">À valider en priorité</h3>
              <p className="text-xs text-muted-foreground">
                {pendingLoading ? "Chargement..." : `${pending?.total ?? 0} volume(s) en attente`}
              </p>
            </div>
            <Button variant="link" asChild className="text-primary shrink-0">
              <Link href="/secretaire/validation">Tout voir</Link>
            </Button>
          </div>
          <ul className="divide-y">
            {pendingRows.map((v) => (
              <li key={v.id} className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary-soft text-primary text-xs">
                    {v.enseignant?.nom?.[0]}{v.enseignant?.prenom?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{v.enseignant?.nom_complet}</span>
                    <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                      {v.annee?.libelle_annee}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {v.heures_realisees}h réalisées sur {v.heures_prevues}h prévues
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-600 shrink-0 px-2"
                  disabled={valider.isPending}
                  onClick={() => valider.mutate({ id: v.id, statut: "valide" })}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive shrink-0 px-2"
                  disabled={valider.isPending}
                  onClick={() => valider.mutate({ id: v.id, statut: "rejete" })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
            {!pendingLoading && pendingRows.length === 0 && (
              <li className="p-8 text-center text-sm text-muted-foreground">Aucun volume en attente</li>
            )}
          </ul>
        </Card>

        <Card className="p-4 md:p-6 shadow-soft">
          <h3 className="font-display font-semibold text-sm md:text-base">Accès rapide</h3>
          <div className="mt-4 space-y-2">
            {[
              { l: "Tous les enseignants", href: "/secretaire/enseignants" },
              { l: "Validations en attente", href: "/secretaire/validation" },
              { l: "Suivi des heures", href: "/secretaire/heures" },
            ].map((x) => (
              <Link
                key={x.l}
                href={x.href}
                className="block rounded-lg border p-3 text-sm hover:border-primary/40 hover:bg-primary-soft/50 transition-colors"
              >
                {x.l}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
