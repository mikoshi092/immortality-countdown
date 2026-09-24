import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("escapes </script> so it cannot close a script tag", () => {
    const html = serializeJsonLd({
      headline: "Example </script><script>alert(1)</script>",
    });
    assert.equal(html.includes("</script>"), false);
    assert.ok(html.includes("\\u003c/script>"));
    assert.ok(html.includes("\\u003cscript>"));
  });
});
