"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HeuresError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/admin/heures] Client error:", error.name, error.message, error.stack);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
      <h2 className="text-xl font-semibold text-destructive">Erreur sur la page Suivi des heures</h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Une erreur s'est produite lors du chargement. Ouvrez la console du navigateur (F12) pour voir les détails.
      </p>
      <code className="text-xs bg-muted px-3 py-2 rounded max-w-lg break-all">
        {error.message || "Erreur inconnue"}
      </code>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
