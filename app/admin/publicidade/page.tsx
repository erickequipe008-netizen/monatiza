"use client";

import { useEffect, useState } from "react";
import {
  ImageIcon,
  Link2,
  Monitor,
  Smartphone,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type CommercialAd = {
  id: number;
  position: number;
  name: string;
  desktop_image_url: string | null;
  mobile_image_url: string | null;
  target_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export default function PublicidadePage() {
  const [ads, setAds] = useState<CommercialAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAds();
  }, []);

  async function loadAds() {
    setLoading(true);

    const { data, error } = await supabase
      .from("commercial_ads")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("Não foi possível carregar os espaços comerciais.");
    } else {
      setAds((data || []) as CommercialAd[]);
    }

    setLoading(false);
  }

  function updateLocal(
    id: number,
    field: keyof CommercialAd,
    value: string | boolean
  ) {
    setAds((current) =>
      current.map((ad) =>
        ad.id === id
          ? {
              ...ad,
              [field]: value,
            }
          : ad
      )
    );
  }

  async function uploadImage(
    ad: CommercialAd,
    file: File,
    type: "desktop" | "mobile"
  ) {
    setMessage("");

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const path = `position-${ad.position}/${type}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("commercial-ads")
      .upload(path, file, {
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      setMessage("Erro ao enviar a imagem.");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("commercial-ads")
      .getPublicUrl(path);

    const field =
      type === "desktop"
        ? "desktop_image_url"
        : "mobile_image_url";

    updateLocal(ad.id, field, publicUrl);

    setMessage(
      `Arte ${
        type === "desktop" ? "desktop" : "mobile"
      } enviada. Clique em Salvar alterações.`
    );
  }

  async function saveAd(ad: CommercialAd) {
    setSaving(ad.id);
    setMessage("");

    const { error } = await supabase
      .from("commercial_ads")
      .update({
        name: ad.name,
        desktop_image_url: ad.desktop_image_url,
        mobile_image_url: ad.mobile_image_url,
        target_url: ad.target_url,
        active: ad.active,
      })
      .eq("id", ad.id);

    if (error) {
      console.error(error);
      setMessage("Erro ao salvar o espaço comercial.");
    } else {
      setMessage(`Espaço Comercial ${ad.position} salvo com sucesso.`);
    }

    setSaving(null);
  }

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 size={18} className="animate-spin" />
          Carregando publicidade...
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
      <div className="mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#E0263B]">
          Monetização
        </p>

        <h1 className="mt-2 text-2xl md:text-3xl font-black tracking-tight text-zinc-950">
          Publicidade
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          Gerencie os dois espaços comerciais próprios da página inicial da
          Monatiza. Você pode vender esses espaços diretamente para seus
          anunciantes.
        </p>
      </div>

      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700">
          <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
          {message}
        </div>
      )}

      <div className="space-y-8">
        {ads.map((ad) => (
          <section
            key={ad.id}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-zinc-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E0263B] text-xs font-black text-white">
                    {ad.position}
                  </span>

                  <h2 className="text-lg font-black text-zinc-950">
                    Espaço Comercial {ad.position}
                  </h2>
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  Posição publicitária própria da Home.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <span
                  className={`text-xs font-bold ${
                    ad.active ? "text-emerald-600" : "text-zinc-400"
                  }`}
                >
                  {ad.active ? "ATIVO" : "INATIVO"}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    updateLocal(ad.id, "active", !ad.active)
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    ad.active ? "bg-emerald-500" : "bg-zinc-300"
                  }`}
                  aria-label={
                    ad.active
                      ? "Desativar anúncio"
                      : "Ativar anúncio"
                  }
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      ad.active ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="p-5 md:p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-zinc-700">
                    Nome do anunciante / campanha
                  </label>

                  <input
                    type="text"
                    value={ad.name}
                    onChange={(e) =>
                      updateLocal(ad.id, "name", e.target.value)
                    }
                    placeholder="Ex.: Campanha Empresa XYZ"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold text-zinc-700">
                    <Link2 size={14} />
                    Link de destino
                  </label>

                  <input
                    type="url"
                    value={ad.target_url || ""}
                    onChange={(e) =>
                      updateLocal(
                        ad.id,
                        "target_url",
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Monitor size={18} />

                    <div>
                      <h3 className="text-sm font-black text-zinc-900">
                        Arte para computador
                      </h3>

                      <p className="text-[11px] text-zinc-500">
                        Banner horizontal para telas maiores.
                      </p>
                    </div>
                  </div>

                  {ad.desktop_image_url ? (
                    <div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ad.desktop_image_url}
                        alt={`Arte desktop do espaço ${ad.position}`}
                        className="aspect-[16/5] w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 flex aspect-[16/5] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white">
                      <div className="text-center text-zinc-400">
                        <ImageIcon
                          size={24}
                          className="mx-auto mb-2"
                        />
                        <span className="text-xs">
                          Nenhuma arte enviada
                        </span>
                      </div>
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-zinc-800">
                    <Upload size={15} />
                    Enviar arte desktop

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          uploadImage(ad, file, "desktop");
                        }

                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Smartphone size={18} />

                    <div>
                      <h3 className="text-sm font-black text-zinc-900">
                        Arte para celular
                      </h3>

                      <p className="text-[11px] text-zinc-500">
                        Arte otimizada para telas mobile.
                      </p>
                    </div>
                  </div>

                  {ad.mobile_image_url ? (
                    <div className="mx-auto mb-4 max-w-[230px] overflow-hidden rounded-xl border border-zinc-200 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ad.mobile_image_url}
                        alt={`Arte mobile do espaço ${ad.position}`}
                        className="aspect-[4/5] w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mx-auto mb-4 flex aspect-[4/5] max-w-[230px] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white">
                      <div className="text-center text-zinc-400">
                        <ImageIcon
                          size={24}
                          className="mx-auto mb-2"
                        />
                        <span className="text-xs">
                          Nenhuma arte enviada
                        </span>
                      </div>
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-zinc-800">
                    <Upload size={15} />
                    Enviar arte mobile

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          uploadImage(ad, file, "mobile");
                        }

                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  disabled={saving === ad.id}
                  onClick={() => saveAd(ad)}
                  className="flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-[#E0263B] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {saving === ad.id ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Salvando...
                    </>
                  ) : (
                    "Salvar alterações"
                  )}
                </button>
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
