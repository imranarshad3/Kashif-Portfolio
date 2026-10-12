/** Plain module (no "use client") so the server layout can inline the script string. */
export const ACCENT_KEY = "kashif-accent";

const IDS = ["gold", "rose", "platinum", "emerald", "sapphire"];

/**
 * Runs in <head> before first paint so a saved accent never flashes gold first.
 * Storage can be unavailable (private mode, blocked site data): it then stays on gold.
 */
export const ACCENT_PREPAINT = `(function(){try{var a=localStorage.getItem("${ACCENT_KEY}");if(${JSON.stringify(IDS)}.indexOf(a)>0)document.documentElement.setAttribute("data-accent",a)}catch(e){}})()`;
