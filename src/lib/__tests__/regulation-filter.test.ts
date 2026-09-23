import { describe, expect, it } from "vitest";

import {
  countByStatus,
  filterByBounds,
  filterByStatus,
} from "@/lib/regulation-filter";
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

describe("filterByBounds", () => {
  /** 東京付近（東西 139.0〜140.0 / 南北 35.0〜36.0）を通る区間。 */
  const tokyo = makeFeature("tokyo", "closed");
  /** 九州付近の区間。 */
  const kyushu: RegulationFeature = {
    ...makeFeature("kyushu", "closed"),
    geometry: {
      type: "LineString",
      coordinates: [
        [130.4, 33.6],
        [130.5, 33.4],
      ],
    },
  };

  const kanto = { north: 36.0, south: 35.0, east: 140.5, west: 139.0 };

  it("表示範囲に重なる区間だけを残す", () => {
    const result = filterByBounds([tokyo, kyushu], kanto);

    expect(result.map((feature) => feature.properties.id)).toEqual(["tokyo"]);
  });

  it("端が画面外でも一部が重なっていれば残す", () => {
    // 区間の東半分だけが入る範囲
    const rightHalf = { north: 36.0, south: 35.0, east: 140.5, west: 139.77 };

    expect(filterByBounds([tokyo], rightHalf)).toHaveLength(1);
  });

  it("まったく重ならない範囲では空になる", () => {
    const hokkaido = { north: 44.0, south: 43.0, east: 142.0, west: 141.0 };

    expect(filterByBounds([tokyo, kyushu], hokkaido)).toEqual([]);
  });

  it("範囲が未取得（null）のときは絞り込まない", () => {
    expect(filterByBounds([tokyo, kyushu], null)).toHaveLength(2);
  });

  it("日付変更線をまたぐ範囲でも判定できる", () => {
    const acrossAntimeridian = { north: 40, south: 30, east: -170, west: 139.0 };

    expect(filterByBounds([tokyo], acrossAntimeridian)).toHaveLength(1);
  });
});
