import type {
  MapBounds,
  RegulationFeature,
  RegulationStatus,
} from "@/types/regulation";

/** ステータスごとの件数を数える。 */
export function countByStatus(
  features: RegulationFeature[],
): Record<RegulationStatus, number> {
  const counts: Record<RegulationStatus, number> = {
    closed: 0,
    construction: 0,
    lane_closed: 0,
    chain_required: 0,
  };

  for (const feature of features) {
    counts[feature.properties.status] += 1;
  }

  return counts;
}

/** 選択されたステータスの規制だけを残す。 */
export function filterByStatus(
  features: RegulationFeature[],
  selected: ReadonlySet<RegulationStatus>,
): RegulationFeature[] {
  return features.filter((feature) => selected.has(feature.properties.status));
}

/** 区間全体を囲む矩形（経度・緯度の最小最大）。 */
function boundingBox(feature: RegulationFeature): MapBounds | null {
  const coordinates = feature.geometry.coordinates;
  if (coordinates.length === 0) return null;

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  for (const [lng, lat] of coordinates) {
    north = Math.max(north, lat);
    south = Math.min(south, lat);
    east = Math.max(east, lng);
    west = Math.min(west, lng);
  }

  return { north, south, east, west };
}

/**
 * 地図が表示している範囲に重なる規制だけを残す。
 *
 * 区間は線なので、端が画面外でも一部が見えていれば対象に含める
 * （区間の外接矩形と表示範囲が重なるかで判定する）。
 */
export function filterByBounds(
  features: RegulationFeature[],
  bounds: MapBounds | null,
): RegulationFeature[] {
  if (!bounds) return features;

  return features.filter((feature) => {
    const box = boundingBox(feature);
    if (!box) return false;

    const overlapsLatitude = box.south <= bounds.north && box.north >= bounds.south;
    if (!overlapsLatitude) return false;

    // 日付変更線をまたぐ表示範囲では west > east になる。
    const crossesAntimeridian = bounds.west > bounds.east;
    return crossesAntimeridian
      ? box.west <= bounds.east || box.east >= bounds.west
      : box.west <= bounds.east && box.east >= bounds.west;
  });
}
