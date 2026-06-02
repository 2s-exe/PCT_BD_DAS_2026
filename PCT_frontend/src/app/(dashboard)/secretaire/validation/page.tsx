"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import type { PaginatedResponse, VolumeHoraire } from "@/types";

export default function SecretaireValidation() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["volumes-attente"],
    queryFn: () => api.get<PaginatedResponse<VolumeHoraire>>("/volumes?statut=en_attente").then(r => r.data),
  });

  const valider = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: "valide" | "rejete" }) =>
      api.post(`/volumes/${id}/valider`, { statut_validation: statut }),
    onSuccess: (_, { statut }) => {
      toast.success(statut === "valide" ? "Volume validé !" : "Volume rejeté.");
      qc.invalidateQueries({ queryKey: ["volumes-attente"] });
    },
  });

  return (
    <AppShell role="secretaire">
      <PageHeader
        title="Validation des heures"
        description="Volumes horaires en attente de validation"
      />
      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Chargement…</div>
      ) : (
        <div className="space-y-4">
          {data?.data.map((v) => (
            <Card key={v.id} className="p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary-soft text-primary text-xs">
                    {v.enseignant?.nom[0]}{v.enseignant?.prenom[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{v.enseignant?.nom_complet}</span>
                    <Badge variant="outline">{v.annee?.libelle_annee}</Badge>
                    <Badge className="bg-amber-50 text-amber-700 border-0">En attente</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Prévues</span>
                      <div className="font-semibold">{v.heures_prevues}h</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Réalisées</span>
                      <div className="font-semibold">{v.heures_realisees}h</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Complémentaires</span>
                      <div className={`font-semibold ${v.heures_complementaires > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {v.heures_complementaires > 0 ? `+${v.heures_complementaires}h` : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => valider.mutate({ id: v.id, statut: "valide" })}
                      disabled={valider.isPending}
                    >
                      <Check className="h-4 w-4 mr-1" />Valider
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/5"
                      onClick={() => valider.mutate({ id: v.id, statut: "rejete" })}
                      disabled={valider.isPending}
                    >
                      <X className="h-4 w-4 mr-1" />Rejeter
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {!data?.data.length && (
            <Card className="p-12 text-center shadow-soft">
              <Check className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <p className="font-medium">Aucun volume en attente</p>
              <p className="text-sm text-muted-foreground mt-1">Tout est à jour.</p>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
