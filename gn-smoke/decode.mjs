// Step-0 smoke test (temporary; deleted after the run): verify that the
// Google News two-step decode (googlenewsdecoder method) works from the
// GitHub Actions egress, and that the keyword RSS feeds are reachable
// from there at all. Writes a full log to gn-smoke/RESULT.md and emits
// the headline verdicts as workflow annotations.

import { writeFileSync } from "node:fs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const lines = [];
function say(message) {
  const line = String(message);
  console.log(line);
  lines.push(line);
}
function annotate(kind, message) {
  // Workflow commands: surface in the run's annotations (publicly readable).
  console.log(`::${kind}::${String(message).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A")}`);
}

function unescapeHtml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Recursively find a JSON string that parses to ["garturlreq", ...]. */
function findGarturlreq(value, depth = 0) {
  if (depth > 6 || value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed[0] === "garturlreq") return parsed;
        return findGarturlreq(parsed, depth + 1);
      } catch {
        return null;
      }
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findGarturlreq(item, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function extractDecodeParams(html) {
  const match = html.match(/<c-wiz[^>]*\sdata-p="([^"]+)"/);
  if (!match) return null;
  const dataP = unescapeHtml(match[1]);
  say(`DATA_P prefix: ${dataP.slice(0, 80)}`);
  const candidates = [dataP, dataP.replace(/^%\.\@\./, "")];
  for (const candidate of candidates) {
    try {
      const outer = JSON.parse(candidate);
      const inner = findGarturlreq(outer);
      if (inner) return inner;
    } catch {
      // try the next candidate shape
    }
    const inner = findGarturlreq(candidate);
    if (inner) return inner;
  }
  return null;
}

function extractResolvedUrl(text) {
  // Structured path: lines of JSON after the )]}' prefix; find the
  // wrb.fr entry for Fbv4je and read its payload.
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("[")) continue;
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (!Array.isArray(parsed)) continue;
    for (const entry of parsed) {
      if (Array.isArray(entry) && entry[0] === "wrb.fr" && entry[1] === "Fbv4je" && typeof entry[2] === "string") {
        try {
          const payload = JSON.parse(entry[2]);
          if (Array.isArray(payload) && typeof payload[1] === "string" && /^https?:\/\//.test(payload[1])) {
            return payload[1];
          }
        } catch {
          // fall through to the regex scan
        }
      }
    }
  }
  // Fallback: first non-Google https URL in the unescaped body.
  const unescaped = text.replace(/\\\//g, "/");
  for (const match of unescaped.matchAll(/https?:\/\/[^\s"'\\<>]+/g)) {
    try {
      const host = new URL(match[0]).hostname;
      if (!/(^|\.)google\.com$|(^|\.)googleusercontent\.com$|(^|\.)gstatic\.com$/.test(host)) return match[0];
    } catch {
      // keep scanning
    }
  }
  return null;
}

async function decode(token, locale) {
  const pageUrl = `https://news.google.com/articles/${token}?hl=${locale.hl}&gl=${locale.gl}&ceid=${locale.ceid}`;
  let html;
  try {
    const response = await fetch(pageUrl, {
      headers: { "user-agent": UA, "accept-language": locale.hl },
      redirect: "follow",
    });
    say(`ARTICLE_PAGE status=${response.status}`);
    html = await response.text();
  } catch (error) {
    say(`ARTICLE_PAGE_ERROR ${error instanceof Error ? error.message : error}`);
    return null;
  }
  say(`ARTICLE_PAGE bytes=${html.length}`);
  const params = extractDecodeParams(html);
  if (!params) {
    say("DECODE_PARAMS_NOT_FOUND");
    return null;
  }
  const [, localeArray, paramToken, timestamp, signature] = params;
  say(
    `PARAMS tokenMatch=${paramToken === token} timestampType=${typeof timestamp} signatureLength=${String(signature ?? "").length} locale=${JSON.stringify(localeArray)}`,
  );
  const payload = JSON.stringify(["garturlreq", localeArray, paramToken, timestamp, signature]);
  const body = new URLSearchParams({
    "f.req": JSON.stringify([[["Fbv4je", payload, null, "generic"]]]),
  });
  let text;
  try {
    const response = await fetch("https://news.google.com/_/DotsSplashUi/data/batchexecute", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        "user-agent": UA,
        referer: "https://news.google.com/",
      },
      body,
    });
    say(`BATCHEXECUTE status=${response.status}`);
    text = await response.text();
  } catch (error) {
    say(`BATCHEXECUTE_ERROR ${error instanceof Error ? error.message : error}`);
    return null;
  }
  say(`BATCHEXECUTE bytes=${text.length}`);
  const resolved = extractResolvedUrl(text);
  if (resolved) say(`RESOLVED ${resolved}`);
  else say("RESOLVED_URL_NOT_FOUND");
  return resolved;
}

async function main() {
  const query = "AI創薬 (資金調達 OR 提携 OR 買収 OR 上場) when:2d";
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ja&gl=JP&ceid=JP:ja`;
  let token = null;
  try {
    const response = await fetch(rssUrl, { headers: { "user-agent": UA } });
    say(`RSS status=${response.status}`);
    const xml = await response.text();
    const links = [...xml.matchAll(/<link>(https:\/\/news\.google\.com\/rss\/articles\/[^<]+)<\/link>/g)].map((m) => m[1]);
    say(`RSS items=${links.length}`);
    const firstTitle = xml.match(/<item>[\s\S]*?<title>([^<]+)<\/title>/)?.[1] ?? "";
    say(`RSS firstTitle=${firstTitle.slice(0, 100)}`);
    if (links.length > 0) {
      token = links[0].match(/articles\/([A-Za-z0-9_-]+)/)?.[1] ?? null;
    }
  } catch (error) {
    say(`RSS_ERROR ${error instanceof Error ? error.message : error}`);
  }
  if (!token) {
    say("VERDICT RSS_NO_TOKEN");
    annotate("error", "GN SMOKE VERDICT: RSS_NO_TOKEN (no in-window item link from Actions egress)");
    return;
  }
  say(`TOKEN prefix=${token.slice(0, 24)} length=${token.length}`);
  const resolved = await decode(token, { hl: "ja", gl: "JP", ceid: "JP:ja" });
  if (resolved) {
    say(`VERDICT DECODE_OK ${resolved}`);
    annotate("notice", `GN SMOKE VERDICT: DECODE_OK resolved=${resolved}`);
  } else {
    say("VERDICT DECODE_FAILED");
    annotate("error", "GN SMOKE VERDICT: DECODE_FAILED (see gn-smoke/RESULT.md on this branch)");
  }
}

main()
  .catch((error) => {
    say(`FATAL ${error instanceof Error ? error.stack ?? error.message : error}`);
    annotate("error", "GN SMOKE VERDICT: FATAL");
  })
  .finally(() => {
    writeFileSync(new URL("./RESULT.md", import.meta.url), lines.join("\n") + "\n");
  });
