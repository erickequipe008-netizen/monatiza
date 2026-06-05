import Link from "next/link";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {

  const supabase = await createClient();

  const {

    data: { session },

  } = await supabase.auth.getSession();

  if (!session) {

    redirect("/admin/login");

  }

  const { data: articles } =
    await supabase
      .from("articles")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  return (

    <main className="
      min-h-screen
      bg-zinc-100
      p-10
    ">

      <div className="
        max-w-7xl
        mx-auto
      ">

        <div className="
          flex
          items-center
          justify-between
          mb-10
        ">

          <div>

            <h1 className="
              text-5xl
              font-black
            ">
              Dashboard MONATIZA
            </h1>

            <p className="
              text-zinc-500
              mt-2
            ">
              Gerencie suas matérias.
            </p>

          </div>

          <Link
            href="/admin/new"
            className="
              bg-black
              text-white
              px-6
              py-4
              rounded-2xl
              font-bold
            "
          >
            Nova matéria
          </Link>

        </div>

        <div className="
          grid
          gap-6
        ">

          {articles?.map((article) => (

            <div
              key={article.id}
              className="
                bg-white
                rounded-3xl
                p-6
                shadow-sm
                flex
                items-center
                justify-between
              "
            >

              <div>

                <span className="
                  text-red-500
                  font-bold
                  uppercase
                  text-sm
                ">
                  {article.category}
                </span>

                <h2 className="
                  text-2xl
                  font-black
                  mt-2
                ">
                  {article.title}
                </h2>

                <p className="
                  text-zinc-500
                  mt-2
                ">
                  {article.excerpt}
                </p>

              </div>

              <div className="
                flex
                gap-3
              ">

                <Link
                  href={`/admin/edit/${article.id}`}
                  className="
                    bg-zinc-200
                    px-5
                    py-3
                    rounded-xl
                    font-bold
                  "
                >
                  Editar
                </Link>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>

  );

}