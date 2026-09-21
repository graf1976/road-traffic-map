import type {
  LineStringGeometry,
  Position,
  RegulationFeature,
  RegulationProperties,
  RegulationStatus,
} from "@/types/regulation";

/**
 * 外部オープンデータの表記ゆれを内部の RegulationStatus に寄せるための対応表。
 * 実データの区分が判明した時点でここに追記すれば、UI 側は変更不要。
 */
const STATUS_ALIASES: Readonly<Record<string, RegulationStatus>> = {
  closed: "closed",
  road_closed: "closed",
  通行止め: "closed",
  通行止: "closed",
  全面通行止め: "closed",
  construction: "construction",
  work: "construction",
  工事中: "construction",
  工事: "construction",
  作業中: "construction",
  lane_closed: "lane_closed",
  lane_restriction: "lane_closed",
  車線規制: "lane_closed",
  車線減少: "lane_closed",
  対面通行: "lane_closed",
  chain_required: "chain_required",
  chain_regulation: "chain_required",
  チェーン規制: "chain_required",
  冬タイヤ規制: "chain_required",
};

/**
 * 区分を判別できない場合は最も強い規制（通行止め）として扱う。
 * 利用者に「通れるはず」と誤認させないための安全側の既定値。
 */
const FALLBACK_STATUS: RegulationStatus = "closed";

export function resolveStatus(value: unknown): RegulationStatus {
  if (typeof value !== "string") return FALLBACK_STATUS;
  return STATUS_ALIASES[value.trim()] ?? FALLBACK_STATUS;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

/** http(s) 以外のリンク（javascript: など）は表示しない。 */
function toSafeUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function toIsoDate(value: unknown): string {
  if (typeof value !== "string") return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : value;
}

function toPosition(value: unknown): Position | null {
  if (!Array.isArray(value) || value.length < 2) return null;

  const [lng, lat] = value;
  if (typeof lng !== "number" || typeof lat !== "number") return null;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) return null;

  return [lng, lat];
}

/** LineString / MultiLineString（先頭の線）を LineString に正規化する。 */
function toLineString(value: unknown): LineStringGeometry | null {
  if (!isRecord(value)) return null;

  const rawCoordinates =
    value.type === "MultiLineString" && Array.isArray(value.coordinates)
      ? value.coordinates[0]
      : value.coordinates;

  if (value.type !== "LineString" && value.type !== "MultiLineString") {
    return null;
  }
  if (!Array.isArray(rawCoordinates)) return null;

  const coordinates = rawCoordinates
    .map(toPosition)
    .filter((position): position is Position => position !== null);

  // 線として描画するには 2 点以上必要。
  return coordinates.length >= 2 ? { type: "LineString", coordinates } : null;
}

/**
 * 1 件の Feature を正規化する。必須情報が欠けている場合は null を返して取り除く。
 *
 * @param index ID が欠けている場合の連番付与に使う。
 */
export function normalizeRegulationFeature(
  input: unknown,
  index: number,
): RegulationFeature | null {
  if (!isRecord(input)) return null;

  const geometry = toLineString(input.geometry);
  if (!geometry) return null;

  const rawProperties = isRecord(input.properties) ? input.properties : {};

  const properties: RegulationProperties = {
    id: toText(rawProperties.id, `regulation-${index}`),
    roadName: toText(rawProperties.roadName ?? rawProperties.road_name, "道路名不明"),
    section: toText(rawProperties.section, ""),
    status: resolveStatus(rawProperties.status),
    description: toText(rawProperties.description, "詳細情報は提供されていません。"),
    link: toSafeUrl(rawProperties.link ?? rawProperties.url),
    updatedAt: toIsoDate(rawProperties.updatedAt ?? rawProperties.updated_at),
  };

  return { type: "Feature", geometry, properties };
}

/**
 * 外部データ（FeatureCollection もしくは Feature の配列）を内部形式へ正規化する。
 * 壊れた要素は無視し、扱える Feature だけを返す。
 */
export function normalizeRegulationCollection(
  input: unknown,
): RegulationFeature[] {
  const rawFeatures = Array.isArray(input)
    ? input
    : isRecord(input) && Array.isArray(input.features)
      ? input.features
      : [];

  return rawFeatures
    .map((feature, index) => normalizeRegulationFeature(feature, index))
    .filter((feature): feature is RegulationFeature => feature !== null);
}
