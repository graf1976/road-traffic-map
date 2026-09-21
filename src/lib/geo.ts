import type { LatLng, RegulationFeature } from "@/types/regulation";

/** GeoJSON の座標列（[経度, 緯度]）を Google Maps 用の {lat, lng} 配列へ変換する。 */
export function toPath(feature: RegulationFeature): LatLng[] {
  return feature.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
}

/** 区間のおおよその中心。一覧から選択したときの InfoWindow 位置に使う。 */
export function midpoint(feature: RegulationFeature): LatLng {
  const path = toPath(feature);
  if (path.length === 0) return { lat: 35.6812, lng: 139.7671 };
  return path[Math.floor(path.length / 2)];
}
