import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SecretaireLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("pct_user")?.value;
  if (!raw) redirect("/login");

  try {
    const { state } = JSON.parse(decodeURIComponent(raw));
    if (state?.user?.role !== "secretaire") redirect("/login");
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}
