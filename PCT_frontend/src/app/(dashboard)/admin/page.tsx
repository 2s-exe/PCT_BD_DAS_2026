"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle2, AlertTriangle, Download, ArrowUpRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from "recharts";

const dept = [
  { name: "Informatique", h: 4820 }, { name: "Mathématiques", h: 3950 },
  { name: "Gestion", h: 4210 },      { name: "Lettres", h: 2890 },
  { name: "Sciences éco.", h: 3640 },{ name: "Droit", h: 3120 },
];

const monthly = [
  { m: "Sep", h: 6200 }, { m: "Oct", h: 7400 }, { m: "Nov", h: 8100 },
  { m: "Déc", h: 5800 }, { m: "Jan", h: 8950 }, { m: "Fév", h: 9420 },
  { m: "Mar", h: 10120 },
];

const activity = [
  { t: "Validation lot avril", who: "Mme. Bamba (Sec.)", time: "il y a 12 min", tone: "success" },
  { t: "Dépassement détecté — Pr. Diallo", who: "Système", time: "il y a 1 h", tone: "warning" },
  { t: "Nouvel enseignant — Dr. Kouamé", who: "Admin", time: "il y a 3 h", tone: "info" },
  { t: "Export rapport mensuel mars", who: "Vous", time: "hier", tone: "default" },
];

export default function AdminDashboard() {
  return (
    <AppShell role="admin">
      <PageHeader
        title="Vue d'ensemble"
        description="Pilotage global des activités pédagogiques — Année 2024-2025"
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exporter</Button>
            <Button className="bg-gradient-primary text-white hover:opacity-95">Nouveau rapport</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enseignants"    value="1 248"    delta="+24 ce mois"   icon={Users}        tone="primary" />
        <StatCard label="Heures totales" value="84 560 h" delta="+8.2% vs N-1"  icon={Clock}        tone="info" />
        <StatCard label="Heures validées"value="72 120 h" delta="85% du volume" icon={CheckCircle2} tone="success" />
        <StatCard label="En attente"     value="1 840 h"  delta="42 activités"  icon={AlertTriangle} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="p-6 lg:col-span-2 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Heures par département</h3>
              <p className="text-xs text-muted-foreground">Cumul depuis septembre 2024</p>
            </div>
            <Badge variant="secondary">6 départements</Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={dept}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="h" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-soft">
          <h3 className="font-display font-semibold">Évolution mensuelle</h3>
          <p className="text-xs text-muted-foreground">Heures déclarées</p>
          <div className="h-56 mt-4">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="h" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Mars 2025</span>
            <span className="text-green-600 font-medium flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" /> +6.9%
            </span>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <Card className="p-6 lg:col-span-2 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Activité récente</h3>
            <Button variant="link" className="text-primary px-0">Tout voir</Button>
          </div>
          <ul className="divide-y">
            {activity.map((a, i) => (
              <li key={i} className="py-3 flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${
                  a.tone === "success" ? "bg-green-500" :
                  a.tone === "warning" ? "bg-amber-500" :
                  a.tone === "info"    ? "bg-blue-500"  : "bg-muted-foreground"
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{a.t}</div>
                  <div className="text-xs text-muted-foreground">{a.who}</div>
                </div>
                <div className="text-xs text-muted-foreground">{a.time}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 shadow-soft bg-gradient-primary text-white border-0">
          <h3 className="font-display font-semibold">Alertes en cours</h3>
          <p className="text-xs text-white/80 mt-1">3 anomalies à traiter</p>
          <div className="mt-5 space-y-3">
            {[
              { t: "Pr. Diallo — dépassement de 28h", d: "Département Informatique" },
              { t: "Dr. Konan — activité non liée",   d: "Cours non référencé" },
              { t: "Mme Yao — déclaration tardive",   d: "Décembre 2024" },
            ].map((al) => (
              <div key={al.t} className="bg-white/10 rounded-lg p-3">
                <div className="text-sm font-medium">{al.t}</div>
                <div className="text-xs text-white/70 mt-0.5">{al.d}</div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="mt-5 w-full bg-white text-primary hover:bg-white/90 border-0">
            Traiter les alertes
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
