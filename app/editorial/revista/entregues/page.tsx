import { requireEditorial } from "@/lib/editorial-auth";

export default async function EntreguesPage() {
  await requireEditorial();
  return (
    <div style={{ padding: 40 }}>
      <h1>Matérias Entregues</h1>
    </div>
  );
}