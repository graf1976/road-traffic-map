"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { Legend } from "@/components/Legend";
import { LocateButton } from "@/components/LocateButton";
import type { MapFocus } from "@/components/Map";
import type { RegulationHit } from "@/components/RegulationLayer";
import { RegulationList } from "@/components/RegulationList";
import { StatusFilter } from "@/components/StatusFilter";
import { useCountdown } from "@/hooks/useCountdown";
import {
  useCurrentLocation,
  type LocatedPoint,
} from "@/hooks/useCurrentLocation";
import { useRegulations } from "@/hooks/useRegulations";
import { midpoint } from "@/lib/geo";
import { countByStatus, filterByStatus } from "@/lib/regulation-filter";
import {
  REGULATION_STATUSES,
  type RegulationFeature,
  type RegulationSelection,
  type RegulationStatus,
} from "@/types/regulation";

/** 地図はブラウザ上でのみ描画する（Google Maps は DOM を前提とするため）。 */
const RoadMap = dynamic(
  () => import("@/components/Map").then((mod) => mod.RoadMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-500">
        地図を読み込んでいます…
      </div>
    ),
  },
);

interface RefreshOption {
  label: string;
  value: number;
}

const REFRESH_OPTIONS: readonly RefreshOption[] = [
  { label: "更新なし（手動）", value: 0 },
  { label: "1分ごと", value: 60_000 },
  { label: "5分ごと", value: 300_000 },
  { label: "10分ごと", value: 600_000 },
];

/** 日本全体を見渡す表示位置。 */
const JAPAN_OVERVIEW = { lat: 36.5, lng: 137.5, zoom: 5 } as const;

/** 一覧から規制を選んだときのズームレベル。 */
const SELECTED_ZOOM = 13;

function formatTime(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export default function Home() {
  const [refreshIntervalMs, setRefreshIntervalMs] = useState<number>(0);
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [selection, setSelection] = useState<RegulationSelection | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    ReadonlySet<RegulationStatus>
  >(() => new Set(REGULATION_STATUSES));
  const [isListOpen, setIsListOpen] = useState(true);
  /** 「更新しました」を一時的に出すための時刻。 */
  const [refreshedAt, setRefreshedAt] = useState<number | null>(null);

  const {
    features,
    generatedAt,
    source,
    isLoading,
    isValidating,
    error,
    refresh,
  } = useRegulations(refreshIntervalMs);

  // 現在地が取得できたら地図の中心を移動する。
  const handleLocated = useCallback((point: LocatedPoint) => {
    setFocus({
      lat: point.lat,
      lng: point.lng,
      zoom: 14,
      requestedAt: point.requestedAt,
    });
  }, []);

  const {
    position,
    isLocating,
    error: locationError,
    locate,
    clearError,
  } = useCurrentLocation({ onLocated: handleLocated });

  const remainingSeconds = useCountdown(refreshIntervalMs, generatedAt);

  const counts = useMemo(() => countByStatus(features), [features]);

  const visibleFeatures = useMemo(
    () => filterByStatus(features, statusFilter),
    [features, statusFilter],
  );

  const userPosition = useMemo(
    () => (position ? { lat: position.lat, lng: position.lng } : null),
    [position],
  );

  const showJapanOverview = useCallback(() => {
    setFocus({ ...JAPAN_OVERVIEW, requestedAt: Date.now() });
  }, []);

  const handleHover = useCallback((hit: RegulationHit | null) => {
    setSelection((current) => {
      // クリックで固定表示中のポップアップはホバーで置き換えない。
      if (current?.pinned) return current;
      return hit ? { ...hit, pinned: false } : null;
    });
  }, []);

  const handleSelect = useCallback((hit: RegulationHit) => {
    setSelection({ ...hit, pinned: true });
  }, []);

  const closeInfoWindow = useCallback(() => setSelection(null), []);

  /** 一覧から選択されたら、該当区間へ地図を移動して InfoWindow を開く。 */
  const handleListSelect = useCallback((feature: RegulationFeature) => {
    const center = midpoint(feature);

    setSelection({
      featureId: feature.properties.id,
      position: center,
      pinned: true,
    });
    setFocus({ ...center, zoom: SELECTED_ZOOM, requestedAt: Date.now() });
  }, []);

  const toggleStatus = useCallback((status: RegulationStatus) => {
    setStatusFilter((current) => {
      const next = new Set(current);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

  const selectAllStatuses = useCallback(() => {
    setStatusFilter(new Set(REGULATION_STATUSES));
  }, []);

  /** 手動更新。押したことが分かるよう、完了後に短くメッセージを出す。 */
  const handleManualRefresh = useCallback(async () => {
    await refresh();
    setRefreshedAt(Date.now());
  }, [refresh]);

  useEffect(() => {
    if (refreshedAt === null) return;

    const timerId = window.setTimeout(() => setRefreshedAt(null), 3000);
    return () => window.clearTimeout(timerId);
  }, [refreshedAt]);

  /** 一覧が空のときに出す案内文。理由によって書き分ける。 */
  const emptyListMessage =
    source === "unconfigured"
      ? "規制情報の提供元が設定されていないため、表示できる情報がありません。"
      : source === "fallback"
        ? "規制情報を取得できませんでした。時間をおいて「今すぐ更新」をお試しください。"
        : "該当する規制情報はありません。";

  const handleAlertAction = useCallback(() => {
    clearError();
    if (error) void refresh();
  }, [clearError, error, refresh]);

  return (
    <main className="flex h-dvh flex-col bg-slate-100">
      <header className="z-20 bg-slate-900 px-4 py-3 text-white shadow-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">全国道路状況マップ</h1>
            <p className="text-xs text-slate-300">
              渋滞状況と通行止め・規制情報をまとめて確認できます
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={locate}
              disabled={isLocating}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLocating ? "取得中…" : "現在地を取得"}
            </button>

            <button
              type="button"
              onClick={showJapanOverview}
              className="rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold transition hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              全国表示
            </button>

            <button
              type="button"
              onClick={() => setIsListOpen((open) => !open)}
              aria-pressed={isListOpen}
              className="rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold transition hover:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              {isListOpen ? "一覧を隠す" : "一覧を表示"}
            </button>

            <label className="flex items-center gap-2 text-sm">
              <span className="whitespace-nowrap text-slate-300">更新間隔</span>
              <select
                value={refreshIntervalMs}
                onChange={(event) =>
                  setRefreshIntervalMs(Number(event.target.value))
                }
                className="rounded-md border border-slate-600 bg-slate-800 px-2 py-2 text-sm text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                {REFRESH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => void handleManualRefresh()}
              disabled={isValidating}
              className="rounded-md border border-slate-600 px-3 py-2 text-sm font-semibold transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isValidating ? "更新中…" : "今すぐ更新"}
            </button>
          </div>
        </div>
      </header>

      <div className="z-10 border-b border-slate-200 bg-white px-4 py-2">
        <div className="mx-auto w-full max-w-7xl space-y-2">
          <StatusFilter
            selected={statusFilter}
            counts={counts}
            onToggle={toggleStatus}
            onSelectAll={selectAllStatuses}
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span>規制情報の取得: {formatTime(generatedAt)}</span>
            <span>
              表示中: {isLoading ? "読み込み中…" : `${visibleFeatures.length}件`}
              {!isLoading && visibleFeatures.length !== features.length && (
                <span className="text-slate-400">／全{features.length}件</span>
              )}
            </span>
            {remainingSeconds !== null && (
              <span>次回更新まで: 約{remainingSeconds}秒</span>
            )}
            {refreshedAt !== null && (
              <span
                role="status"
                className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800"
              >
                更新しました
              </span>
            )}
            {source === "live" && (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                実データ
              </span>
            )}
            {source === "unconfigured" && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                規制情報は未接続
              </span>
            )}
            {source === "fallback" && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                規制情報を取得できませんでした
              </span>
            )}
            {source === "sample" && (
              <span
                title="開発用の見本データです。実際の規制ではありません。"
                className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
              >
                見本データ（開発用）
              </span>
            )}
          </div>

          {source === "unconfigured" && (
            <p className="text-xs leading-relaxed text-slate-500">
              通行止め・規制情報の提供元が未設定のため、黒い線は表示されません。
              道路の色（緑・オレンジ・赤）は Google のリアルタイム渋滞情報です。
            </p>
          )}
        </div>
      </div>

      {(error || locationError) && (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2">
            <span>{locationError ?? error?.message}</span>
            <button
              type="button"
              onClick={handleAlertAction}
              className="rounded border border-red-300 px-2 py-1 text-xs font-semibold transition hover:bg-red-100"
            >
              {error ? "再試行" : "閉じる"}
            </button>
          </div>
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-0 flex-1">
          <RoadMap
            features={visibleFeatures}
            selection={selection}
            onHover={handleHover}
            onSelect={handleSelect}
            onCloseInfoWindow={closeInfoWindow}
            focus={focus}
            userPosition={userPosition}
          />
          <Legend />
          <LocateButton
            onLocate={locate}
            isLocating={isLocating}
            hasPosition={userPosition !== null}
          />
        </div>

        {isListOpen && (
          <div className="absolute inset-x-0 bottom-0 z-20 shadow-lg lg:static lg:z-auto lg:w-96 lg:shrink-0 lg:shadow-none">
            <RegulationList
              features={visibleFeatures}
              selectedId={selection?.featureId ?? null}
              isLoading={isLoading}
              emptyMessage={emptyListMessage}
              onSelect={handleListSelect}
              onClose={() => setIsListOpen(false)}
            />
          </div>
        )}
      </div>
    </main>
  );
}
