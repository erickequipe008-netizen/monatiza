import { redirect } from "next/navigation";

// /admin/login não é mais usado (o login é em /login, que roteia por papel).
export default function AdminLoginRedirect() {
  redirect("/admin/dashboard");
}
