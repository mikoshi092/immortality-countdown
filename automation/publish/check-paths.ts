import { disallowedChangedPaths, protectedChangedPaths } from "./paths";
import { pathToFileURL } from "node:url";

export function assertAutoPublishPaths(changedPaths: string[]): {
  ok: true;
} | { ok: false; reason: string; disallowed: string[]; protectedChanged: string[] } {
  const disallowed = disallowedChangedPaths(changedPaths);
  const protectedChanged = protectedChangedPaths(changedPaths);
  if (protectedChanged.length > 0 || disallowed.length > 0) {
    return {
      ok: false,
      reason:
        protectedChanged.length > 0
          ? `protected file changed: ${protectedChanged.join(", ")}`
          : `disallowed path changed: ${disallowed.join(", ")}`,
      disallowed,
      protectedChanged,
    };
  }
  return { ok: true };
}

const isCli =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCli) {
  const paths = process.argv.slice(2).filter((path) => path.length > 0);
  const result = assertAutoPublishPaths(paths);
  if (!result.ok) {
    console.error(result.reason);
    process.exitCode = 1;
  }
}
