import type { RegulationStatus } from "@/types/regulation";

/** ステータスごとのバッジ配色（一覧・ポップアップ・フィルタで共通）。 */
export const STATUS_BADGE_CLASS: Record<RegulationStatus, string> = {
  closed: "bg-red-100 text-red-800",
  construction: "bg-amber-100 text-amber-900",
  lane_closed: "bg-orange-100 text-orange-900",
  chain_required: "bg-sky-100 text-sky-900",
};

/** 一覧の左端に表示する帯の色。 */
export const STATUS_BAR_COLOR: Record<RegulationStatus, string> = {
  closed: "#dc2626",
  construction: "#d97706",
  lane_closed: "#ea580c",
  chain_required: "#0284c7",
};

/** 日時を「MM/DD HH:mm」形式で表示する。解釈できない場合は原文を返す。 */
export function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("ja-JP", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}
