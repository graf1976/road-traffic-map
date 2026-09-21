import { MOCK_REGULATION_FEATURES } from "@/lib/mock-regulations";
import { normalizeRegulationCollection } from "@/lib/regulation-normalize";
import type {
  RegulationFeature,
  RegulationSourceKind,
} from "@/types/regulation";

/**
 * 規制情報の取得元 URL（サーバー専用の環境変数）。
 * 未設定の場合はモックデータを返す。国土交通省などのオープンデータ
 * （GeoJSON を返すエンドポイント）を設定すればそのまま実データに切り替わる。
 */
const SOURCE_URL: string = process.env.REGULATION_SOURCE_URL?.trim() ?? "";

/** 上流APIへの問い合わせ間隔の下限（ミリ秒）。 */
const CACHE_TTL_MS = 60_000;

/** 上流APIの応答待ち時間の上限（ミリ秒）。 */
const FETCH_TIMEOUT_MS = 8_000;

interface CacheEntry {
  features: RegulationFeature[];
  fetchedAt: number;
}

/**
 * プロセス内キャッシュ。自動更新で複数クライアントから呼ばれても
 * 上流APIへのリクエストが増えすぎないようにする。
 * （サーバーレス環境ではインスタンス単位のキャッシュになる点に注意）
 */
let cache: CacheEntry | null = null;

export interface RegulationLoadResult {
  features: RegulationFeature[];
  source: RegulationSourceKind;
}

/** テスト用にキャッシュを初期化する。 */
export function resetRegulationCache(): void {
  cache = null;
}

async function fetchFromSource(url: string): Promise<RegulationFeature[]> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { Accept: "application/geo+json, application/json" },
  });

  if (!response.ok) {
    throw new Error(`上流APIがエラーを返しました（HTTP ${response.status}）`);
  }

  const payload: unknown = await response.json();
  const features = normalizeRegulationCollection(payload);

  if (features.length === 0) {
    throw new Error("上流APIのレスポンスに有効な規制情報が含まれていません");
  }

  return features;
}

/**
 * 規制情報を取得する。
 *
 * 1. `REGULATION_SOURCE_URL` 未設定 → モックデータ
 * 2. キャッシュが新しい → キャッシュ
 * 3. 上流APIを取得 → 正規化してキャッシュ
 * 4. 失敗 → 直近のキャッシュ、無ければモックデータ（source: "fallback"）
 */
export async function loadRegulations(): Promise<RegulationLoadResult> {
  if (!SOURCE_URL) {
    return { features: MOCK_REGULATION_FEATURES, source: "mock" };
  }

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return { features: cache.features, source: "live" };
  }

  try {
    const features = await fetchFromSource(SOURCE_URL);
    cache = { features, fetchedAt: Date.now() };
    return { features, source: "live" };
  } catch (error) {
    console.warn("[regulations] 上流APIの取得に失敗しました:", error);

    return {
      features: cache?.features ?? MOCK_REGULATION_FEATURES,
      source: "fallback",
    };
  }
}
