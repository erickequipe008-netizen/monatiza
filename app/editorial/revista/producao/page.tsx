import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function BriefingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabaseAdmin
    .from("magazine_forms")
    .select(`
      *,
      magazine_orders (
        nome,
        email,
        telefone,
        status
      )
    `)
    .eq("id", id)
    .single();

  if (!data) {
    return (
      <div className="p-10">
        Briefing não encontrado
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-4xl font-bold mb-8">
        Briefing Editorial
      </h1>

      <div className="space-y-2 mb-8">
        <p>
          <strong>Cliente:</strong>{" "}
          {data.magazine_orders?.nome}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {data.magazine_orders?.email}
        </p>

        <p>
          <strong>Empresa:</strong>{" "}
          {data.nome_empresa}
        </p>

        <p>
          <strong>Cargo:</strong>{" "}
          {data.cargo}
        </p>

        <p>
          <strong>Instagram:</strong>{" "}
          {data.instagram}
        </p>

        <p>
          <strong>LinkedIn:</strong>{" "}
          {data.linkedin}
        </p>

        <p>
          <strong>WhatsApp:</strong>{" "}
          {data.whatsapp}
        </p>

        <p>
          <strong>Site:</strong>{" "}
          {data.site}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3">
          Biografia
        </h2>

        <div className="border p-4 rounded">
          {data.biografia}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3">
          Tema da Matéria
        </h2>

        <div className="border p-4 rounded">
          {data.tema_materia}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3">
          Observações
        </h2>

        <div className="border p-4 rounded">
          {data.observacoes}
        </div>
      </div>
    </div>
  );
}