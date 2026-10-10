import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { adminData } from "@/lib/data";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  if (!await isAdmin()) redirect("/admin/login");
  const data = await adminData();
  return <AdminDashboard initial={data} />;
}
