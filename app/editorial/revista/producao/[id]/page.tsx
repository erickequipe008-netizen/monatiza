import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function BriefingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("magazine_forms")
    .select(`
      *,
      magazine_orders (
        nome,
        email,
        telefone,
        plano,
        status
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
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

      <div className="bg-white border rounded p-6 space-y-6">

        <div>
          <h2 className="font-bold text-xl mb-2">
            Dados do Cliente
          </h2>

          <p>
            <strong>Nome:</strong>{" "}
            {data.magazine_orders?.nome}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {data.magazine_orders?.email}
          </p>

          <p>
            <strong>Plano:</strong>{" "}
            {data.magazine_orders?.plano}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {data.magazine_orders?.status}
          </p>
        </div>

        <hr />

        <div>
          <h2 className="font-bold text-xl mb-2">
            Empresa
          </h2>

          <p>
            <strong>Empresa:</strong>{" "}
            {data.nome_empresa}
          </p>

          <p>
            <strong>Cargo:</strong>{" "}
            {data.cargo}
          </p>

          <p>
            <strong>WhatsApp:</strong>{" "}
            {data.whatsapp}
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
            <strong>Site:</strong>{" "}
            {data.site}
          </p>
        </div>

        <hr />

        <div>
          <h2 className="font-bold text-xl mb-2">
            Tema da Matéria
          </h2>

          <p>{data.tema_materia}</p>
        </div>

        <hr />

        <div>
          <h2 className="font-bold text-xl mb-2">
            Biografia
          </h2>

          <p>{data.biografia}</p>
        </div>

        <hr />

        <div>
          <h2 className="font-bold text-xl mb-2">
            Observações
          </h2>

          <p>{data.observacoes}</p>
        </div>

      </div>
    </div>
  );
}