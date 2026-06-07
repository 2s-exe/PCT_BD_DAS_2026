"use client";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  label?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ open, label, isPending, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            {label
              ? <>Supprimer <strong>{label}</strong> ? Cette action est irréversible.</>
              : "Cette action est irréversible. Voulez-vous vraiment supprimer cet élément ?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Suppression…" : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
