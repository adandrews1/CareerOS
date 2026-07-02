import type { Cadence } from "./types";

export function getWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function getMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getQuarterKey(date = new Date()): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${quarter}`;
}

export function periodKeyFor(cadence: Cadence, date = new Date()): string {
  if (cadence === "weekly") return getWeekKey(date);
  if (cadence === "monthly") return getMonthKey(date);
  return getQuarterKey(date);
}

export const CADENCE_LABELS: Record<Cadence, string> = {
  weekly: "This Week",
  monthly: "This Month",
  quarterly: "This Quarter",
};
