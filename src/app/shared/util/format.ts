/** "850 ms", "1.8s", "41.2s", "1m 05s" */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  const rest = Math.round(s - m * 60);
  return `${m}m ${rest.toString().padStart(2, '0')}s`;
}

/** Seconds as "37.9s" (for chart axes and tiles). */
export function formatSeconds(sec: number): string {
  return sec >= 100 ? `${Math.round(sec)}s` : `${sec.toFixed(1)}s`;
}

/**
 * Round a maximum up to a "nice" axis maximum and return evenly spaced ticks including 0.
 * niceScale(14) -> { max: 20, ticks: [0, 10, 20] }
 */
export function niceScale(rawMax: number, desiredTicks = 3): { max: number; ticks: number[] } {
  if (rawMax <= 0) return { max: 1, ticks: [0, 1] };
  const rough = rawMax / desiredTicks;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? 10 * pow;
  const max = Math.ceil(rawMax / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 1000) / 1000);
  return { max, ticks };
}
