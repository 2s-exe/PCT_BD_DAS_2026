"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Attribution, AnneeAcademique } from "@/types";
import { useAuthStore } from "@/store/authStore";

const schema = z.object({
  id_attribution:    z.string().min(1, "Sélectionnez un cours"),
  id_annee:          z.string().min(1, "Sélectionnez une année"),
  type_operation:    z.enum(["creation", "mise_a_jour"]),
  niveau_complexite: z.enum(["simple", "intermediaire", "complexe"]),
  date_activite:     z.string().min(1, "Date requise"),
  observations:      z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DeclarerActivite() {
  const router = useRouter();
  const { user } = useAuthStore();
  const enseignantId = user?.enseignant?.id;

  const { data: attributions } = useQuery({
    queryKey: ["mes-attributions", enseignantId],
    queryFn: () =>
      api.get<{ data: Attribution[] }>(`/attributions?id_enseignant=${enseignantId}`).then(r => r.data.data),
    enabled: !!enseignantId,
  });

  const { data: annees } = useQuery({
    queryKey: ["annees"],
    queryFn: () => api.get<AnneeAcademique[]>("/annees").then(r => r.data),
  });

  const anneeActive = annees?.find(a => a.active);

  const { control, register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type_operation:    "creation",
      niveau_complexite: "simple",
      id_annee:          anneeActive ? String(anneeActive.id) : "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post("/activites", data),
    onSuccess: () => {
      toast.success("Activité déclarée avec succès !");
      router.push("/enseignant/historique");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <AppShell role="enseignant">
      <PageHeader
        title="Déclarer une activité"
        description="Enregistrez une activité pédagogique réalisée"
      />

      <Card className="w-full max-w-xl p-5 md:p-6 shadow-soft">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">

          {/* Cours */}
          <div className="space-y-2">
            <Label>Cours / Attribution *</Label>
            <Controller name="id_attribution" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez un cours" /></SelectTrigger>
                <SelectContent>
                  {attributions?.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.cours?.intitule_ecue}
                    </SelectItem>
                  ))}
                  {!attributions?.length && (
                    <SelectItem value="__none__" disabled>Aucune attribution disponible</SelectItem>
                  )}
                </SelectContent>
              </Select>
            )} />
            {errors.id_attribution && <p className="text-xs text-destructive">{errors.id_attribution.message}</p>}
          </div>

          {/* Année académique */}
          <div className="space-y-2">
            <Label>Année académique *</Label>
            <Controller name="id_annee" control={control} render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez une année" /></SelectTrigger>
                <SelectContent>
                  {annees?.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.libelle_annee}{a.active ? " (active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            {errors.id_annee && <p className="text-xs text-destructive">{errors.id_annee.message}</p>}
          </div>

          {/* Type + Complexité */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type d'opération *</Label>
              <Controller name="type_operation" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creation">Création</SelectItem>
                    <SelectItem value="mise_a_jour">Mise à jour</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-2">
              <Label>Niveau de complexité *</Label>
              <Controller name="niveau_complexite" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                    <SelectItem value="complexe">Complexe</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Date de l'activité *</Label>
            <Input type="date" {...register("date_activite")} className="w-full" />
            {errors.date_activite && <p className="text-xs text-destructive">{errors.date_activite.message}</p>}
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label>Observations <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
            <Textarea {...register("observations")} placeholder="Précisions éventuelles sur l'activité…" rows={3} />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary text-white hover:opacity-95"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Envoi en cours…" : "Déclarer l'activité"}
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
