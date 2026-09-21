"use client";

import useSWR from "swr";

import type {
  RegulationCollection,
  RegulationFeature,
  RegulationSourceKind,
} from "@/types/regulation";

const REGULATIONS_ENDPOINT = "/api/regulations";

async function fetchRegulations(url: string): Promise<RegulationCollection> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`規制情報の取得に失敗しました（HTTP ${response.status}）`);
  }

  return (await response.json()) as RegulationCollection;
}

export interface UseRegulationsResult {
  features: RegulationFeature[];
  /** サーバーがデータを生成した時刻。取得できていない場合は null。 */
  generatedAt: Date | null;
  /** データの取得元（モック／実データ／フォールバック）。 */
  source: RegulationSourceKind | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  /** 手動で再取得する。 */
  refresh: () => void;
}

/**
 * 規制情報を取得し、指定間隔で自動更新する。
 *
 * @param refreshIntervalMs 自動更新間隔（ミリ秒）。0 の場合は自動更新しない。
 */
export function useRegulations(refreshIntervalMs: number): UseRegulationsResult {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<RegulationCollection, Error>(REGULATIONS_ENDPOINT, fetchRegulations, {
      refreshInterval: refreshIntervalMs,
      revalidateOnFocus: false,
      keepPreviousData: true,
      shouldRetryOnError: false,
    });

  return {
    features: data?.features ?? [],
    generatedAt: data?.generatedAt ? new Date(data.generatedAt) : null,
    source: data?.source ?? null,
    isLoading,
    isValidating,
    error: error ?? null,
    refresh: () => {
      void mutate();
    },
  };
}
