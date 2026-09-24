import { NextResponse } from "next/server";

import { findRoadOperator, type RoadOperator } from "@/lib/road-operators";

export const dynamic = "force-dynamic";

/** OpenStreetMap をもとに、指定地点にいちばん近い道路を返すサービス。 */
const NEAREST_ENDPOINT = "https://router.project-osrm.org/nearest/v1/driving";

const FETCH_TIMEOUT_MS = 5_000;

/**
 * 「その道路を指した」とみなす距離の上限（メートル）。
 * 地図は縮尺で 1 ピクセルあたりの距離が変わるため、ズームから計算する。
 */
const MAX_SNAP_DISTANCE_M = 400;

/**
 * 指す精度は入力方法で大きく違う。
 * 指でのタップはマウスより数倍ずれるため、判定を広げないと反応しない。
 */
const POINTER_PRECISION = {
  fine: { tolerancePx: 12, minDistanceM: 30 },
  coarse: { tolerancePx: 28, minDistanceM: 70 },
} as const;

type PointerPrecision = keyof typeof POINTER_PRECISION;

/**
 * 近い順にいくつ候補を見るか。
 * いちばん近い区間はランプなどで名前が付いていないことがあるため、
 * 名前のある区間が見つかるまで順に見る。
 */
const CANDIDATE_COUNT = 5;

/** 同じあたりを何度も問い合わせないための簡易キャッシュ。 */
const CACHE_TTL_MS = 10 * 60_000;
const CACHE_LIMIT = 500;

export interface RoadLookupResult {
  /** 道路名。分からない場合は null。 */
  name: string | null;
  /** その道路の管理者（分かる場合）。 */
  operator: RoadOperator | null;
}

interface CacheEntry {
  result: RoadLookupResult;
  storedAt: number;
}

const cache = new Map<string, CacheEntry>();

/** テスト用にキャッシュを初期化する。 */
export function resetRoadCache(): void {
  cache.clear();
}

/** 約 10m 四方＋ズーム＋入力方法の単位でまとめてキャッシュする。 */
function cacheKey(
  lat: number,
  lng: number,
  zoom: number | null,
  precision: PointerPrecision,
): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)},${zoom ?? "-"},${precision}`;
}

function readCache(key: string): RoadLookupResult | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.storedAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.result;
}

function writeCache(key: string, result: RoadLookupResult): void {
  if (cache.size >= CACHE_LIMIT) {
    // 古いものから捨てる（Map は挿入順を保つ）。
    const oldest = cache.keys().next();
    if (!oldest.done) cache.delete(oldest.value);
  }
  cache.set(key, { result, storedAt: Date.now() });
}

function parseCoordinate(value: string | null, limit: number): number | null {
  if (value === null) return null;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || Math.abs(parsed) > limit) return null;

  return parsed;
}

/**
 * 画面の見た目の距離を実際の距離に直す。
 * ズームが小さい（広域）ほど 1 ピクセルが表す距離は長くなる。
 */
function snapDistanceFor(
  lat: number,
  zoom: number | null,
  precision: PointerPrecision,
): number {
  const { tolerancePx, minDistanceM } = POINTER_PRECISION[precision];

  if (zoom === null) return minDistanceM * 2;

  const metersPerPixel =
    (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;

  return Math.min(
    MAX_SNAP_DISTANCE_M,
    Math.max(minDistanceM, metersPerPixel * tolerancePx),
  );
}

async function lookupRoadName(
  lat: number,
  lng: number,
  maxDistance: number,
): Promise<string | null> {
  const response = await fetch(`${NEAREST_ENDPOINT}/${lng},${lat}?number=${CANDIDATE_COUNT}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "road-traffic-map/1.0" },
  });

  if (!response.ok) throw new Error(`道路の検索に失敗しました（HTTP ${response.status}）`);

  const payload: unknown = await response.json();
  if (typeof payload !== "object" || payload === null) return null;

  const waypoints = (payload as { waypoints?: unknown }).waypoints;
  if (!Array.isArray(waypoints) || waypoints.length === 0) return null;

  for (const candidate of waypoints) {
    const { name, distance } = candidate as { name?: unknown; distance?: unknown };

    // 道路から離れた場所（海や建物の上）では名前を返さない。
    if (typeof distance !== "number" || distance > maxDistance) continue;

    const roadName = typeof name === "string" ? name.trim() : "";
    if (roadName.length > 0) return roadName;
  }

  return null;
}

/**
 * 指定した地点の道路名と、その管理者へのリンクを返す。
 *
 *   GET /api/road?lat=35.68&lng=139.76&zoom=14&precision=coarse
 *
 * 道路名は OpenStreetMap（OSRM 経由）から取得する。分からない場合も
 * エラーにはせず name: null を返し、画面側は何も出さない。
 */
export async function GET(request: Request): Promise<NextResponse<RoadLookupResult>> {
  const params = new URL(request.url).searchParams;
  const lat = parseCoordinate(params.get("lat"), 90);
  const lng = parseCoordinate(params.get("lng"), 180);

  if (lat === null || lng === null) {
    return NextResponse.json(
      { name: null, operator: null },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const zoomParam = params.get("zoom");
  const parsedZoom = zoomParam === null ? null : Number(zoomParam);
  const zoom =
    parsedZoom !== null && Number.isFinite(parsedZoom) && parsedZoom >= 0 && parsedZoom <= 25
      ? Math.round(parsedZoom)
      : null;

  const precision: PointerPrecision =
    params.get("precision") === "coarse" ? "coarse" : "fine";

  const key = cacheKey(lat, lng, zoom, precision);
  const cached = readCache(key);
  if (cached) {
    return NextResponse.json(cached, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const name = await lookupRoadName(
      lat,
      lng,
      snapDistanceFor(lat, zoom, precision),
    );
    const result: RoadLookupResult = { name, operator: findRoadOperator(name) };

    writeCache(key, result);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("[road] 道路名を取得できませんでした:", error);
    return NextResponse.json(
      { name: null, operator: null },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
