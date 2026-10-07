/**
 * Currency formatter matching GanadoCarnes format:
 * "$ 2.500.000" (pesos colombianos con separador de miles con punto)
 */
export function formatCOP(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$ 0';
  const rounded = Math.round(amount);
  const formattedNumber = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$ ${formattedNumber}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return dateString;
  }
}

export function calculateAgeMonths(birthDayString: string): number {
  if (!birthDayString) return 0;
  const birth = new Date(birthDayString);
  const now = new Date();
  if (isNaN(birth.getTime())) return 0;
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}
