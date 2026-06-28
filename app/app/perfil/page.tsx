"use client";

import { useEffect, useState } from "react";
import { ensureProfile, getMyProfile, type CommunityProfile } from "@/lib/premium/community";
import ProfileView from "@/components/premium/ProfileView";
import { Spinner } from "@/components/premium/States";

export default function PerfilPage() {
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await ensureProfile();
      setProfile(await getMyProfile());
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;
  if (!profile) return <p className="py-16 text-center text-zinc-400">Não foi possível carregar seu perfil.</p>;
  return <ProfileView profile={profile} isMe />;
}
