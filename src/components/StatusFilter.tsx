"use client";

import { STATUS_BAR_COLOR } from "@/lib/regulation-ui";
import {
  REGULATION_STATUSES,
  REGULATION_STATUS_LABEL,
  type RegulationStatus,
} from "@/types/regulation";

interface StatusFilterProps {
  selected: ReadonlySet<RegulationStatus>;
  /** ステータスごとの件数（フィルタ前の全件を対象に集計）。 */
  counts: Readonly<Record<RegulationStatus, number>>;
  onToggle: (status: RegulationStatus) => void;
  onSelectAll: () => void;
}

/** 規制の種別で絞り込むチェックボックス群。 */
export function StatusFilter({
  selected,
  counts,
  onToggle,
  onSelectAll,
}: StatusFilterProps) {
  const isAllSelected = selected.size === REGULATION_STATUSES.length;

  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      <span className="shrink-0 text-xs font-semibold text-slate-500">
        種別で絞り込み
      </span>

      {REGULATION_STATUSES.map((status) => {
        const isChecked = selected.has(status);

        return (
          <label
            key={status}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              isChecked
                ? "border-slate-400 bg-white text-slate-800 shadow-sm"
                : "border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => onToggle(status)}
              className="sr-only"
            />
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor: isChecked
                  ? STATUS_BAR_COLOR[status]
                  : "#cbd5e1",
              }}
            />
            {REGULATION_STATUS_LABEL[status]}
            <span className="text-[11px] font-normal text-slate-500">
              {counts[status]}
            </span>
          </label>
        );
      })}

      <button
        type="button"
        onClick={onSelectAll}
        disabled={isAllSelected}
        className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        すべて表示
      </button>
    </div>
  );
}
