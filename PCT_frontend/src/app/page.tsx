"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Users, BookOpen, Clock, ShieldCheck,
  CheckCircle2, BarChart3, ArrowRight, FileText, Menu, X,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#fonctionnalites" },
  { label: "Fonctionnement",  href: "#fonctionnement" },
  { label: "Rôles",           href: "#roles" },
];

const API = (process.env.NEXT_PUBLIC_API_URL ?? "https://pct-bd-das-2026-516n.onrender.com").replace(/\/$/, "");

function fmt(n: number) {
  if (n >= 1000) return `${Math.round(n / 100) / 10} k`;
  return String(n);
}

interface PublicStats { enseignants: number; cours: number; heures_total: number; heures_validees: number; volumes_en_attente: number; }

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    fetch(`${API}/public-stats`, { headers: { Accept: "application/json" } })
      .then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-2xl shadow-elegant ring-1 ring-primary/20">
              <Image src="/images/uvciL.png" alt="UVCI" fill className="object-contain" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-semibold text-sm">PCT UVCI</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:block">Gestion des heures</div>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild className="bg-gradient-primary text-white hover:opacity-95 text-sm">
              <Link href="/login">
                <span className="hidden sm:inline">Accéder à la plateforme</span>
                <span className="sm:hidden">Connexion</span>
              </Link>
            </Button>
            {/* Hamburger mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile nav sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-64 pt-12">
          <button
            className="absolute top-4 right-4 p-1 rounded hover:bg-muted"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <nav className="flex flex-col gap-1 mt-2">
            {NAV_LINKS.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-md text-sm hover:bg-muted transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="border-t mt-3 pt-3">
              <Button asChild variant="outline" className="w-full mb-2">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Se connecter</Link>
              </Button>
              <Button asChild className="w-full bg-gradient-primary text-white hover:opacity-95">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Accéder à la plateforme</Link>
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Hero */}
      <section className="bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16 md:pt-20 md:pb-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Plateforme universitaire certifiée
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mt-5 leading-[1.05]">
              Optimisez la gestion des{" "}
              <span className="text-primary">heures d&apos;enseignement</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
              Centralisez la déclaration, la validation et le calcul des volumes horaires de vos
              enseignants. Préparez vos états de paiement en quelques clics.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-gradient-primary text-white hover:opacity-95">
                <Link href="/login">
                  Accéder à la plateforme <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm sm:max-w-lg">
              {[
                { v: stats ? fmt(stats.enseignants)  : "…", l: "Enseignants" },
                { v: stats ? fmt(stats.cours)        : "…", l: "Cours actifs" },
                { v: stats ? `${fmt(stats.heures_total)} h` : "…", l: "Heures gérées" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-primary-deep">{s.v}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock dashboard — masqué sur petit mobile */}
          <div className="relative hidden sm:block">
            <div className="absolute -inset-4 bg-gradient-primary opacity-10 blur-3xl rounded-full pointer-events-none" />
            <Card className="relative shadow-elegant overflow-hidden border-border/80">
              <div className="bg-sidebar text-white p-3 sm:p-4 flex items-center gap-3">
                <div className="relative h-6 w-6 overflow-hidden rounded-md bg-white/10 shrink-0">
                  <Image src="/images/uvci.png" alt="UVCI" fill className="object-contain" />
                </div>
                <div className="text-sm font-medium truncate">Tableau de bord — Administrateur</div>
                <div className="ml-auto flex gap-1 shrink-0">
                  {[0,1,2].map(i => <span key={i} className="h-2 w-2 rounded-full bg-white/30" />)}
                </div>
              </div>
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 bg-background">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { v: stats ? fmt(stats.enseignants)           : "…", l: "Enseignants", c: "bg-primary-soft text-primary" },
                    { v: stats ? `${fmt(stats.heures_validees)} h`: "…", l: "Validées",    c: "bg-green-50 text-green-700" },
                    { v: stats ? String(stats.volumes_en_attente) : "…", l: "En attente",  c: "bg-amber-50 text-amber-700" },
                  ].map((k) => (
                    <div key={k.l} className={`rounded-lg p-2 sm:p-3 ${k.c}`}>
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-wide opacity-80">{k.l}</div>
                      <div className="font-display text-base sm:text-lg font-semibold mt-1">{k.v}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border p-3 sm:p-4">
                  <div className="text-xs text-muted-foreground mb-2 sm:mb-3">Heures par département</div>
                  <div className="flex items-end gap-1.5 sm:gap-2 h-16 sm:h-24">
                    {[55, 75, 40, 85, 60, 72, 48].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t bg-gradient-primary" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 text-xs">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-muted-foreground">24 activités validées ce matin.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">Fonctionnalités</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold mt-2">
              Une suite complète pour la direction des études
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-8 sm:mt-10">
            {[
              { i: Users,        t: "Gestion des enseignants", d: "Profils, grades, départements et taux horaires centralisés." },
              { i: BookOpen,     t: "Catalogue des cours",     d: "Filières, niveaux, semestres et volumes horaires prévisionnels." },
              { i: Clock,        t: "Suivi des heures",        d: "Calcul automatique des volumes effectués et heures complémentaires." },
              { i: CheckCircle2, t: "Validation pédagogique",  d: "Workflow secrétariat → administration avec traçabilité." },
              { i: BarChart3,    t: "Tableaux analytiques",    d: "Indicateurs par département, évolution mensuelle, alertes." },
              { i: FileText,     t: "Rapports & exports",      d: "Génération PDF/Excel pour les états de paiement." },
            ].map((f) => (
              <Card key={f.t} className="p-5 sm:p-6 border-border/60 hover:shadow-elegant transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                  <f.i className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold mt-4">{f.t}</h3>
                <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnement */}
      <section id="fonctionnement" className="py-16 md:py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">Fonctionnement</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold mt-2">
              Du déclaratif à l&apos;état de paiement, en 4 étapes
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mt-8 sm:mt-10">
            {[
              { n: "01", t: "Déclaration", d: "L'enseignant déclare ses activités pédagogiques." },
              { n: "02", t: "Validation",  d: "Le secrétariat vérifie et valide les activités." },
              { n: "03", t: "Calcul",      d: "Le système agrège les volumes et détecte les dépassements." },
              { n: "04", t: "Export",      d: "L'administration génère les états de paiement en PDF/Excel." },
            ].map((s) => (
              <Card key={s.n} className="p-4 sm:p-6 border-border/60 bg-background">
                <div className="text-primary font-display font-semibold text-lg">{s.n}</div>
                <h3 className="font-display font-semibold mt-2 sm:mt-3 text-sm sm:text-base">{s.t}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-center max-w-2xl mx-auto">
            Une expérience adaptée à chaque profil
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5 mt-8 sm:mt-10">
            {[
              { t: "Administrateur", d: "Pilotage global, gestion des utilisateurs, rapports stratégiques." },
              { t: "Secrétariat",    d: "Validation des activités, suivi par enseignant, anomalies." },
              { t: "Enseignant",     d: "Déclaration des activités, historique personnel, total des heures." },
            ].map((r) => (
              <Card key={r.t} className="p-5 sm:p-6 border-border/60">
                <div className="font-display font-semibold">{r.t}</div>
                <p className="text-sm text-muted-foreground mt-2">{r.d}</p>
                <Button variant="link" asChild className="px-0 mt-3 text-primary">
                  <Link href="/login">
                    Accéder à l&apos;espace <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Card className="bg-gradient-primary text-white p-8 sm:p-10 md:p-14 border-0 shadow-elegant">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold max-w-2xl">
              Prêt à digitaliser la gestion des heures de votre université ?
            </h2>
            <p className="mt-4 text-white/80 max-w-xl text-sm sm:text-base">
              Rejoignez les institutions qui ont choisi PCT UVCI pour fiabiliser leurs
              processus pédagogiques et administratifs.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
                <Link href="/login">Accéder à la plateforme</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/40 bg-transparent text-white hover:bg-white/10">
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <footer className="border-t py-6 sm:py-8 text-center text-xs text-muted-foreground px-4">
        © {new Date().getFullYear()} PCT UVCI — Université Virtuelle de Côte d&apos;Ivoire.
      </footer>
    </div>
  );
}
