// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "@/app/page";
import type { MapBounds, RegulationCollection } from "@/types/regulation";

/** 地図の代わりに、表示範囲を手動で通知できるボタンを置く。 */
vi.mock("@/components/Map", () => ({
  RoadMap: ({
    onBoundsChange,
  }: {
    onBoundsChange?: (bounds: MapBounds) => void;
    children?: ReactNode;
  }) => (
    <div data-testid="map-stub">
      <button
        type="button"
        onClick={() =>
          onBoundsChange?.({ north: 36, south: 35, east: 140.5, west: 139 })
        }
      >
        関東を表示
      </button>
      <button
        type="button"
        onClick={() =>
          onBoundsChange?.({ north: 34, south: 33, east: 131, west: 130 })
        }
      >
        九州を表示
      </button>
    </div>
  ),
  DEFAULT_CENTER: { lat: 35.6812, lng: 139.7671 },
  DEFAULT_ZOOM: 9,
}));

function makeFeature(id: string, roadName: string, coordinates: [number, number][]) {
  return {
    type: "Feature" as const,
    geometry: { type: "LineString" as const, coordinates },
    properties: {
      id,
      roadName,
      section: "区間",
      status: "closed" as const,
      description: "説明",
      link: "https://example.com",
      updatedAt: "2026-09-24T00:00:00Z",
    },
  };
}

const collection: RegulationCollection = {
  type: "FeatureCollection",
  generatedAt: "2026-09-24T00:00:00Z",
  source: "live",
  features: [
    makeFeature("kanto", "関東の道路", [
      [139.6, 35.6],
      [139.8, 35.7],
    ]),
    makeFeature("kyushu", "九州の道路", [
      [130.4, 33.6],
      [130.5, 33.4],
    ]),
  ],
};

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => collection,
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("トップページの一覧", () => {
  it("地図の表示範囲に合わせて一覧の件数が変わる", async () => {
    render(<Home />);

    // 範囲が未取得のうちは全件を出す。
    expect(await screen.findByText("関東の道路")).toBeTruthy();
    expect(screen.getByText("九州の道路")).toBeTruthy();

    // 関東を表示 → 九州の規制は一覧から消える。
    fireEvent.click(screen.getByRole("button", { name: "関東を表示" }));
    await waitFor(() => {
      expect(screen.queryByText("九州の道路")).toBeNull();
    });
    expect(screen.getByText("関東の道路")).toBeTruthy();

    // 九州を表示 → 入れ替わる。
    fireEvent.click(screen.getByRole("button", { name: "九州を表示" }));
    await waitFor(() => {
      expect(screen.queryByText("関東の道路")).toBeNull();
    });
    expect(screen.getByText("九州の道路")).toBeTruthy();
  });

  it("「地図の範囲のみ」を外すと全件表示に戻る", async () => {
    render(<Home />);
    expect(await screen.findByText("関東の道路")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "九州を表示" }));
    await waitFor(() => {
      expect(screen.queryByText("関東の道路")).toBeNull();
    });

    fireEvent.click(screen.getByRole("checkbox", { name: "地図の範囲のみ" }));

    await waitFor(() => {
      expect(screen.getByText("関東の道路")).toBeTruthy();
    });
    expect(screen.getByText("九州の道路")).toBeTruthy();
  });

  it("公式サイトの案内も地図の範囲に追従する", async () => {
    render(<Home />);
    expect(await screen.findByText("関東の道路")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "関東を表示" }));
    await waitFor(() => {
      expect(screen.getByText("関東の規制情報を公式サイトで見る")).toBeTruthy();
    });
    expect(screen.getByRole("link", { name: /首都高速/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "九州を表示" }));
    await waitFor(() => {
      expect(screen.getByText("九州の規制情報を公式サイトで見る")).toBeTruthy();
    });
    expect(screen.getByRole("link", { name: /NEXCO西日本/ })).toBeTruthy();
  });

  it("範囲内に規制が無いときは地図を動かすよう案内する", async () => {
    render(<Home />);
    expect(await screen.findByText("関東の道路")).toBeTruthy();

    // 何も無い海上あたりを表示する想定で、九州→関東の順に切り替える。
    fireEvent.click(screen.getByRole("button", { name: "関東を表示" }));
    await waitFor(() => {
      expect(screen.queryByText("九州の道路")).toBeNull();
    });

    // 種別フィルタをすべて外すと、範囲内の件数は 0 になる。
    fireEvent.click(screen.getByRole("checkbox", { name: /通行止め/ }));

    await waitFor(() => {
      expect(screen.getByText("該当する規制情報はありません。")).toBeTruthy();
    });
  });
});
