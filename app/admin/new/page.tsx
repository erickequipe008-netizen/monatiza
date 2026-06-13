"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [content, setContent] =
    useState("");

  const [category, setCategory] =
    useState("Negócios");

  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  async function uploadCover() {
    if (!imageFile) return null;

    const fileExt =
      imageFile.name.split(".").pop();

    const fileName =
      `${Date.now()}.${fileExt}`;

    const filePath =
      `covers/${fileName}`;

    const { error } =
      await supabase.storage
        .from("articles")
        .upload(
          filePath,
          imageFile
        );

    if (error) {
      console.log(error);
      alert("Erro ao enviar imagem");
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("articles")
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async function handlePublish(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);

    const uploadedImage =
      await uploadCover();

    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Usuário não autenticado");
      setLoading(false);
      return;
    }

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single();

    const { error } =
  await supabase
    .from("articles")
    .insert([
      {
        title,
        description,
        content,
        category,
        image_url: uploadedImage,
        slug,

        author:
          profile?.display_name ||
          "Redação Monatiza",

        journalist_name:
          profile?.display_name ||
          "Redação Monatiza",

        author_id: user.id,
      },
    ]);

    if (error) {
      console.log(error);

      alert(error.message);

      setLoading(false);

      return;
    }

    alert(
      "Matéria publicada com sucesso!"
    );

    router.push(
      "/admin/dashboard"
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-black text-black mb-3">
            Nova Matéria
          </h1>

          <p className="text-gray-500 text-lg">
            Crie uma nova publicação para o portal
          </p>
        </div>

        <form
          onSubmit={handlePublish}
          className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-10 space-y-8"
        >
          <div className="space-y-3">
            <label className="text-2xl font-bold text-black">
              Título da matéria
            </label>

            <input
              type="text"
              placeholder="Digite o título..."
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              className="w-full h-20 px-6 rounded-[24px] border border-gray-300 bg-white text-black text-2xl font-bold outline-none placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-2xl font-bold text-black">
              Resumo
            </label>

            <textarea
              placeholder="Escreva um resumo..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="w-full h-48 p-6 rounded-[24px] border border-gray-300 bg-white text-black text-lg outline-none resize-none placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-2xl font-bold text-black">
              Categoria
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full h-20 px-6 rounded-[24px] border border-gray-300 bg-white text-black text-xl outline-none"
            >
              <option value="Negócios">
                Negócios
              </option>

              <option value="Tecnologia">
                Tecnologia
              </option>

              <option value="IA">
                IA
              </option>

              <option value="Política">
                Política
              </option>

              <option value="Brasil">
                Brasil
              </option>

              <option value="Mercado">
                Mercado
              </option>

              <option value="Economia">
                Economia
              </option>

              <option value="Saúde">
                Saúde
              </option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-2xl font-bold text-black">
              Imagem de capa
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (
                  e.target.files?.[0]
                ) {
                  setImageFile(
                    e.target.files[0]
                  );
                }
              }}
              className="w-full h-20 px-6 rounded-[24px] border border-gray-300 bg-white text-black outline-none file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white file:rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <label className="text-2xl font-bold text-black">
              Conteúdo
            </label>

            <textarea
              placeholder="Escreva a matéria..."
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
              }
              className="w-full h-[700px] p-8 rounded-[24px] border border-gray-300 bg-white text-black text-xl outline-none resize-none placeholder:text-gray-400"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="h-16 px-10 rounded-2xl bg-black text-white font-bold text-lg hover:opacity-90 transition"
            >
              {loading
                ? "Publicando..."
                : "Publicar matéria"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}