"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial, RoundedBox, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import type { Skill } from "@/content/skills";
import { glowTexture, skillCardTexture } from "./skillCardTexture";
import { useAdaptiveQuality, usePageVisible, useWarmUp } from "./quality";
import { accentPalette, useAccent, type AccentId, type AccentPalette } from "@/lib/accent";

/** `pulse` is a counter: the parent increments it to make the crystal flare once. */
export type CrystalControl = { progress: number; pointer: { x: number; y: number }; pulse: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/* ------------------------------------------------------------------ crystal */

/** Brilliant-cut gem: octagonal crown with a table, thin girdle, long pavilion. Flat-shaded facets. */
function useGemGeometry() {
  return useMemo(() => {
    const crown = new THREE.CylinderGeometry(0.42, 0.8, 0.62, 8, 1, false);
    crown.translate(0, 0.31 + 0.05, 0);
    const girdle = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 8, 1, true);
    const pavilion = new THREE.ConeGeometry(0.8, 1.75, 8, 1, false);
    pavilion.rotateX(Math.PI);
    pavilion.translate(0, -0.05 - 0.875, 0);
    const positions: number[] = [];
    for (const geo of [crown, girdle, pavilion]) {
      const flat = geo.index ? geo.toNonIndexed() : geo;
      positions.push(...(flat.getAttribute("position").array as Float32Array));
      geo.dispose();
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    out.computeVertexNormals(); // non-indexed → one normal per facet
    out.translate(0, 0.35, 0);
    return out;
  }, []);
}

const GEM_BACKGROUND = new THREE.Color("#0b0907");

function Crystal({ control, reduced, lowPower, pal }: { control: MutableRefObject<CrystalControl>; reduced: boolean; lowPower: boolean; pal: AccentPalette }) {
  const group = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const coreLight = useRef<THREE.PointLight>(null);
  const halo = useRef<THREE.Sprite>(null);
  const geometry = useGemGeometry();
  const glow = useMemo(() => glowTexture(), []);
  const flare = useRef({ seen: 0, level: 0, spin: 0 });

  useFrame(({ clock }, delta) => {
    const c = control.current;
    const f = flare.current;
    if (c.pulse !== f.seen) {
      f.seen = c.pulse;
      f.level = 1;
      f.spin += Math.PI / 2; // a quarter-turn flourish on each selection
    }
    f.level = Math.max(0, f.level - delta * 1.4);
    const enter = reduced ? 1 : easeOut(c.progress / 0.55);
    const t = clock.elapsedTime;

    if (group.current) {
      group.current.position.y = -0.7 * (1 - enter) + (reduced ? 0 : Math.sin(t * 0.9) * 0.06);
      group.current.scale.setScalar(0.72 + 0.28 * enter + f.level * 0.05);
    }
    if (gem.current) {
      const target = (reduced ? 0 : t * 0.22) + f.spin;
      gem.current.rotation.y += (target - gem.current.rotation.y) * (1 - Math.exp(-delta * 4));
      gem.current.rotation.z = Math.sin(t * 0.4) * (reduced ? 0 : 0.04);
    }
    const breathe = reduced ? 0 : Math.sin(t * 1.6) * 0.12;
    if (core.current) (core.current.material as THREE.MeshBasicMaterial).opacity = 0.55 + breathe + f.level * 0.4;
    if (coreLight.current) coreLight.current.intensity = 3.5 + breathe * 6 + f.level * 8;
    if (halo.current) {
      halo.current.material.opacity = 0.32 + breathe * 0.4 + f.level * 0.35;
      halo.current.scale.setScalar(3.6 + f.level * 0.8);
    }
  });

  return (
    <group ref={group}>
      <sprite ref={halo} position={[0, 0.25, -0.6]} scale={3.6}>
        <spriteMaterial map={glow} color={pal.glow} transparent opacity={0.32} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <mesh ref={gem} geometry={geometry}>
        {lowPower ? (
          <meshPhysicalMaterial
            color={pal["200"]}
            metalness={0.35}
            roughness={0.08}
            clearcoat={1}
            clearcoatRoughness={0.05}
            transparent
            opacity={0.82}
            envMapIntensity={1.6}
            flatShading
          />
        ) : (
          <MeshTransmissionMaterial
            backside
            backsideThickness={0.35}
            samples={6}
            resolution={512}
            transmission={1}
            thickness={1.1}
            roughness={0.035}
            ior={1.9}
            chromaticAberration={0.05}
            anisotropy={0.2}
            distortion={0.12}
            distortionScale={0.4}
            temporalDistortion={0.04}
            color={pal["100"]}
            attenuationColor={pal["200"]}
            attenuationDistance={2.8}
            clearcoat={1}
            envMapIntensity={1.4}
            background={GEM_BACKGROUND}
            flatShading
          />
        )}
      </mesh>
      {/* inner light */}
      <mesh ref={core} position={[0, 0.2, 0]} scale={[0.16, 0.42, 0.16]}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color={pal["200"]} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <pointLight ref={coreLight} position={[0, 0.2, 0]} color={pal.glow} intensity={3.5} distance={4.5} decay={1.6} />
    </group>
  );
}

/* --------------------------------------------------------------- orbit rings */

const RINGS = [
  { r: 1.55, tilt: [1.25, 0, 0.18] as [number, number, number], speed: 0.32, opacity: 0.9, beads: 2 },
  { r: 1.9, tilt: [1.05, 0.35, -0.3] as [number, number, number], speed: -0.22, opacity: 0.55, beads: 1 },
  { r: 2.25, tilt: [1.42, -0.2, 0.42] as [number, number, number], speed: 0.14, opacity: 0.35, beads: 1 },
];

function OrbitRings({ control, reduced, pal }: { control: MutableRefObject<CrystalControl>; reduced: boolean; pal: AccentPalette }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((_, delta) => {
    const enter = reduced ? 1 : easeOut((control.current.progress - 0.1) / 0.5);
    refs.current.forEach((g, i) => {
      if (!g) return;
      if (!reduced) g.rotation.z += delta * RINGS[i].speed;
      g.scale.setScalar(0.55 + 0.45 * enter);
    });
  });
  return (
    <group position={[0, 0.2, 0]}>
      {RINGS.map((ring, i) => (
        <group key={i} rotation={ring.tilt}>
          <group
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            <mesh>
              <torusGeometry args={[ring.r, 0.0065, 8, 220]} />
              <meshBasicMaterial color={pal["200"]} transparent opacity={ring.opacity} toneMapped={false} />
            </mesh>
            {Array.from({ length: ring.beads }, (_, b) => {
              const a = (b / ring.beads) * Math.PI * 2 + i;
              return (
                <mesh key={b} position={[Math.cos(a) * ring.r, Math.sin(a) * ring.r, 0]}>
                  <sphereGeometry args={[0.035, 12, 12]} />
                  <meshBasicMaterial color={pal["100"]} toneMapped={false} />
                </mesh>
              );
            })}
          </group>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ pedestal */

function Pedestal({ pal }: { pal: AccentPalette }) {
  const glow = useMemo(() => glowTexture(), []);
  return (
    <group position={[0, -1.95, 0]}>
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[1.5, 1.58, 0.16, 72]} />
        <meshPhysicalMaterial color="#0f0e0d" roughness={0.22} clearcoat={1} clearcoatRoughness={0.1} metalness={0.3} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[1.12, 1.2, 0.24, 72]} />
        <meshPhysicalMaterial color="#171513" roughness={0.18} clearcoat={1} clearcoatRoughness={0.06} metalness={0.35} />
      </mesh>
      <mesh position={[0, 0.122, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.06, 1.12, 96]} />
        <meshBasicMaterial color={pal["200"]} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      {/* light pool on the pedestal top */}
      <mesh position={[0, 0.125, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshBasicMaterial map={glow} color={pal.glow} transparent opacity={0.45} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* --------------------------------------------------------------- tech cards */

type CardProps = {
  skill: Skill;
  index: number;
  count: number;
  fontFamily: string;
  selected: boolean;
  hovered: MutableRefObject<number>;
  orbit: MutableRefObject<number>;
  deckStart: MutableRefObject<number>;
  control: MutableRefObject<CrystalControl>;
  reduced: boolean;
  scale: number;
  onSelect: (name: string) => void;
  onHover: (index: number) => void;
  onHoverEnd: (index: number) => void;
  accent: AccentId;
  pal: AccentPalette;
};

const tmpTarget = new THREE.Vector3();
const DEAL_FROM = new THREE.Vector3(0, -1.7, 0);

function TechCard({ skill, index, count, fontFamily, selected, hovered, orbit, deckStart, control, reduced, scale, onSelect, onHover, onHoverEnd, accent, pal }: CardProps) {
  const root = useRef<THREE.Group>(null);
  const slab = useRef<THREE.MeshPhysicalMaterial>(null);
  const face = useRef<THREE.MeshBasicMaterial>(null);
  const highlight = useRef<THREE.MeshBasicMaterial>(null);
  const lift = useRef(0);
  const texture = useMemo(() => skillCardTexture(skill, fontFamily, accent), [skill, fontFamily, accent]);
  const glow = useMemo(() => glowTexture(), []);

  useFrame(({ clock, camera, viewport }, delta) => {
    const g = root.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
    const rx = Math.min(2.95, vp.width / 2 - 0.55 * scale);
    const rz = 1.5;

    // scroll entrance (staggered) combined with a re-deal when the category changes
    const scrollIn = reduced ? 1 : easeOut((control.current.progress - 0.18 - index * 0.028) / 0.42);
    const dealIn = reduced ? 1 : easeOut((t - deckStart.current - index * 0.055) / 0.7);
    const vis = Math.min(scrollIn, dealIn);

    const angle = (index / count) * Math.PI * 2 + orbit.current + Math.PI / 2;
    const tier = count > 6 ? (index % 2 === 0 ? 0.62 : -0.48) : 0; // alternate high/low so neighbours don't overlap
    tmpTarget.set(
      Math.cos(angle) * rx,
      0.1 + tier + (reduced ? 0 : Math.sin(t * 0.8 + index) * 0.05),
      Math.sin(angle) * rz,
    );
    g.position.lerpVectors(DEAL_FROM, tmpTarget, vis);

    const isHover = hovered.current === index;
    lift.current += ((isHover ? 1 : selected ? 0.6 : 0) - lift.current) * (1 - Math.exp(-delta * 8));
    g.scale.setScalar(scale * (0.35 + 0.65 * vis) * (1 + lift.current * 0.12));
    g.lookAt(camera.position);

    // cards passing behind the crystal recede a little
    const depth = clamp01((g.position.z + rz) / (2 * rz));
    const fade = vis * (0.45 + 0.55 * depth);
    if (slab.current) slab.current.opacity = 0.62 * fade;
    if (face.current) face.current.opacity = fade;
    if (highlight.current) highlight.current.opacity = fade * (0.15 + lift.current * 0.75);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(index);
  };
  const out = () => onHoverEnd(index);

  return (
    <group ref={root}>
      <mesh position={[0, 0, -0.06]} scale={[1.7, 1.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={highlight} map={glow} color={pal.glow} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <RoundedBox
        args={[0.86, 1.02, 0.05]}
        radius={0.07}
        smoothness={4}
        onPointerOver={over}
        onPointerOut={out}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(skill.name);
        }}
      >
        <meshPhysicalMaterial
          ref={slab}
          color="#1b1612"
          transparent
          opacity={0.62}
          roughness={0.16}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={1.7}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.027]}>
        <planeGeometry args={[0.86, 1.02]} />
        <meshBasicMaterial ref={face} map={texture} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CardRing({
  skills,
  selected,
  onSelect,
  control,
  reduced,
  lowPower,
  accent,
  pal,
}: {
  skills: Skill[];
  selected: string;
  onSelect: (name: string) => void;
  control: MutableRefObject<CrystalControl>;
  reduced: boolean;
  lowPower: boolean;
  accent: AccentId;
  pal: AccentPalette;
}) {
  const hovered = useRef(-1);
  const orbit = useRef(0);
  const speed = useRef(0.07);
  const deckStart = useRef(-100);
  const lastDeck = useRef<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const clock = useThree((s) => s.clock);
  const deckKey = skills.map((s) => s.name).join("|");

  // Card faces use the site font; wait for it so canvas text isn't drawn in a fallback face.
  useEffect(() => {
    let cancelled = false;
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-manrope").trim() || "sans-serif";
    document.fonts
      .load(`600 40px ${family}`)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setFontFamily(family);
      });
    return () => {
      cancelled = true;
      document.body.style.cursor = "";
    };
  }, []);

  // New category → deal the new cards in from the pedestal (first deck arrives with the scroll instead)
  useEffect(() => {
    if (lastDeck.current !== null && lastDeck.current !== deckKey) {
      deckStart.current = clock.elapsedTime;
      hovered.current = -1;
    }
    lastDeck.current = deckKey;
  }, [deckKey, clock]);

  useFrame((_, delta) => {
    const target = reduced || hovered.current >= 0 ? 0 : 0.07; // pause while aiming at a card
    speed.current += (target - speed.current) * (1 - Math.exp(-delta * 3));
    orbit.current += delta * speed.current;
  });

  const hoverCard = (index: number) => {
    hovered.current = index;
    document.body.style.cursor = "pointer";
  };
  const leaveCard = (index: number) => {
    if (hovered.current === index) hovered.current = -1;
    document.body.style.cursor = "";
  };

  if (!fontFamily) return null;
  const visible = skills.slice(0, lowPower ? 8 : 12);
  return (
    <group>
      {visible.map((s, i) => (
        <TechCard
          key={s.name}
          skill={s}
          index={i}
          count={visible.length}
          fontFamily={fontFamily}
          selected={s.name === selected}
          hovered={hovered}
          orbit={orbit}
          deckStart={deckStart}
          control={control}
          reduced={reduced}
          scale={lowPower ? 0.8 : 1}
          onSelect={onSelect}
          accent={accent}
          pal={pal}
          onHover={hoverCard}
          onHoverEnd={leaveCard}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------- camera */

const LOOK_AT = new THREE.Vector3(0, -0.4, 0);

function Rig({ control, reduced }: { control: MutableRefObject<CrystalControl>; reduced: boolean }) {
  useFrame(({ camera }, delta) => {
    const { pointer, progress } = control.current;
    const k = 1 - Math.exp(-delta * 2.5);
    const px = reduced ? 0 : pointer.x * 0.55;
    const py = reduced ? 0 : pointer.y * 0.3;
    // a slow crane down as the section scrolls into place
    const crane = reduced ? 0 : (1 - easeOut(progress / 0.7)) * 1.2;
    camera.position.x += (px - camera.position.x) * k;
    camera.position.y += (1.35 + py + crane - camera.position.y) * k;
    camera.lookAt(LOOK_AT);
  });
  return null;
}

export default function CrystalScene({
  control,
  reduced,
  lowPower,
  active,
  skills,
  selected,
  onSelect,
}: {
  control: MutableRefObject<CrystalControl>;
  reduced: boolean;
  lowPower: boolean;
  active: boolean;
  skills: Skill[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  const { dpr, tier, monitor } = useAdaptiveQuality(lowPower);
  // accent theme: re-read the CSS palette whenever the visitor switches it
  const accent = useAccent();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- accent is the trigger to re-read the CSS variables
  const pal = useMemo(() => accentPalette(), [accent]);
  const visible = usePageVisible();
  // mounted ahead of the section, so the transmission shader compiles before it's on screen
  const { warm, warmer } = useWarmUp();
  return (
    <Canvas
      dpr={dpr}
      frameloop={(active || !warm) && visible ? "always" : "never"}
      camera={{ position: [0, 1.35, 9.6], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      {monitor}
      {warmer}
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} color="#ffe2b0" />
      <directionalLight position={[-4, 1, -3]} intensity={0.9} color={pal["400"]} />
      <Rig control={control} reduced={reduced} />
      <Crystal control={control} reduced={reduced} lowPower={tier !== "high"} pal={pal} />
      <OrbitRings control={control} reduced={reduced} pal={pal} />
      <Pedestal pal={pal} />
      <CardRing skills={skills} selected={selected} onSelect={onSelect} control={control} reduced={reduced} lowPower={lowPower} accent={accent} pal={pal} />
      {tier === "high" && !reduced && <Sparkles count={30} scale={[6, 4, 3]} size={2} speed={0.22} opacity={0.5} color={pal["200"]} />}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={4} color="#ffd9a0" position={[0, 4, 3]} scale={[5, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ff9e57" position={[-4, 0.5, 1]} scale={[1, 4, 1]} />
        <Lightformer form="ring" intensity={2} color="#fff2d6" position={[4, 1.5, -1]} scale={2} />
        <Lightformer form="rect" intensity={0.6} color="#8a6cff" position={[0, -2, -3]} scale={[5, 2, 1]} />
      </Environment>
    </Canvas>
  );
}
