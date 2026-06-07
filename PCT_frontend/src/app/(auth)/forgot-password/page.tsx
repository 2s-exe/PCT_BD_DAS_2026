"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md">
        <Card className="p-6 sm:p-8 shadow-elegant">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <MailCheck className="h-7 w-7 text-green-600" />
                </div>
              </div>
              <h1 className="font-display text-xl font-semibold">Email envoyé</h1>
              <p className="text-sm text-muted-foreground">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <Button asChild className="w-full mt-2">
                <Link href="/login">Retour à la connexion</Link>
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
              <h1 className="font-display text-xl sm:text-2xl font-semibold">Mot de passe oublié</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Entrez votre email institutionnel pour recevoir un lien de réinitialisation.
              </p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email institutionnel</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@uvci.edu.ci"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary text-white hover:opacity-95"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
