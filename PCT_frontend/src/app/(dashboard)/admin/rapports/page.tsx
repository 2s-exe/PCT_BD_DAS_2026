"use client";
import { AppShell, PageHeader } from "@/components/shared/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Download, Users } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const RAPPORTS = [
  { t: "État global des heures (PDF)",    d: "Tous les enseignants, toutes les heures de l'année en cours.", icon: FileText,        fn: "/exports/pdf",   ext: "pdf" },
  { t: "État global des heures (Excel)",  d: "Fichier Excel complet pour le service comptabilité.",          icon: FileSpreadsheet,  fn: "/exports/excel", ext: "xlsx" },
  { t: "Fiches individuelles (ZIP PDF)",  d: "Une fiche PDF par enseignant avec le détail des activités.",   icon: Users,            fn: "/exports/pdf",   ext: "pdf" },
];

export default function AdminRapports() {
  const download = async (endpoint: string, filename: string) => {
    try {
      const res = await api.get(endpoint, { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success("Téléchargement démarré !");
    } catch { toast.error("Erreur lors de la génération du rapport."); }
  };

  return (
    <AppShell role="admin">
      <PageHeader title="Rapports & Exports" description="Générez et téléchargez les états officiels" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RAPPORTS.map((r) => (
          <Card key={r.t} className="p-6 shadow-soft flex flex-col gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <r.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm">{r.t}</h3>
              <p className="text-xs text-muted-foreground mt-1">{r.d}</p>
            </div>
            <Button
              variant="outline" className="mt-auto"
              onClick={() => download(`${r.fn}?id_annee=1`, `rapport.${r.ext}`)}
            >
              <Download className="h-4 w-4 mr-2" />Générer et télécharger
            </Button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
