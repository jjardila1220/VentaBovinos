/**
 * Cliente de la API de Semillas del Valle (Django REST Framework + JWT).
 *
 * Solo se ejecuta en el servidor: las credenciales de integración y los tokens JWT
 * nunca llegan al navegador. Medidas de seguridad principales:
 *
 *  - La URL base sale de la configuración del servidor; ningún dato del usuario forma
 *    parte de la URL (las rutas son constantes y `periodo` pasa por una lista blanca).
 *  - En producción se exige HTTPS (salvo loopback o `SEMILLAS_API_ALLOW_HTTP=true`).
 *  - `redirect: "error"`: nunca se sigue una redirección, así el token no se reenvía a
 *    otro host.
 *  - Timeout en cada petición y límite de tamaño de la respuesta.
 *  - La respuesta se valida campo por campo antes de usarse; lo que no cumple el
 *    contrato se rechaza en vez de mostrarse.
 *  - Los errores llevan un mensaje seguro para la interfaz; el detalle técnico solo va
 *    al log del servidor y jamás incluye credenciales ni tokens.
 */

import { isIsoDate } from "~/utils/iso-date.ts";
import {
  PERIODOS,
  type SemillasCategoriaVendida,
  type SemillasConversion,
  type SemillasPeriodo,
  type SemillasProductoVendido,
  type SemillasSalesReport,
  type SemillasSeriePunto,
} from "./semillas.types.ts";

// ---------------------------------------------------------------------------
// Errores
// ---------------------------------------------------------------------------

export type SemillasErrorCode =
  | "not_configured"
  | "unavailable"
  | "auth_failed"
  | "forbidden"
  | "invalid_response";

const USER_MESSAGES: Record<SemillasErrorCode, string> = {
  not_configured:
    "La integración con Semillas del Valle no está configurada en el servidor. Revisa las variables SEMILLAS_API_*.",
  unavailable:
    "No fue posible comunicarse con Semillas del Valle. Verifica que el servicio esté en línea e inténtalo de nuevo.",
  auth_failed:
    "Semillas del Valle rechazó las credenciales de integración. Verifica el correo y la contraseña configurados, y que la cuenta sea de administrador.",
  forbidden: "La cuenta de integración no tiene permisos de administrador en Semillas del Valle.",
  invalid_response: "Semillas del Valle respondió con un formato inesperado, por lo que los datos no se muestran.",
};

export class SemillasError extends Error {
  readonly code: SemillasErrorCode;

  /** `detail` es solo para el log del servidor: nunca se muestra en pantalla. */
  constructor(code: SemillasErrorCode, detail?: string) {
    super(detail ?? USER_MESSAGES[code]);
    this.name = "SemillasError";
    this.code = code;
  }

  /** Mensaje seguro para mostrar al usuario. */
  get userMessage(): string {
    return USER_MESSAGES[this.code];
  }
}

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

export interface SemillasConfig {
  /** URL base de la API, siempre con "/" al final (por ejemplo http://127.0.0.1:8000/api/). */
  baseUrl: URL;
  email: string;
  password: string;
  timeoutMs: number;
  /** 0 desactiva la caché. */
  cacheTtlMs: number;
}

type Env = Record<string, string | undefined>;

const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_CACHE_TTL_SECONDS = 30;
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function readInteger(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new SemillasError("not_configured", `Valor numérico fuera de rango: ${raw}`);
  }
  return value;
}

export function loadSemillasConfig(env: Env = process.env): SemillasConfig {
  const rawUrl = env.SEMILLAS_API_URL?.trim();
  const email = env.SEMILLAS_API_EMAIL?.trim();
  const password = env.SEMILLAS_API_PASSWORD;

  if (!rawUrl || !email || !password) {
    throw new SemillasError("not_configured", "Faltan SEMILLAS_API_URL, SEMILLAS_API_EMAIL o SEMILLAS_API_PASSWORD");
  }
  if (email.length > 254 || password.length > 256) {
    throw new SemillasError("not_configured", "Credenciales de integración con longitud inválida");
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SemillasError("not_configured", "SEMILLAS_API_URL no es una URL válida");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SemillasError("not_configured", "SEMILLAS_API_URL debe usar http o https");
  }
  if (url.username || url.password) {
    throw new SemillasError("not_configured", "SEMILLAS_API_URL no debe incluir usuario ni contraseña");
  }
  const insecureAllowed = env.SEMILLAS_API_ALLOW_HTTP === "true" || LOOPBACK_HOSTS.has(url.hostname);
  if (env.NODE_ENV === "production" && url.protocol !== "https:" && !insecureAllowed) {
    throw new SemillasError("not_configured", "En producción SEMILLAS_API_URL debe usar https");
  }

  // La base se normaliza para que las rutas relativas se resuelvan siempre bajo ella.
  url.search = "";
  url.hash = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";

  return {
    baseUrl: url,
    email,
    password,
    timeoutMs: readInteger(env.SEMILLAS_API_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, 500, 30_000),
    cacheTtlMs: readInteger(env.SEMILLAS_CACHE_TTL_SECONDS, DEFAULT_CACHE_TTL_SECONDS, 0, 3_600) * 1_000,
  };
}

// ---------------------------------------------------------------------------
// Validación de la respuesta (el contrato lo define el backend de Semillas)
// ---------------------------------------------------------------------------

const MAX_MONEY = 1e13;
const MAX_COUNT = 1e9;

function fail(detail: string): never {
  throw new SemillasError("invalid_response", detail);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown, field: string): Record<string, unknown> {
  return isRecord(value) ? value : fail(`${field} debe ser un objeto`);
}

function list(value: unknown, field: string, max: number): unknown[] {
  if (!Array.isArray(value)) return fail(`${field} debe ser una lista`);
  if (value.length > max) return fail(`${field} excede ${max} elementos`);
  return value;
}

function number(value: unknown, field: string, min = 0, max = MAX_MONEY): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    return fail(`${field} no es un número válido`);
  }
  return value;
}

function integer(value: unknown, field: string): number {
  const result = number(value, field, 0, MAX_COUNT);
  return Number.isInteger(result) ? result : fail(`${field} debe ser entero`);
}

function nullableNumber(value: unknown, field: string, min: number, max: number): number | null {
  return value === null ? null : number(value, field, min, max);
}

/** Texto acotado y sin caracteres de control. React lo escapa al renderizar. */
function text(value: unknown, field: string, maxLength: number, allowEmpty = false): string {
  if (typeof value !== "string") return fail(`${field} debe ser texto`);
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength);
  if (!clean && !allowEmpty) return fail(`${field} no puede estar vacío`);
  return clean;
}

function date(value: unknown, field: string): string {
  return isIsoDate(value) ? value : fail(`${field} no es una fecha válida`);
}

export function parseSalesReport(raw: unknown, expectedPeriodo: SemillasPeriodo): SemillasSalesReport {
  const data = record(raw, "respuesta");

  if (data.periodo !== expectedPeriodo) fail("el periodo de la respuesta no coincide con el solicitado");

  const desde = date(data.desde, "desde");
  const hasta = date(data.hasta, "hasta");

  const serie: SemillasSeriePunto[] = list(data.serie, "serie", 60).map((item, index) => {
    const punto = record(item, `serie[${index}]`);
    return {
      etiqueta: text(punto.etiqueta, `serie[${index}].etiqueta`, 40),
      desde: date(punto.desde, `serie[${index}].desde`),
      total: number(punto.total, `serie[${index}].total`),
      pedidos: integer(punto.pedidos, `serie[${index}].pedidos`),
    };
  });

  if (serie.length === 0) fail("serie vacía");
  if (serie[0].desde !== desde) fail("la serie no empieza en la fecha inicial del reporte");
  for (let i = 1; i < serie.length; i += 1) {
    if (serie[i].desde <= serie[i - 1].desde) fail("las fechas de la serie no son crecientes");
  }
  if (hasta < serie[serie.length - 1].desde) fail("la fecha final es anterior al último intervalo");

  const masVendidos: SemillasProductoVendido[] = list(data.mas_vendidos, "mas_vendidos", 20).map((item, index) => {
    const producto = record(item, `mas_vendidos[${index}]`);
    return {
      id: integer(producto.id, `mas_vendidos[${index}].id`),
      nombre: text(producto.nombre, `mas_vendidos[${index}].nombre`, 150),
      presentacion: text(producto.presentacion, `mas_vendidos[${index}].presentacion`, 100, true),
      unidades: integer(producto.unidades, `mas_vendidos[${index}].unidades`),
      total: number(producto.total, `mas_vendidos[${index}].total`),
    };
  });

  const porCategoria: SemillasCategoriaVendida[] = list(data.por_categoria, "por_categoria", 50).map((item, index) => {
    const categoria = record(item, `por_categoria[${index}]`);
    return {
      categoria: text(categoria.categoria, `por_categoria[${index}].categoria`, 100),
      total: number(categoria.total, `por_categoria[${index}].total`),
    };
  });

  const conversionRaw = record(data.conversion, "conversion");
  const conversion: SemillasConversion = {
    unidades_vendidas: integer(conversionRaw.unidades_vendidas, "conversion.unidades_vendidas"),
    unidades_canceladas: integer(conversionRaw.unidades_canceladas, "conversion.unidades_canceladas"),
    unidades_apartadas_ahora: integer(conversionRaw.unidades_apartadas_ahora, "conversion.unidades_apartadas_ahora"),
    porcentaje_compradas: nullableNumber(conversionRaw.porcentaje_compradas, "conversion.porcentaje_compradas", 0, 100),
  };

  return {
    periodo: expectedPeriodo,
    desde,
    hasta,
    total_ventas: number(data.total_ventas, "total_ventas"),
    variacion: nullableNumber(data.variacion, "variacion", -100, MAX_COUNT),
    pedidos: integer(data.pedidos, "pedidos"),
    clientes: integer(data.clientes, "clientes"),
    productos_distintos: integer(data.productos_distintos, "productos_distintos"),
    unidades_vendidas: integer(data.unidades_vendidas, "unidades_vendidas"),
    ticket_promedio: number(data.ticket_promedio, "ticket_promedio"),
    serie,
    mas_vendidos: masVendidos,
    por_categoria: porCategoria,
    conversion,
  };
}

// ---------------------------------------------------------------------------
// Cliente HTTP
// ---------------------------------------------------------------------------

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
/** Un token se renueva un poco antes de vencer para no usarlo "al límite". */
const TOKEN_SKEW_MS = 30_000;
/** Si el token no trae `exp` legible se asume una vida corta y conservadora. */
const FALLBACK_TOKEN_LIFETIME_MS = 60_000;

interface Tokens {
  access: string;
  refresh: string | null;
  /** Instante (ms desde epoch) en que vence el token de acceso. */
  accessExpiresAt: number;
}

export interface SemillasClientDeps {
  config: SemillasConfig;
  /** Inyectable para pruebas. */
  fetch?: typeof fetch;
  /** Inyectable para pruebas (ms desde epoch). */
  now?: () => number;
}

export interface SemillasClient {
  getSalesReport(periodo: SemillasPeriodo): Promise<SemillasSalesReport>;
  /** Olvida tokens y caché. */
  reset(): void;
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.name === "TimeoutError" || error.name === "AbortError" ? "tiempo de espera agotado" : error.name;
  }
  return "error desconocido";
}

/** Lee `exp` de un JWT sin verificarlo (solo para saber cuándo renovarlo). */
function jwtExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (isRecord(parsed) && typeof parsed.exp === "number" && Number.isFinite(parsed.exp)) {
      return parsed.exp * 1_000;
    }
  } catch {
    // token con formato inesperado: se usa la vida por defecto
  }
  return null;
}

async function readLimitedBody(response: Response): Promise<string> {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
    await response.body?.cancel().catch(() => {});
    throw new SemillasError("invalid_response", "respuesta demasiado grande");
  }
  if (!response.body) return "";

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) {
        await reader.cancel().catch(() => {});
        throw new SemillasError("invalid_response", "respuesta demasiado grande");
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof SemillasError) throw error;
    throw new SemillasError("unavailable", `lectura interrumpida (${describeError(error)})`);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function createSemillasClient(deps: SemillasClientDeps): SemillasClient {
  const { config } = deps;
  const doFetch = deps.fetch ?? fetch;
  const now = deps.now ?? (() => Date.now());

  let tokens: Tokens | null = null;
  let tokenInFlight: Promise<Tokens> | null = null;
  const cache = new Map<SemillasPeriodo, { expiresAt: number; value: SemillasSalesReport }>();
  const reportsInFlight = new Map<SemillasPeriodo, Promise<SemillasSalesReport>>();

  async function request(
    path: string,
    init: { method: "GET" | "POST"; query?: Record<string, string>; body?: unknown; token?: string }
  ): Promise<{ status: number; data: unknown }> {
    const url = new URL(path, config.baseUrl);
    // Defensa en profundidad: la URL final debe seguir dentro de la base configurada.
    if (url.origin !== config.baseUrl.origin || !url.pathname.startsWith(config.baseUrl.pathname)) {
      throw new SemillasError("unavailable", "la ruta resuelta queda fuera de la URL base");
    }
    for (const [key, value] of Object.entries(init.query ?? {})) url.searchParams.set(key, value);

    const headers: Record<string, string> = { Accept: "application/json" };
    if (init.body !== undefined) headers["Content-Type"] = "application/json";
    if (init.token) headers.Authorization = `Bearer ${init.token}`;

    let response: Response;
    try {
      response = await doFetch(url, {
        method: init.method,
        headers,
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(config.timeoutMs),
      });
    } catch (error) {
      throw new SemillasError("unavailable", `fallo de red (${describeError(error)})`);
    }

    const body = await readLimitedBody(response);
    let data: unknown = null;
    if (body) {
      try {
        data = JSON.parse(body);
      } catch {
        if (response.ok) throw new SemillasError("invalid_response", "el cuerpo no es JSON");
      }
    }
    return { status: response.status, data };
  }

  function storeAccess(access: unknown, refresh: string | null): Tokens {
    if (typeof access !== "string" || access.length === 0 || access.length > 8_192) {
      throw new SemillasError("invalid_response", "token de acceso ausente o inválido");
    }
    const expiresAt = jwtExpiryMs(access) ?? now() + FALLBACK_TOKEN_LIFETIME_MS;
    tokens = { access, refresh, accessExpiresAt: expiresAt };
    return tokens;
  }

  async function login(): Promise<Tokens> {
    const { status, data } = await request("auth/login/", {
      method: "POST",
      // `rol` hace que Semillas rechace el login si la cuenta no es de administrador.
      body: { email: config.email, password: config.password, rol: "admin" },
    });
    if (status === 200 && isRecord(data)) {
      const refresh = typeof data.refresh === "string" && data.refresh.length <= 8_192 ? data.refresh : null;
      return storeAccess(data.access, refresh);
    }
    if (status === 400 || status === 401) throw new SemillasError("auth_failed", `login rechazado (HTTP ${status})`);
    if (status === 403) throw new SemillasError("forbidden", "login prohibido (HTTP 403)");
    throw new SemillasError("unavailable", `login falló (HTTP ${status})`);
  }

  async function refreshOrLogin(): Promise<Tokens> {
    const current = tokens;
    if (current?.refresh) {
      const { status, data } = await request("auth/renovar/", { method: "POST", body: { refresh: current.refresh } });
      if (status === 200 && isRecord(data)) {
        const rotated = typeof data.refresh === "string" ? data.refresh : current.refresh;
        return storeAccess(data.access, rotated);
      }
      if (status !== 400 && status !== 401) {
        throw new SemillasError("unavailable", `renovación falló (HTTP ${status})`);
      }
      // El refresh venció o fue revocado: se inicia sesión de nuevo.
      tokens = null;
    }
    return login();
  }

  /** Una sola autenticación a la vez, aunque lleguen varias peticiones simultáneas. */
  async function getAccessToken(): Promise<string> {
    if (tokens && tokens.accessExpiresAt - TOKEN_SKEW_MS > now()) return tokens.access;
    if (!tokenInFlight) {
      tokenInFlight = refreshOrLogin().finally(() => {
        tokenInFlight = null;
      });
    }
    return (await tokenInFlight).access;
  }

  async function fetchSalesReport(periodo: SemillasPeriodo): Promise<SemillasSalesReport> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const token = await getAccessToken();
      const { status, data } = await request("reportes/ventas/", { method: "GET", query: { periodo }, token });

      if (status === 200) return parseSalesReport(data, periodo);
      if (status === 401) {
        // El token pudo ser revocado o vencer en tránsito: se descarta y se reintenta una vez.
        tokens = null;
        if (attempt === 0) continue;
        throw new SemillasError("auth_failed", "Semillas rechazó el token recién emitido");
      }
      if (status === 403) throw new SemillasError("forbidden", "reporte prohibido (HTTP 403)");
      throw new SemillasError("unavailable", `reporte falló (HTTP ${status})`);
    }
    throw new SemillasError("unavailable", "reintentos agotados");
  }

  return {
    async getSalesReport(periodo) {
      if (!(PERIODOS as readonly string[]).includes(periodo)) {
        throw new TypeError(`Periodo no soportado: ${String(periodo)}`);
      }

      const cached = cache.get(periodo);
      if (cached && cached.expiresAt > now()) return cached.value;

      // Peticiones simultáneas por el mismo periodo comparten una sola llamada a Semillas.
      const pending = reportsInFlight.get(periodo);
      if (pending) return pending;

      const promise = fetchSalesReport(periodo)
        .then((value) => {
          if (config.cacheTtlMs > 0) cache.set(periodo, { expiresAt: now() + config.cacheTtlMs, value });
          return value;
        })
        .finally(() => {
          reportsInFlight.delete(periodo);
        });
      reportsInFlight.set(periodo, promise);
      return promise;
    },

    reset() {
      tokens = null;
      tokenInFlight = null;
      cache.clear();
      reportsInFlight.clear();
    },
  };
}

// ---------------------------------------------------------------------------
// Instancia compartida (se conserva entre recargas en caliente del servidor de desarrollo)
// ---------------------------------------------------------------------------

declare global {
  var __semillas_client: SemillasClient | undefined;
}

/**
 * Devuelve el cliente compartido. Lanza `SemillasError("not_configured")` si faltan
 * o son inválidas las variables de entorno (la configuración no se cachea al fallar).
 */
export function getSemillasClient(): SemillasClient {
  if (!globalThis.__semillas_client) {
    globalThis.__semillas_client = createSemillasClient({ config: loadSemillasConfig() });
  }
  return globalThis.__semillas_client;
}

/** Solo para pruebas: fuerza a releer la configuración. */
export function resetSemillasClient(): void {
  globalThis.__semillas_client?.reset();
  globalThis.__semillas_client = undefined;
}
