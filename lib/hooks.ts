"use client";

import { useEffect, useLayoutEffect, useState, useSyncExternalStore, type RefObject } from "react";
import { gsap } from "./gsap";

export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function subscribeMedia(query: string) {
  return (cb: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  };
}

export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

let webglSupport: boolean | null = null;
function detectWebGL() {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

export function useWebGL() {
  return useSyncExternalStore(
    () => () => {},
    detectWebGL,
    () => false,
  );
}

/** True once the element has come near the viewport — used to lazy-mount 3D canvases. */
export function useNearViewport(ref: RefObject<Element | null>, rootMargin = "300px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, near]);
  return near;
}

/** Tracks whether the element is currently on screen — used to pause offscreen render loops. */
export function useInViewport(ref: RefObject<Element | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

/** Runs GSAP setup scoped to `scope`, reverting every tween and ScrollTrigger on cleanup. */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: (ctx: gsap.Context) => void, deps: unknown[] = []) {
  useIsoLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context((self) => setup(self), scope.current);
    return () => ctx.revert();
  }, deps);
}
