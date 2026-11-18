/**
 * Tipos de la integración con la API de Semillas del Valle.
 *
 * Este archivo no contiene código de servidor: se puede importar tanto desde
 * servicios (`*.server.ts`) como desde componentes de React.
 */

/** Periodos que expone `GET /api/reportes/ventas/?periodo=` en Semillas del Valle. */
export const PERIODOS = ["semana", "mes", "anio"] as const;
export type SemillasPeriodo = (typeof PERIODOS)[number];
export const PERIODO_POR_DEFECTO: SemillasPeriodo = "mes";

/** Lista blanca: cualquier valor desconocido (o manipulado) cae en el periodo por defecto. */
export function parsePeriodo(value: string | null | undefined): SemillasPeriodo {
  return (PERIODOS as readonly string[]).includes(value ?? "")
    ? (value as SemillasPeriodo)
    : PERIODO_POR_DEFECTO;
}

export interface SemillasSeriePunto {
  etiqueta: string;
  /** Primer día del intervalo (YYYY-MM-DD, hora de Bogotá). */
  desde: string;
  total: number;
  pedidos: number;
}

export interface SemillasProductoVendido {
  id: number;
  nombre: string;
  presentacion: string;
  unidades: number;
  total: number;
}

export interface SemillasCategoriaVendida {
  categoria: string;
  total: number;
}

export interface SemillasConversion {
  unidades_vendidas: number;
  unidades_canceladas: number;
  unidades_apartadas_ahora: number;
  porcentaje_compradas: number | null;
}

/** Respuesta ya validada de `GET /api/reportes/ventas/`. */
export interface SemillasSalesReport {
  periodo: SemillasPeriodo;
  /** Primer día cubierto por el reporte. */
  desde: string;
  /** Último día cubierto por el reporte (inclusive). */
  hasta: string;
  total_ventas: number;
  variacion: number | null;
  pedidos: number;
  clientes: number;
  productos_distintos: number;
  unidades_vendidas: number;
  ticket_promedio: number;
  serie: SemillasSeriePunto[];
  mas_vendidos: SemillasProductoVendido[];
  por_categoria: SemillasCategoriaVendida[];
  conversion: SemillasConversion;
}
