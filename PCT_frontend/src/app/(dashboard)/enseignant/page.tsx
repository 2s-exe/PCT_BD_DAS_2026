"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, ClipboardList, PlusCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

interface EnseignantDashboardData {
  annee?: string;
  kpis: {
    heures_realisees: number;
    heures_validees: number;
    heures_en_attente: number;
    heures_prevues: number;
    heures_complementaires: number;
    activites_en_attente: number;
  };
  recentes: {
    id: number;
    date: string;
    cours: string;
    type_operation: "creation" | "mise_a_jour";
    niveau_complexite: string;
    volume_horaire: number;
    statut_validation: "en_attente" | "valide" | "rejete";
  }[];
  par_type: { label: string; heures: number }[];
}

function fmt(n: number) {
  return Number(n || 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

export default function EnseignantDashboard() {
  const { user } = useAuthStore();
  const name = user?.enseignant
    ? `${user.enseignant.prenom} ${user.enseignant.nom}`
    : "Enseignant";

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-enseignant"],
    queryFn: () => api.get<EnseignantDashboardData>("/dashboard/enseignant").then(r => r.data),
    staleTime: 60_000,
  });

  const kpis = data?.kpis;
  const objectif = kpis?.heures_prevues ?? 0;
  const realisees = kpis?.heures_realisees ?? 0;
  const progress = objectif > 0 ? Math.min(100, Math.round((realisees / objectif) * 100)) : 0;

  return (
    <AppShell role="enseignant">
      <PageHeader
        title={`Bonjour, ${name}`}
        description={`Voici votre activité pédagogique${data?.annee ? ` pour ${data.annee}` : ""}`}
        actions={
          <Button asChild className="bg-gradient-primary text-white hover:opacity-95">
            <Link href="/enseignant/declarer">
              <PlusCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Ajouter une activité</span>
              <span className="sm:hidden">Ajouter</span>
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard label="Heures effectuées" value={isLoading ? "..." : `${fmt(kpis?.heures_realisees ?? 0)} h`} icon={Clock} tone="primary" />
        <StatCard label="Heures validées" value={isLoading ? "..." : `${fmt(kpis?.heures_validees ?? 0)} h`} icon={CheckCircle2} tone="success" />
        <StatCard label="En attente" value={isLoading ? "..." : `${fmt(kpis?.heures_en_attente ?? 0)} h`} icon={ClipboardList} tone="warning" delta={`${kpis?.activites_en_attente ?? 0} activité(s)`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 shadow-soft">
          <div className="p-4 md:p-5 border-b flex items-center justify-between gap-2">
            <h3 className="font-display font-semibold text-sm md:text-base">Mes dernières activités</h3>
            <Button variant="link" asChild className="text-primary shrink-0">
              <Link href="/enseignant/historique">Historique complet</Link>
            </Button>
          </div>
          <ul className="divide-y">
            {(data?.recentes ?? []).map((a) => (
              <li key={a.id} className="p-3 md:p-4 flex items-center gap-3">
                <div className="h-9 w-9 shrink-0 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold">
                  {(a.type_operation === "creation" ? "CR" : "MJ")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.cours}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.niveau_complexite} • {a.date}</div>
                </div>
                <div className="text-sm font-semibold shrink-0">{fmt(a.volume_horaire)}h</div>
                <div className="shrink-0 hidden sm:block">
                  {a.statut_validation === "valide" && <Badge className="bg-green-50 text-green-700 border-0">Validé</Badge>}
                  {a.statut_validation === "rejete" && <Badge className="bg-red-50 text-red-700 border-0">Rejeté</Badge>}
                  {a.statut_validation === "en_attente" && <Badge className="bg-amber-50 text-amber-700 border-0">En attente</Badge>}
                </div>
              </li>
            ))}
            {!isLoading && !data?.recentes.length && (
              <li className="p-8 text-center text-sm text-muted-foreground">Aucune activité déclarée</li>
            )}
          </ul>
        </Card>

        <Card className="p-4 md:p-6 shadow-soft">
          <h3 className="font-display font-semibold text-sm md:text-base">Volume horaire annuel</h3>
          <p className="text-xs text-muted-foreground mt-1">Objectif : {fmt(objectif)} h</p>
          <div className="mt-5">
            <div className="flex items-end justify-between mb-2">
              <span className="font-display text-3xl font-semibold text-primary">{fmt(realisees)}h</span>
              <Badge className="bg-amber-50 text-amber-700 border-0">+{fmt(kpis?.heures_complementaires ?? 0)}h compl.</Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0h</span>
              <span>{fmt(objectif)}h prévues</span>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {(data?.par_type ?? []).map((s) => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-medium">{fmt(s.heures)}h</span>
              </div>
            ))}
            {!isLoading && !data?.par_type.length && (
              <p className="text-sm text-muted-foreground">Aucune répartition disponible</p>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
