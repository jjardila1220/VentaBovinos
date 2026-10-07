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
