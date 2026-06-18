import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function ProducaoPage() {
  const { data: formularios } = await supabaseAdmin
    .from("magazine_forms")
    .select(`
      *,
      magazine_orders (
        nome,
        email,
        status
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">
        Produção Editorial
      </h1>

      <div className="overflow-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3 text-left">
                Cliente
              </th>

              <th className="border p-3 text-left">
                Empresa
              </th>

              <th className="border p-3 text-left">
                Cargo
              </th>

              <th className="border p-3 text-left">
                Tema
              </th>

              <th className="border p-3 text-left">
                Status
              </th>

              <th className="border p-3 text-left">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {formularios?.map((item: any) => (
              <tr key={item.id}>
                <td className="border p-3">
                  {item.magazine_orders?.nome}
                </td>

                <td className="border p-3">
                  {item.nome_empresa}
                </td>

                <td className="border p-3">
                  {item.cargo}
                </td>

                <td className="border p-3">
                  {item.tema_materia}
                </td>

                <td className="border p-3">
                  {item.magazine_orders?.status}
                </td>

                <td className="border p-3">
                  <a
                    href={`/editorial/revista/producao/${item.id}`}
                    className="bg-black text-white px-4 py-2 rounded"
                  >
                    Abrir
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}