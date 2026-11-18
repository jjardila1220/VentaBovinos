/**
 * Utilidades para fechas de calendario en formato ISO (YYYY-MM-DD).
 *
 * Toda la aritmética se hace en UTC para que el resultado no dependa de la zona
 * horaria del servidor. Colombia no tiene horario de verano (UTC-5 fijo), por lo que
 * "el día de Bogotá" se obtiene restando cinco horas al instante.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;
const BOGOTA_OFFSET_HOURS = 5;

function parts(iso: string): [number, number, number] {
  const [year, month, day] = iso.split("-").map(Number);
  return [year, month, day];
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** `true` solo para fechas reales con formato YYYY-MM-DD (rechaza 2026-02-30, 2026-13-01, etc.). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [year, month, day] = parts(value);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Suma (o resta, con valores negativos) días a una fecha ISO. */
export function addDays(iso: string, days: number): string {
  const [year, month, day] = parts(iso);
  return toIso(new Date(Date.UTC(year, month - 1, day + days)));
}

/** Días transcurridos desde `from` hasta `to` (positivo si `to` es posterior). */
export function diffDays(from: string, to: string): number {
  const [fy, fm, fd] = parts(from);
  const [ty, tm, td] = parts(to);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / MS_PER_DAY);
}

/** Fecha de hoy en Bogotá (UTC-5) para el instante dado. */
export function bogotaToday(now: Date = new Date()): string {
  return toIso(new Date(now.getTime() - BOGOTA_OFFSET_HOURS * 3_600_000));
}

/** Instante exacto en que empieza el día `iso` en Bogotá (00:00 UTC-5). */
export function bogotaDayStart(iso: string): Date {
  return new Date(`${iso}T00:00:00-0${BOGOTA_OFFSET_HOURS}:00`);
}
