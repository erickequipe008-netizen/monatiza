"use client";

import { useEffect, useState } from "react";
import { Loader2, Camera } from "lucide-react";

import PageHeader   from "@/components/layout/PageHeader";
import { supabase } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [name,         setName]         = useState("");
  const [displayName,  setDisplayName]  = useState("");
  const [bio,          setBio]          = useState("");
  const [email,        setEmail]        = useState("");
  const [instagram,    setInstagram]    = useState("");
  const [linkedin,     setLinkedin]     = useState("");
  const [website,      setWebsite]      = useState("");
  const [avatarUrl,    setAvatarUrl]    = useState("");
  const [newPassword,  setNewPassword]  = useState("");
  const [userId,       setUserId]       = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email || "");
    setUserId(user.id);

    const { data } = await supabase
      .from("journalists")
      .select("*")
      .eq("email", user.email)
      .single();

    if (data) {
      setName(data.name || "");
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setInstagram(data.instagram || "");
      setLinkedin(data.linkedin || "");
      setWebsite(data.website || "");
      setAvatarUrl(data.avatar_url || "");
    }

    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("journalists")
      .update({ name, display_name: displayName, bio, instagram, linkedin, website, avatar_url: avatarUrl })
      .eq("email", user.email);

    await supabase.from("profiles")
      .upsert({ id: userId, display_name: displayName });

    if (newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) alert(error.message);
      else setNewPassword("");
    }

    setSaving(false);
    alert("Salvo com sucesso!");
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <PageHeader title="Configurações" description="Perfil e preferências" />

      <div className="p-8 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6">

          {/* AVATAR */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h3 className="text-[13px] font-bold text-black mb-4">Foto de perfil</h3>
            <div className="flex items-center gap-5">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-16 h-16 rounded-2xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Camera size={20} className="text-gray-300" />
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="URL da foto de perfil"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                className="
                  flex-1 h-9 px-3
                  bg-gray-50 border border-gray-200
                  rounded-xl text-[13px]
                  outline-none placeholder:text-gray-300
                  focus:border-gray-400 transition
                "
              />
            </div>
          </div>

          {/* PROFILE */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
            <h3 className="text-[13px] font-bold text-black">Informações pessoais</h3>

            {[
              { label: "Nome completo",    value: name,         set: setName,        placeholder: "Seu nome" },
              { label: "Nome público",     value: displayName,  set: setDisplayName, placeholder: "Como aparece nos artigos" },
              { label: "Instagram",        value: instagram,    set: setInstagram,   placeholder: "@usuario" },
              { label: "LinkedIn",         value: linkedin,     set: setLinkedin,    placeholder: "linkedin.com/in/..." },
              { label: "Website",          value: website,      set: setWebsite,     placeholder: "https://..." },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label}>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                  {label}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  className="
                    w-full h-10 px-4
                    bg-gray-50 border border-gray-200
                    rounded-xl text-[13px] text-black
                    outline-none placeholder:text-gray-300
                    focus:border-gray-400 transition
                  "
                />
              </div>
            ))}

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Biografia
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Breve descrição profissional..."
                rows={3}
                className="
                  w-full px-4 py-3
                  bg-gray-50 border border-gray-200
                  rounded-xl text-[13px] text-black
                  outline-none resize-none placeholder:text-gray-300
                  focus:border-gray-400 transition
                "
              />
            </div>
          </div>

          {/* ACCOUNT */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
            <h3 className="text-[13px] font-bold text-black">Conta</h3>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="
                  w-full h-10 px-4
                  bg-gray-50 border border-gray-100
                  rounded-xl text-[13px] text-gray-400
                  outline-none cursor-not-allowed
                "
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Nova senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Deixe em branco para não alterar"
                className="
                  w-full h-10 px-4
                  bg-gray-50 border border-gray-200
                  rounded-xl text-[13px] text-black
                  outline-none placeholder:text-gray-300
                  focus:border-gray-400 transition
                "
              />
            </div>
          </div>

          {/* SAVE */}
          <button
            type="submit"
            disabled={saving}
            className="
              flex items-center gap-2
              bg-black text-white
              px-6 py-2.5 rounded-xl
              text-[13px] font-semibold
              hover:opacity-80 transition
              disabled:opacity-40
            "
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      </div>
    </>
  );
}