import * as THREE from "three";

/** Deterministic PRNG so generated textures are identical on every load. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Dusk city skyline seen through the office window. Distant layers are blurred and
 * lit windows become soft bokeh, imitating a shallow depth of field.
 */
export function skylineTexture() {
  const w = 1280;
  const h = 800;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#241c2c");
  sky.addColorStop(0.3, "#4a3240");
  sky.addColorStop(0.55, "#9a5f4e");
  sky.addColorStop(0.75, "#e3976a");
  sky.addColorStop(1, "#f7c88a");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);

  // Low sun glow behind the towers
  const glow = g.createRadialGradient(w * 0.58, h * 0.8, 10, w * 0.58, h * 0.8, w * 0.6);
  glow.addColorStop(0, "rgba(255,222,160,0.9)");
  glow.addColorStop(0.4, "rgba(255,170,110,0.35)");
  glow.addColorStop(1, "rgba(255,170,110,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, w, h);

  const rand = seeded(7);
  const layers = [
    { count: 34, minH: 0.14, maxH: 0.34, color: "#5a3a3a", lit: 0.1, blur: 4 },
    { count: 22, minH: 0.22, maxH: 0.52, color: "#2a1c22", lit: 0.18, blur: 2.2 },
    { count: 12, minH: 0.35, maxH: 0.72, color: "#130d11", lit: 0.24, blur: 1.2 },
  ];
  const bokeh: { x: number; y: number; r: number; a: number }[] = [];
  // Each layer is drawn sharp on its own canvas, then composited with a single blur pass.
  // (Setting ctx.filter before thousands of small draws would blur every draw separately.)
  const layerCanvas = document.createElement("canvas");
  layerCanvas.width = w;
  layerCanvas.height = h;
  const l = layerCanvas.getContext("2d")!;
  for (const layer of layers) {
    l.clearRect(0, 0, w, h);
    let x = -30;
    for (let i = 0; i < layer.count && x < w; i++) {
      const bw = 40 + rand() * 90;
      const bh = h * (layer.minH + rand() * (layer.maxH - layer.minH));
      const top = h - bh;
      l.fillStyle = layer.color;
      l.fillRect(x, top, bw, bh);
      if (rand() > 0.65) {
        // spire
        l.beginPath();
        l.moveTo(x + bw * 0.3, top);
        l.lineTo(x + bw * 0.5, top - 40 - rand() * 60);
        l.lineTo(x + bw * 0.7, top);
        l.fill();
      }
      for (let wy = top + 12; wy < h - 6; wy += 13) {
        for (let wx = x + 6; wx < x + bw - 8; wx += 11) {
          if (rand() < layer.lit) {
            l.fillStyle = rand() > 0.3 ? "rgba(255,196,128,0.9)" : "rgba(255,236,205,0.8)";
            l.fillRect(wx, wy, 4, 6);
            if (rand() < 0.08) bokeh.push({ x: wx, y: wy, r: 6 + rand() * 14, a: 0.25 + rand() * 0.35 });
          }
        }
      }
      x += bw + rand() * 14;
    }
    g.filter = `blur(${layer.blur}px)`;
    g.drawImage(layerCanvas, 0, 0);
    g.filter = "none";
  }
  // Out-of-focus lights
  for (const b of bokeh) {
    const grad = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    grad.addColorStop(0, `rgba(255,214,150,${b.a})`);
    grad.addColorStop(0.7, `rgba(255,190,120,${b.a * 0.5})`);
    grad.addColorStop(1, "rgba(255,190,120,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    g.fill();
  }
  return toTexture(c);
}

/** Single leaf silhouette, shared by every plant. */
export function leafShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(0.09, 0.12, 0.08, 0.36, 0, 0.5);
  s.bezierCurveTo(-0.08, 0.36, -0.09, 0.12, 0, 0);
  return s;
}

/** Second, smaller screen: dashboard with a chart. */
export function dashboardTexture() {
  const w = 512;
  const h = 320;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#151826");
  bg.addColorStop(1, "#0b0d14");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  // Mountains / landscape wallpaper like the reference laptop
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#2b3a63");
  sky.addColorStop(0.55, "#d38a63");
  sky.addColorStop(1, "#3a2a2a");
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#1a1f33";
  g.beginPath();
  g.moveTo(0, h * 0.75);
  g.lineTo(w * 0.22, h * 0.42);
  g.lineTo(w * 0.38, h * 0.62);
  g.lineTo(w * 0.58, h * 0.32);
  g.lineTo(w * 0.8, h * 0.6);
  g.lineTo(w, h * 0.48);
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.fill();
  g.fillStyle = "#0f1220";
  g.beginPath();
  g.moveTo(0, h * 0.88);
  g.lineTo(w * 0.3, h * 0.68);
  g.lineTo(w * 0.55, h * 0.84);
  g.lineTo(w * 0.78, h * 0.7);
  g.lineTo(w, h * 0.86);
  g.lineTo(w, h);
  g.lineTo(0, h);
  g.fill();
  return toTexture(c);
}

/** Handwritten "Code / Create / Automate / Scale" for the glass board. */
export function scriptBoardTexture(fontFamily: string) {
  const w = 512;
  const h = 640;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.clearRect(0, 0, w, h);
  g.font = `600 92px ${fontFamily}`;
  g.fillStyle = "#f4dcaa";
  g.shadowColor = "rgba(255,200,120,0.75)";
  g.shadowBlur = 18;
  ["Code", "Create", "Automate", "Scale"].forEach((word, i) => {
    g.save();
    g.translate(48 + i * 26, 130 + i * 128);
    g.rotate(-0.12);
    g.fillText(word, 0, 0);
    g.restore();
  });
  // a few chalk dots like the reference
  g.shadowBlur = 8;
  [[70, 40], [120, 70], [95, 95], [180, 36]].forEach(([x, y]) => {
    g.beginPath();
    g.arc(x, y, 3, 0, Math.PI * 2);
    g.fill();
  });
  return toTexture(c);
}
