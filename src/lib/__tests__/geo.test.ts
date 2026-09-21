import { describe, expect, it } from "vitest";

import { midpoint, toPath } from "@/lib/geo";
import type { RegulationFeature } from "@/types/regulation";

function makeFeature(
  coordinates: [number, number][],
): RegulationFeature {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates },
    properties: {
      id: "test",
      roadName: "テスト道路",
      section: "A〜B",
      status: "closed",
      description: "説明",
      link: "https://example.com",
      updatedAt: "2026-09-21T00:00:00Z",
    },
  };
}

describe("toPath", () => {
  it("[経度, 緯度] を {lat, lng} に並び替える", () => {
    const path = toPath(
      makeFeature([
        [139.76, 35.68],
        [139.78, 35.69],
      ]),
    );

    expect(path).toEqual([
      { lat: 35.68, lng: 139.76 },
      { lat: 35.69, lng: 139.78 },
    ]);
  });
});

describe("midpoint", () => {
  it("区間の中間付近の座標を返す", () => {
    const center = midpoint(
      makeFeature([
        [139.0, 35.0],
        [139.5, 35.5],
        [140.0, 36.0],
      ]),
    );

    expect(center).toEqual({ lat: 35.5, lng: 139.5 });
  });
});
