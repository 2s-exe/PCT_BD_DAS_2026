"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, Clock,
  FileBarChart, Settings, CheckSquare,
  PlusCircle, Bell, Search, LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

const NAV: Record<Role, { href: string; label: string; icon: any }[]> = {
  admin: [
    { href: "/admin",             label: "Tableau de bord",  icon: LayoutDashboard },
    { href: "/admin/enseignants", label: "Enseignants",      icon: Users },
    { href: "/admin/cours",       label: "Cours & Filières", icon: BookOpen },
    { href: "/admin/activites",   label: "Activités",        icon: ClipboardList },
    { href: "/admin/heures",      label: "Suivi des heures", icon: Clock },
    { href: "/admin/rapports",    label: "Rapports",         icon: FileBarChart },
    { href: "/admin/parametres",  label: "Paramètres",       icon: Settings },
  ],
  secretaire: [
    { href: "/secretaire",              label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/secretaire/validation",   label: "Validation",      icon: CheckSquare },
    { href: "/secretaire/enseignants",  label: "Enseignants",     icon: Users },
    { href: "/secretaire/heures",       label: "Heures",          icon: Clock },
  ],
  enseignant: [
    { href: "/enseignant",             label: "Mon tableau",       icon: LayoutDashboard },
    { href: "/enseignant/declarer",    label: "Déclarer activité", icon: PlusCircle },
    { href: "/enseignant/historique",  label: "Mes activités",     icon: ClipboardList },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  admin:      "Administrateur",
  secretaire: "Secrétariat pédagogique",
  enseignant: "Enseignant",
};

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname  = usePathname();
  const { user, logout } = useAuth();
  const items     = NAV[role];
  const initials  = user
    ? `${user.enseignant?.nom?.[0] ?? ""}${user.enseignant?.prenom?.[0] ?? "A"}`.toUpperCase()
    : "U";
  const displayName = user?.enseignant
    ? `${user.enseignant.prenom} ${user.enseignant.nom}`
    : user?.login ?? "Utilisateur";

  return (
    <div className="min-h-screen flex bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-white/10 shadow-elegant">
            <Image src="/images/uvci.png" alt="UVCI" fill className="object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-sm text-white">PCT UVCI</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              {ROLE_LABEL[role]}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((it) => {
            const Icon   = it.icon;
            const active = pathname === it.href || (it.href !== `/${role}` && pathname.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-white w-full"
          >
            <LogOut className="h-3.5 w-3.5" /> Quitter la session
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-background border-b flex items-center px-4 md:px-8 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un enseignant, un cours…"
              className="pl-9 bg-muted/60 border-transparent"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l">
              <div className="text-right leading-tight">
                <div className="text-sm font-medium">{displayName}</div>
                <div className="text-[11px] text-muted-foreground">{ROLE_LABEL[role]}</div>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title, description, actions,
}: {
  title: string; description?: string; actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
