import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthGuard } from "@/components/shared/AuthGuard";

// Server Component : protection serveur avant tout rendu JavaScript
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("pct_user")?.value;

  if (!raw) redirect("/login");

  try {
    const { state } = JSON.parse(decodeURIComponent(raw));
    if (!state?.token || !state?.user) redirect("/login");
  } catch {
    redirect("/login");
  }

  // Couche client : protection par rôle (token réactif + rôle)
  return <AuthGuard>{children}</AuthGuard>;
}
