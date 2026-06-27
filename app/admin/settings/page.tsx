"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Camera,
  Trash2,
  Save,
  LogOut,
  LayoutDashboard,
  FileText,
  Plus,
  Users,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import { supabase } from "@/lib/supabase/client";

export default function PerfilPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [accountMsg, setAccountMsg] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin/login");
        return;
      }
      setUserId(user.id);
      setEmail(user.email || "");

      const meta = (user.user_metadata ?? {}) as { display_name?: string; name?: string };

      const { data } = await supabase
        .from("journalists")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setName(data?.name || meta.name || "");
      setDisplayName(data?.display_name || meta.display_name || "");
      setBio(data?.bio || "");
      setInstagram(data?.instagram || "");
      setLinkedin(data?.linkedin || "");
      setWebsite(data?.website || "");
      setAvatarUrl(data?.avatar_url || "");

      setLoading(false);
    })();
  }, [router]);

  async function uploadAvatar(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${userId}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("articles").upload(path, file);
    if (error) {
      alert("Erro ao enviar a foto: " + error.message);
      setUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from("articles").getPublicUrl(path);
    setAvatarUrl(publicUrl);
    setUploading(false);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: userId,
      email,
      name: name || displayName || "Jornalista",
      display_name: displayName || name,
      bio,
      instagram,
      linkedin,
      website,
      avatar_url: avatarUrl || null,
      role: "journalist",
    };

    const { error } = await supabase.from("journalists").upsert(payload, { onConflict: "id" });
    if (error) {
      setSaving(false);
      alert("Erro ao salvar: " + error.message);
      return;
    }

    // mantém profiles e o metadata em sincronia (o nome de jornalismo é o que aparece nos artigos)
    await supabase.from("profiles").upsert({
      id: userId,
      name: payload.name,
      display_name: payload.display_name,
      bio,
      avatar_url: avatarUrl || null,
      email,
    });
    await supabase.auth.updateUser({
      data: { name: payload.name, display_name: payload.display_name },
    });

    setSaving(false);
    alert("Perfil salvo com sucesso!");
  }

  async function changeEmail() {
    setAccountMsg("");
    if (!newEmail.trim()) return setAccountMsg("Digite o novo e-mail.");
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) return setAccountMsg("Erro: " + error.message);
    setNewEmail("");
    setAccountMsg("Enviamos um link de confirmação para o novo e-mail. A troca só vale após confirmar.");
  }

  async function changePassword() {
    setAccountMsg("");
    if (newPassword.length < 6) return setAccountMsg("A senha deve ter no mínimo 6 caracteres.");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return setAccountMsg("Erro: " + error.message);
    setNewPassword("");
    setAccountMsg("Senha atualizada com sucesso.");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  const inputCls =
    "w-full h-10 px-4 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-black outline-none placeholder:text-gray-300 focus:border-gray-400 transition";
  const labelCls = "block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5";
  const cardCls = "bg-white border border-gray-100 rounded-2xl p-6";

  return (
    <>
      <PageHeader title="Perfil" description="Suas informações, currículo e conta" />

      <div className="p-6 md:p-8 max-w-3xl space-y-6">
        <form onSubmit={saveProfile} className="space-y-6">
          {/* FOTO */}
          <div className={cardCls}>
            <h3 className="text-[13px] font-bold text-black mb-4">Foto de perfil</h3>
            <div className="flex items-center gap-5">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Foto de perfil" className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Camera size={20} className="text-gray-300" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:opacity-80 transition cursor-pointer">
                  {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                  {uploading ? "Enviando…" : "Enviar foto"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadAvatar(f);
                    }}
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-[13px] font-semibold hover:border-red-300 hover:text-red-600 transition"
                  >
                    <Trash2 size={13} /> Remover
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Clique em “Salvar alterações” para confirmar.</p>
          </div>

          {/* INFORMAÇÕES + CURRÍCULO */}
          <div className={`${cardCls} space-y-4`}>
            <h3 className="text-[13px] font-bold text-black">Informações do jornalista</h3>

            {[
              { label: "Nome completo", value: name, set: setName, placeholder: "Seu nome" },
              { label: "Nome de jornalismo (aparece nos artigos)", value: displayName, set: setDisplayName, placeholder: "Como assina as matérias" },
              { label: "Instagram", value: instagram, set: setInstagram, placeholder: "@usuario" },
              { label: "LinkedIn", value: linkedin, set: setLinkedin, placeholder: "linkedin.com/in/..." },
              { label: "Website", value: website, set: setWebsite, placeholder: "https://..." },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className={labelCls}>{label}</label>
                <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} className={inputCls} />
              </div>
            ))}

            <div>
              <label className={labelCls}>Currículo / biografia</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Trajetória, áreas de cobertura, experiência..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-black outline-none resize-none placeholder:text-gray-300 focus:border-gray-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold hover:opacity-80 transition disabled:opacity-40"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>

        {/* CONTA */}
        <div className={`${cardCls} space-y-4`}>
          <h3 className="text-[13px] font-bold text-black">Conta</h3>

          {accountMsg && (
            <p className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-[12px] text-gray-600">{accountMsg}</p>
          )}

          <div>
            <label className={labelCls}>E-mail atual</label>
            <input type="email" value={email} disabled className={`${inputCls} text-gray-400 cursor-not-allowed`} />
          </div>

          <div>
            <label className={labelCls}>Trocar e-mail</label>
            <div className="flex gap-2">
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="novo@email.com" className={inputCls} />
              <button type="button" onClick={changeEmail} className="shrink-0 border border-gray-200 text-black px-4 rounded-xl text-[13px] font-semibold hover:border-gray-400 transition">
                Atualizar
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Trocar senha</label>
            <div className="flex gap-2">
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nova senha (mín. 6)" className={inputCls} />
              <button type="button" onClick={changePassword} className="shrink-0 border border-gray-200 text-black px-4 rounded-xl text-[13px] font-semibold hover:border-gray-400 transition">
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* GERENCIAMENTO */}
        <div className={`${cardCls}`}>
          <h3 className="text-[13px] font-bold text-black mb-4">Gerenciamento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
              { label: "Minhas matérias", href: "/admin/articles", icon: FileText },
              { label: "Nova matéria", href: "/admin/articles/new", icon: Plus },
              { label: "Jornalistas", href: "/admin/journalists", icon: Users },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-semibold text-black hover:border-black transition"
              >
                <Icon size={16} className="text-gray-400" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* SAIR */}
        <div className={`${cardCls} flex items-center justify-between`}>
          <div>
            <h3 className="text-[13px] font-bold text-black">Sair da conta</h3>
            <p className="text-[12px] text-gray-400 mt-0.5">Encerra sua sessão neste navegador.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-red-700 transition"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>
    </>
  );
}
