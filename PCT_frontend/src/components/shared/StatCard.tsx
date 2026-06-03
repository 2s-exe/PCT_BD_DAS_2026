"use client";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

type Tone = "primary" | "success" | "warning" | "info" | "danger";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  info:    "bg-blue-50 text-blue-700",
  danger:  "bg-red-50 text-red-700",
};

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: Tone;
}

export function StatCard({ label, value, delta, icon: Icon, tone = "primary" }: StatCardProps) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="font-display text-2xl font-semibold mt-1">{value}</p>
          {delta && <p className="text-xs text-muted-foreground mt-1">{delta}</p>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
