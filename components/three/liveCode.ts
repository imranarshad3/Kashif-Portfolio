import * as THREE from "three";

/**
 * "Live coding" monitor: a VS Code-style editor painted onto a canvas that the 3D monitor
 * uses as its screen texture. Typing state is driven by a GSAP timeline (see Monitor in
 * OfficeScene); this module only knows how to draw a given state.
 */

type Lang = "ts" | "py";

export type CodeFile = {
  name: string;
  path: string;
  lang: Lang;
  code: string;
  terminal: { text: string; color: string }[];
};

export const FILES: CodeFile[] = [
  {
    name: "page.tsx",
    path: "app/dashboard/page.tsx",
    lang: "ts",
    code: `import { getInvoices } from "@/lib/billing";
import { RevenueChart } from "@/components/revenue-chart";

export default async function Dashboard() {
  const invoices = await getInvoices({ status: "paid" });
  const total = invoices.reduce((sum, i) => sum + i.amount, 0);

  return (
    <main className="grid gap-6">
      <h1>Revenue</h1>
      <RevenueChart data={invoices} total={total} />
    </main>
  );
}`,
    terminal: [
      { text: "▲ Next.js 16 · ready", color: "#9ca3af" },
      { text: "✓ Compiled /dashboard in 412ms", color: "#86efac" },
    ],
  },
  {
    name: "main.py",
    path: "api/main.py",
    lang: "py",
    code: `from fastapi import FastAPI, Depends
from .schemas import QuoteIn, QuoteOut
from .services import pricing

app = FastAPI(title="Estimates API")

@app.post("/quotes", response_model=QuoteOut, status_code=201)
async def create_quote(body: QuoteIn, db=Depends(get_db)):
    items = await pricing.price_items(body.items, region=body.region)
    quote = await db.quotes.insert(items=items, total=sum(i.cost for i in items))
    return QuoteOut.model_validate(quote)`,
    terminal: [
      { text: "INFO  Uvicorn running on http://127.0.0.1:8000", color: "#9ca3af" },
      { text: "INFO  POST /quotes  201 Created", color: "#86efac" },
    ],
  },
  {
    name: "stripe.ts",
    path: "app/api/webhooks/stripe.ts",
    lang: "ts",
    code: `export async function handleEvent(event: Stripe.Event) {
  const seen = await db.events.find(event.id);
  if (seen) return { status: "duplicate" };

  await db.transaction(async (tx) => {
    await tx.events.insert({ id: event.id });
    await applyBilling(tx, event);
  });

  return { status: "processed" };
}`,
    terminal: [
      { text: "$ pnpm test webhooks", color: "#9ca3af" },
      { text: "✓ ignores duplicate events (idempotent)", color: "#86efac" },
      { text: "✓ retries failed deliveries with backoff", color: "#86efac" },
    ],
  },
  {
    name: "rag.py",
    path: "agents/rag.py",
    lang: "py",
    code: `async def answer(question: str) -> AsyncIterator[str]:
    chunks = await store.search(embed(question), k=8)
    context = rerank(question, chunks)[:4]

    stream = client.messages.stream(
        model=settings.MODEL,
        system=PROMPT,
        messages=[{"role": "user", "content": build(question, context)}],
    )
    async for token in stream.text_stream:
        yield token`,
    terminal: [
      { text: "$ python -m agents.eval", color: "#9ca3af" },
      { text: "✓ retrieved 8 · reranked 4 · streamed answer", color: "#86efac" },
    ],
  },
];

/* --------------------------------------------------------------- highlighting */

const C = {
  text: "#d4d4d8",
  keyword: "#c792ea",
  string: "#c3e88d",
  comment: "#6b7280",
  number: "#f78c6c",
  func: "#82aaff",
  type: "#f3d79f",
  punct: "#89ddff",
  decorator: "#f3d79f",
};

const KW: Record<Lang, Set<string>> = {
  ts: new Set("import export from default async await function const let return if else new type interface of for in".split(" ")),
  py: new Set("from import def async await return if else for in with as class yield lambda None True False".split(" ")),
};

type Tok = [string, string];

const TOKEN = /(\/\/.*$|#.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|(@[A-Za-z_][\w.]*)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d"'`]+)/g;

function highlight(line: string, lang: Lang): Tok[] {
  const out: Tok[] = [];
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(line))) {
    const [t, comment, str, deco, num, word, space] = m;
    if (comment && (lang === "py" ? t.startsWith("#") : t.startsWith("//"))) out.push([t, C.comment]);
    else if (str) out.push([t, C.string]);
    else if (deco && lang === "py") out.push([t, C.decorator]);
    else if (num) out.push([t, C.number]);
    else if (word) {
      const next = line[m.index + t.length];
      if (KW[lang].has(word)) out.push([t, C.keyword]);
      else if (next === "(") out.push([t, C.func]);
      else if (/^[A-Z]/.test(word)) out.push([t, C.type]);
      else out.push([t, C.text]);
    } else if (space) out.push([t, C.text]);
    else out.push([t, C.punct]);
  }
  return out;
}

/** Pre-tokenised files; `chars` counts characters including one per newline. */
export const PREPARED = FILES.map((f) => {
  const lines = f.code.split("\n");
  return { ...f, lines: lines.map((l) => highlight(l, f.lang)), lengths: lines.map((l) => l.length), total: lines.reduce((s, l) => s + l.length + 1, 0) };
});

/* --------------------------------------------------------------- drawing */

export type EditorState = {
  file: number;
  /** characters typed in the current file (float, floored when drawing) */
  chars: number;
  /** terminal lines revealed */
  term: number;
  /** 0 → 1 content visibility, used to cross-fade between files */
  alpha: number;
  /** cursor visible this frame */
  cursorOn: boolean;
};

const BG = "#0b0d13";

export function createEditorCanvas(width: number) {
  const height = Math.round((width * 9) / 16);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext("2d")!;
  const s = width / 1280; // all layout below is in 1280×720 units
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return {
    texture,
    /** Repaint the editor and flag the texture for upload. */
    draw: (state: EditorState) => {
      drawEditor(g, s, state);
      texture.needsUpdate = true;
    },
    dispose: () => texture.dispose(),
  };
}

function drawEditor(g: CanvasRenderingContext2D, s: number, st: EditorState) {
  const W = 1280;
  const H = 720;
  g.setTransform(s, 0, 0, s, 0, 0);
  const file = PREPARED[st.file];
  const mono = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

  // chrome
  g.fillStyle = BG;
  g.fillRect(0, 0, W, H);
  g.fillStyle = "#11141c";
  g.fillRect(0, 0, W, 34);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(20 + i * 20, 17, 6, 0, Math.PI * 2);
    g.fill();
  });
  g.font = `14px ${mono}`;
  g.fillStyle = "#6b7280";
  g.textAlign = "center";
  g.fillText(`${file.path} — kashif-workspace`, W / 2, 22);
  g.textAlign = "left";

  // activity bar + explorer
  g.fillStyle = "#0d1017";
  g.fillRect(0, 34, 48, H - 34);
  [80, 124, 168, 212].forEach((y, i) => {
    g.fillStyle = i === 0 ? "#f3d79f" : "#3a3f4b";
    g.fillRect(16, y, 16, 16);
  });
  g.fillStyle = "#0e1118";
  g.fillRect(48, 34, 210, H - 34);
  g.fillStyle = "#6b7280";
  g.font = `12px ${mono}`;
  g.fillText("EXPLORER", 64, 60);
  g.font = `14px ${mono}`;
  FILES.forEach((f, i) => {
    const y = 92 + i * 28;
    if (i === st.file) {
      g.fillStyle = "rgba(243,215,159,0.10)";
      g.fillRect(48, y - 18, 210, 26);
    }
    // file-type badge
    g.fillStyle = f.lang === "py" ? "#3b82f6" : "#61dafb";
    g.font = `bold 10px ${mono}`;
    g.fillText(f.lang === "py" ? "PY" : "TS", 68, y - 1);
    g.font = `14px ${mono}`;
    g.fillStyle = i === st.file ? "#f3d79f" : "#9ca3af";
    g.fillText(f.name, 92, y);
  });

  // tabs
  const ex = 258;
  g.fillStyle = "#0e1118";
  g.fillRect(ex, 34, W - ex, 36);
  let tx = ex;
  FILES.forEach((f, i) => {
    g.font = `14px ${mono}`;
    const w = g.measureText(f.name).width + 40;
    const on = i === st.file;
    g.fillStyle = on ? BG : "#0e1118";
    g.fillRect(tx, 34, w, 36);
    if (on) {
      g.fillStyle = "#e2b973";
      g.fillRect(tx, 34, w, 2);
    }
    g.fillStyle = on ? "#e5e7eb" : "#6b7280";
    g.fillText(f.name, tx + 20, 57);
    g.fillStyle = "#1c202b";
    g.fillRect(tx + w, 34, 1, 36);
    tx += w + 1;
  });

  // code
  const termH = 150;
  const statusH = 24;
  const top = 96;
  const lineH = 25;
  g.save();
  g.globalAlpha = st.alpha;
  g.font = `17px ${mono}`;
  const gutter = ex + 16;
  const codeX = ex + 64;
  let remaining = Math.floor(st.chars);
  let cursor: [number, number] | null = null;
  for (let li = 0; li < file.lines.length; li++) {
    const y = top + li * lineH;
    if (y > H - termH - statusH - 8) break;
    const len = file.lengths[li];
    const typing = remaining <= len;
    if (remaining < 0) break;
    // line number (active line highlighted)
    g.fillStyle = typing ? "#f3d79f" : "#3a3f4b";
    g.textAlign = "right";
    g.fillText(String(li + 1), gutter + 28, y);
    g.textAlign = "left";
    if (typing) {
      g.fillStyle = "rgba(255,255,255,0.035)";
      g.fillRect(ex, y - 18, W - ex, lineH);
    }
    let x = codeX;
    let left = Math.min(remaining, len);
    for (const [t, color] of file.lines[li]) {
      if (left <= 0) break;
      const part = t.slice(0, left);
      g.fillStyle = color;
      g.fillText(part, x, y);
      x += g.measureText(part).width;
      left -= part.length;
    }
    if (typing) {
      cursor = [x, y];
      break;
    }
    remaining -= len + 1;
  }
  if (cursor && st.cursorOn) {
    g.fillStyle = "#f3d79f";
    g.fillRect(cursor[0] + 1, cursor[1] - 17, 2, 22);
  }
  g.restore();

  // terminal
  const ty = H - termH - statusH;
  g.fillStyle = "#090b10";
  g.fillRect(ex, ty, W - ex, termH);
  g.fillStyle = "#1c202b";
  g.fillRect(ex, ty, W - ex, 1);
  g.font = `12px ${mono}`;
  g.fillStyle = "#e5e7eb";
  g.fillText("TERMINAL", ex + 18, ty + 24);
  g.fillStyle = "#e2b973";
  g.fillRect(ex + 18, ty + 30, 64, 2);
  g.fillStyle = "#6b7280";
  g.fillText("PROBLEMS   OUTPUT", ex + 104, ty + 24);
  g.font = `15px ${mono}`;
  file.terminal.slice(0, Math.floor(st.term)).forEach((l, i) => {
    g.fillStyle = l.color;
    g.fillText(l.text, ex + 18, ty + 60 + i * 24);
  });

  // status bar
  g.fillStyle = "#1a1510";
  g.fillRect(0, H - statusH, W, statusH);
  g.font = `12px ${mono}`;
  g.fillStyle = "#f3d79f";
  g.fillText("⎇ main", 14, H - 7);
  g.fillStyle = "#9ca3af";
  const done = Math.floor(st.chars) >= file.total;
  g.fillText(done ? "✓ saved" : "● editing", 110, H - 7);
  g.textAlign = "right";
  g.fillText(`${file.lang === "py" ? "Python" : "TypeScript React"}   UTF-8   Spaces: 2`, W - 14, H - 7);
  g.textAlign = "left";
}
