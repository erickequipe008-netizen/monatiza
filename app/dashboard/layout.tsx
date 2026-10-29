import JournalistShell from "@/components/journalist/JournalistShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <JournalistShell>{children}</JournalistShell>;
}
