"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import MagazineForm from "@/components/admin/MagazineForm";
import type { Magazine } from "@/types/magazine";

export default function EditMagazinePage() {
  const { id } = useParams<{ id: string }>();
  const [mag, setMag] = useState<Magazine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("magazines").select("*").eq("id", id).maybeSingle();
      setMag((data as Magazine) ?? null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <div className="h-[520px] animate-pulse rounded-2xl bg-zinc-100" />
      </div>
    );
  }
  if (!mag) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-zinc-500">Revista não encontrada.</div>;
  }
  return <MagazineForm initial={mag} />;
}
