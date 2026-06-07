"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

function ResetPasswordForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const token        = params.get("token") ?? "";
  const emailParam   = params.get("email") ?? "";

  const [password,     setPassword]     = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [loading,      setLoading]      = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmation) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/reset-password", {
        token,
        email:                 emailParam,
        password,
        password_confirmation: confirmation,
      });
      toast.success("Mot de passe réinitialisé ! Vous pouvez vous connecter.");
      router.push("/login");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8 shadow-elegant">
      <h1 className="font-display text-xl sm:text-2xl font-semibold">Nouveau mot de passe</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Choisissez un mot de passe d&apos;au moins 8 caractères.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Nouveau mot de passe</Label>
          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPwd(v => !v)}
              tabIndex={-1}
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Confirmer le mot de passe</Label>
          <Input
            type="password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-primary text-white hover:opacity-95"
          disabled={loading || !token}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
        </Button>
        {!token && (
          <p className="text-xs text-destructive text-center">
            Lien invalide. Veuillez redemander un email de réinitialisation.
          </p>
        )}
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-muted-foreground">Chargement…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
