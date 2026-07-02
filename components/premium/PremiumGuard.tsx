"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  MessagesSquare,
  Compass,
  Newspaper,
  Bookmark,
  User,
  Sparkles,
  BookOpen,
  Mail,
  LayoutDashboard,
  CreditCard,
  ShieldCheck,
  Search,
  MessageCircle,
  Bell,
  MoreHorizontal,
  PenSquare,
  LogOut,
  Loader2,
  Crown,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useSubscriber } from "@/components/premium/SubscriberProvider";
import { countUnread } from "@/lib/premium/messages";
import { getMyProfile, type CommunityProfile } from "@/lib/premium/community";
import { countUnreadNotifications, markNotificationsRead } from "@/lib/premium/notifications";

const PRIMARY = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/comunidade", label: "Comunidade", icon: MessagesSquare },
  { href: "/app/descobrir", label: "Descobrir", icon: Compass },
  { href: "/app/feed", label: "Notícias", icon: Newspaper },
  { href: "/app/biblioteca", label: "Biblioteca", icon: Bookmark },
];

const MORE = [
  { href: "/app/perfil", label: "Meu perfil", icon: User },
  { href: "/app/mensagens", label: "Mensagens", icon: MessageCircle },
  { href: "/app/notificacoes", label: "Notificações", icon: Bell },
  { href: "/app/verificacao", label: "Verificação", icon: ShieldCheck },
  { href: "/app/exclusivo", label: "Exclusivo", icon: Sparkles },
  { href: "/app/revistas", label: "Revistas", icon: BookOpen },
  { href: "/app/newsletter", label: "Newsletter", icon: Mail },
  { href: "/app/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/app/conta", label: "Conta", icon: CreditCard },
];

const MOBILE = [...PRIMARY.slice(0, 4), { href: "/app/perfil", label: "Perfil", icon: User }];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0a0a0c] text-zinc-500">
      {children}
    </div>
  );
}

export default function PremiumGuard({ children }: { children: React.ReactNode }) {
  const { loading, isSubscriber, user, status } = useSubscriber();
  const router = useRouter();
  const pathname = usePathname() || "/app";
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [q, setQ] = useState("");
  const [unread, setUnread] = useState(0);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [notif, setNotif] = useState(0);
  const onNotif = pathname.startsWith("/app/notificacoes");

  // não lidas: contadas pelo banco (abrir a conversa marca como lida)
  useEffect(() => {
    if (!user?.id) return;
    countUnread().then(setUnread);
  }, [user?.id, pathname]);

  // tempo real: nova mensagem recebida fora da aba → +1 no badge
  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel("dm-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, (payload) => {
        const m = payload.new as { recipient_id: string };
        if (m.recipient_id === user.id && !window.location.pathname.startsWith("/app/mensagens")) {
          setUnread((n) => n + 1);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) getMyProfile().then(setProfile);
  }, [user?.id]);

  // notificações: zera ao entrar na aba, senão conta
  useEffect(() => {
    if (!user?.id) return;
    if (onNotif) {
      markNotificationsRead();
      setNotif(0);
      return;
    }
    countUnreadNotifications().then(setNotif);
  }, [user?.id, onNotif]);

  useEffect(() => {
    if (!user?.id) return;
    const ch = supabase
      .channel("notif-unread")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const n = payload.new as { user_id: string };
        if (n.user_id === user.id && !window.location.pathname.startsWith("/app/notificacoes")) {
          setNotif((x) => x + 1);
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user?.id]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/painel/login?next=${encodeURIComponent(pathname)}`);
    } else if (!isSubscriber) {
      router.replace(status === "inactive" || status === "past_due" ? "/painel" : "/assinantes");
    }
  }, [loading, user, isSubscriber, status, pathname, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <FullScreen>
        <Loader2 className="animate-spin" size={22} />
        <span className="text-sm">Carregando…</span>
      </FullScreen>
    );
  }
  if (!user || !isSubscriber) {
    return (
      <FullScreen>
        <Crown size={22} className="text-[#9B72CB]" />
        <span className="text-sm">Redirecionando…</span>
      </FullScreen>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const firstName = (user.name || user.email || "Assinante").split(" ")[0];
  const displayName = profile?.display_name || firstName;
  const initial = (displayName || "A").charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url || null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] pb-24 text-zinc-100 md:pb-0">
      {/* ── BARRA SUPERIOR (celular/tablet) ── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0c]/80 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/app" className="flex items-center">
            <span className="text-[22px] font-extrabold tracking-tight text-white">monatiza</span>
          </Link>

          <nav className="pro-scroll hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto md:flex">
            {PRIMARY.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] font-semibold transition ${
                    active
                      ? "pro-gradient text-white shadow-lg shadow-[#9B72CB]/20"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href="/app/busca"
              className="rounded-full p-2.5 text-zinc-400 transition hover:bg-white/5 hover:text-white"
              aria-label="Buscar"
            >
              <Search size={19} />
            </Link>
            <Link
              href="/app/mensagens"
              className={`relative rounded-full p-2.5 transition ${
                isActive(pathname, "/app/mensagens")
                  ? "pro-gradient text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
              aria-label="Mensagens"
            >
              <MessageCircle size={19} />
              {unread > 0 && (
                <span className="pro-badge pro-gradient absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-[#0a0a0c]">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
            <Link
              href="/app/notificacoes"
              className={`relative rounded-full p-2.5 transition ${
                onNotif ? "pro-gradient text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
              aria-label="Notificações"
            >
              <Bell size={19} />
              {notif > 0 && (
                <span className="pro-badge pro-gradient absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold leading-none text-white ring-2 ring-[#0a0a0c]">
                  {notif > 99 ? "99+" : notif}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="pro-ring rounded-full p-[2px] transition hover:opacity-90"
                aria-label="Menu da conta"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a0a0c] text-[13px] font-bold text-white">
                    {initial}
                  </span>
                )}
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="pro-pop absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#15151b] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
                    <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                      <span className="pro-ring rounded-full p-[2px]">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#15151b] text-[13px] font-bold text-white">
                            {initial}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-white">{displayName}</p>
                        <p className="truncate text-[12px] text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <nav className="p-1.5">
                      {MORE.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
                          >
                            <Icon size={17} className="text-zinc-500" />
                            {item.label}
                          </Link>
                        );
                      })}
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
                      >
                        <LogOut size={17} className="text-zinc-500" /> Sair
                      </button>
                    </nav>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── CORPO: menu lateral (desktop) + conteúdo ── */}
      <div className="mx-auto flex w-full max-w-[1300px]">
        {/* menu lateral estilo grande rede social */}
        <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-white/10 px-4 py-6 lg:flex">
          <Link href="/app" className="px-3 text-[24px] font-extrabold tracking-tight text-white">
            monatiza
          </Link>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) router.push(`/app/busca?q=${encodeURIComponent(q.trim())}`);
            }}
            className="relative mt-5 px-1"
          >
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-[14px] text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-[#9B72CB]"
            />
          </form>

          <nav className="mt-5 flex-1 space-y-1 overflow-y-auto pro-scroll">
            {[
              { href: "/app", label: "Início", icon: Home },
              { href: "/app/descobrir", label: "Explorar", icon: Compass },
              { href: "/app/notificacoes", label: "Notificações", icon: Bell, badge: notif },
              { href: "/app/mensagens", label: "Mensagens", icon: MessageCircle, badge: unread },
              { href: "/app/comunidade", label: "Comunidade", icon: MessagesSquare },
              { href: "/app/feed", label: "Notícias", icon: Newspaper },
              { href: "/app/biblioteca", label: "Biblioteca", icon: Bookmark },
              { href: "/app/perfil", label: "Perfil", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 rounded-full px-4 py-2.5 text-[15px] transition ${
                    active ? "bg-white/5 font-extrabold text-white" : "font-semibold text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="relative">
                    <Icon size={21} />
                    {!!item.badge && item.badge > 0 && (
                      <span className="pro-badge pro-gradient absolute -right-2 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-extrabold leading-none text-white">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </span>
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="flex w-full items-center gap-3.5 rounded-full px-4 py-2.5 text-[15px] font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <MoreHorizontal size={21} /> Mais
            </button>
            {moreOpen && (
              <div className="ml-4 space-y-1 border-l border-white/10 pl-3">
                {MORE.filter((m) => !["/app/perfil", "/app/mensagens", "/app/notificacoes"].includes(m.href)).map(
                  (item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] font-semibold text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      >
                        <Icon size={17} /> {item.label}
                      </Link>
                    );
                  }
                )}
              </div>
            )}

            <Link
              href="/app#publicar"
              className="pro-gradient pro-glow mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold text-white transition hover:opacity-90"
            >
              <PenSquare size={17} /> Publicar
            </Link>
          </nav>

          {/* perfil no rodapé */}
          <div className="mt-4 flex items-center gap-3 rounded-full px-2 py-2 transition hover:bg-white/5">
            <Link href="/app/perfil" className="flex min-w-0 flex-1 items-center gap-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="pro-gradient flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-bold text-white">
                  {initial}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold text-white">{displayName}</span>
                {profile?.handle && <span className="block truncate text-[12px] text-zinc-500">@{profile.handle}</span>}
              </span>
            </Link>
            <button onClick={logout} className="shrink-0 rounded-full p-2 text-zinc-500 transition hover:bg-white/10 hover:text-white" aria-label="Sair" title="Sair">
              <LogOut size={17} />
            </button>
          </div>
        </aside>

        {/* ── CONTEÚDO ── */}
        <main key={pathname} className="pro-pop min-w-0 flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>

      {/* ── BARRA INFERIOR (mobile) ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0c]/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-[640px] items-stretch justify-around px-1">
          {MOBILE.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-1 py-2.5 active:scale-95 transition"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                    active ? "pro-gradient text-white" : "text-zinc-500"
                  }`}
                >
                  <Icon size={21} />
                </span>
                <span className={`text-[10px] font-bold ${active ? "pro-gradient-text" : "text-zinc-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
