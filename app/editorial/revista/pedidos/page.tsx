
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function PedidosRevista() {

  const { data: pedidos, error } =
    await supabaseAdmin
      .from("magazine_orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  console.log("PEDIDOS:", pedidos);
  console.log("ERROR:", error);

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Pedidos da Revista
      </h1>

      <div className="overflow-x-auto">

        <table className="w-full border">

          <thead>
            <tr className="bg-zinc-100">
              <th className="p-3 text-left">
                Nome
              </th>

              <th className="p-3 text-left">
                Email
              </th>

              <th className="p-3 text-left">
                Plano
              </th>

              <th className="p-3 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>

            {pedidos?.map((pedido: any) => (
              <tr
                key={pedido.id}
                className="border-t"
              >
                <td className="p-3">
                  {pedido.nome}
                </td>

                <td className="p-3">
                  {pedido.email}
                </td>

                <td className="p-3">
                  {pedido.plano}
                </td>

                <td className="p-3">
                  {pedido.status}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

