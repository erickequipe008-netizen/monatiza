"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, MoreHorizontal } from "lucide-react";

import PageHeader   from "@/components/layout/PageHeader";
import { supabase } from "@/lib/supabase/client";

export default function JournalistsPage() {
  const [journalists, setJournalists] = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from("journalists")
      .select("*, articles(count)")
      .order("created_at", { ascending: false });

    setJournalists(data || []);
    setLoading(false);
  }

  return (
    <>
      <PageHeader
        title="Jornalistas"
        description={`${journalists.length} profissionais cadastrados`}
        action={
          <Link href="/admin/journalists/new">
            <button className="
              flex items-center gap-1.5
              bg-black text-white
              px-4 py-2 rounded-xl
              text-[13px] font-semibold
              hover:opacity-80 transition
            ">
              <Plus size={14} />
              Adicionar
            </button>
          </Link>
        }
      />

      <div className="p-8">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
          ) : journalists.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-[13px] text-gray-400">Nenhum jornalista cadastrado.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Jornalista", "Nome Público", "E-mail", "Matérias", ""].map(h => (
                    <th key={h} className="
                      px-6 py-3 text-left
                      text-[11px] font-semibold
                      text-gray-400 uppercase tracking-wide
                    ">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {journalists.map(j => (
                  <tr
                    key={j.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {j.avatar_url ? (
                          <img
                            src={j.avatar_url}
                            alt={j.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="
                            w-8 h-8 rounded-full
                            bg-gray-100 flex items-center justify-center
                            text-[12px] font-bold text-gray-500
                          ">
                            {j.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <span className="text-[13px] font-semibold text-black">
                          {j.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-gray-500">
                        {j.display_name || "—"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[12px] text-gray-400">{j.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="
                        inline-block px-2.5 py-1
                        bg-gray-100 rounded-lg
                        text-[11px] font-semibold text-gray-500
                      ">
                        {j.articles?.[0]?.count ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/journalists/${j.id}`}>
                        <button className="
                          p-1.5 rounded-lg
                          hover:bg-gray-100 text-gray-400 hover:text-black
                          transition
                        ">
                          <MoreHorizontal size={15} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}