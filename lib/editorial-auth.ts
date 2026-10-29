import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Guarda do painel editorial (server-side).
 * Só libera quem tem o cookie de sessão com o token secreto (EDITORIAL_TOKEN),
 * definido no login após a senha correta. O valor do cookie NÃO é adivinhável
 * (token aleatório guardado só em variável de ambiente). Sem cookie válido → login.
 */
export async function requireEditorial() {
  const token = (await cookies()).get("editorial-token")?.value;
  const expected = process.env.EDITORIAL_TOKEN;
  if (!expected || !token || token !== expected) {
    redirect("/editorial/revista/login");
  }
}
