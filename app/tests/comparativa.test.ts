import { describe, expect, test } from "bun:test";
import { buildComparativa, bovineWindow, describeComparativa } from "~/services/comparativa.ts";
import {
  createSemillasClient,
  loadSemillasConfig,
  parseSalesReport,
  SemillasError,
} from "~/services/semillas.server.ts";
import { parsePeriodo } from "~/services/semillas.types.ts";
import { niceScale } from "~/utils/chart-scale.ts";
import { formatCompactCOP, formatPercent, formatSignedPercent } from "~/utils/formatters.ts";
import { addDays, bogotaToday, isIsoDate } from "~/utils/iso-date.ts";
import { safeRedirect } from "~/utils/safe-redirect.ts";

const report = (over: Record<string, unknown> = {}) => ({
  periodo: "mes",
  desde: "2026-09-01",
  hasta: "2026-11-30",
  total_ventas: 300,
  variacion: 10.5,
  pedidos: 3,
  clientes: 2,
  productos_distintos: 2,
  unidades_vendidas: 9,
  ticket_promedio: 100,
  serie: [
    { etiqueta: "sep", desde: "2026-09-01", total: 100, pedidos: 1 },
    { etiqueta: "oct", desde: "2026-10-01", total: 0, pedidos: 0 },
    { etiqueta: "nov", desde: "2026-11-01", total: 200, pedidos: 2 },
  ],
  mas_vendidos: [{ id: 1, nombre: "<img src=x onerror=alert(1)>", presentacion: "1 kg", unidades: 5, total: 200 }],
  por_categoria: [{ categoria: "Pasto", total: 300 }],
  conversion: { unidades_vendidas: 9, unidades_canceladas: 1, unidades_apartadas_ahora: 0, porcentaje_compradas: 90 },
  ...over,
});

const cfg = (extra: Record<string, string> = {}) =>
  loadSemillasConfig({ SEMILLAS_API_URL: "https://semillas.test/api", SEMILLAS_API_EMAIL: "a@b.co", SEMILLAS_API_PASSWORD: "x", ...extra });

const jsonRes = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

describe("fechas y utilidades", () => {
  test("isIsoDate rechaza fechas imposibles", () => {
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("2026-2-1")).toBe(false);
    expect(isIsoDate("2026-11-18")).toBe(true);
  });
  test("addDays cruza meses y años; bogotaToday usa UTC-5", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(bogotaToday(new Date("2026-11-01T04:59:59Z"))).toBe("2026-10-31");
    expect(bogotaToday(new Date("2026-11-01T05:00:00Z"))).toBe("2026-11-01");
  });
  test("parsePeriodo usa lista blanca", () => {
    expect(parsePeriodo("semana")).toBe("semana");
    expect(parsePeriodo("../../admin")).toBe("mes");
    expect(parsePeriodo(null)).toBe("mes");
  });
  test("safeRedirect bloquea open redirect", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "/a\nb", ""]) {
      expect(safeRedirect(bad)).toBe("/");
    }
    expect(safeRedirect("/ventas?x=1")).toBe("/ventas?x=1");
  });
  test("formatos es-CO y escala", () => {
    expect(formatCompactCOP(2_555_300)).toBe("$ 2,6 M");
    expect(formatCompactCOP(454_000)).toBe("$ 454 mil");
    expect(formatPercent(30.44)).toBe("30,4\u00A0%");
    expect(formatSignedPercent(-14.4)).toBe("-14,4\u00A0%");
    expect(niceScale(7_000_000)).toEqual({ max: 8_000_000, step: 2_000_000 });
  });
});

describe("configuración", () => {
  test("exige variables y URL válida", () => {
    expect(() => loadSemillasConfig({})).toThrow(SemillasError);
    expect(() => cfg({ SEMILLAS_API_URL: "ftp://x" })).toThrow(SemillasError);
    expect(() => cfg({ SEMILLAS_API_URL: "https://u:p@x.com/api" })).toThrow(SemillasError);
  });
  test("en producción exige https salvo loopback", () => {
    expect(() => cfg({ SEMILLAS_API_URL: "http://semillas.test/api", NODE_ENV: "production" })).toThrow(SemillasError);
    expect(() => cfg({ SEMILLAS_API_URL: "http://127.0.0.1:8000/api", NODE_ENV: "production" })).not.toThrow();
    expect(cfg().baseUrl.pathname).toBe("/api/");
  });
});

describe("validación de la respuesta de Semillas", () => {
  test("acepta un reporte válido y conserva texto hostil como texto", () => {
    const r = parseSalesReport(report(), "mes");
    expect(r.mas_vendidos[0].nombre).toContain("<img");
  });
  test.each([
    ["periodo distinto", report({ periodo: "anio" })],
    ["monto negativo", report({ total_ventas: -1 })],
    ["NaN como texto", report({ pedidos: "3" })],
    ["serie desordenada", report({ serie: [{ etiqueta: "a", desde: "2026-10-01", total: 1, pedidos: 1 }, { etiqueta: "b", desde: "2026-09-01", total: 1, pedidos: 1 }] })],
    ["fecha falsa", report({ desde: "2026-02-31" })],
    ["no objeto", [1, 2]],
  ] as Array<[string, unknown]>)("rechaza %s", (_n: string, body: unknown) => {
    expect(() => parseSalesReport(body, "mes")).toThrow(SemillasError);
  });
});

describe("cliente HTTP", () => {
  test("login, Bearer, caché y reintento ante 401", async () => {
    const calls: string[] = [];
    let reportCalls = 0;
    const fakeFetch = (async (url: URL, init: RequestInit) => {
      calls.push(`${init.method} ${url.pathname}`);
      expect(init.redirect).toBe("error");
      if (url.pathname.endsWith("/auth/login/")) {
        expect(JSON.parse(init.body as string).rol).toBe("admin");
        return jsonRes({ access: `tok${calls.length}`, refresh: "r" });
      }
      reportCalls += 1;
      const auth = (init.headers as Record<string, string>).Authorization;
      if (reportCalls === 1) return jsonRes({ detail: "expired" }, 401); // primer token "vencido"
      expect(auth).toBe("Bearer tok3");
      return jsonRes(report());
    }) as unknown as typeof fetch;

    const client = createSemillasClient({ config: cfg(), fetch: fakeFetch });
    const a = await client.getSalesReport("mes");
    const b = await client.getSalesReport("mes"); // caché
    expect(a).toBe(b);
    expect(reportCalls).toBe(2);
  });

  test("credenciales malas → auth_failed; caída → unavailable; JSON basura → invalid_response", async () => {
    const mk = (res: () => Response | Promise<Response>) =>
      createSemillasClient({ config: cfg(), fetch: (async () => res()) as unknown as typeof fetch });
    await expect(mk(() => jsonRes({ detail: "x" }, 401)).getSalesReport("mes")).rejects.toMatchObject({ code: "auth_failed" });
    await expect(mk(() => { throw new TypeError("fetch failed"); }).getSalesReport("mes")).rejects.toMatchObject({ code: "unavailable" });
    await expect(mk(() => new Response("<html>", { status: 200 })).getSalesReport("mes")).rejects.toMatchObject({ code: "invalid_response" });
  });

  test("el mensaje de usuario nunca contiene la contraseña ni la URL", async () => {
    const client = createSemillasClient({
      config: cfg({ SEMILLAS_API_PASSWORD: "super-secreta" }),
      fetch: (async () => { throw new Error("super-secreta https://semillas.test"); }) as unknown as typeof fetch,
    });
    const err = (await client.getSalesReport("mes").catch((e) => e)) as SemillasError;
    expect(err.userMessage).not.toContain("super-secreta");
    expect(err.userMessage).not.toContain("semillas.test");
  });

  test("periodo fuera de la lista blanca no llega a la red", async () => {
    let called = false;
    const client = createSemillasClient({ config: cfg(), fetch: (async () => { called = true; return jsonRes({}); }) as unknown as typeof fetch });
    await expect(client.getSalesReport("x&admin=1" as never)).rejects.toThrow(TypeError);
    expect(called).toBe(false);
  });
});

describe("comparativa", () => {
  const input = () => ({
    semillas: parseSalesReport(report(), "mes"),
    bovinosDiario: [
      { day: "2026-08-15", orders: 1, units: 1, total: 1000 }, // periodo anterior
      { day: "2026-09-10", orders: 1, units: 1, total: 500 },
      { day: "2026-10-31", orders: 1, units: 2, total: 700 },
      { day: "2026-11-01", orders: 1, units: 1, total: 300 },
    ],
    bovinosCategorias: [{ category: "Toros", units: 1, total: 1500 }],
    hoy: "2026-11-17",
    generadoEn: "2026-11-17T12:00:00.000Z",
  });

  test("ventana anterior de igual duración", () => {
    expect(bovineWindow({ desde: "2026-09-01", hasta: "2026-11-30" })).toEqual({
      previousFrom: "2026-06-02", from: "2026-09-01", toExclusive: "2026-12-01",
    });
  });
  test("alinea bovinos a los intervalos de Semillas y calcula totales", () => {
    const c = buildComparativa(input());
    expect(c.serie.map((p) => p.bovinos.total)).toEqual([500, 700, 300]);
    expect(c.serie.map((p) => p.enCurso)).toEqual([false, false, true]);
    expect(c.bovinos.total).toBe(1500);
    expect(c.bovinos.variacion).toBe(50); // 1500 vs 1000 previos
    expect(c.semillas.total).toBe(300);
    expect(c.combinado.total).toBe(1800);
    expect(c.combinado.participacionSemillas).toBe(16.7);
    expect(c.combinado.participacionBovinos).toBe(83.3);
    expect(c.combinado.razon).toEqual({ mayor: "bovinos", veces: 5 });
    expect(c.serie.reduce((s, p) => s + p.total, 0)).toBe(c.combinado.total);
    expect(describeComparativa(c)).toContain("5,0 veces");
  });
  test("sin ventas no hay divisiones por cero", () => {
    const c = buildComparativa({ ...input(), bovinosDiario: [], bovinosCategorias: [], semillas: parseSalesReport(report({ serie: report().serie.map((p) => ({ ...p, total: 0, pedidos: 0 })), pedidos: 0 }), "mes") });
    expect(c.combinado.participacionSemillas).toBeNull();
    expect(c.bovinos.variacion).toBeNull();
    expect(describeComparativa(c)).toContain("no hay ventas");
  });
});
