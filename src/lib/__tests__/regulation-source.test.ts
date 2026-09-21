import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const SOURCE_URL = "https://example.com/regulations.geojson";

const upstreamPayload = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [139.76, 35.68],
          [139.78, 35.69],
        ],
      },
      properties: {
        id: "upstream-1",
        roadName: "国道1号",
        status: "通行止め",
        link: "https://example.com/detail",
      },
    },
  ],
};

/** 環境変数はモジュール読み込み時に評価されるため、毎回読み直す。 */
async function importSource() {
  vi.resetModules();
  return import("@/lib/regulation-source");
}

interface FetchResponseStub {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

function mockFetchOnce(response: FetchResponseStub) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("loadRegulations", () => {
  it("取得元が未設定ならモックデータを返す", async () => {
    vi.stubEnv("REGULATION_SOURCE_URL", "");
    const { loadRegulations } = await importSource();

    const result = await loadRegulations();

    expect(result.source).toBe("mock");
    expect(result.features.length).toBeGreaterThan(0);
  });

  it("取得元が設定されていれば実データを正規化して返す", async () => {
    vi.stubEnv("REGULATION_SOURCE_URL", SOURCE_URL);
    const fetchMock = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => upstreamPayload,
    });

    const { loadRegulations } = await importSource();
    const result = await loadRegulations();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.source).toBe("live");
    expect(result.features).toHaveLength(1);
    expect(result.features[0].properties.id).toBe("upstream-1");
    expect(result.features[0].properties.status).toBe("closed");
  });

  it("2 回目の呼び出しはキャッシュを使い、上流APIを叩かない", async () => {
    vi.stubEnv("REGULATION_SOURCE_URL", SOURCE_URL);
    const fetchMock = mockFetchOnce({
      ok: true,
      status: 200,
      json: async () => upstreamPayload,
    });

    const { loadRegulations } = await importSource();
    await loadRegulations();
    const second = await loadRegulations();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second.source).toBe("live");
  });

  it("上流APIが失敗したらモックデータにフォールバックする", async () => {
    vi.stubEnv("REGULATION_SOURCE_URL", SOURCE_URL);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { loadRegulations } = await importSource();
    const result = await loadRegulations();

    expect(result.source).toBe("fallback");
    expect(result.features.length).toBeGreaterThan(0);
    expect(warn).toHaveBeenCalled();
  });

  it("失敗時に直近の取得結果が残っていればそれを返す", async () => {
    vi.stubEnv("REGULATION_SOURCE_URL", SOURCE_URL);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => upstreamPayload })
      .mockRejectedValueOnce(new Error("network error"));
    vi.stubGlobal("fetch", fetchMock);

    const { loadRegulations, resetRegulationCache } = await importSource();
    await loadRegulations();

    // キャッシュの有効期限切れを模して、取得済みデータは残したまま再取得させる。
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 120_000);
    const result = await loadRegulations();
    vi.useRealTimers();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.source).toBe("fallback");
    expect(result.features[0].properties.id).toBe("upstream-1");

    resetRegulationCache();
  });

  it("HTTP エラーはフォールバック扱いになる", async () => {
    vi.stubEnv("REGULATION_SOURCE_URL", SOURCE_URL);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mockFetchOnce({ ok: false, status: 503, json: async () => ({}) });

    const { loadRegulations } = await importSource();
    const result = await loadRegulations();

    expect(result.source).toBe("fallback");
  });
});
