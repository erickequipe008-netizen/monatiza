"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getPost,
  listReplies,
  ensureProfile,
  type Post,
  type CommunityProfile,
} from "@/lib/premium/community";
import PostCard from "@/components/premium/PostCard";
import PostComposer from "@/components/premium/PostComposer";
import { Spinner } from "@/components/premium/States";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const { user } = useSubscriber();
  const [me, setMe] = useState<CommunityProfile | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      setLoading(true);
      const [pr, p, r] = await Promise.all([ensureProfile(), getPost(id), listReplies(id)]);
      if (!active) return;
      setMe(pr);
      setPost(p);
      setReplies(r);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Spinner />;
  if (!post)
    return (
      <div className="py-16 text-center">
        <p className="font-bold text-zinc-500">Publicação não encontrada.</p>
        <Link href="/app/comunidade" className="mt-3 inline-block text-sm font-bold text-[#E0263B]">
          Voltar para a comunidade
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-[640px]">
      <Link
        href="/app/comunidade"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-[#E0263B]"
      >
        <ArrowLeft size={14} /> Comunidade
      </Link>

      <PostCard post={post} myId={user?.id} clickable={false} onDeleted={() => history.back()} />

      <div className="border-b border-zinc-200 py-2 text-[12px] font-black uppercase tracking-widest text-zinc-400">
        Respostas
      </div>

      <PostComposer
        parentId={post.id}
        placeholder="Escreva uma resposta…"
        myProfile={me}
        onPosted={(p) => setReplies((prev) => [...prev, p])}
      />

      {replies.length ? (
        replies.map((r) => (
          <PostCard
            key={r.id}
            post={r}
            myId={user?.id}
            clickable={false}
            onDeleted={(rid) => setReplies((prev) => prev.filter((x) => x.id !== rid))}
          />
        ))
      ) : (
        <p className="py-8 text-center text-sm text-zinc-400">Nenhuma resposta ainda. Seja o primeiro.</p>
      )}
    </div>
  );
}
