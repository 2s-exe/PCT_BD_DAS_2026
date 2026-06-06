"use client";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { downloadExport } from "@/lib/download";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";

interface DashboardStats {
  kpis: {
    enseignants: number;
    enseignants_actifs: number;
    heures_total: number;
    heures_validees: number;
    volumes_en_attente: number;
  };
  par_departement: { name: string; h: number }[];
  evolution_mensuelle: { m: string; h: number }[];
  activites_recentes: { id: number; titre: string; who: string; date: string; tone: string }[];
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)} k` : String(n);
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<DashboardStats>("/dashboard/stats").then(r => r.data),
    staleTime: 60_000,
  });

  const kpis = data?.kpis;
  const pctValidees = kpis && kpis.heures_total > 0
    ? Math.round((kpis.heures_validees / kpis.heures_total) * 100)
    : 0;

  return (
    <AppShell role="admin">
      <PageHeader
        title="Vue d'ensemble"
        description="Pilotage global des activités pédagogiques"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadExport("/exports/excel", "etat_heures").catch(e => toast.error(getErrorMessage(e)))}
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
            <Button asChild className="bg-gradient-primary text-white hover:opacity-95" size="sm">
              <Link href="/admin/rapports">
                <span className="hidden sm:inline">Nouveau rapport</span>
                <span className="sm:hidden">Rapport</span>
              </Link>
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Enseignants"
          value={isLoading ? "…" : String(kpis?.enseignants ?? 0)}
          delta={`${kpis?.enseignants_actifs ?? 0} actifs`}
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Heures totales"
          value={isLoading ? "…" : `${fmt(kpis?.heures_total ?? 0)} h`}
          delta="heures réalisées"
          icon={Clock}
          tone="info"
        />
        <StatCard
          label="Validées"
          value={isLoading ? "…" : `${fmt(kpis?.heures_validees ?? 0)} h`}
          delta={`${pctValidees}% du volume`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="En attente"
          value={isLoading ? "…" : String(kpis?.volumes_en_attente ?? 0)}
          delta="volumes à valider"
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      {/* Graphiques */}
      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="p-4 md:p-6 lg:col-span-2 shadow-soft">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="font-display font-semibold text-sm md:text-base">Heures par département</h3>
              <p className="text-xs text-muted-foreground">Cumul volumes horaires réalisés</p>
            </div>
            <Badge variant="secondary">{data?.par_departement.length ?? 0} départements</Badge>
          </div>
          <div className="h-56 md:h-72">
            <ResponsiveContainer>
              <BarChart data={data?.par_departement ?? []} margin={{ left: -10, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v} h`, "Heures"]} />
                <Bar dataKey="h" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 md:p-6 shadow-soft">
          <h3 className="font-display font-semibold text-sm md:text-base">Évolution mensuelle</h3>
          <p className="text-xs text-muted-foreground">VHN déclarés (12 derniers mois)</p>
          <div className="h-44 md:h-56 mt-4">
            <ResponsiveContainer>
              <LineChart data={data?.evolution_mensuelle ?? []} margin={{ left: -10, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v} h`, "VHN"]} />
                <Line type="monotone" dataKey="h" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Activité récente */}
      <div className="mt-6">
        <Card className="p-4 md:p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm md:text-base">Activité récente</h3>
          </div>
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">Chargement…</div>
          ) : (
            <ul className="divide-y">
              {(data?.activites_recentes ?? []).map((a) => (
                <li key={a.id} className="py-3 flex items-center gap-3">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.titre}</div>
                    <div className="text-xs text-muted-foreground">{a.who}</div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">{a.date}</div>
                </li>
              ))}
              {!data?.activites_recentes?.length && (
                <li className="py-6 text-center text-sm text-muted-foreground">Aucune activité récente</li>
              )}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
