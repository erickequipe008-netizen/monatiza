"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Pencil, X, Loader2, CreditCard, Camera, Link2 } from "lucide-react";
import {
  getMyProfile,
  updateProfile,
  listUserPosts,
  getFollowCounts,
  isFollowing as checkFollowing,
  follow,
  unfollow,
  listFollowers,
  listFollowing,
  type CommunityProfile,
  type Post,
  type FollowCounts,
} from "@/lib/premium/community";
import { uploadMedia } from "@/lib/premium/upload";
import PostCard, { Avatar } from "@/components/premium/PostCard";
import VerifiedBadge from "@/components/premium/VerifiedBadge";
import { Spinner } from "@/components/premium/States";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

type Tab = "posts" | "followers" | "following";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-[#9B72CB]";

function normalizeLink(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
function prettyLink(v: string): string {
  return v.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export default function ProfileView({
  profile: initial,
  isMe,
}: {
  profile: CommunityProfile;
  isMe: boolean;
}) {
  const { user } = useSubscriber();
  const [profile, setProfile] = useState(initial);
  const [counts, setCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [people, setPeople] = useState<CommunityProfile[]>([]);
  const [loadingTab, setLoadingTab] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({ display_name: "", handle: "", bio: "", avatar_url: "", cover_url: "", link: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [upAvatar, setUpAvatar] = useState(false);
  const [upCover, setUpCover] = useState(false);
  const avatarRef = useRef<HTMLInputElement | null>(null);
  const coverRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setProfile(initial);
    setForm({
      display_name: initial.display_name || "",
      handle: initial.handle || "",
      bio: initial.bio || "",
      avatar_url: initial.avatar_url || "",
      cover_url: initial.cover_url || "",
      link: initial.link || "",
    });
  }, [initial]);

  useEffect(() => {
    (async () => {
      const [c, f] = await Promise.all([
        getFollowCounts(profile.user_id),
        isMe ? Promise.resolve(false) : checkFollowing(profile.user_id),
      ]);
      setCounts(c);
      setFollowing(f);
    })();
  }, [profile.user_id, isMe]);

  useEffect(() => {
    let active = true;
    setLoadingTab(true);
    (async () => {
      if (tab === "posts") {
        const d = await listUserPosts(profile.user_id);
        if (active) setPosts(d);
      } else {
        const d = tab === "followers" ? await listFollowers(profile.user_id) : await listFollowing(profile.user_id);
        if (active) setPeople(d);
      }
      if (active) setLoadingTab(false);
    })();
    return () => {
      active = false;
    };
  }, [tab, profile.user_id]);

  async function toggleFollow() {
    const n = !following;
    setFollowing(n);
    setCounts((c) => ({ ...c, followers: c.followers + (n ? 1 : -1) }));
    if (n) await follow(profile.user_id);
    else await unfollow(profile.user_id);
  }

  async function save() {
    setErr("");
    setSaving(true);
    const { error } = await updateProfile({
      display_name: form.display_name.trim() || null,
      handle: form.handle.trim().replace(/[^a-z0-9_]/gi, "").toLowerCase() || null,
      bio: form.bio.trim() || null,
      avatar_url: form.avatar_url || null,
      cover_url: form.cover_url || null,
      link: normalizeLink(form.link),
    });
    setSaving(false);
    if (error) {
      setErr(error);
      return;
    }
    const p = await getMyProfile();
    if (p) setProfile(p);
    setEditing(false);
  }

  async function pickAvatar(f: File) {
    setUpAvatar(true);
    const { url } = await uploadMedia(f, "avatars");
    setUpAvatar(false);
    if (url) setForm((s) => ({ ...s, avatar_url: url }));
  }
  async function pickCover(f: File) {
    setUpCover(true);
    const { url } = await uploadMedia(f, "covers");
    setUpCover(false);
    if (url) setForm((s) => ({ ...s, cover_url: url }));
  }

  const name = profile.display_name || profile.handle || "Membro";
  const coverShown = editing ? form.cover_url : profile.cover_url;
  const avatarShown = editing ? form.avatar_url : profile.avatar_url;

  const TABS: { key: Tab; label: string }[] = [
    { key: "posts", label: "Publicações" },
    { key: "followers", label: "Seguidores" },
    { key: "following", label: "Seguindo" },
  ];

  return (
    <div className="pro-pop mx-auto max-w-[640px]">
      {/* Capa */}
      <div className="relative h-36 w-full overflow-hidden rounded-3xl ring-1 ring-white/10 sm:h-48">
        {coverShown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverShown} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="pro-gradient h-full w-full opacity-80" />
        )}
        {editing && (
          <button
            onClick={() => coverRef.current?.click()}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur hover:bg-black/80"
          >
            {upCover ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />} Capa
          </button>
        )}
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickCover(f); }} />
      </div>

      {/* Avatar + ações */}
      <div className="flex items-end justify-between px-1">
        <div className="relative -mt-10 ml-1">
          <span className="block rounded-full bg-[#0a0a0c] p-1">
            <Avatar name={form.display_name || name} url={avatarShown} size={84} />
          </span>
          {editing && (
            <button onClick={() => avatarRef.current?.click()} className="absolute bottom-1 right-1 rounded-full bg-white/15 p-1.5 text-white shadow backdrop-blur" aria-label="Trocar foto">
              {upAvatar ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            </button>
          )}
          <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickAvatar(f); }} />
        </div>

        <div className="mb-1 flex items-center gap-2">
          {isMe ? (
            <>
              <Link
                href="/app/conta"
                className="pro-glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-zinc-200"
              >
                <CreditCard size={14} /> Conta
              </Link>
              <button
                onClick={() => setEditing((v) => !v)}
                className="pro-glass inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-zinc-200"
              >
                {editing ? <X size={14} /> : <Pencil size={14} />}
                {editing ? "Cancelar" : "Editar perfil"}
              </button>
            </>
          ) : (
            <>
              <Link
                href={`/app/mensagens/${profile.user_id}`}
                className="pro-glass rounded-full px-4 py-2 text-[13px] font-bold text-zinc-200"
              >
                Mensagem
              </Link>
              <button
                onClick={toggleFollow}
                className={`rounded-full px-5 py-2 text-[13px] font-bold transition ${
                  following
                    ? "border border-white/15 text-zinc-200 hover:border-[#E0263B] hover:text-[#E0263B]"
                    : "pro-gradient text-white hover:opacity-90"
                }`}
              >
                {following ? "Seguindo" : "Seguir"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Identidade */}
      <div className="mt-2 px-1">
        <div className="flex items-center gap-1.5">
          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-white">{name}</h1>
          {profile.verified && <VerifiedBadge size={17} />}
        </div>
        <p className="text-[14px] text-zinc-500">@{profile.handle}</p>
        {profile.bio && !editing && <p className="mt-2 text-[14px] leading-relaxed text-zinc-300">{profile.bio}</p>}
        {profile.link && !editing && (
          <a
            href={normalizeLink(profile.link) || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="pro-gradient-text mt-2 inline-flex items-center gap-1.5 text-[13.5px] font-bold"
          >
            <Link2 size={13} /> {prettyLink(profile.link)}
          </a>
        )}

        <div className="mt-3 flex items-center gap-5 text-[14px]">
          <button onClick={() => setTab("followers")} className="hover:underline">
            <b className="font-extrabold text-white">{counts.followers}</b> <span className="text-zinc-500">seguidores</span>
          </button>
          <button onClick={() => setTab("following")} className="hover:underline">
            <b className="font-extrabold text-white">{counts.following}</b> <span className="text-zinc-500">seguindo</span>
          </button>
        </div>

        {isMe && !profile.verified && (
          <Link href="/app/verificacao" className="pro-gradient-text mt-3 inline-flex items-center gap-1 text-[13px] font-bold">
            ✦ Obter selo de verificado
          </Link>
        )}
      </div>

      {/* Form de edição */}
      {editing && (
        <div className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          {err && <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{err}</p>}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-zinc-400">Nome</label>
            <input value={form.display_name} maxLength={40} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-zinc-400">@usuário</label>
            <input value={form.handle} maxLength={20} onChange={(e) => setForm({ ...form, handle: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-zinc-400">Bio</label>
            <textarea value={form.bio} maxLength={160} rows={3} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={`${inputCls} resize-none`} />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-zinc-400">Link (site)</label>
            <input value={form.link} maxLength={120} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://seusite.com" className={inputCls} />
          </div>
          <button onClick={save} disabled={saving} className="pro-gradient pro-glow inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />} Salvar perfil
          </button>
        </div>
      )}

      {/* Abas */}
      <div className="sticky top-16 z-10 mt-6 flex border-b border-white/10 bg-[#0a0a0c]/80 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex-1 py-3 text-[13.5px] font-bold transition ${
              tab === t.key ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
            {tab === t.key && <span className="pro-gradient absolute inset-x-6 bottom-0 h-[3px] rounded-full" />}
          </button>
        ))}
      </div>

      <div className="mt-2">
        {loadingTab ? (
          <Spinner />
        ) : tab === "posts" ? (
          posts.length ? (
            posts.map((p) => <PostCard key={p.id} post={p} myId={user?.id} onDeleted={(id) => setPosts((prev) => prev.filter((x) => x.id !== id))} />)
          ) : (
            <p className="py-10 text-center text-sm text-zinc-500">Nenhuma publicação ainda.</p>
          )
        ) : people.length ? (
          people.map((p) => (
            <Link key={p.user_id} href={`/app/perfil/${p.handle}`} className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-white/5">
              <Avatar name={p.display_name || p.handle} url={p.avatar_url} size={46} />
              <div className="min-w-0">
                <p className="truncate font-bold text-zinc-100">{p.display_name || p.handle}</p>
                <p className="truncate text-[13px] text-zinc-500">@{p.handle}</p>
                {p.bio && <p className="line-clamp-1 text-[13px] text-zinc-500">{p.bio}</p>}
              </div>
            </Link>
          ))
        ) : (
          <p className="py-10 text-center text-sm text-zinc-500">{tab === "followers" ? "Ainda sem seguidores." : "Ainda não segue ninguém."}</p>
        )}
      </div>
    </div>
  );
}
