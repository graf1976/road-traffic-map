import { beforeEach, describe, expect, it } from "vitest";

import { GET } from "@/app/api/regulations/route";
import { resetRegulationCache } from "@/lib/regulation-source";
import type { RegulationCollection } from "@/types/regulation";

describe("GET /api/regulations", () => {
  beforeEach(() => {
    resetRegulationCache();
  });

  it("GeoJSON の FeatureCollection を返す", async () => {
    const response = await GET();
    const body = (await response.json()) as RegulationCollection;

    expect(response.status).toBe(200);
    expect(body.type).toBe("FeatureCollection");
    expect(Array.isArray(body.features)).toBe(true);
    expect(Number.isNaN(new Date(body.generatedAt).getTime())).toBe(false);
  });

  it("取得元が未設定のときは規制を返さない", async () => {
    const response = await GET();
    const body = (await response.json()) as RegulationCollection;

    expect(body.source).toBe("unconfigured");
    expect(body.features).toEqual([]);
  });

  it("返す Feature は描画に必要な形を満たす", async () => {
    const response = await GET();
    const body = (await response.json()) as RegulationCollection;

    for (const feature of body.features) {
      expect(feature.geometry.type).toBe("LineString");
      expect(feature.geometry.coordinates.length).toBeGreaterThanOrEqual(2);
      expect(feature.properties.id).toBeTruthy();
      expect(feature.properties.link).toMatch(/^https?:\/\//);
    }
  });

  it("キャッシュを無効化するヘッダーを付ける", async () => {
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});
