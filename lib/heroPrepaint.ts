/** Plain module (no "use client") so the server layout can inline the script string. */
export const HERO_PENDING = "hero-pending";

/**
 * Runs in <head> before first paint. The hero's entrance animates its copy in from hidden, so
 * with motion allowed the server-rendered copy starts hidden too; otherwise it would paint
 * fully, vanish at hydration and then animate in. The Hero removes the class as it sets up;
 * the timeout only rescues the copy if scripts fail to run.
 */
export const HERO_PREPAINT = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var d=document.documentElement;d.classList.add("${HERO_PENDING}");setTimeout(function(){d.classList.remove("${HERO_PENDING}")},6000)}catch(e){}})()`;
