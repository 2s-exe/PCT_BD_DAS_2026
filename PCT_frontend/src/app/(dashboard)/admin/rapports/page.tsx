"use client";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Download, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { downloadExport } from "@/lib/download";

const RAPPORTS = [
  {
    t: "État global des heures (CSV)",
    d: "Tous les enseignants, volumes prévus, réalisés et statut de validation.",
    icon: FileText,
    fn: "/exports/pdf",
    filename: "etat_heures",
  },
  {
    t: "Volumes horaires (CSV)",
    d: "Vue complète des volumes par enseignant et année académique.",
    icon: FileSpreadsheet,
    fn: "/exports/volumes",
    filename: "volumes_horaires",
  },
  {
    t: "Activités déclarées (CSV)",
    d: "Toutes les activités pédagogiques avec cours, volumes et observations.",
    icon: Users,
    fn: "/exports/activites",
    filename: "activites_declarees",
  },
];

export default function AdminRapports() {
  const [loading, setLoading] = useState<string | null>(null);

  const download = async (endpoint: string, filename: string) => {
    if (loading) return;
    setLoading(filename);
    try {
      await downloadExport(endpoint, filename);
      toast.success("Téléchargement démarré !");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(null);
    }
  };

  return (
    <AppShell role="admin">
      <PageHeader title="Rapports & Exports" description="Générez et téléchargez les états officiels" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RAPPORTS.map((r) => {
          const isLoading = loading === r.filename;
          return (
            <Card key={r.t} className="p-6 shadow-soft flex flex-col gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <r.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-sm">{r.t}</h3>
                <p className="text-xs text-muted-foreground mt-1">{r.d}</p>
              </div>
              <Button
                variant="outline"
                className="mt-auto w-full"
                disabled={!!loading}
                onClick={() => download(r.fn, r.filename)}
              >
                {isLoading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Génération...</>
                  : <><Download className="h-4 w-4 mr-2" />Télécharger</>}
              </Button>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
