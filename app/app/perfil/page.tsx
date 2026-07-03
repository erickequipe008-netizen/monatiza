"use client";

import { useEffect, useState } from "react";
import { ensureProfile, getMyProfile, type CommunityProfile } from "@/lib/premium/community";
import ProfileView from "@/components/premium/ProfileView";
import RightRail from "@/components/premium/RightRail";
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
  return (
    <div className="mx-auto flex w-full max-w-[1000px] items-start gap-7">
      <div className="min-w-0 flex-1 xl:max-w-[600px]">
        <ProfileView profile={profile} isMe />
      </div>
      <RightRail className="sticky top-4 hidden w-[330px] shrink-0 xl:block" />
    </div>
  );
}
