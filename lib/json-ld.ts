/**
 * Serialize JSON-LD for a <script type="application/ld+json"> tag.
 *
 * JSON.stringify alone is not safe here: a string containing `</script>`
 * would close the tag and let the rest of the payload run as HTML/JS.
 * Escaping `<` to `\u003c` keeps the JSON valid and stops that breakout.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
