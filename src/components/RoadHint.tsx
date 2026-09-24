"use client";

import type { RoadOperator } from "@/lib/road-operators";

interface RoadHintProps {
  name: string;
  operator: RoadOperator | null;
}

/** OpenStreetMap の著作権・ライセンス（ODbL）の案内ページ。 */
const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";

/**
 * 地図で指した道路の名前と、その道路の管理者へのリンク。
 * 渋滞・規制の詳しい情報は管理者のサイトで確認してもらう。
 *
 * 道路名は OpenStreetMap のデータなので、ライセンス（ODbL）に従い
 * 表示している場所に出典を明記する。
 */
export function RoadHint({ name, operator }: RoadHintProps) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-10 max-w-[calc(100%-10rem)] -translate-x-1/2 rounded-xl bg-white/95 px-3 py-1.5 shadow-md ring-1 ring-slate-200">
      <div className="flex items-center gap-2">
        <span className="truncate text-xs font-bold text-slate-800 sm:text-sm">
          {name}
        </span>
        {operator && (
          <a
            href={operator.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            <span className="hidden sm:inline">{operator.label}</span>
            <span className="sm:hidden">交通情報</span>
            <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sr-only">
              {operator.label}（新しいタブで開きます）
            </span>
          </a>
        )}
      </div>

      <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-500">
        道路名 ©{" "}
        <a
          href={OSM_COPYRIGHT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto underline underline-offset-2 hover:text-slate-700"
        >
          OpenStreetMap
        </a>{" "}
        contributors
      </p>
    </div>
  );
}
