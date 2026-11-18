/**
 * Lógica pura de la comparativa de ventas: semillas (API de Semillas del Valle) frente a
 * bovinos (base de datos propia). No accede a red ni a base de datos, por lo que es fácil
 * de probar y se puede importar desde cualquier parte.
 *
 * Principio de diseño: los intervalos (semanas, meses o años) los define Semillas en su
 * respuesta; las ventas de bovinos se agrupan EXACTAMENTE en esos mismos intervalos para
 * que cada barra compare lo mismo con lo mismo.
 */

import { formatCOP, formatDecimal, formatPercent } from "~/utils/formatters.ts";
import { addDays, diffDays } from "~/utils/iso-date.ts";
import type {
  SemillasConversion,
  SemillasPeriodo,
  SemillasSalesReport,
} from "./semillas.types.ts";

// ---------------------------------------------------------------------------
// Entradas (lo que devuelve la base de datos de bovinos)
// ---------------------------------------------------------------------------

/** Ventas completadas de bovinos de un día (hora de Bogotá). */
export interface BovineDailyRow {
  /** YYYY-MM-DD */
  day: string;
  /** Facturas con al menos un bovino ese día. */
  orders: number;
  /** Bovinos vendidos. */
  units: number;
  total: number;
}

export interface BovineCategoryRow {
  category: string;
  units: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Salida
// ---------------------------------------------------------------------------

export interface ComparativaPunto {
  etiqueta: string;
  /** Primer día del intervalo. */
  desde: string;
  /** Último día del intervalo (inclusive). */
  hasta: string;
  /** El intervalo incluye el día de hoy: su total es parcial. */
  enCurso: boolean;
  bovinos: { total: number; pedidos: number; unidades: number };
  semillas: { total: number; pedidos: number };
  total: number;
  /** Porcentaje (0-100) del total del intervalo que corresponde a semillas; `null` si no hubo ventas. */
  participacionSemillas: number | null;
}

export interface ComparativaCategoria {
  nombre: string;
  total: number;
  /** Porcentaje (0-100) sobre el total de su lado. */
  participacion: number | null;
}

export interface ComparativaLado {
  total: number;
  /** Variación porcentual frente al periodo inmediatamente anterior de igual duración. */
  variacion: number | null;
  pedidos: number;
  unidades: number;
  ticketPromedio: number;
  porCategoria: ComparativaCategoria[];
}

export interface ComparativaProductoSemillas {
  id: number;
  nombre: string;
  presentacion: string;
  unidades: number;
  total: number;
  participacion: number | null;
}

export interface Comparativa {
  periodo: SemillasPeriodo;
  etiquetaPeriodo: string;
  desde: string;
  hasta: string;
  hoy: string;
  generadoEn: string;
  serie: ComparativaPunto[];
  bovinos: ComparativaLado;
  semillas: ComparativaLado & {
    clientes: number;
    productosDistintos: number;
    masVendidos: ComparativaProductoSemillas[];
    conversion: SemillasConversion;
  };
  combinado: {
    total: number;
    participacionSemillas: number | null;
    participacionBovinos: number | null;
    /** Cuántas veces mayor es el lado más grande; `null` si alguno de los dos no vendió. */
    razon: { mayor: "bovinos" | "semillas" | "igual"; veces: number } | null;
  };
  mejorPeriodo: {
    bovinos: { etiqueta: string; total: number } | null;
    semillas: { etiqueta: string; total: number } | null;
  };
}

// ---------------------------------------------------------------------------
// Utilidades numéricas
// ---------------------------------------------------------------------------

const round1 = (value: number) => Math.round(value * 10) / 10;
const round2 = (value: number) => Math.round(value * 100) / 100;

function percent(part: number, whole: number): number | null {
  return whole > 0 ? round1((part / whole) * 100) : null;
}

/** Misma definición que usa Semillas: sin base de comparación no hay variación. */
function variation(current: number, previous: number): number | null {
  return previous > 0 ? round1(((current - previous) / previous) * 100) : null;
}

function describePeriod(periodo: SemillasPeriodo, count: number): string {
  if (periodo === "semana") return count === 1 ? "Última semana" : `Últimas ${count} semanas`;
  if (periodo === "mes") return count === 1 ? "Último mes" : `Últimos ${count} meses`;
  return count === 1 ? "Último año" : `Últimos ${count} años`;
}

// ---------------------------------------------------------------------------
// Ventana de consulta de bovinos
// ---------------------------------------------------------------------------

export interface BovineWindow {
  /** Inicio del periodo anterior de igual duración (para calcular la variación). */
  previousFrom: string;
  /** Primer día del periodo del reporte. */
  from: string;
  /** Día siguiente al último del reporte (límite exclusivo). */
  toExclusive: string;
}

/** Ventana que debe consultarse en la base de bovinos para alinearse con el reporte de Semillas. */
export function bovineWindow(report: Pick<SemillasSalesReport, "desde" | "hasta">): BovineWindow {
  const toExclusive = addDays(report.hasta, 1);
  const length = diffDays(report.desde, toExclusive);
  return { previousFrom: addDays(report.desde, -length), from: report.desde, toExclusive };
}

// ---------------------------------------------------------------------------
// Construcción de la comparativa
// ---------------------------------------------------------------------------

export interface BuildComparativaInput {
  semillas: SemillasSalesReport;
  /** Debe cubrir el periodo anterior y el actual (ver `bovineWindow`). */
  bovinosDiario: BovineDailyRow[];
  /** Solo del periodo actual. */
  bovinosCategorias: BovineCategoryRow[];
  /** Fecha de hoy en Bogotá (YYYY-MM-DD). */
  hoy: string;
  generadoEn: string;
}

function withShare<T extends { total: number }>(items: T[]): Array<T & { participacion: number | null }> {
  const base = items.reduce((sum, item) => sum + item.total, 0);
  return items.map((item) => ({ ...item, participacion: percent(item.total, base) }));
}

function bestPeriod(points: ComparativaPunto[], pick: (point: ComparativaPunto) => number) {
  let best: ComparativaPunto | null = null;
  for (const point of points) {
    if (pick(point) > 0 && (best === null || pick(point) > pick(best))) best = point;
  }
  return best ? { etiqueta: best.etiqueta, total: pick(best) } : null;
}

export function buildComparativa(input: BuildComparativaInput): Comparativa {
  const { semillas, bovinosDiario, bovinosCategorias, hoy, generadoEn } = input;
  const range = bovineWindow(semillas);

  // Intervalos de Semillas: cada uno termina donde empieza el siguiente.
  const intervals = semillas.serie.map((punto, index) => {
    const toExclusive = index + 1 < semillas.serie.length ? semillas.serie[index + 1].desde : range.toExclusive;
    return { punto, toExclusive };
  });

  const bovineByInterval = intervals.map(() => ({ total: 0, pedidos: 0, unidades: 0 }));
  let bovinePrevious = 0;

  for (const row of bovinosDiario) {
    if (row.day >= range.from && row.day < range.toExclusive) {
      const index = intervals.findIndex(({ punto, toExclusive }) => row.day >= punto.desde && row.day < toExclusive);
      if (index >= 0) {
        bovineByInterval[index].total += row.total;
        bovineByInterval[index].pedidos += row.orders;
        bovineByInterval[index].unidades += row.units;
      }
    } else if (row.day >= range.previousFrom && row.day < range.from) {
      bovinePrevious += row.total;
    }
  }

  const serie: ComparativaPunto[] = intervals.map(({ punto, toExclusive }, index) => {
    const bovinos = {
      total: round2(bovineByInterval[index].total),
      pedidos: bovineByInterval[index].pedidos,
      unidades: bovineByInterval[index].unidades,
    };
    const semillasPunto = { total: round2(punto.total), pedidos: punto.pedidos };
    const total = round2(bovinos.total + semillasPunto.total);
    return {
      etiqueta: punto.etiqueta,
      desde: punto.desde,
      hasta: addDays(toExclusive, -1),
      enCurso: hoy >= punto.desde && hoy < toExclusive,
      bovinos,
      semillas: semillasPunto,
      total,
      participacionSemillas: percent(semillasPunto.total, total),
    };
  });

  // Los totales se obtienen de la misma serie que se dibuja, así KPI, gráfico y tabla siempre cuadran.
  const bovinosTotal = round2(serie.reduce((sum, p) => sum + p.bovinos.total, 0));
  const semillasTotal = round2(serie.reduce((sum, p) => sum + p.semillas.total, 0));
  const bovinosPedidos = serie.reduce((sum, p) => sum + p.bovinos.pedidos, 0);
  const bovinosUnidades = serie.reduce((sum, p) => sum + p.bovinos.unidades, 0);
  const combinadoTotal = round2(bovinosTotal + semillasTotal);

  const shareSemillas = percent(semillasTotal, combinadoTotal);
  const shareBovinos = shareSemillas === null ? null : round1(100 - shareSemillas);

  let razon: Comparativa["combinado"]["razon"] = null;
  if (bovinosTotal > 0 && semillasTotal > 0) {
    if (bovinosTotal === semillasTotal) razon = { mayor: "igual", veces: 1 };
    else if (bovinosTotal > semillasTotal) razon = { mayor: "bovinos", veces: round1(bovinosTotal / semillasTotal) };
    else razon = { mayor: "semillas", veces: round1(semillasTotal / bovinosTotal) };
  }

  const bovinosPorCategoria = withShare(
    bovinosCategorias
      .filter((row) => row.total > 0)
      .map((row) => ({ nombre: row.category, total: round2(row.total) }))
      .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, "es"))
  );

  const semillasPorCategoria = withShare(
    semillas.por_categoria
      .filter((row) => row.total > 0)
      .map((row) => ({ nombre: row.categoria, total: round2(row.total) }))
      .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, "es"))
  );

  return {
    periodo: semillas.periodo,
    etiquetaPeriodo: describePeriod(semillas.periodo, serie.length),
    desde: semillas.desde,
    hasta: semillas.hasta,
    hoy,
    generadoEn,
    serie,
    bovinos: {
      total: bovinosTotal,
      variacion: variation(bovinosTotal, bovinePrevious),
      pedidos: bovinosPedidos,
      unidades: bovinosUnidades,
      ticketPromedio: bovinosPedidos > 0 ? Math.round(bovinosTotal / bovinosPedidos) : 0,
      porCategoria: bovinosPorCategoria,
    },
    semillas: {
      total: semillasTotal,
      variacion: semillas.variacion,
      pedidos: semillas.pedidos,
      unidades: semillas.unidades_vendidas,
      ticketPromedio: semillas.pedidos > 0 ? Math.round(semillasTotal / semillas.pedidos) : 0,
      porCategoria: semillasPorCategoria,
      clientes: semillas.clientes,
      productosDistintos: semillas.productos_distintos,
      masVendidos: semillas.mas_vendidos.map((producto) => ({
        ...producto,
        participacion: percent(producto.total, semillasTotal),
      })),
      conversion: semillas.conversion,
    },
    combinado: {
      total: combinadoTotal,
      participacionSemillas: shareSemillas,
      participacionBovinos: shareBovinos,
      razon,
    },
    mejorPeriodo: {
      bovinos: bestPeriod(serie, (p) => p.bovinos.total),
      semillas: bestPeriod(serie, (p) => p.semillas.total),
    },
  };
}

// ---------------------------------------------------------------------------
// Conclusión en lenguaje natural
// ---------------------------------------------------------------------------

/** Frase que resume la comparativa (se muestra como conclusión sobre el gráfico). */
export function describeComparativa(comparativa: Comparativa): string {
  const { etiquetaPeriodo, bovinos, semillas, combinado, mejorPeriodo } = comparativa;

  if (combinado.total === 0) {
    return `${etiquetaPeriodo}: no hay ventas completadas de bovinos ni de semillas.`;
  }
  if (semillas.total === 0) {
    return `${etiquetaPeriodo}: solo hubo ventas de bovinos (${formatCOP(bovinos.total)}); no se registraron ventas de semillas.`;
  }
  if (bovinos.total === 0) {
    return `${etiquetaPeriodo}: solo hubo ventas de semillas (${formatCOP(semillas.total)}); no se registraron ventas de bovinos.`;
  }

  const { razon } = combinado;
  let main: string;
  if (!razon || razon.mayor === "igual" || razon.veces <= 1.1) {
    main = "las ventas de bovinos y de semillas fueron similares";
  } else if (razon.mayor === "bovinos") {
    main = `los bovinos generaron ${formatDecimal(razon.veces, 1)} veces los ingresos de las semillas`;
  } else {
    main = `las semillas generaron ${formatDecimal(razon.veces, 1)} veces los ingresos de los bovinos`;
  }

  const share = `Las semillas aportan el ${formatPercent(combinado.participacionSemillas)} del total combinado (${formatCOP(combinado.total)}).`;
  const best =
    mejorPeriodo.bovinos && mejorPeriodo.semillas
      ? ` Mejor periodo en bovinos: ${mejorPeriodo.bovinos.etiqueta}; en semillas: ${mejorPeriodo.semillas.etiqueta}.`
      : "";

  return `${etiquetaPeriodo}: ${main}. ${share}${best}`;
}
