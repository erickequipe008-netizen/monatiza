import { supabase } from "@/lib/supabase/client";

// Faz upload de mídia da comunidade no bucket "community".
// Caminho sempre começa com o user_id → a RLS do storage só deixa o
// dono gravar na própria pasta. Retorna a URL pública (bucket público).
export async function uploadMedia(
  file: File,
  kind: "avatars" | "covers" | "posts" | "reels"
): Promise<{ url: string | null; error: string | null }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const uid = session?.user.id;
  if (!uid) return { url: null, error: "Não autenticado" };

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${uid}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from("community").upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) return { url: null, error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("community").getPublicUrl(path);
  return { url: publicUrl, error: null };
}
