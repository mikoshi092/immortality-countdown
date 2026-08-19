/**
 * Crawls every internal link on the built site and fails on anything that
 * is not 200, plus any in-page anchor (#foo) whose target id is missing.
 *
 *   node scripts/check-links.mjs [baseUrl]
 *
 * This is the check that catches a nav item pointing at a route nobody
 * created, or an anchor that stops existing when a section is renamed —
 * the class of bug that is invisible in review and obvious to a visitor.
 */
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const seen = new Set();
const queue = ["/"];
const failures = [];
/** path -> Set of anchor ids present on that page */
const anchors = new Map();
/** [fromPath, hrefWithHash] pairs to verify once every page is fetched */
const anchorRefs = [];

const isInternal = (href) =>
  href &&
  !href.startsWith("//") &&
  !/^[a-z][a-z0-9+.-]*:/i.test(href) &&
  !href.startsWith("#");

function collect(html) {
  const hrefs = [...html.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)].map((m) => m[1]);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/gi)].map((m) => m[1]));
  return { hrefs, ids };
}

while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);

  let res;
  try {
    res = await fetch(BASE + path, { redirect: "manual" });
  } catch (err) {
    failures.push(`${path} — request failed: ${err.message}`);
    continue;
  }

  if (res.status !== 200) {
    failures.push(`${path} — HTTP ${res.status}`);
    continue;
  }

  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) continue;

  const { hrefs, ids } = collect(await res.text());
  anchors.set(path, ids);

  for (const href of hrefs) {
    if (!isInternal(href)) continue;
    const [rawPath, hash] = href.split("#");
    const target = (rawPath || path).replace(/\/$/, "") || "/";
    if (hash) anchorRefs.push([path, target, hash]);
    if (!seen.has(target)) queue.push(target);
  }
}

for (const [from, target, hash] of anchorRefs) {
  const ids = anchors.get(target);
  if (!ids) {
    failures.push(`${from} → ${target}#${hash} — target page was never reached`);
  } else if (!ids.has(hash)) {
    failures.push(`${from} → ${target}#${hash} — no element with id="${hash}"`);
  }
}

console.log(`checked ${seen.size} pages, ${anchorRefs.length} anchor links`);

if (failures.length) {
  console.error(`\n${failures.length} broken link(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log("no broken internal links");
