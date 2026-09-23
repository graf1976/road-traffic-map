import { describe, expect, it } from "vitest";

import { MOCK_REGULATION_FEATURES } from "@/lib/mock-regulations";
import { REGULATION_STATUSES } from "@/types/regulation";

/**
 * 見本データ（開発時のみ表示）の妥当性を確認する。
 * 線形は scripts/generate-mock-geometry.mjs が実際の道路から生成している。
 */
describe("MOCK_REGULATION_FEATURES", () => {
  it("IDが重複していない", () => {
    const ids = MOCK_REGULATION_FEATURES.map((feature) => feature.properties.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("線として描ける座標を持ち、日本国内の範囲に収まっている", () => {
    for (const feature of MOCK_REGULATION_FEATURES) {
      expect(feature.geometry.type).toBe("LineString");
      // 道路の形に沿わせるため、直線ではなく十分な点数を持たせている。
      expect(feature.geometry.coordinates.length).toBeGreaterThanOrEqual(10);

      for (const [lng, lat] of feature.geometry.coordinates) {
        expect(lng).toBeGreaterThan(122);
        expect(lng).toBeLessThan(154);
        expect(lat).toBeGreaterThan(20);
        expect(lat).toBeLessThan(46);
      }
    }
  });

  it("表示に必要な属性がそろっている", () => {
    for (const { properties } of MOCK_REGULATION_FEATURES) {
      expect(properties.roadName).toBeTruthy();
      expect(properties.description).toBeTruthy();
      expect(properties.link).toMatch(/^https:\/\//);
      expect(REGULATION_STATUSES).toContain(properties.status);
      expect(Number.isNaN(new Date(properties.updatedAt).getTime())).toBe(false);
    }
  });
});
