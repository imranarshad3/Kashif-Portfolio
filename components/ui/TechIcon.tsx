import { brandIcons } from "@/lib/icons";
import type { Skill } from "@/content/skills";

function isDark(hex: string) {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 70;
}

/** Brand mark when available (simple-icons, CC0), otherwise an elegant text glyph. */
export function TechIcon({ skill, className = "h-7 w-7" }: { skill: Skill; className?: string }) {
  const icon = skill.icon ? brandIcons[skill.icon] : undefined;
  if (icon) {
    const color = isDark(icon.hex) ? "#efe6d6" : `#${icon.hex}`;
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden fill={color} style={{ filter: `drop-shadow(0 0 10px ${color}55)` }}>
        <path d={icon.path} />
      </svg>
    );
  }
  return (
    <span aria-hidden className={`grid place-items-center font-display text-[13px] font-semibold text-gold-bright ${className}`}>
      {skill.glyph}
    </span>
  );
}
