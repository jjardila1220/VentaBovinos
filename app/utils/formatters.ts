export function formatCOP(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "$ 0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$ 0";
  const rounded = Math.round(num);
  const formattedNumber = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$ ${formattedNumber}`;
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  try {
    const d = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(d.getTime())) return String(dateString);
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  try {
    const d = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(d.getTime())) return String(dateString);
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return String(dateString);
  }
}

/** Número con separador de miles "." y decimal "," (mismo estilo que `formatCOP`), sin depender del ICU. */
export function formatDecimal(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "0";
  const fixed = Math.abs(value).toFixed(digits);
  const [integer, decimals] = fixed.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = value < 0 && Number(fixed) !== 0 ? "-" : "";
  return `${sign}${grouped}${decimals ? `,${decimals}` : ""}`;
}

/** Entero con separador de miles: 12345 → "12.345". */
export function formatInteger(value: number | null | undefined): string {
  return formatDecimal(Math.round(value ?? 0), 0);
}

/** Porcentaje con un decimal: 30.44 → "30,4 %". Usa espacio de no separación. */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${formatDecimal(value, 1)}\u00A0%`;
}

/** Porcentaje con signo explícito: 30.4 → "+30,4 %", -14.4 → "-14,4 %". */
export function formatSignedPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const text = formatPercent(value);
  return value > 0 && !text.startsWith("-") ? `+${text}` : text;
}

/** Pesos en formato corto para ejes de gráficos: 2555300 → "$ 2,6 M", 454000 → "$ 454 mil". */
export function formatCompactCOP(amount: number | null | undefined): string {
  const value = Math.round(amount ?? 0);
  const trim = (text: string) => text.replace(/,0$/, "");
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$ ${trim(formatDecimal(millions, millions >= 100 ? 0 : 1))} M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `$ ${trim(formatDecimal(thousands, thousands >= 100 ? 0 : 1))} mil`;
  }
  return `$ ${formatDecimal(value, 0)}`;
}

/** Fecha de calendario YYYY-MM-DD → "28 sep 2026", sin desfases por zona horaria. */
export function formatIsoDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
    .format(date)
    .replace(/\./g, "");
}
