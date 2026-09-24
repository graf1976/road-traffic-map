import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET, resetRoadCache, type RoadLookupResult } from "@/app/api/road/route";

function request(query: string): Request {
  return new Request(`http://localhost/api/road${query}`);
}

function nearestResponse(name: string, distance: number) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ waypoints: [{ name, distance }] }),
  };
}

beforeEach(() => {
  resetRoadCache();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/road", () => {
  it("地点の道路名と管理者を返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(nearestResponse("伊勢湾岸自動車道", 5)));

    const response = await GET(request("?lat=35.05&lng=136.75"));
    const body = (await response.json()) as RoadLookupResult;

    expect(body.name).toBe("伊勢湾岸自動車道");
    expect(body.operator?.label).toBe("NEXCO中日本 交通情報");
  });

  it("道路から離れた地点では名前を返さない", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(nearestResponse("東名高速道路", 500)));

    const body = (await (await GET(request("?lat=35&lng=139"))).json()) as RoadLookupResult;

    expect(body.name).toBeNull();
    expect(body.operator).toBeNull();
  });

  it("拡大しているほど、道路と判定する距離を狭める", async () => {
    // ズーム18（近い）では 60m 離れた道路は対象外。
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(nearestResponse("国道1号", 60)));
    const close = (await (
      await GET(request("?lat=35&lng=139&zoom=18"))
    ).json()) as RoadLookupResult;
    expect(close.name).toBeNull();

    // ズーム12（広域）では同じ 60m でも対象になる。
    resetRoadCache();
    const wide = (await (
      await GET(request("?lat=35&lng=139&zoom=12"))
    ).json()) as RoadLookupResult;
    expect(wide.name).toBe("国道1号");
  });

  it("近い地点は問い合わせ直さない（キャッシュ）", async () => {
    const fetchMock = vi.fn().mockResolvedValue(nearestResponse("国道1号", 3));
    vi.stubGlobal("fetch", fetchMock);

    // 約 10m 四方をひとまとめにするため、ごく近い 2 点は 1 回で済む。
    await GET(request("?lat=35.12341&lng=139.12341"));
    await GET(request("?lat=35.12342&lng=139.12342"));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("座標が不正なら 400 を返す", async () => {
    const response = await GET(request("?lat=abc&lng=139"));

    expect(response.status).toBe(400);
  });

  it("取得に失敗しても落ちずに名前なしを返す", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const response = await GET(request("?lat=35&lng=139"));
    const body = (await response.json()) as RoadLookupResult;

    expect(response.status).toBe(200);
    expect(body.name).toBeNull();
    expect(warn).toHaveBeenCalled();
  });
});
