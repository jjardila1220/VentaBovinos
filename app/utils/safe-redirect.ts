/**
 * Evita "open redirect": solo se aceptan rutas internas ("/algo"). Rechaza URLs absolutas,
 * "//host", "/\\host" y caracteres de control.
 */
export function safeRedirect(target: FormDataEntryValue | string | null | undefined, fallback = "/"): string {
  if (typeof target !== "string" || target.length === 0 || target.length > 2048) return fallback;
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(target)) return fallback;
  return target;
}
