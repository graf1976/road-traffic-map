import { describe, expect, it } from "vitest";

import {
  normalizeRegulationCollection,
  normalizeRegulationFeature,
  resolveStatus,
} from "@/lib/regulation-normalize";

describe("resolveStatus", () => {
  it("日本語・英語どちらの表記も内部の区分に変換する", () => {
    expect(resolveStatus("通行止め")).toBe("closed");
    expect(resolveStatus("road_closed")).toBe("closed");
    expect(resolveStatus("工事中")).toBe("construction");
    expect(resolveStatus("車線規制")).toBe("lane_closed");
    expect(resolveStatus("チェーン規制")).toBe("chain_required");
  });

  it("前後の空白を無視する", () => {
    expect(resolveStatus("  工事中 ")).toBe("construction");
  });

  it("未知の値や文字列以外は安全側（通行止め）として扱う", () => {
    expect(resolveStatus("未知の区分")).toBe("closed");
    expect(resolveStatus(undefined)).toBe("closed");
    expect(resolveStatus(42)).toBe("closed");
  });
});

describe("normalizeRegulationFeature", () => {
  const validFeature = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.76, 35.68],
        [139.78, 35.69],
      ],
    },
    properties: {
      id: "reg-1",
      roadName: "首都高速都心環状線",
      section: "霞が関〜神田橋",
      status: "通行止め",
      description: "車両火災のため通行止め",
      link: "https://example.com/detail",
      updatedAt: "2026-09-21T07:20:00+09:00",
    },
  };

  it("正しい Feature をそのまま正規化する", () => {
    const result = normalizeRegulationFeature(validFeature, 0);

    expect(result).not.toBeNull();
    expect(result?.properties.id).toBe("reg-1");
    expect(result?.properties.status).toBe("closed");
    expect(result?.geometry.coordinates).toHaveLength(2);
  });

  it("スネークケースのプロパティ名も受け付ける", () => {
    const result = normalizeRegulationFeature(
      {
        ...validFeature,
        properties: {
          road_name: "国道1号",
          status: "工事中",
          url: "https://example.com/a",
          updated_at: "2026-09-21T00:00:00Z",
        },
      },
      3,
    );

    expect(result?.properties.roadName).toBe("国道1号");
    expect(result?.properties.link).toBe("https://example.com/a");
  });

  it("ID が無い場合は連番で補完する", () => {
    const result = normalizeRegulationFeature(
      { ...validFeature, properties: {} },
      7,
    );

    expect(result?.properties.id).toBe("regulation-7");
  });

  it("http(s) 以外のリンクは取り除く", () => {
    const result = normalizeRegulationFeature(
      {
        ...validFeature,
        properties: { ...validFeature.properties, link: "javascript:alert(1)" },
      },
      0,
    );

    expect(result?.properties.link).toBe("");
  });

  it("MultiLineString は先頭の線を採用する", () => {
    const result = normalizeRegulationFeature(
      {
        ...validFeature,
        geometry: {
          type: "MultiLineString",
          coordinates: [
            [
              [139.7, 35.6],
              [139.8, 35.7],
            ],
            [
              [140.1, 36.1],
              [140.2, 36.2],
            ],
          ],
        },
      },
      0,
    );

    expect(result?.geometry.type).toBe("LineString");
    expect(result?.geometry.coordinates[0]).toEqual([139.7, 35.6]);
  });

  it("線として成立しないデータは null を返す", () => {
    const onePoint = {
      ...validFeature,
      geometry: { type: "LineString", coordinates: [[139.76, 35.68]] },
    };
    const outOfRange = {
      ...validFeature,
      geometry: {
        type: "LineString",
        coordinates: [
          [999, 35.68],
          [139.78, 35.69],
        ],
      },
    };

    expect(normalizeRegulationFeature(onePoint, 0)).toBeNull();
    expect(normalizeRegulationFeature(outOfRange, 0)).toBeNull();
    expect(normalizeRegulationFeature(null, 0)).toBeNull();
    expect(normalizeRegulationFeature({ type: "Feature" }, 0)).toBeNull();
  });
});

describe("normalizeRegulationCollection", () => {
  const feature = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [139.76, 35.68],
        [139.78, 35.69],
      ],
    },
    properties: { id: "ok", status: "通行止め" },
  };

  it("FeatureCollection から有効な Feature だけを取り出す", () => {
    const result = normalizeRegulationCollection({
      type: "FeatureCollection",
      features: [feature, { type: "Feature" }, null],
    });

    expect(result).toHaveLength(1);
    expect(result[0].properties.id).toBe("ok");
  });

  it("Feature の配列も受け付ける", () => {
    expect(normalizeRegulationCollection([feature])).toHaveLength(1);
  });

  it("想定外の入力では空配列を返す", () => {
    expect(normalizeRegulationCollection(undefined)).toEqual([]);
    expect(normalizeRegulationCollection("error")).toEqual([]);
    expect(normalizeRegulationCollection({ features: "x" })).toEqual([]);
  });
});
