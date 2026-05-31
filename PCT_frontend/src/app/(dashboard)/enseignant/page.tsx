"use client";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, ClipboardList, PlusCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const recent = [
  { d: "12/03/2025", c: "INF301 - Algorithmique",   t: "Cours magistral", h: 3, st: "valide" },
  { d: "11/03/2025", c: "INF402 - Génie logiciel",  t: "TD",              h: 2, st: "valide" },
  { d: "10/03/2025", c: "INF301 - Algorithmique",   t: "TP",              h: 4, st: "en_attente" },
  { d: "08/03/2025", c: "INF402 - Génie logiciel",  t: "Évaluation",      h: 2, st: "valide" },
];

export default function EnseignantDashboard() {
  const { user } = useAuthStore();
  const name = user?.enseignant
    ? `${user.enseignant.prenom} ${user.enseignant.nom}`
    : "Enseignant";

  return (
    <AppShell role="enseignant">
      <PageHeader
        title={`Bonjour, ${name}`}
        description="Voici votre activité pédagogique pour 2024-2025"
        actions={
          <Button asChild className="bg-gradient-primary text-white hover:opacity-95">
            <Link href="/enseignant/declarer">
              <PlusCircle className="h-4 w-4 mr-2" />Ajouter une activité
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Heures effectuées" value="268 h" icon={Clock}        tone="primary" delta="+12h cette semaine" />
        <StatCard label="Heures validées"   value="248 h" icon={CheckCircle2} tone="success" delta="92% du total" />
        <StatCard label="En attente"        value="20 h"  icon={ClipboardList} tone="warning" delta="3 activités" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 shadow-soft">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-display font-semibold">Mes dernières activités</h3>
            <Button variant="link" asChild className="text-primary">
              <Link href="/enseignant/historique">Historique complet</Link>
            </Button>
          </div>
          <ul className="divide-y">
            {recent.map((a, i) => (
              <li key={i} className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold">
                  {a.t.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.c}</div>
                  <div className="text-xs text-muted-foreground">{a.t} • {a.d}</div>
                </div>
                <div className="text-sm font-semibold">{a.h}h</div>
                {a.st === "valide"
                  ? <Badge className="bg-green-50 text-green-700 border-0">Validé</Badge>
                  : <Badge className="bg-amber-50 text-amber-700 border-0">En attente</Badge>}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 shadow-soft">
          <h3 className="font-display font-semibold">Volume horaire annuel</h3>
          <p className="text-xs text-muted-foreground mt-1">Objectif : 240 h</p>
          <div className="mt-6">
            <div className="flex items-end justify-between mb-2">
              <span className="font-display text-3xl font-semibold text-primary">268h</span>
              <Badge className="bg-amber-50 text-amber-700 border-0">+28h compl.</Badge>
            </div>
            <Progress value={100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>0h</span>
              <span>240h prévus</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            {[
              { l: "Cours magistral", v: "120h" }, { l: "TD",           v: "84h" },
              { l: "TP",              v: "48h"  }, { l: "Évaluations",  v: "16h" },
            ].map((s) => (
              <div key={s.l} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{s.l}</span>
                <span className="font-medium">{s.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
