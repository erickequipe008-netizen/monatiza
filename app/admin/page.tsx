import { redirect } from "next/navigation";

// /admin sempre leva ao dashboard único (o controle de acesso é feito no AdminShell).
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
