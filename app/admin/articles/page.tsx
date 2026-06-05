"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal, FileText } from "lucide-react";

import PageHeader   from "@/components/layout/PageHeader";
import { supabase } from "@/lib/supabase/client";

const CATEGORIES = ["Todos", "Negócios", "Tecnologia", "IA", "Mercado", "Brasil", "Saúde"];

export default function ArticlesPage() {
  const [articles,  setArticles]  = useState<any[]>([]);
  const [filtered,  setFiltered]  = useState<any[]>([]);
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("Todos");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = articles;
    if (search)           result = result.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()));
    if (category !== "Todos") result = result.filter(a => a.category === category);
    setFiltered(result);
  }, [search, category, articles]);

  async function load() {
    const { data } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    setArticles(data || []);
    setFiltered(data || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta matéria?")) return;
    await supabase.from("articles").delete().eq("id", id);
    load();
  }

  return (
    <>
      <PageHeader
        title="Artigos"
        description={`${articles.length} matérias publicadas`}
        action={
          <Link href="/admin/articles/new">
            <button className="
              flex items-center gap-1.5
              bg-black text-white
              px-4 py-2 rounded-xl
              text-[13px] font-semibold
              hover:opacity-80 transition
            ">
              <Plus size={14} />
              Nova matéria
            </button>
          </Link>
        }
      />

      <div className="p-8">

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar matéria..."
              className="
                w-full h-9 pl-8 pr-4
                bg-white border border-gray-200
                rounded-xl text-[13px]
                outline-none placeholder:text-gray-300
                focus:border-gray-400 transition
              "
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400" />
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`
                  px-3 py-1.5 rounded-lg
                  text-[12px] font-medium
                  transition
                  ${category === c
                    ? "bg-black text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"
                  }
                `}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-[13px] text-gray-400">Nenhuma matéria encontrada.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Título", "Categoria", "Autor", "Data", ""].map(h => (
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
                {filtered.map(a => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-6 py-3.5">
                      <p className="text-[13px] font-semibold text-black truncate max-w-[280px]">
                        {a.title}
                      </p>
                      {a.description && (
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[280px]">
                          {a.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="
                        inline-block px-2.5 py-1
                        bg-gray-100 text-gray-600
                        rounded-lg text-[11px] font-semibold
                      ">
                        {a.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="text-[12px] text-gray-500">{a.journalist_name || a.author}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="text-[12px] text-gray-400">
                        {new Date(a.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/articles/${a.id}`}>
                          <button className="
                            px-3 py-1.5 rounded-lg
                            text-[12px] font-medium
                            bg-gray-100 hover:bg-black hover:text-white
                            transition text-gray-600
                          ">
                            Editar
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="
                            p-1.5 rounded-lg
                            hover:bg-red-50 hover:text-red-500
                            text-gray-300 transition
                          "
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
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