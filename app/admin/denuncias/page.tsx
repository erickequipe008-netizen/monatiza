"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag, Trash2, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface ReportRow {
  id: number;
  reporter_id: string;
  post_id: number;
  reason: string | null;
  status: string;
  created_at: string;
  post?: { id: number; content: string; image_url: string | null; user_id: string } | null;
  author?: { handle: string | null; display_name: string | null } | null;
  reporter?: { handle: string | null; display_name: string | null } | null;
}

// Moderação de denúncias da comunidade (RLS: só admin lê/resolve;
// admin também pode excluir qualquer publicação).
export default function DenunciasPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    const { data: reports } = await supabase
      .from("reports")
      .select("id, reporter_id, post_id, reason, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(100);
    const list = (reports || []) as ReportRow[];

    if (list.length) {
      const postIds = [...new Set(list.map((r) => r.post_id))];
      const userIds = [...new Set(list.map((r) => r.reporter_id))];
      const { data: posts } = await supabase
        .from("posts")
        .select("id, content, image_url, user_id")
        .in("id", postIds);
      const authorIds = [...new Set((posts || []).map((p: any) => p.user_id))];
      const { data: profs } = await supabase
        .from("community_profiles")
        .select("user_id, handle, display_name")
        .in("user_id", [...new Set([...userIds, ...authorIds])]);
      const pmap = new Map((posts || []).map((p: any) => [p.id, p]));
      const umap = new Map((profs || []).map((p: any) => [p.user_id, p]));
      list.forEach((r) => {
        r.post = pmap.get(r.post_id) || null;
        r.author = r.post ? umap.get(r.post.user_id) || null : null;
        r.reporter = umap.get(r.reporter_id) || null;
      });
    }
    setRows(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(r: ReportRow, removePost: boolean) {
    setBusy(r.id);
    if (removePost && r.post) {
      await supabase.from("posts").delete().eq("id", r.post.id);
    }
    await supabase
      .from("reports")
      .update({ status: removePost ? "resolved" : "dismissed" })
      .eq("id", r.id);
    setBusy(null);
    load();
  }

  return (
    <div className="mx-auto max-w-[860px] px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-black">
        <Flag size={20} className="text-[#E0263B]" /> Denúncias
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Publicações denunciadas pela comunidade. Remova o conteúdo ou ignore a denúncia.
      </p>

      {loading ? (
        <div className="flex justify-center py-16 text-zinc-400">
          <Loader2 className="animate-spin" size={22} />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-16 text-center text-zinc-500 dark:border-zinc-700">
          Nenhuma denúncia pendente. 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[13px] text-zinc-500">
                <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 font-bold text-red-500">pendente</span>
                <span>
                  Denunciado por <b>@{r.reporter?.handle || "membro"}</b> ·{" "}
                  {new Date(r.created_at).toLocaleString("pt-BR")}
                </span>
              </div>

              {r.reason && <p className="mb-3 text-[14px] italic text-zinc-500">Motivo: “{r.reason}”</p>}

              {r.post ? (
                <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
                  <p className="mb-1 text-[13px] font-bold">@{r.author?.handle || "membro"}</p>
                  {r.post.content && <p className="text-[14px]">{r.post.content}</p>}
                  {r.post.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.post.image_url} alt="" className="mt-2 max-h-56 rounded-lg" />
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Publicação já removida.</p>
              )}

              <div className="mt-4 flex gap-3">
                {r.post && (
                  <button
                    onClick={() => resolve(r, true)}
                    disabled={busy === r.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#E0263B] px-4 py-2 text-[13px] font-bold text-white transition hover:bg-[#b91d2f] disabled:opacity-60"
                  >
                    <Trash2 size={14} /> Remover publicação
                  </button>
                )}
                <button
                  onClick={() => resolve(r, false)}
                  disabled={busy === r.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-4 py-2 text-[13px] font-bold transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  <Check size={14} /> Ignorar denúncia
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
