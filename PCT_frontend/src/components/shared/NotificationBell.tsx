"use client";
import Link from "next/link";
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "@/lib/api";

interface NotifItem {
  id: string;
  title: string;
  body: string;
  date: string;
  type: "success" | "warning" | "error" | "info";
  href: string;
}

interface NotifResponse {
  count: number;
  items: NotifItem[];
}

const TYPE_STYLE: Record<NotifItem["type"], { icon: React.ElementType; dot: string; bg: string }> = {
  success: { icon: CheckCircle2,   dot: "bg-green-500",  bg: "text-green-600" },
  warning: { icon: AlertTriangle,  dot: "bg-amber-500",  bg: "text-amber-600" },
  error:   { icon: XCircle,        dot: "bg-red-500",    bg: "text-red-600"   },
  info:    { icon: Info,           dot: "bg-blue-500",   bg: "text-blue-600"  },
};

export function NotificationBell() {
  const { data } = useQuery<NotifResponse>({
    queryKey: ["notifications"],
    queryFn: () => api.get<NotifResponse>("/notifications").then(r => r.data),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const count = data?.count ?? 0;
  const items = data?.items ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white leading-none">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {count > 0 && (
            <span className="text-xs bg-destructive/10 text-destructive font-medium px-2 py-0.5 rounded-full">
              {count} nouvelle{count > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Liste */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="divide-y">
              {items.map(item => {
                const { icon: Icon, dot, bg } = TYPE_STYLE[item.type];
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <span className={`mt-0.5 shrink-0 h-2 w-2 rounded-full ${dot} self-start mt-2`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-3.5 w-3.5 shrink-0 ${bg}`} />
                          <span className="text-xs font-semibold truncate">{item.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.body}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{item.date}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
