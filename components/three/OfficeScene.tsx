"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { useAdaptiveQuality, usePageVisible, useWarmUp } from "./quality";
import { createEditorCanvas, PREPARED, type EditorState } from "./liveCode";
import { gsap } from "@/lib/gsap";
import { dashboardTexture, leafShape, scriptBoardTexture, seeded, skylineTexture } from "./textures";

export type SceneControl = {
  /** 0 → 1 scroll progress through the hero. */
  progress: number;
  /** Normalised pointer position, -1 → 1. */
  pointer: { x: number; y: number };
  /**
   * When true (desktop, full motion) the second half of `progress` flies the camera
   * into the monitor; otherwise all of `progress` is the original push-in.
   */
  fly: boolean;
  /** Desktop portrait column is showing: frame the workspace a little left of it. */
  portrait: boolean;
};

const METAL = "#18181b";
const GOLD = "#c9a15f";

const WIN = { x0: -0.7, x1: 3.2, y0: 0.55, y1: 3.45 };

function Room() {
  const skyline = useMemo(() => skylineTexture(), []);
  const cx = (WIN.x0 + WIN.x1) / 2;
  const w = WIN.x1 - WIN.x0;
  const wall = <meshStandardMaterial color="#17120f" roughness={0.88} />;
  return (
    <group>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#0b0907" roughness={0.22} metalness={0.5} envMapIntensity={0.8} />
      </mesh>
      {/* Back wall around the window opening */}
      <mesh position={[WIN.x0 - 5, 2.5, -2.6]}>
        <planeGeometry args={[10, 5]} />
        {wall}
      </mesh>
      <mesh position={[WIN.x1 + 5, 2.5, -2.6]}>
        <planeGeometry args={[10, 5]} />
        {wall}
      </mesh>
      <mesh position={[cx, (WIN.y1 + 5) / 2, -2.6]}>
        <planeGeometry args={[w, 5 - WIN.y1]} />
        {wall}
      </mesh>
      <mesh position={[cx, WIN.y0 / 2, -2.6]}>
        <planeGeometry args={[w, WIN.y0]} />
        {wall}
      </mesh>
      {/* Warm wall-wash sconce on the left wall, behind the headline */}
      <mesh position={[-2.4, 2.3, -2.58]}>
        <planeGeometry args={[0.05, 0.7]} />
        <meshBasicMaterial color="#ffcf8a" toneMapped={false} />
      </mesh>

      {/* City view */}
      <mesh position={[cx, 2.1, -3.4]}>
        <planeGeometry args={[w + 1.8, 3.9]} />
        <meshBasicMaterial map={skyline} toneMapped={false} />
      </mesh>
      {/* Glass pane reflection */}
      <mesh position={[cx, (WIN.y0 + WIN.y1) / 2, -2.58]}>
        <planeGeometry args={[w, WIN.y1 - WIN.y0]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.05} roughness={0.05} metalness={0.1} />
      </mesh>
      {/* Mullions */}
      {[WIN.x0, WIN.x0 + w / 3, WIN.x0 + (2 * w) / 3, WIN.x1].map((x) => (
        <mesh key={x} position={[x, (WIN.y0 + WIN.y1) / 2, -2.55]}>
          <boxGeometry args={[0.07, WIN.y1 - WIN.y0, 0.08]} />
          <meshStandardMaterial color="#0a0a0b" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {[WIN.y0, WIN.y1, 2.6].map((y) => (
        <mesh key={y} position={[cx, y, -2.55]}>
          <boxGeometry args={[w + 0.07, 0.06, 0.09]} />
          <meshStandardMaterial color="#0a0a0b" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

const DESK = { x: 1.6, w: 3.0, z: -0.62, top: 0.76 };

function Desk() {
  const x0 = DESK.x - DESK.w / 2 + 0.15;
  const x1 = DESK.x + DESK.w / 2 - 0.15;
  const legs: [number, number][] = [
    [x0, -1.0],
    [x1, -1.0],
    [x0, -0.25],
    [x1, -0.25],
  ];
  return (
    <group>
      {/* Walnut top with a clear-coat, so the lamp and screens reflect in it */}
      <RoundedBox args={[DESK.w, 0.06, 0.95]} radius={0.02} position={[DESK.x, DESK.top, DESK.z]}>
        <meshPhysicalMaterial color="#2e1d12" roughness={0.42} clearcoat={0.8} clearcoatRoughness={0.18} envMapIntensity={1.2} />
      </RoundedBox>
      {/* gold edge trim */}
      <mesh position={[DESK.x, DESK.top - 0.032, DESK.z + 0.476]}>
        <boxGeometry args={[DESK.w, 0.006, 0.006]} />
        <meshBasicMaterial color="#e2b973" toneMapped={false} />
      </mesh>
      {/* Warm under-desk LED wash */}
      <mesh position={[DESK.x, DESK.top - 0.045, DESK.z + 0.35]}>
        <boxGeometry args={[DESK.w - 0.3, 0.008, 0.02]} />
        <meshBasicMaterial color="#ffc27a" toneMapped={false} />
      </mesh>
      <pointLight position={[DESK.x, 0.45, DESK.z + 0.3]} color="#ffb05a" intensity={2.2} distance={2.2} decay={1.8} />
      {legs.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.37, z]}>
          <boxGeometry args={[0.05, 0.74, 0.05]} />
          <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.3} />
        </mesh>
      ))}
      {/* Keyboard + mouse */}
      <RoundedBox args={[0.7, 0.02, 0.21]} radius={0.008} position={[1.5, 0.8, -0.36]}>
        <meshStandardMaterial color="#1b1b1e" roughness={0.55} metalness={0.2} />
      </RoundedBox>
      <RoundedBox args={[0.07, 0.025, 0.11]} radius={0.012} position={[2.0, 0.8, -0.36]}>
        <meshStandardMaterial color="#1b1b1e" roughness={0.45} metalness={0.2} />
      </RoundedBox>
      {/* Ceramic cup */}
      <mesh position={[2.85, 0.84, -0.32]}>
        <cylinderGeometry args={[0.045, 0.038, 0.11, 24]} />
        <meshStandardMaterial color="#1c1a19" roughness={0.25} metalness={0.2} />
      </mesh>
      {/* Desk-level soft shadows, baked once */}
      <ContactShadows position={[DESK.x, DESK.top + 0.031, DESK.z]} scale={[DESK.w, 0.95]} opacity={0.75} blur={1.6} far={0.8} resolution={256} frames={1} color="#000000" />
    </group>
  );
}

/**
 * Monitor with a live-coding screen: a GSAP timeline types through four files, shows terminal
 * output, then cross-fades to the next tab, looping. The canvas texture is repainted only when
 * something visible changed (max ~20×/s), and the timeline pauses whenever the hero is off-screen.
 */
function Monitor({
  glow,
  active,
  reduced,
  lowPower,
}: {
  glow: MutableRefObject<THREE.MeshBasicMaterial | null>;
  active: boolean;
  reduced: boolean;
  lowPower: boolean;
}) {
  const editor = useMemo(() => createEditorCanvas(lowPower ? 1024 : 1280), [lowPower]);
  const state = useRef<EditorState>({ file: 0, chars: reduced ? PREPARED[0].total : 0, term: reduced ? 9 : 0, alpha: 1, cursorOn: true });
  const last = useRef({ key: "", at: 0 });
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Build the looping typing timeline once.
  useEffect(() => {
    if (reduced) return;
    const st = state.current;
    const loop = gsap.timeline({ repeat: -1, paused: true });
    PREPARED.forEach((file, i) => {
      loop.set(st, { file: i, chars: 0, term: 0 });
      loop.to(st, { alpha: 1, duration: 0.35, ease: "power1.out" });
      // type line by line with a natural pause at each line end
      let typed = 0;
      file.lengths.forEach((len, li) => {
        typed += len + 1;
        loop.to(st, { chars: typed, duration: Math.max(0.12, len / 34), ease: "none" });
        if (li < file.lengths.length - 1) loop.to({}, { duration: len === 0 ? 0.25 : 0.06 + ((li * 7) % 5) * 0.03 });
      });
      loop.to(st, { term: file.terminal.length, duration: 0.5 * file.terminal.length, ease: "steps(" + file.terminal.length + ")" }, "+=0.35");
      loop.to({}, { duration: 2.2 }); // let it read
      loop.to(st, { alpha: 0, duration: 0.4, ease: "power1.in" });
    });
    tl.current = loop;
    return () => {
      loop.kill();
      tl.current = null;
    };
  }, [reduced]);

  // Pause typing while the hero is off-screen.
  useEffect(() => {
    const loop = tl.current;
    if (!loop) return;
    if (active) loop.play();
    else loop.pause();
  }, [active]);

  useFrame(({ clock }) => {
    const st = state.current;
    const t = clock.elapsedTime;
    const typing = !reduced && Math.floor(st.chars) < PREPARED[st.file].total && st.alpha > 0.99;
    st.cursorOn = typing || Math.floor(t * 2) % 2 === 0;
    const key = `${st.file}|${Math.floor(st.chars)}|${Math.floor(st.term)}|${st.alpha.toFixed(2)}|${st.cursorOn}`;
    if (key === last.current.key || t - last.current.at < 0.05) return;
    last.current = { key, at: t };
    editor.draw(st);
  });

  useEffect(() => () => editor.dispose(), [editor]);

  return (
    <group position={[1.5, 1.21, -0.94]}>
      <RoundedBox args={[1.42, 0.7, 0.035]} radius={0.012}>
        <meshStandardMaterial color="#0b0b0d" metalness={0.6} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[1.37, 0.656]} />
        <meshBasicMaterial ref={glow} map={editor.texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.37, -0.04]}>
        <boxGeometry args={[0.06, 0.2, 0.03]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.445, 0.0]}>
        <boxGeometry args={[0.3, 0.012, 0.18]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Laptop() {
  const screen = useMemo(() => dashboardTexture(), []);
  return (
    <group position={[2.5, 0.79, -0.55]} rotation-y={-0.4}>
      <RoundedBox args={[0.5, 0.016, 0.34]} radius={0.006}>
        <meshStandardMaterial color="#2a2a2e" metalness={0.7} roughness={0.3} />
      </RoundedBox>
      <group position={[0, 0.008, -0.17]} rotation-x={-0.32}>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.5, 0.32, 0.01]} />
          <meshStandardMaterial color="#2a2a2e" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.16, 0.0055]}>
          <planeGeometry args={[0.47, 0.29]} />
          <meshBasicMaterial map={screen} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Vertical alpha ramp for the lamp's light cone: bright under the shade, gone at the desk. */
function beamTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "rgba(255,214,150,0.9)");
  grad.addColorStop(0.55, "rgba(255,196,120,0.25)");
  grad.addColorStop(1, "rgba(255,196,120,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Soft cone of lamplight with a few slow dust motes (high quality tier only). */
function LampBeam({ reduced }: { reduced: boolean }) {
  const tex = useMemo(() => beamTexture(), []);
  return (
    <group position={[2.98, 0.79, -0.98]}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.15, 0.62, 0.6, 40, 1, true]} />
        <meshBasicMaterial map={tex} transparent opacity={0.16} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {!reduced && <Sparkles count={18} scale={[0.75, 0.55, 0.75]} position={[0, 0.3, 0]} size={1.4} speed={0.12} opacity={0.55} color="#ffe2b0" noise={0.4} />}
    </group>
  );
}

function Lamp({ light }: { light: MutableRefObject<THREE.PointLight | null> }) {
  return (
    <group position={[2.98, 0.79, -0.98]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.04, 32]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.011, 0.011, 0.62, 12]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} />
      </mesh>
      {/* Linen shade: glowing cream outside, brighter inside */}
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.13, 0.17, 0.3, 48, 1, true]} />
        <meshBasicMaterial color="#ffe7bd" side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#fff6e0" toneMapped={false} />
      </mesh>
      {/* glow halo */}
      <mesh position={[0, 0.74, 0.02]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshBasicMaterial color="#ffb560" transparent opacity={0.07} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[0, 0.62, 0.08]} color="#ffbb6e" intensity={7} distance={6} decay={1.5} />
      <spotLight position={[0, 0.6, 0]} angle={1} penumbra={0.9} color="#ffc583" intensity={10} distance={2.6} />
    </group>
  );
}

function Chair() {
  return (
    <group position={[1.05, 0, 0.5]} rotation-y={0.45}>
      <RoundedBox args={[0.62, 0.09, 0.58]} radius={0.04} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#141416" roughness={0.75} />
      </RoundedBox>
      <RoundedBox args={[0.58, 0.66, 0.07]} radius={0.05} position={[0, 0.92, 0.3]} rotation-x={0.12}>
        <meshStandardMaterial color="#121214" roughness={0.6} metalness={0.15} />
      </RoundedBox>
      {[-0.33, 0.33].map((x) => (
        <mesh key={x} position={[x, 0.66, 0.05]}>
          <boxGeometry args={[0.04, 0.04, 0.42]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.42, 12]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, 0.06, 0]} rotation-y={(i / 5) * Math.PI * 2}>
          <boxGeometry args={[0.04, 0.03, 0.62]} />
          <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Bookshelf() {
  const books = useMemo(() => {
    const rand = seeded(42);
    const palette = ["#3b2b22", "#1f2a2c", "#5b4632", "#2e2420", "#6d5338", "#1c1c20", "#4a3a2a"];
    const out: { x: number; y: number; w: number; h: number; c: string }[] = [];
    for (const y of [0.62, 1.32, 2.02]) {
      let x = -0.6;
      while (x < 0.55) {
        const w = 0.04 + rand() * 0.05;
        const h = 0.26 + rand() * 0.16;
        if (rand() > 0.12) out.push({ x: x + w / 2, y: y + h / 2, w, h, c: palette[Math.floor(rand() * palette.length)] });
        x += w + 0.006;
      }
    }
    return out;
  }, []);
  return (
    <group position={[3.95, 0, -2.25]}>
      {/* Frame */}
      {[-0.68, 0.68].map((x) => (
        <mesh key={x} position={[x, 1.35, 0]}>
          <boxGeometry args={[0.05, 2.7, 0.36]} />
          <meshStandardMaterial color="#120f0d" roughness={0.6} />
        </mesh>
      ))}
      {[0.6, 1.3, 2.0, 2.7].map((y) => (
        <group key={y}>
          <mesh position={[0, y, 0]}>
            <boxGeometry args={[1.36, 0.035, 0.36]} />
            <meshStandardMaterial color="#120f0d" roughness={0.6} />
          </mesh>
          {/* warm LED strip under each shelf */}
          <mesh position={[0, y - 0.022, 0.15]}>
            <boxGeometry args={[1.3, 0.008, 0.01]} />
            <meshBasicMaterial color="#ffc477" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0]}>
          <boxGeometry args={[b.w, b.h, 0.24]} />
          <meshStandardMaterial color={b.c} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

const LEAF_GEOMETRY = typeof window !== "undefined" ? new THREE.ShapeGeometry(leafShape(), 8) : null;
const LEAF_COLORS = ["#24432a", "#2d5233", "#1d3823", "#36603b"];

function Plant({ position, scale = 1, seed = 1, leaves: count = 16 }: { position: [number, number, number]; scale?: number; seed?: number; leaves?: number }) {
  const leaves = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => {
      const yaw = (i / count) * Math.PI * 2 + rand() * 0.5;
      return {
        yaw,
        tilt: 0.35 + rand() * 0.75, // how far the stem leans out
        y: 0.3 + rand() * 0.25,
        s: 0.75 + rand() * 0.6,
        c: LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)],
      };
    });
  }, [seed, count]);
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.16, 0.12, 0.32, 32]} />
        <meshStandardMaterial color="#141210" roughness={0.3} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.322, 0]}>
        <torusGeometry args={[0.16, 0.006, 6, 32]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
      {LEAF_GEOMETRY &&
        leaves.map((l, i) => (
          <group key={i} position={[0, l.y, 0]} rotation={[0, l.yaw, 0]}>
            <group rotation={[l.tilt, 0, 0]}>
              <mesh geometry={LEAF_GEOMETRY} scale={l.s} rotation={[0, 0, 0]}>
                <meshStandardMaterial color={l.c} roughness={0.55} side={THREE.DoubleSide} />
              </mesh>
            </group>
          </group>
        ))}
    </group>
  );
}

function GlassBoard() {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    let cancelled = false;
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-caveat").trim() || "cursive";
    document.fonts
      .load(`600 92px ${family}`)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setTex(scriptBoardTexture(family));
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <group position={[2.55, 2.05, -1.95]} rotation-y={-0.25}>
      <mesh>
        <boxGeometry args={[0.95, 1.18, 0.02]} />
        <meshPhysicalMaterial color="#20180f" transparent opacity={0.35} roughness={0.15} metalness={0.2} />
      </mesh>
      {tex && (
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.9, 1.12]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      )}
      {/* gold edges */}
      {[
        [0, 0.59, 0.95, 0.008],
        [0, -0.59, 0.95, 0.008],
        [0.475, 0, 0.008, 1.18],
        [-0.475, 0, 0.008, 1.18],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, 0.012]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color="#e9c587" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// Camera path endpoints and scratch vectors (module-level: one hero scene per page).
const CAM_START = { pos: new THREE.Vector3(-0.3, 1.72, 4.6), look: new THREE.Vector3(1.0, 1.48, -0.8) };
const CAM_END = { pos: new THREE.Vector3(1.3, 1.42, 2.05), look: new THREE.Vector3(1.55, 1.2, -0.95) };
// Into the monitor: square-on to the screen, close enough that it overfills the frame.
const SCREEN_CENTER = new THREE.Vector3(1.5, 1.21, -0.92);
const CAM_SCREEN = { pos: new THREE.Vector3(1.5, 1.21, -0.92 + 0.22), look: SCREEN_CENTER };
// Desktop hero progress: push-in [0, FLY_SPLIT] → flight into the monitor [FLY_SPLIT, FLY_END]
// → welcome sequence (HTML, in Hero) for the remainder.
const FLY_SPLIT = 0.38;
const FLY_END = 0.74;
const camTarget = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const lookCurrent = new THREE.Vector3().copy(CAM_START.look);

function Rig({ control, reduced }: { control: MutableRefObject<SceneControl>; reduced: boolean }) {
  useFrame(({ camera, size }, delta) => {
    const { progress, pointer, fly } = control.current;
    const pushRaw = fly ? Math.min(1, progress / FLY_SPLIT) : progress;
    const flyRaw = fly ? Math.min(1, Math.max(0, (progress - FLY_SPLIT) / (FLY_END - FLY_SPLIT))) : 0;
    const p = reduced ? 0 : THREE.MathUtils.smootherstep(pushRaw, 0, 1);
    const f = reduced ? 0 : THREE.MathUtils.smootherstep(flyRaw, 0, 1);
    camTarget.lerpVectors(CAM_START.pos, CAM_END.pos, p);
    lookTarget.lerpVectors(CAM_START.look, CAM_END.look, p);
    if (f > 0) {
      camTarget.lerp(CAM_SCREEN.pos, f);
      lookTarget.lerp(CAM_SCREEN.look, Math.min(1, f * 1.6));
    }
    // Make room for the hero portrait on the right; eases away as the push-in begins.
    if (control.current.portrait) {
      const room = 1 - p;
      camTarget.x += 0.3 * room;
      camTarget.z += 0.6 * room;
      lookTarget.x += 0.34 * room;
    }
    // Portrait screens see a narrow slice; pull back and centre on the monitor.
    const portrait = size.width / size.height < 0.9;
    if (portrait) {
      camTarget.z += 2.2 * (1 - p);
      camTarget.x += 1.0;
      lookTarget.x += 0.5;
    }
    if (!reduced) {
      // parallax fades out as we commit to the flight
      camTarget.x += pointer.x * 0.28 * (1 - f);
      camTarget.y += pointer.y * 0.14 * (1 - f);
    }
    // tighter follow during the flight so the screen lines up precisely
    const k = 1 - Math.exp(-delta * (3.5 + f * 4));
    camera.position.lerp(camTarget, k);
    lookCurrent.lerp(lookTarget, k);
    camera.lookAt(lookCurrent);
  });
  return null;
}

function Ambience({ control, reduced, active, lowPower }: { control: MutableRefObject<SceneControl>; reduced: boolean; active: boolean; lowPower: boolean }) {
  const lamp = useRef<THREE.PointLight | null>(null);
  const screen = useRef<THREE.MeshBasicMaterial | null>(null);
  const windowLight = useRef<THREE.DirectionalLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = control.current.progress;
    if (lamp.current) lamp.current.intensity = 7 + (reduced ? 0 : Math.sin(t * 1.1) * 0.2) + p * 2;
    // the room warms as you scroll into the workstation
    if (windowLight.current) windowLight.current.intensity = 1.8 - p * 0.6;
    // the screen glows brighter as the camera dives into it
    const flyP = control.current.fly ? Math.min(1, Math.max(0, (p - FLY_SPLIT) / (FLY_END - FLY_SPLIT))) : 0;
    if (screen.current) screen.current.color.setScalar(0.9 + Math.min(p, FLY_SPLIT) * 0.5 + flyP * 0.45);
  });
  return (
    <>
      <ambientLight intensity={0.3} color="#ffe2c0" />
      <hemisphereLight args={["#ffcf9a", "#0b0907", 0.25]} />
      <directionalLight ref={windowLight} position={[0.5, 2.4, -4]} color="#ffa264" intensity={1.8} />
      <Lamp light={lamp} />
      <Monitor glow={screen} active={active} reduced={reduced} lowPower={lowPower} />
    </>
  );
}

export default function OfficeScene({
  control,
  reduced,
  lowPower,
  active,
  onReady,
}: {
  control: MutableRefObject<SceneControl>;
  reduced: boolean;
  lowPower: boolean;
  /** Render continuously. Before the first frames are drawn the scene always renders, to warm up. */
  active: boolean;
  /** Called once the first frames (shaders, environment, baked shadows) are on screen. */
  onReady?: () => void;
}) {
  const { dpr, tier, monitor } = useAdaptiveQuality(lowPower);
  const visible = usePageVisible();
  const { warm, warmer } = useWarmUp();
  useEffect(() => {
    if (warm) onReady?.();
  }, [warm, onReady]);
  return (
    <Canvas
      dpr={dpr}
      frameloop={(active || !warm) && visible ? "always" : "never"}
      camera={{ fov: 40, position: [-0.3, 1.72, 4.6], near: 0.1, far: 40 }}
      gl={{ antialias: !lowPower, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.25;
      }}
    >
      {monitor}
      {warmer}
      <color attach="background" args={["#070607"]} />
      <fog attach="fog" args={["#070607", 7, 16]} />
      <Rig control={control} reduced={reduced} />
      <Ambience control={control} reduced={reduced} active={active && visible} lowPower={lowPower} />
      {tier === "high" && <LampBeam reduced={reduced} />}
      <Room />
      <Desk />
      <Laptop />
      <Chair />
      <Bookshelf />
      <GlassBoard />
      <Plant position={[-1.25, 0, -1.9]} scale={1.9} seed={3} leaves={20} />
      <Plant position={[0.45, 0.79, -1.02]} scale={0.75} seed={9} />
      {tier === "high" && <Plant position={[4.75, 0, -1.3]} scale={2.1} seed={5} leaves={22} />}
      <ContactShadows position={[0, 0.005, 0]} opacity={0.75} scale={12} blur={2.2} far={2.5} resolution={tier === "high" ? 512 : 256} color="#000000" frames={1} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} color="#ffb070" position={[-2, 2.5, -3]} scale={[6, 3, 1]} />
        <Lightformer form="circle" intensity={4} color="#ffd59a" position={[3, 1.6, -0.9]} scale={0.8} />
        <Lightformer form="rect" intensity={0.5} color="#f0d8b0" position={[1, 3, 3]} scale={[4, 1, 1]} />
      </Environment>
    </Canvas>
  );
}
