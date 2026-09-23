// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RoadMap } from "@/components/Map";
import type { RegulationFeature, RegulationSelection } from "@/types/regulation";

/** API キーの有無をテストごとに切り替えるための状態。 */
const envState = vi.hoisted(() => ({ hasKey: true }));
/** useApiLoadingStatus の返り値。 */
const apiState = vi.hoisted(() => ({ status: "LOADED" }));
/** モックの Map が受け取った props（イベントを手動で発火させるために使う）。 */
const mapProps = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
}));

vi.mock("@/lib/env", () => ({
  GOOGLE_MAPS_API_KEY: "test-key",
  GOOGLE_MAPS_MAP_ID: "TEST_MAP_ID",
  get hasGoogleMapsApiKey() {
    return envState.hasKey;
  },
}));

vi.mock("@vis.gl/react-google-maps", () => ({
  APIProvider: ({ children }: { children: ReactNode }) => (
    <div data-testid="api-provider">{children}</div>
  ),
  Map: (props: { children: ReactNode }) => {
    mapProps.current = props as unknown as Record<string, unknown>;
    return <div data-testid="map">{props.children}</div>;
  },
  InfoWindow: ({ children }: { children: ReactNode }) => (
    <div data-testid="info-window">{children}</div>
  ),
  AdvancedMarker: ({
    children,
    title,
  }: {
    children: ReactNode;
    title: string;
  }) => (
    <div data-testid="marker" title={title}>
      {children}
    </div>
  ),
  Pin: () => <div data-testid="pin" />,
  Polyline: () => null,
  useMap: () => null,
  useMapsLibrary: () => null,
  useApiLoadingStatus: () => apiState.status,
  APILoadingStatus: { FAILED: "FAILED", AUTH_FAILURE: "AUTH_FAILURE" },
  ColorScheme: { LIGHT: "LIGHT" },
}));

const feature: RegulationFeature = {
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
    section: "霞が関出入口〜神田橋JCT",
    status: "closed",
    description: "車両火災の影響により全面通行止めです。",
    link: "https://example.com/detail",
    updatedAt: "2026-09-21T07:20:00+09:00",
  },
};

const selection: RegulationSelection = {
  featureId: "reg-1",
  position: { lat: 35.68, lng: 139.77 },
  pinned: true,
};

function renderMap(overrides: Partial<Parameters<typeof RoadMap>[0]> = {}) {
  return render(
    <RoadMap
      features={[feature]}
      selection={null}
      onHover={vi.fn()}
      onSelect={vi.fn()}
      onCloseInfoWindow={vi.fn()}
      focus={null}
      userPosition={null}
      {...overrides}
    />,
  );
}

beforeEach(() => {
  envState.hasKey = true;
  apiState.status = "LOADED";
  mapProps.current = null;
});

afterEach(() => {
  cleanup();
});

describe("RoadMap", () => {
  it("API キーが未設定なら地図の代わりに設定方法を案内する", () => {
    envState.hasKey = false;
    renderMap();

    expect(screen.getByText("Google Maps API キーが設定されていません")).toBeTruthy();
    expect(screen.queryByTestId("map")).toBeNull();
  });

  it("API キーがあれば地図を描画する", () => {
    renderMap();

    expect(screen.getByTestId("api-provider")).toBeTruthy();
    expect(screen.getByTestId("map")).toBeTruthy();
  });

  it("選択中の規制があれば InfoWindow に内容を表示する", () => {
    renderMap({ selection });

    expect(screen.getByTestId("info-window")).toBeTruthy();
    expect(screen.getByText("首都高速都心環状線")).toBeTruthy();
    expect(screen.getByText("車両火災の影響により全面通行止めです。")).toBeTruthy();
  });

  it("選択が無ければ InfoWindow を表示しない", () => {
    renderMap();

    expect(screen.queryByTestId("info-window")).toBeNull();
  });

  it("フィルタで消えた規制が選択されていても InfoWindow を出さない", () => {
    renderMap({ features: [], selection });

    expect(screen.queryByTestId("info-window")).toBeNull();
  });

  it("現在地が渡されたらピンを表示する", () => {
    renderMap({ userPosition: { lat: 35.0, lng: 139.0 } });

    expect(screen.getByTestId("marker").getAttribute("title")).toBe("現在地");
    expect(screen.getByTestId("pin")).toBeTruthy();
  });

  it("現在地が無ければピンを表示しない", () => {
    renderMap();

    expect(screen.queryByTestId("marker")).toBeNull();
  });

  it("地図の操作が落ち着いたら表示範囲を知らせる", () => {
    const onBoundsChange = vi.fn();
    renderMap({ onBoundsChange });

    const bounds = { north: 36, south: 35, east: 140, west: 139 };
    const onIdle = mapProps.current?.onIdle as (event: unknown) => void;
    onIdle({ map: { getBounds: () => ({ toJSON: () => bounds }) } });

    expect(onBoundsChange).toHaveBeenCalledWith(bounds);
  });

  it("表示範囲を取得できないときは通知しない", () => {
    const onBoundsChange = vi.fn();
    renderMap({ onBoundsChange });

    const onIdle = mapProps.current?.onIdle as (event: unknown) => void;
    onIdle({ map: { getBounds: () => undefined } });

    expect(onBoundsChange).not.toHaveBeenCalled();
  });

  it("API の読み込みに失敗したらエラーを重ねて表示する", () => {
    apiState.status = "AUTH_FAILURE";
    renderMap();

    expect(screen.getByText("Google Maps を読み込めませんでした")).toBeTruthy();
  });
});
