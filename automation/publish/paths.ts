/**
 * Paths an automatic news PR may change.
 * Anything else, including model files and existing UI, fails the workflow.
 */
export const AUTO_PUBLISH_ALLOWED_PATHS = ["data/articles.ts"] as const;

export const AUTO_PUBLISH_PROTECTED_PATHS = [
  "lev/params.json",
  "lev/forecast.json",
] as const;

const PROTECTED_PREFIXES = ["lev/", "app/", "components/", "lib/", "automation/"];

export function normalizeRepoPath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function isProtectedPath(path: string): boolean {
  const normalized = normalizeRepoPath(path);
  if ((AUTO_PUBLISH_ALLOWED_PATHS as readonly string[]).includes(normalized)) {
    return false;
  }
  if ((AUTO_PUBLISH_PROTECTED_PATHS as readonly string[]).includes(normalized)) {
    return true;
  }
  return PROTECTED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function disallowedChangedPaths(changedPaths: string[]): string[] {
  return changedPaths
    .map(normalizeRepoPath)
    .filter((path) => path.length > 0)
    .filter(
      (path) => !(AUTO_PUBLISH_ALLOWED_PATHS as readonly string[]).includes(path),
    );
}

export function protectedChangedPaths(changedPaths: string[]): string[] {
  return changedPaths.map(normalizeRepoPath).filter(isProtectedPath);
}
