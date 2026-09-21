import type { RegulationFeature, RegulationStatus } from "@/types/regulation";

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
