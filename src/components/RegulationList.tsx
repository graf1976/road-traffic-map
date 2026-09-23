"use client";

import {
  STATUS_BADGE_CLASS,
  STATUS_BAR_COLOR,
  formatDateTime,
} from "@/lib/regulation-ui";
import {
  REGULATION_STATUS_LABEL,
  type RegulationFeature,
} from "@/types/regulation";

interface RegulationListProps {
  features: RegulationFeature[];
  selectedId: string | null;
  isLoading: boolean;
  /** 表示できる規制が無いときの案内文。 */
  emptyMessage?: string;
  /** 地図の範囲で絞り込んでいるか。切り替え関数を渡すと操作 UI を表示する。 */
  restrictToView?: boolean;
  onRestrictToViewChange?: (value: boolean) => void;
  onSelect: (feature: RegulationFeature) => void;
  onClose: () => void;
}

/** 規制情報の一覧。項目を選ぶと該当区間へ地図を移動する。 */
export function RegulationList({
  features,
  selectedId,
  isLoading,
  emptyMessage = "該当する規制情報はありません。",
  restrictToView = false,
  onRestrictToViewChange,
  onSelect,
  onClose,
}: RegulationListProps) {
  return (
    <section
      aria-label="規制情報一覧"
      className="flex min-h-0 flex-1 flex-col border-t border-slate-200 bg-white lg:border-t-0 lg:border-l"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2">
        <h2 className="text-sm font-bold text-slate-800">
          規制情報一覧
          <span className="ml-2 text-xs font-normal text-slate-500">
            {isLoading ? "読み込み中…" : `${features.length}件`}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {onRestrictToViewChange && (
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={restrictToView}
                onChange={(event) => onRestrictToViewChange(event.target.checked)}
                className="h-3.5 w-3.5 accent-blue-600"
              />
              地図の範囲のみ
            </label>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
          >
            閉じる
          </button>
        </div>
      </header>

      {features.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-slate-500">
          {isLoading ? "規制情報を読み込んでいます…" : emptyMessage}
        </p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
          {features.map((feature) => {
            const { id, roadName, section, status, description, updatedAt } =
              feature.properties;
            const isSelected = id === selectedId;

            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onSelect(feature)}
                  aria-current={isSelected}
                  className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="mt-0.5 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_BAR_COLOR[status] }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${STATUS_BADGE_CLASS[status]}`}
                      >
                        {REGULATION_STATUS_LABEL[status]}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {roadName}
                      </span>
                    </span>
                    {section && (
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {section}
                      </span>
                    )}
                    <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-slate-600">
                      {description}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-400">
                      情報更新: {formatDateTime(updatedAt)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
