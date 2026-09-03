/** Paths that do not require authentication and should not use AppShell. */
export const PUBLIC_PATHS = [
  "/",
  "/health",
  "/login",
  "/esqueci-senha",
  "/redefinir-senha",
] as const;

export function isPublicPath(pathname: string): boolean {
  if ((PUBLIC_PATHS as readonly string[]).includes(pathname)) return true;
  if (pathname.startsWith("/invite/")) return true;
  return false;
}

/** Authenticated app chrome (classic or harmony) wraps these paths. */
export function shouldUseAppShell(pathname: string, isAuthenticated: boolean): boolean {
  if (isPublicPath(pathname)) return false;
  return isAuthenticated;
}
