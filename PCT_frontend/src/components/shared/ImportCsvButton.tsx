"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Download, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

interface ImportResult {
  importes: number;
  erreurs: number;
  noms_importes: string[];
  details_erreurs: { ligne: number; erreur: string }[];
}

interface Props {
  endpoint: string;
  templateUrl?: string;
  label?: string;
  onSuccess?: () => void;
}

export function ImportCsvButton({
  endpoint,
  templateUrl = "/templates/enseignants_template.csv",
  label = "Importer CSV",
  onSuccess,
}: Props) {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ImportResult | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    setLoading(true);
    try {
      const res = await api.post<ImportResult>(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
      if (res.data.importes > 0) {
        toast.success(`${res.data.importes} enseignant(s) importé(s) avec succès`);
        onSuccess?.();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFile}
      />

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {loading ? "Import…" : label}
        </Button>

        <a href={templateUrl} download>
          <Button variant="ghost" size="sm" title="Télécharger le modèle CSV">
            <Download className="h-4 w-4" />
          </Button>
        </a>
      </div>

      {/* Résultat import */}
      <Dialog open={!!result} onOpenChange={(o) => !o && setResult(null)}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Résultat de l'import</DialogTitle>
          </DialogHeader>
          {result && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-green-700">{result.importes}</div>
                    <div className="text-xs text-green-600">Importé(s)</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <div>
                    <div className="font-semibold text-red-600">{result.erreurs}</div>
                    <div className="text-xs text-red-500">Erreur(s)</div>
                  </div>
                </div>
              </div>

              {result.details_erreurs.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Détail des erreurs :</p>
                  <ul className="space-y-1 max-h-40 overflow-y-auto">
                    {result.details_erreurs.map((e, i) => (
                      <li key={i} className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                        <span className="font-medium">Ligne {e.ligne} :</span> {e.erreur}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button className="w-full" onClick={() => setResult(null)}>Fermer</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
