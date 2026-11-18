/**
 * Escala "agradable" para el eje vertical de un gráfico: devuelve un máximo y un paso
 * redondos (1, 2, 2.5, 5 × 10^n) que contienen el valor máximo con pocas líneas guía.
 */
export function niceScale(maxValue: number, targetTicks = 4): { max: number; step: number } {
  if (!Number.isFinite(maxValue) || maxValue <= 0) return { max: 1, step: 1 };
  const rough = maxValue / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  const step = factor * magnitude;
  return { max: step * Math.ceil(maxValue / step - 1e-9), step };
}

/** Valores de las líneas guía: 0, step, 2·step, … max. */
export function scaleTicks(max: number, step: number): number[] {
  const ticks: number[] = [];
  for (let value = 0; value <= max + step / 1e6; value += step) ticks.push(Math.round(value * 1e6) / 1e6);
  return ticks;
}
