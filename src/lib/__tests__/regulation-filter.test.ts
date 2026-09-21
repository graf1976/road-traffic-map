import { describe, expect, it } from "vitest";

import { countByStatus, filterByStatus } from "@/lib/regulation-filter";
import type { RegulationFeature, RegulationStatus } from "@/types/regulation";

function makeFeature(id: string, status: RegulationStatus): RegulationFeature {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.76, 35.68],
        [139.78, 35.69],
      ],
    },
    properties: {
      id,
      roadName: "テスト道路",
      section: "A〜B",
      status,
      description: "説明",
      link: "https://example.com",
      updatedAt: "2026-09-21T00:00:00Z",
    },
  };
}

const features = [
  makeFeature("1", "closed"),
  makeFeature("2", "closed"),
  makeFeature("3", "construction"),
  makeFeature("4", "chain_required"),
];

describe("countByStatus", () => {
  it("ステータスごとの件数を返す", () => {
    expect(countByStatus(features)).toEqual({
      closed: 2,
      construction: 1,
      lane_closed: 0,
      chain_required: 1,
    });
  });

  it("空配列ではすべて 0 になる", () => {
    expect(countByStatus([])).toEqual({
      closed: 0,
      construction: 0,
      lane_closed: 0,
      chain_required: 0,
    });
  });
});

describe("filterByStatus", () => {
  it("選択したステータスのみを残す", () => {
    const result = filterByStatus(features, new Set(["closed"]));

    expect(result.map((feature) => feature.properties.id)).toEqual(["1", "2"]);
  });

  it("複数選択に対応する", () => {
    const result = filterByStatus(
      features,
      new Set(["construction", "chain_required"]),
    );

    expect(result).toHaveLength(2);
  });

  it("何も選択されていない場合は空になる", () => {
    expect(filterByStatus(features, new Set())).toEqual([]);
  });
});
