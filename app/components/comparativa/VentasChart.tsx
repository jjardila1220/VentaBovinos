import { useId, useState } from "react";
import type { ComparativaPunto } from "~/services/comparativa.ts";
import { niceScale, scaleTicks } from "~/utils/chart-scale.ts";
import { cn } from "~/lib/utils.ts";
import { formatCOP, formatCompactCOP, formatPercent } from "~/utils/formatters.ts";

/** Rojo corporativo (bovinos) y verde con rayas (semillas): se distinguen aunque no se vean los colores. */
const BOVINOS = "#B3202A";
const SEMILLAS = "#047857";

type Mode = "valores" | "participacion";

const WIDTH = 720;
const HEIGHT = 340;
const MARGIN = { top: 20, right: 16, bottom: 58, left: 64 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

export function VentasChart({ serie, titulo }: { serie: ComparativaPunto[]; titulo: string }) {
  const uid = useId().replace(/:/g, "");
  const patternId = `semillas-${uid}`;
  const [mode, setMode] = useState<Mode>("valores");

  const hasSales = serie.some((point) => point.total > 0);
  const groupWidth = PLOT_W / Math.max(serie.length, 1);
  const centerX = (index: number) => MARGIN.left + groupWidth * (index + 0.5);

  const maxValue = Math.max(0, ...serie.map((p) => Math.max(p.bovinos.total, p.semillas.total)));
  const valueScale = niceScale(maxValue);
  const ticks =
    mode === "valores" ? scaleTicks(valueScale.max, valueScale.step) : [0, 25, 50, 75, 100];
  const tickMax = mode === "valores" ? valueScale.max : 100;
  const yFor = (value: number) => MARGIN.top + PLOT_H - (value / tickMax) * PLOT_H;
  const formatTick = (value: number) => (mode === "valores" ? formatCompactCOP(value) : `${value} %`);

  const barWidth = Math.min(34, groupWidth * 0.34);
  const stackWidth = Math.min(56, groupWidth * 0.6);
  const showValueLabels = mode === "valores" && serie.length <= 4;

  const summary = serie
    .map(
      (p) =>
        `${p.etiqueta}: bovinos ${formatCOP(p.bovinos.total)}, semillas ${formatCOP(p.semillas.total)}`
    )
    .join("; ");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
        <div role="group" aria-label="Tipo de gráfico" className="inline-flex rounded-xl bg-stone-100 p-1 text-xs font-bold">
          {(
            [
              ["valores", "Ventas en pesos"],
              ["participacion", "Participación (%)"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B3202A]",
                mode === value ? "bg-white text-[#B3202A] shadow-sm" : "text-stone-500 hover:text-stone-800"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Legend patternId={patternId} />
      </div>
      <div className="hidden print:block mb-2">
        <Legend patternId={patternId} />
      </div>

      {!hasSales ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 py-16 text-center text-xs text-stone-500">
          No hay ventas completadas en este periodo para graficar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-labelledby={`${uid}-title ${uid}-desc`}
            className="w-full h-auto min-w-[560px]"
          >
            <title id={`${uid}-title`}>{titulo}</title>
            <desc id={`${uid}-desc`}>
              {mode === "valores"
                ? `Barras agrupadas de ventas por periodo. ${summary}.`
                : `Participación porcentual de cada tipo de venta por periodo. ${serie
                    .map((p) => `${p.etiqueta}: semillas ${formatPercent(p.participacionSemillas)}`)
                    .join("; ")}.`}{" "}
              Los mismos datos están en la tabla de detalle.
            </desc>

            <defs>
              <pattern id={patternId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" fill={SEMILLAS} />
                <line x1="0" y1="0" x2="0" y2="6" stroke="#D1FAE5" strokeWidth="2.2" />
              </pattern>
            </defs>

            {/* Líneas guía y eje vertical */}
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={WIDTH - MARGIN.right}
                  y1={yFor(tick)}
                  y2={yFor(tick)}
                  stroke={tick === 0 ? "#A8A29E" : "#E7E5E4"}
                  strokeWidth={tick === 0 ? 1.2 : 1}
                />
                <text x={MARGIN.left - 8} y={yFor(tick) + 3.5} textAnchor="end" fontSize="10.5" fill="#57534E">
                  {formatTick(tick)}
                </text>
              </g>
            ))}

            {serie.map((point, index) => {
              const cx = centerX(index);
              const partial = point.enCurso ? { opacity: 0.62, strokeDasharray: "4 2" } : {};
              const labelY = HEIGHT - MARGIN.bottom + 18;

              return (
                <g key={point.desde}>
                  {mode === "valores" ? (
                    <>
                      <Bar
                        x={cx - barWidth - 2}
                        width={barWidth}
                        y={yFor(point.bovinos.total)}
                        base={yFor(0)}
                        fill={BOVINOS}
                        stroke={BOVINOS}
                        partial={partial}
                        label={`Bovinos, ${point.etiqueta}: ${formatCOP(point.bovinos.total)}`}
                      />
                      <Bar
                        x={cx + 2}
                        width={barWidth}
                        y={yFor(point.semillas.total)}
                        base={yFor(0)}
                        fill={`url(#${patternId})`}
                        stroke={SEMILLAS}
                        partial={partial}
                        label={`Semillas, ${point.etiqueta}: ${formatCOP(point.semillas.total)}`}
                      />
                      {showValueLabels && (
                        <>
                          {point.bovinos.total > 0 && (
                            <text x={cx - barWidth / 2 - 2} y={yFor(point.bovinos.total) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#57534E">
                              {formatCompactCOP(point.bovinos.total)}
                            </text>
                          )}
                          {point.semillas.total > 0 && (
                            <text x={cx + barWidth / 2 + 2} y={yFor(point.semillas.total) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#57534E">
                              {formatCompactCOP(point.semillas.total)}
                            </text>
                          )}
                        </>
                      )}
                    </>
                  ) : point.total > 0 ? (
                    <Stacked
                      x={cx - stackWidth / 2}
                      width={stackWidth}
                      semillasPct={point.participacionSemillas ?? 0}
                      yFor={yFor}
                      patternId={patternId}
                      partial={partial}
                      etiqueta={point.etiqueta}
                    />
                  ) : (
                    <text x={cx} y={yFor(0) - 8} textAnchor="middle" fontSize="10" fill="#78716C">
                      Sin ventas
                    </text>
                  )}

                  <text x={cx} y={labelY} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#292524">
                    {point.etiqueta}
                  </text>
                  {point.enCurso && (
                    <text x={cx} y={labelY + 14} textAnchor="middle" fontSize="9.5" fontStyle="italic" fill="#78716C">
                      en curso
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

function Legend({ patternId }: { patternId: string }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-stone-600">
      <li className="flex items-center gap-1.5">
        <svg width="14" height="14" aria-hidden="true">
          <rect width="14" height="14" rx="3" fill={BOVINOS} />
        </svg>
        Bovinos
      </li>
      <li className="flex items-center gap-1.5">
        <svg width="14" height="14" aria-hidden="true">
          <rect width="14" height="14" rx="3" fill={`url(#${patternId})`} stroke={SEMILLAS} />
        </svg>
        Semillas
      </li>
      <li className="flex items-center gap-1.5 text-stone-500">
        <svg width="14" height="14" aria-hidden="true">
          <rect x="0.75" y="0.75" width="12.5" height="12.5" rx="3" fill="#D6D3D1" stroke="#78716C" strokeDasharray="3 2" />
        </svg>
        Periodo en curso (parcial)
      </li>
    </ul>
  );
}

interface BarProps {
  x: number;
  width: number;
  y: number;
  base: number;
  fill: string;
  stroke: string;
  partial: { opacity?: number; strokeDasharray?: string };
  label: string;
}

function Bar({ x, width, y, base, fill, stroke, partial, label }: BarProps) {
  const height = Math.max(0, base - y);
  if (height <= 0) return null;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={3}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
      opacity={partial.opacity}
      strokeDasharray={partial.strokeDasharray}
    >
      <title>{label}</title>
    </rect>
  );
}

function Stacked({
  x,
  width,
  semillasPct,
  yFor,
  patternId,
  partial,
  etiqueta,
}: {
  x: number;
  width: number;
  semillasPct: number;
  yFor: (value: number) => number;
  patternId: string;
  partial: { opacity?: number; strokeDasharray?: string };
  etiqueta: string;
}) {
  const bovinosPct = Math.max(0, 100 - semillasPct);
  const bovinosTop = yFor(bovinosPct);
  const semillasTop = yFor(100);
  const base = yFor(0);
  const segments = [
    { key: "bovinos", top: bovinosTop, bottom: base, pct: bovinosPct, fill: BOVINOS, stroke: BOVINOS, name: "Bovinos", text: "#FFFFFF" },
    { key: "semillas", top: semillasTop, bottom: bovinosTop, pct: semillasPct, fill: `url(#${patternId})`, stroke: SEMILLAS, name: "Semillas", text: "#064E3B" },
  ];

  return (
    <g>
      {segments.map((segment) => {
        const height = segment.bottom - segment.top;
        if (height <= 0.5) return null;
        return (
          <g key={segment.key}>
            <rect
              x={x}
              y={segment.top}
              width={width}
              height={height}
              fill={segment.fill}
              stroke={segment.stroke}
              strokeWidth={1}
              opacity={partial.opacity}
              strokeDasharray={partial.strokeDasharray}
            >
              <title>{`${segment.name}, ${etiqueta}: ${formatPercent(segment.pct)}`}</title>
            </rect>
            {height >= 18 && (
              <g>
                {/* Fondo claro detrás del texto para que se lea sobre el patrón de rayas */}
                {segment.key === "semillas" && (
                  <rect x={x + width / 2 - 21} y={segment.top + height / 2 - 8} width={42} height={16} rx={8} fill="#ECFDF5" />
                )}
                <text
                  x={x + width / 2}
                  y={segment.top + height / 2 + 4}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="800"
                  fill={segment.text}
                >
                  {formatPercent(segment.pct)}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
