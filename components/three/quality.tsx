"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { setConsoleFunction } from "three";

// @react-three/fiber 9.x creates a THREE.Clock per <Canvas>, which three r183+ flags as
// deprecated. Nothing in our code uses Clock; drop just that one notice until R3F moves to
// THREE.Timer. Everything else three reports goes to the console unchanged.
setConsoleFunction((type, message, ...params) => {
  if (type === "warn" && message.startsWith("THREE.Clock: This module has been deprecated")) return;
  console[type](message, ...params);
});

export type QualityTier = "high" | "medium" | "low";

/**
 * Adaptive rendering quality for a <Canvas>.
 * - Pixel ratio scales smoothly with measured frame rate (PerformanceMonitor `factor`).
 * - `tier` lets scenes drop their costliest effects (refraction, sparkles, extra props).
 * - Devices that keep struggling fall back to "low" for the rest of the session.
 */
export function useAdaptiveQuality(lowPower: boolean) {
  const [min, max] = lowPower ? [0.75, 1.25] : [1, 1.75];
  const [factor, setFactor] = useState(lowPower ? 0.6 : 0.85);
  const [tier, setTier] = useState<QualityTier>(lowPower ? "medium" : "high");

  const onChange = useCallback(
    ({ factor: f }: { factor: number }) => {
      setFactor(f);
      setTier((current) => (current === "low" ? "low" : f < 0.35 ? "medium" : lowPower ? "medium" : "high"));
    },
    [lowPower],
  );
  const onFallback = useCallback(() => setTier("low"), []);

  const dpr = Math.round((min + (max - min) * factor) * 100) / 100;
  const monitor = (
    <PerformanceMonitor
      factor={factor}
      step={0.15}
      flipflops={4}
      bounds={(refresh) => (refresh > 90 ? [55, 90] : [42, 58])}
      onChange={onChange}
      onFallback={onFallback}
    />
  );
  return { dpr: tier === "low" ? Math.min(dpr, 1) : dpr, tier, monitor };
}

function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

/** False while the tab is hidden — render loops pause instead of burning battery. */
export function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

function FirstFrames({ frames, onReady }: { frames: number; onReady: () => void }) {
  const count = useRef(0);
  useFrame(() => {
    if (++count.current === frames) onReady();
  });
  return null;
}

/**
 * Shader compilation and one-off render targets (environment maps, baked shadows) all happen on
 * a canvas's first frames, which is where a scene would otherwise hitch. `warmer` renders those
 * frames as soon as the canvas mounts — keep the loop running until `warm` — so the cost is paid
 * before the scene is revealed or scrolled to, never mid-animation.
 */
export function useWarmUp(frames = 3) {
  const [warm, setWarm] = useState(false);
  const onReady = useCallback(() => setWarm(true), []);
  return { warm, warmer: warm ? null : <FirstFrames frames={frames} onReady={onReady} /> };
}
