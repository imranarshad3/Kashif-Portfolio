import * as THREE from "three";
import type { Skill } from "@/content/skills";
import { brandIcons } from "@/lib/icons";
import { accentTriplet } from "@/lib/accent";

const W = 320;
const H = 380;
const cache = new Map<string, THREE.CanvasTexture>();

function isDark(hex: string) {
  const n = parseInt(hex, 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255) < 70;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/**
 * Face of a floating glass tech card: frosted sheen, champagne-gold edge, brand mark
 * (simple-icons, CC0) or a gold glyph, and the skill name. Cached per skill.
 */
export function skillCardTexture(skill: Skill, fontFamily: string, accent: string) {
  const cacheKey = `${accent}|${skill.name}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;
  const hi = accentTriplet("100");
  const br = accentTriplet("200");
  const mid = accentTriplet("300");

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;

  // Frosted glass body: brighter at the top like light catching the pane
  roundRect(g, 6, 6, W - 12, H - 12, 34);
  const body = g.createLinearGradient(0, 0, 0, H);
  body.addColorStop(0, "rgba(255,246,228,0.20)");
  body.addColorStop(0.45, "rgba(255,246,228,0.06)");
  body.addColorStop(1, "rgba(255,246,228,0.10)");
  g.fillStyle = body;
  g.fill();

  // Champagne-gold edge, brightest along the top
  const edge = g.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, `rgba(${hi},0.95)`);
  edge.addColorStop(0.5, `rgba(${mid},0.45)`);
  edge.addColorStop(1, `rgba(${br},0.75)`);
  g.lineWidth = 3;
  g.strokeStyle = edge;
  g.stroke();

  // Diagonal sheen
  g.save();
  roundRect(g, 6, 6, W - 12, H - 12, 34);
  g.clip();
  const sheen = g.createLinearGradient(0, 0, W, H * 0.6);
  sheen.addColorStop(0, "rgba(255,255,255,0.10)");
  sheen.addColorStop(0.35, "rgba(255,255,255,0)");
  g.fillStyle = sheen;
  g.fillRect(0, 0, W, H);
  g.restore();

  // Mark
  const icon = skill.icon ? brandIcons[skill.icon] : undefined;
  const cx = W / 2;
  const cy = 150;
  if (icon) {
    const color = isDark(icon.hex) ? "#f3e9d6" : `#${icon.hex}`;
    const size = 128;
    g.save();
    g.translate(cx - size / 2, cy - size / 2);
    g.scale(size / 24, size / 24);
    g.shadowColor = color;
    g.shadowBlur = 14;
    g.fillStyle = color;
    g.fill(new Path2D(icon.path));
    g.restore();
  } else if (skill.glyph === skill.name) {
    // e.g. "AWS": the wordmark *is* the name — draw it once, large
    g.save();
    g.font = `700 92px ${fontFamily}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = `rgba(${br},0.8)`;
    g.shadowBlur = 16;
    g.fillStyle = `rgb(${br})`;
    g.fillText(skill.name, cx, H / 2);
    g.restore();
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    cache.set(cacheKey, tex);
    return tex;
  } else {
    g.save();
    g.font = `600 ${skill.glyph && skill.glyph.length > 2 ? 64 : 88}px ${fontFamily}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = `rgba(${br},0.8)`;
    g.shadowBlur = 16;
    g.fillStyle = `rgb(${br})`;
    g.fillText(skill.glyph ?? skill.name.slice(0, 2), cx, cy);
    g.restore();
  }

  // Name (shrinks to fit)
  let fontSize = 40;
  g.textAlign = "center";
  g.textBaseline = "middle";
  do {
    g.font = `600 ${fontSize}px ${fontFamily}`;
    fontSize -= 2;
  } while (g.measureText(skill.name).width > W - 48 && fontSize > 22);
  g.fillStyle = "#f4ede1";
  g.shadowColor = "rgba(0,0,0,0.6)";
  g.shadowBlur = 6;
  g.fillText(skill.name, cx, 300);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  cache.set(cacheKey, tex);
  return tex;
}

/** Soft radial glow used for halos and card highlights (shared). Neutral white: tint it with the material colour. */
let glowTex: THREE.CanvasTexture | null = null;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}
