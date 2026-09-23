import { describe, expect, it } from "vitest";

import {
  NATIONWIDE_LINKS,
  ROAD_INFO_REGIONS,
  centerOf,
  findRegion,
} from "@/lib/official-links";

describe("findRegion", () => {
  const cases: ReadonlyArray<[string, number, number, string]> = [
    ["東京", 35.68, 139.77, "関東"],
    ["札幌", 43.06, 141.35, "北海道"],
    ["仙台", 38.27, 140.87, "東北"],
    ["新潟", 37.9, 139.02, "北陸"],
    ["名古屋", 35.18, 136.91, "中部"],
    ["大阪", 34.69, 135.5, "近畿"],
    ["広島", 34.38, 132.46, "中国"],
    ["高松", 34.34, 134.05, "四国"],
    ["福岡", 33.59, 130.4, "九州"],
    ["那覇", 26.21, 127.68, "沖縄"],
  ];

  for (const [label, lat, lng, expected] of cases) {
    it(`${label}は「${expected}」と判定する`, () => {
      expect(findRegion({ lat, lng })?.name).toBe(expected);
    });
  }

  it("位置が分からないときは null を返す", () => {
    expect(findRegion(null)).toBeNull();
  });

  it("日本の外では null を返す", () => {
    // ソウル付近
    expect(findRegion({ lat: 37.57, lng: 126.98 })).toBeNull();
  });
});

describe("centerOf", () => {
  it("表示範囲の中心を返す", () => {
    expect(centerOf({ north: 36, south: 34, east: 140, west: 138 })).toEqual({
      lat: 35,
      lng: 139,
    });
  });

  it("範囲が無ければ null", () => {
    expect(centerOf(null)).toBeNull();
  });
});

describe("リンク定義", () => {
  it("すべて https の URL を持つ", () => {
    const urls = [
      ...NATIONWIDE_LINKS,
      ...ROAD_INFO_REGIONS.flatMap((region) => region.links),
    ].map((link) => link.url);

    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("地方ごとに 1 つ以上の案内先がある", () => {
    for (const region of ROAD_INFO_REGIONS) {
      expect(region.links.length).toBeGreaterThan(0);
    }
  });
});
