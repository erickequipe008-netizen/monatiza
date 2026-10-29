// Silenciar / bloquear usuários — guardado no dispositivo (localStorage).
// Some do feed na hora; os feeds filtram por isHidden().
const MUTE_KEY = "monatiza_muted";
const BLOCK_KEY = "monatiza_blocked";

function read(key: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}
function write(key: string, s: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...s]));
  } catch {
    /* ignora */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("monatiza:hidden-changed"));
}

export function isMuted(userId?: string | null): boolean {
  return !!userId && read(MUTE_KEY).has(userId);
}
export function isBlocked(userId?: string | null): boolean {
  return !!userId && read(BLOCK_KEY).has(userId);
}
export function isHidden(userId?: string | null): boolean {
  return isMuted(userId) || isBlocked(userId);
}
export function muteUser(userId: string) {
  const s = read(MUTE_KEY);
  s.add(userId);
  write(MUTE_KEY, s);
}
export function unmuteUser(userId: string) {
  const s = read(MUTE_KEY);
  s.delete(userId);
  write(MUTE_KEY, s);
}
export function blockUser(userId: string) {
  const s = read(BLOCK_KEY);
  s.add(userId);
  write(BLOCK_KEY, s);
}
export function unblockUser(userId: string) {
  const s = read(BLOCK_KEY);
  s.delete(userId);
  write(BLOCK_KEY, s);
}
