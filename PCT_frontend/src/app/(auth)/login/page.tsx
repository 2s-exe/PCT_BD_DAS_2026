"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";

export default function LoginPage() {
  const { login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [showPwd, setShowPwd]       = useState(false);

  const handleSubmit = async () => {
    if (!loginValue || !password) return;
    setLoading(true);
    try {
      await login(loginValue, password);
      toast.success("Connexion réussie !");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">

      {/* Panneau gauche — visible seulement sur large */}
      <div className="hidden lg:flex bg-sidebar text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-900/40 blur-3xl pointer-events-none" />

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/10 shadow-elegant shrink-0">
            <Image src="/images/uvci.png" alt="UVCI" fill className="object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-lg">PCT UVCI</div>
            <div className="text-[11px] uppercase tracking-wider text-white/60">
              Gestion des heures d'enseignement
            </div>
          </div>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            La gestion académique simplifiée pour l'enseignement supérieur.
          </h2>
          <p className="mt-4 text-white/70 max-w-md">
            Une plateforme sécurisée et collaborative pour piloter les activités
            pédagogiques de l'Université Virtuelle de Côte d'Ivoire.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Connexion sécurisée — accès réservé aux adresses @uvci.edu.ci
          </div>
        </div>

        <div className="text-xs text-white/40 relative z-10">
          © {new Date().getFullYear()} UVCI — Service informatique.
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-muted/30">
        <div className="w-full max-w-md">

          {/* Logo mobile (affiché seulement sur < lg) */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-primary/10 shadow-soft shrink-0">
                <Image src="/images/uvci.png" alt="UVCI" fill className="object-contain" />
              </div>
              <div>
                <div className="font-display font-semibold text-base">PCT UVCI</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Gestion des heures
                </div>
              </div>
            </div>
          </div>

          <Card className="p-6 sm:p-8 shadow-elegant">
            <div className="hidden lg:flex items-center justify-center gap-4 mb-6">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-primary/20">
                <Image src="/images/uvci.png" alt="UVCI" fill className="object-contain" />
              </div>
              <div>
                <div className="font-display text-base font-semibold">PCT UVCI</div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  Gestion des heures d'enseignement
                </div>
              </div>
            </div>

            <h1 className="font-display text-xl sm:text-2xl font-semibold text-center">Connexion</h1>
            <p className="text-center text-xs text-muted-foreground mt-1">
              Entrez vos identifiants pour accéder à votre espace
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login">Email</Label>
                <Input
                  id="login"
                  type="email"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  placeholder="votre@uvci.edu.ci"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPwd(v => !v)}
                    tabIndex={-1}
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary text-white hover:opacity-95 mt-2"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Connexion…" : "Se connecter"}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Besoin d'aide ?{" "}
              <a href="#" className="text-primary hover:underline">
                Contactez le support
              </a>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
