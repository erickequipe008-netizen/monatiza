export function Skeleton({ className, dark }: { className?: string; dark: boolean }) {
  return (
    <div
      className={`animate-pulse rounded ${
        dark ? "bg-zinc-800" : "bg-zinc-200"
      } ${className ?? ""}`}
    />
  );
}
