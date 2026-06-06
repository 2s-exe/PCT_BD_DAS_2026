"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, Clock,
  FileBarChart, Settings, CheckSquare,
  PlusCircle, Search, LogOut, UserCog, Menu,
  Building2, Link2, CalendarRange, KeyRound,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { ChangePasswordDialog } from "@/components/shared/ChangePasswordDialog";
import { NotificationBell } from "@/components/shared/NotificationBell";
import type { Role } from "@/types";

const NAV: Record<Role, { href: string; label: string; icon: LucideIcon }[]> = {
  admin: [
    { href: "/admin",               label: "Tableau de bord",  icon: LayoutDashboard },
    { href: "/admin/enseignants",   label: "Enseignants",      icon: Users },
    { href: "/admin/secretaires",   label: "Secrétaires",      icon: UserCog },
    { href: "/admin/departements",  label: "Départements",     icon: Building2 },
    { href: "/admin/cours",         label: "Cours & Filières", icon: BookOpen },
    { href: "/admin/attributions",  label: "Attributions",     icon: Link2 },
    { href: "/admin/annees",        label: "Années académiques", icon: CalendarRange },
    { href: "/admin/activites",     label: "Activités",        icon: ClipboardList },
    { href: "/admin/heures",        label: "Suivi des heures", icon: Clock },
    { href: "/admin/rapports",      label: "Rapports",         icon: FileBarChart },
    { href: "/admin/parametres",    label: "Paramètres",       icon: Settings },
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

function NavLinks({ role, pathname, onNavigate }: { role: Role; pathname: string; onNavigate?: () => void }) {
  const items = NAV[role];
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {items.map((it) => {
        const Icon   = it.icon;
        const active = pathname === it.href || (it.href !== `/${role}` && pathname.startsWith(it.href));
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarHeader({ role }: { role: Role }) {
  return (
    <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border shrink-0">
      <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-white/10 shadow-elegant shrink-0">
        <Image src="/images/uvci.png" alt="UVCI" fill className="object-contain" />
      </div>
      <div className="leading-tight">
        <div className="font-display font-semibold text-sm text-white">PCT UVCI</div>
        <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
          {ROLE_LABEL[role]}
        </div>
      </div>
    </div>
  );
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const pathname  = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pwDialog, setPwDialog] = useState(false);

  // Guard: if authenticated user's role doesn't match the shell's expected role,
  // render nothing — middleware + AuthGuard should already prevent this path.
  if (user && user.role !== role) return null;

  const initials = user
    ? `${user.enseignant?.nom?.[0] ?? ""}${user.enseignant?.prenom?.[0] ?? "A"}`.toUpperCase()
    : "U";
  const displayName = user?.enseignant
    ? `${user.enseignant.prenom} ${user.enseignant.nom}`
    : user?.login ?? "Utilisateur";

  return (
    <div className="min-h-screen flex bg-muted/40">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SidebarHeader role={role} />
        <NavLinks role={role} pathname={pathname} />
        <div className="p-4 border-t border-sidebar-border shrink-0 space-y-2">
          <button
            onClick={() => setPwDialog(true)}
            className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-white w-full"
          >
            <KeyRound className="h-3.5 w-3.5" /> Modifier mon mot de passe
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-white w-full"
          >
            <LogOut className="h-3.5 w-3.5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Sidebar mobile (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-0">
          <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
          <SidebarHeader role={role} />
          <NavLinks role={role} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <button
              onClick={() => { setMobileOpen(false); setPwDialog(true); }}
              className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-white w-full"
            >
              <KeyRound className="h-3.5 w-3.5" /> Modifier mon mot de passe
            </button>
            <button
              onClick={() => { setMobileOpen(false); logout(); }}
              className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-white w-full"
            >
              <LogOut className="h-3.5 w-3.5" /> Déconnexion
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-background border-b flex items-center px-4 md:px-8 gap-3 shrink-0">
          {/* Hamburger mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher…"
              className="pl-9 bg-muted/60 border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-3 pl-3 border-l hover:opacity-80 transition-opacity outline-none">
                  <div className="text-right leading-tight">
                    <div className="text-sm font-medium truncate max-w-[120px]">{displayName}</div>
                    <div className="text-[11px] text-muted-foreground">{ROLE_LABEL[role]}</div>
                  </div>
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setPwDialog(true)}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Modifier mon mot de passe
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</main>
      </div>

      <ChangePasswordDialog open={pwDialog} onClose={() => setPwDialog(false)} />
    </div>
  );
}

export function PageHeader({
  title, description, actions,
}: {
  title: string; description?: string; actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>
      )}
    </div>
  );
}
