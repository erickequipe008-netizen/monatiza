// Maps the icon names stored in lib/categories.ts to lucide-react components.
// Imported by client components (Header, CategoryFeed).
import {
  Briefcase,
  Cpu,
  TrendingUp,
  Flag,
  Landmark,
  Laptop,
  Lightbulb,
  Rocket,
  GraduationCap,
  HeartPulse,
  BookOpen,
  Crown,
  Newspaper,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  Cpu,
  TrendingUp,
  Flag,
  Landmark,
  Laptop,
  Lightbulb,
  Rocket,
  GraduationCap,
  HeartPulse,
  BookOpen,
  Crown,
};

export function iconFor(name: string): LucideIcon {
  return ICON_MAP[name] ?? Newspaper;
}
