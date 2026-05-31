"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginValue, password);
      toast.success("Connexion réussie !");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Panneau gauche */}
      <div className="hidden lg:flex bg-sidebar text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-blue-900/40 blur-3xl" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/10 shadow-elegant">
            <Image src="/images/uvci.png" alt="UVCI" fill className="object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-lg">PCT UVCI</div>
            <div className="text-[11px] uppercase tracking-wider text-white/60">
              Gestion des heures d'enseignement
            </div>
          </div>
        </Link>

        <div className="relative">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            La gestion académique simplifiée pour l'enseignement supérieur.
          </h2>
          <p className="mt-4 text-white/70 max-w-md">
            Une plateforme sécurisée et collaborative pour piloter les activités
            pédagogiques de l'Université Virtuelle de Côte d'Ivoire.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs text-white/60">
            <ShieldCheck className="h-4 w-4" />
            Connexion sécurisée — accès réservé aux adresses @uvci.edu.ci
          </div>
        </div>

        <div className="text-xs text-white/40 relative">
          © {new Date().getFullYear()} UVCI — Service informatique.
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-muted/30">
        <div className="w-full max-w-md">

          <Card className="p-8 shadow-elegant">
            <div className="flex flex-col items-center justify-center gap-3 mb-6 text-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-primary/20">
                <Image src="/images/uvci.png" alt="UVCI" fill className="object-contain" />
              </div>
              <div>
                <div className="font-display text-lg font-semibold">PCT UVCI</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Gestion des heures d'enseignement
                </div>
              </div>
            </div>

            <h1 className="font-display text-2xl font-semibold text-center">Connexion</h1>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Email</Label>
                <Input
                  id="login"
                  type="email"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  placeholder="votre@uvci.edu.ci"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary text-white hover:opacity-95"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Connexion…" : "Se connecter"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
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