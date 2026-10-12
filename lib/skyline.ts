/** Deterministic skyline outline (SVG path) and lit windows for a 1440×260 viewBox. */
export function seededSkyline(seed: number) {
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let x = 0;
  let d = "M0 260";
  const windows: [number, number, number][] = [];
  while (x < 1440) {
    const w = 40 + Math.round(rand() * 70);
    // taller towers toward the right, where the contact glow sits
    const bias = 0.55 + (x / 1440) * 0.45;
    const top = Math.round(260 - (50 + rand() * 150) * bias);
    d += ` L${x} ${top}`;
    if (rand() > 0.72) {
      const mid = x + Math.round(w / 2);
      d += ` L${mid - 3} ${top} L${mid} ${top - 18 - Math.round(rand() * 20)} L${mid + 3} ${top}`;
    }
    d += ` L${x + w} ${top}`;
    for (let wy = top + 10; wy < 250; wy += 12) {
      for (let wx = x + 6; wx < x + w - 6; wx += 10) {
        if (rand() < 0.07) windows.push([wx, wy, 0.35 + Math.round(rand() * 50) / 100]);
      }
    }
    x += w + Math.round(rand() * 6);
  }
  d += " L1440 260";
  return { outline: d, windows };
}
