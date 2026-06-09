"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

const schema = z.object({
  current_password:          z.string().min(1, "Requis"),
  new_password:              z.string().min(6, "Minimum 6 caractères"),
  new_password_confirmation: z.string().min(1, "Requis"),
}).refine(d => d.new_password === d.new_password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["new_password_confirmation"],
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordDialog({ open, onClose }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post("/change-password", data),
    onSuccess: () => {
      toast.success("Mot de passe modifié avec succès.");
      onClose();
    },
    onError: (error: unknown) => {
      // Afficher l'erreur du mot de passe actuel directement dans le champ
      const err = error as { response?: { data?: { errors?: Record<string, string[]> } } };
      if (err.response?.data?.errors?.current_password) {
        setError("current_password", {
          message: err.response.data.errors.current_password[0],
        });
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            Modifier mon mot de passe
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(d => mutation.mutate(d))}
          className="space-y-4 py-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="current_password">Mot de passe actuel</Label>
            <Input
              id="current_password"
              type="password"
              placeholder="••••••••"
              {...register("current_password")}
            />
            {errors.current_password && (
              <p className="text-xs text-destructive">{errors.current_password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new_password">Nouveau mot de passe</Label>
            <Input
              id="new_password"
              type="password"
              placeholder="••••••••"
              {...register("new_password")}
            />
            {errors.new_password && (
              <p className="text-xs text-destructive">{errors.new_password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new_password_confirmation">Confirmer le nouveau mot de passe</Label>
            <Input
              id="new_password_confirmation"
              type="password"
              placeholder="••••••••"
              {...register("new_password_confirmation")}
            />
            {errors.new_password_confirmation && (
              <p className="text-xs text-destructive">{errors.new_password_confirmation.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-gradient-primary text-white hover:opacity-95"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Enregistrement…" : "Modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
