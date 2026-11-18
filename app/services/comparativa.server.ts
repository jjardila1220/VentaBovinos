/**
 * Orquesta la comparativa de ventas: combina las ventas de semillas (API de Semillas del
 * Valle) con las ventas de bovinos (PostgreSQL propio).
 *
 * Qué se considera "venta de bovinos": las líneas de factura de bovinos (`is_bovine = true`)
 * de ventas en estado "Completado". Las ventas de cortes cárnicos (productos) no cuentan.
 * Qué se considera "venta de semillas": los pedidos "Completado" de Semillas del Valle.
 */

import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "~/db/index.ts";
import { bovines } from "~/db/schema/bovines.ts";
import { saleDetails } from "~/db/schema/sale-details.ts";
import { sales } from "~/db/schema/sales.ts";
import { bogotaDayStart, bogotaToday } from "~/utils/iso-date.ts";
import {
  bovineWindow,
  buildComparativa,
  type BovineCategoryRow,
  type BovineDailyRow,
  type Comparativa,
} from "./comparativa.ts";
import { getSemillasClient } from "./semillas.server.ts";
import type { SemillasPeriodo } from "./semillas.types.ts";

// Día calendario en Bogotá (UTC-5): el mismo criterio con el que Semillas agrupa sus ventas.
const SALE_DAY_BOGOTA = sql<string>`to_char((${sales.date} AT TIME ZONE 'America/Bogota')::date, 'YYYY-MM-DD')`;

/** Líneas de bovinos de ventas completadas con fecha en [from, toExclusive) (días de Bogotá). */
function completedBovineLinesBetween(from: string, toExclusive: string) {
  return and(
    eq(sales.status, "Completado"),
    eq(saleDetails.isBovine, true),
    gte(sales.date, bogotaDayStart(from)),
    lt(sales.date, bogotaDayStart(toExclusive))
  );
}

export async function getBovineDailySales(from: string, toExclusive: string): Promise<BovineDailyRow[]> {
  return db
    .select({
      day: SALE_DAY_BOGOTA,
      orders: sql<number>`count(distinct ${sales.id})`.mapWith(Number),
      units: sql<number>`coalesce(sum(${saleDetails.quantity}), 0)`.mapWith(Number),
      total: sql<number>`coalesce(sum(${saleDetails.subtotal}), 0)`.mapWith(Number),
    })
    .from(saleDetails)
    .innerJoin(sales, eq(saleDetails.saleId, sales.id))
    .where(completedBovineLinesBetween(from, toExclusive))
    .groupBy(SALE_DAY_BOGOTA)
    .orderBy(SALE_DAY_BOGOTA);
}

export async function getBovineCategorySales(from: string, toExclusive: string): Promise<BovineCategoryRow[]> {
  return db
    .select({
      category: bovines.category,
      units: sql<number>`coalesce(sum(${saleDetails.quantity}), 0)`.mapWith(Number),
      total: sql<number>`coalesce(sum(${saleDetails.subtotal}), 0)`.mapWith(Number),
    })
    .from(saleDetails)
    .innerJoin(sales, eq(saleDetails.saleId, sales.id))
    .innerJoin(bovines, eq(saleDetails.bovineId, bovines.id))
    .where(completedBovineLinesBetween(from, toExclusive))
    .groupBy(bovines.category);
}

/**
 * Genera la comparativa del periodo indicado.
 * Lanza `SemillasError` si la API de Semillas no está disponible o responde algo inválido.
 */
export async function getComparativa(periodo: SemillasPeriodo, now: Date = new Date()): Promise<Comparativa> {
  // Semillas define los intervalos; luego se consultan los bovinos para esos mismos intervalos.
  const semillas = await getSemillasClient().getSalesReport(periodo);
  const range = bovineWindow(semillas);

  const [bovinosDiario, bovinosCategorias] = await Promise.all([
    getBovineDailySales(range.previousFrom, range.toExclusive),
    getBovineCategorySales(range.from, range.toExclusive),
  ]);

  return buildComparativa({
    semillas,
    bovinosDiario,
    bovinosCategorias,
    hoy: bogotaToday(now),
    generadoEn: now.toISOString(),
  });
}
