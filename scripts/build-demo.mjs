/**
 * Bundles the static export in `out/` into ONE self-contained HTML file so
 * the site can be previewed without a server.
 *
 * Demo-only. Next's own JS bundle is dropped (it expects /_next/* paths),
 * so this file ships a ~60-line stand-in for the three interactive bits:
 * page routing, the mobile menu, and the news category filter.
 *
 *   node scripts/build-demo.mjs > demo.html
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";

/* ---- css ---------------------------------------------------------- */
const cssDir = join(OUT, "_next/static/chunks");
const css = readdirSync(cssDir)
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(join(cssDir, f), "utf8"))
  .join("\n");

/* ---- image as a data URI ------------------------------------------ */
const helix = readFileSync("/tmp/helix-demo.webp").toString("base64");
const helixUri = `data:image/webp;base64,${helix}`;

/* ---- pages -------------------------------------------------------- */
const fieldSlugs = readdirSync(join(OUT, "fields"))
  .filter((f) => f.endsWith(".html"))
  .map((f) => f.replace(/\.html$/, ""));

const routes = [
  ["/", "index.html"],
  ["/methodology", "methodology.html"],
  ["/model", "model.html"],
  ["/fields", "fields.html"],
  ...fieldSlugs.map((s) => [`/fields/${s}`, `fields/${s}.html`]),
];

const titleOf = (html) => (html.match(/<title>([^<]*)<\/title>/) ?? [, ""])[1];

const bodyOf = (html) => {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  if (!m) throw new Error("no body");
  return m[1]
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<template[\s\S]*?<\/template>/g, "")
    .replaceAll("/dna-helix-sketch.png", helixUri)
    // next/image with unoptimized still emits srcset entries pointing at the
    // original path; collapse them so only the inlined src is used.
    .replace(/\ssrcSet="[^"]*"/g, "")
    .replace(/\ssrcset="[^"]*"/g, "");
};

const pages = {};
const titles = {};
for (const [route, file] of routes) {
  const p = join(OUT, file);
  if (!existsSync(p)) continue;
  const html = readFileSync(p, "utf8");
  pages[route] = bodyOf(html);
  titles[route] = titleOf(html);
}

/* ---- news categories, recovered by headline ----------------------- */
let newsMap = {};
try {
  const src = readFileSync("data/news.ts", "utf8");
  const items = [...src.matchAll(/category:\s*"([^"]+)"[\s\S]*?headline:\s*\n?\s*"([^"]+)"/g)];
  newsMap = Object.fromEntries(items.map((m) => [m[2], m[1]]));
} catch {}

/* ---- assemble ----------------------------------------------------- */
const escape = (s) => s.replace(/<\/script>/gi, "<\\/script>");

process.stdout.write(`<!doctype html>
<html lang="en" class="h-full antialiased">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titles["/"] ?? "Immortality Countdown"}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&family=Source+Serif+4:opsz,wght@8..60,200..900&display=swap" rel="stylesheet">
<style>${css}</style>
<style>
  /* next/font normally injects these; the demo build stubs it out. */
  :root {
    --font-geist-sans: "Geist";
    --font-geist-mono: "Geist Mono";
    --font-source-serif: "Source Serif 4";
  }
  /* html gets height:100%, body gets MIN-height only. Setting height:100%
     on the body makes it a definite-height flex container, so <main> shrinks
     to one viewport and the footer lands in the middle of the page with the
     rest of the content overflowing behind it. This mirrors the real
     layout.tsx, which uses h-full on <html> and min-h-full on <body>. */
  html { height: 100%; }
  body { margin: 0; display: flex; flex-direction: column; min-height: 100%; }
  #app { display: contents; }
</style>
</head>
<body>
<div id="app"></div>
<script>
const PAGES = ${escape(JSON.stringify(pages))};
const TITLES = ${escape(JSON.stringify(titles))};
const NEWS = ${escape(JSON.stringify(newsMap))};

const app = document.getElementById("app");

function normalise(path) {
  const p = (path || "/").split("#")[0].replace(/\\/$/, "");
  return p === "" ? "/" : p;
}

function wireMobileMenu() {
  const btn = app.querySelector('[aria-controls="primary-nav-menu"]');
  const menu = app.querySelector("#primary-nav-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", () => {
    const open = menu.classList.contains("hidden");
    menu.classList.toggle("hidden", !open);
    menu.classList.toggle("block", open);
    btn.setAttribute("aria-expanded", String(open));
  });
}

function wireNewsFilter() {
  const group = app.querySelector('[aria-label="Filter latest news by category"]');
  if (!group) return;
  const chips = [...group.querySelectorAll("button")];
  const list = group.parentElement.querySelector(".space-y-4");
  if (!list) return;
  const cards = [...list.children];
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const want = chip.textContent.trim();
      chips.forEach((c) => {
        const on = c === chip;
        c.setAttribute("aria-pressed", String(on));
        c.className = c.className
          .replace(/border-\\[#141413\\] bg-\\[#141413\\] text-white/, "border-black/15 bg-white text-[#17202a]/70")
          .replace(/border-black\\/15 bg-white text-\\[#17202a\\]\\/70/, on
            ? "border-[#141413] bg-[#141413] text-white"
            : "border-black/15 bg-white text-[#17202a]/70");
      });
      cards.forEach((card) => {
        const h = card.querySelector("h3");
        const cat = h ? NEWS[h.textContent.trim()] : null;
        card.style.display = want === "All" || cat === want ? "" : "none";
      });
    });
  });
}

/* LevConceptVisual adds the is-drawn class from an IntersectionObserver;
   without React that class never lands, so .lev-plot-reveal stays clipped to
   zero width and .lev-dot-core / .lev-pulse-ring stay at opacity 0 — the graph
   and its pulsing LEV point simply vanish. Reproduce the observer here.
   (No backticks in here: this comment sits inside a template literal.) */
function wireLevVisual() {
  const figs = [...app.querySelectorAll(".lev-concept-visual")];
  if (!figs.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    figs.forEach((f) => f.classList.add("is-drawn"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-drawn"); io.unobserve(e.target); }
    });
  }, { threshold: 0.25 });
  figs.forEach((f) => io.observe(f));
}

function scrollToHash(hash) {
  if (!hash) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  const el = document.getElementById(hash);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function render(path, hash, push) {
  const route = normalise(path);
  const html = PAGES[route];
  if (!html) return false;
  app.innerHTML = html;
  document.title = TITLES[route] || document.title;
  wireMobileMenu();
  wireNewsFilter();
  wireLevVisual();
  runCountdown();
  if (push) history.pushState({}, "", "#" + route + (hash ? "#" + hash : ""));
  requestAnimationFrame(() => scrollToHash(hash));
  return true;
}

/* The hero numeral rolls down on load in the real build; reproduced here so
   the demo shows the actual behaviour rather than a static number. */
function runCountdown() {
  const el = [...app.querySelectorAll('p span[aria-hidden="true"]')]
    .find((n) => /^\\d+$/.test(n.textContent.trim()));
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const end = parseInt(el.textContent, 10);
  const start = Math.min(99, end + 40);
  let v = start;
  el.textContent = String(v);
  const tick = () => {
    v -= 1;
    el.textContent = String(v);
    if (v > end) setTimeout(tick, v - end < 10 ? 17 + Math.pow(1 - (v - end) / 10, 2) * 60 : 17);
  };
  setTimeout(tick, 17);
}

document.addEventListener("click", (ev) => {
  const a = ev.target.closest("a");
  if (!a) return;
  const href = a.getAttribute("href");
  if (!href || /^[a-z]+:/i.test(href) || href.startsWith("//")) return;
  ev.preventDefault();
  const [path, hash] = href.split("#");
  render(path || location.hash.slice(1).split("#")[0] || "/", hash, true);
});

window.addEventListener("popstate", () => {
  const [route, hash] = location.hash.replace(/^#/, "").split("#");
  render(route || "/", hash, false);
});

const [initial, initialHash] = location.hash.replace(/^#/, "").split("#");
render(initial || "/", initialHash, false);
</script>
</body>
</html>
`);
