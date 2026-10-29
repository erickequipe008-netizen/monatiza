"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProfileByHandle, type CommunityProfile } from "@/lib/premium/community";
import ProfileView from "@/components/premium/ProfileView";
import RightRail from "@/components/premium/RightRail";
import { Spinner, EmptyState } from "@/components/premium/States";
import { useSubscriber } from "@/components/premium/SubscriberProvider";

export default function MemberProfilePage() {
  const params = useParams<{ handle: string }>();
  const handle = params?.handle;
  const { user } = useSubscriber();
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!handle) return;
    let active = true;
    (async () => {
      const p = await getProfileByHandle(handle);
      if (active) {
        setProfile(p);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [handle]);

  if (loading) return <Spinner />;
  if (!profile)
    return (
      <div className="mx-auto max-w-[640px]">
        <Link
          href="/app/comunidade"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-zinc-500 hover:text-[#E0263B]"
        >
          <ArrowLeft size={14} /> Comunidade
        </Link>
        <EmptyState title="Perfil não encontrado." />
      </div>
    );

  return (
    <div className="mx-auto flex w-full max-w-[1000px] items-start gap-7">
      <div className="min-w-0 flex-1 xl:max-w-[600px]">
        <ProfileView profile={profile} isMe={user?.id === profile.user_id} />
      </div>
      <RightRail className="sticky top-4 hidden w-[330px] shrink-0 xl:block" />
    </div>
  );
}
