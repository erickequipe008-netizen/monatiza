"use client";

interface EditClientProps {
  article: any;
}

export default function EditClient({
  article,
}: EditClientProps) {

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold">
        Editando artigo
      </h1>

      <pre className="mt-6">
        {JSON.stringify(article, null, 2)}
      </pre>
    </div>
  );

}