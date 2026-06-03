"use client";
import Link from "next/link";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { StatCard } from "@/components/shared/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClipboardList, CheckCircle2, Clock, Users, Check, X } from "lucide-react";

const pending = [
  { e: "Pr. Diallo",  c: "INF301 - Algorithmique",   t: "Cours magistral", h: 3, d: "Aujourd'hui" },
  { e: "Dr. Kouamé",  c: "MAT202 - Probabilités",     t: "TD",              h: 2, d: "Aujourd'hui" },
  { e: "Mme Bamba",   c: "GES101 - Intro gestion",    t: "TP",              h: 4, d: "Hier" },
  { e: "Pr. Sékou",   c: "LET102 - Linguistique",     t: "TD",              h: 2, d: "Hier" },
];

export default function SecretaireDashboard() {
  return (
    <AppShell role="secretaire">
      <PageHeader
        title="Espace secrétariat"
        description="Suivi quotidien des activités déclarées par les enseignants"
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard label="À valider"          value="42"      icon={ClipboardList} tone="warning" delta="depuis 3 jours" />
        <StatCard label="Validées (semaine)" value="186"     icon={CheckCircle2}  tone="success" delta="+12 hier" />
        <StatCard label="Heures déclarées"   value="1 240 h" icon={Clock}         tone="info"    delta="cette semaine" />
        <StatCard label="Enseignants actifs" value="218"     icon={Users}         tone="primary" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2 shadow-soft">
          <div className="p-4 md:p-5 border-b flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-display font-semibold text-sm md:text-base">À valider en priorité</h3>
              <p className="text-xs text-muted-foreground">4 activités en attente</p>
            </div>
            <Button variant="link" asChild className="text-primary shrink-0">
              <Link href="/secretaire/validation">Tout voir</Link>
            </Button>
          </div>
          <ul className="divide-y">
            {pending.map((p, i) => (
              <li key={i} className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary-soft text-primary text-xs">
                    {(p.e.split(" ").slice(-1)[0] ?? "").slice(0, 2) || "??"}

                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{p.e}</span>
                    <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{p.t}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.c} • {p.h}h • {p.d}
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-green-600 shrink-0 px-2">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive shrink-0 px-2">
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 md:p-6 shadow-soft">
          <h3 className="font-display font-semibold text-sm md:text-base">Accès rapide</h3>
          <div className="mt-4 space-y-2">
            {[
              { l: "Tous les enseignants",   href: "/secretaire/enseignants" },
              { l: "Validations en attente", href: "/secretaire/validation" },
              { l: "Suivi des heures",       href: "/secretaire/heures" },
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
